import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firebaseAuth, firebaseConfigured, firestore } from '@/services/firebase';
import type { AgeBand, UserProfile } from '@/types/domain';

export const TERMS_VERSION = '2026-08-28';
export const PRIVACY_VERSION = '2026-08-28';

function requireFirebase() {
  if (!firebaseConfigured || !firebaseAuth || !firestore) {
    throw new Error('Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* values to use account sign-in.');
  }
  return { auth: firebaseAuth, db: firestore };
}

function profileFromCredential(credential: UserCredential, ageBand: AgeBand, displayName = ''): UserProfile {
  return {
    uid: credential.user.uid,
    email: credential.user.email ?? '',
    displayName,
    ageBand,
    avatar: { hair: 'waves', skin: 'medium', eyes: 'happy', clothes: 'hoodie' },
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_VERSION,
    emailVerified: credential.user.emailVerified,
    createdAt: new Date().toISOString(),
  };
}

function newProfileDocument(profile: UserProfile) {
  const { uid: _uid, createdAt: _createdAt, ...data } = profile;
  return { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
}

function updatedProfileDocument(profile: UserProfile) {
  const { uid: _uid, createdAt: _createdAt, ...data } = profile;
  return { ...data, updatedAt: serverTimestamp() };
}

export async function registerWithEmail(email: string, password: string, ageBand: AgeBand) {
  const { auth, db } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile = profileFromCredential(credential, ageBand);
  await Promise.all([
    sendEmailVerification(credential.user),
    setDoc(doc(db, 'users', credential.user.uid), newProfileDocument(profile)),
  ]);
  return profile;
}

async function saveRegisteredProfile(credential: UserCredential, ageBand: AgeBand, displayName = '') {
  const { db } = requireFirebase();
  const existing = await getDoc(doc(db, 'users', credential.user.uid));
  if (existing.exists()) return loadExistingProfile(credential);
  const profile = profileFromCredential(credential, ageBand, displayName);
  await setDoc(doc(db, 'users', credential.user.uid), newProfileDocument(profile));
  return profile;
}

export async function registerWithGoogleIdToken(idToken: string, ageBand: AgeBand) {
  const { auth } = requireFirebase();
  const credential = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  return saveRegisteredProfile(credential, ageBand, credential.user.displayName ?? '');
}

async function getAppleCredential() {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const apple = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    nonce: hashedNonce,
  });
  if (!apple.identityToken) throw new Error('Apple did not return an identity token.');
  const provider = new OAuthProvider('apple.com');
  return {
    credential: provider.credential({ idToken: apple.identityToken, rawNonce }),
    displayName: [apple.fullName?.givenName, apple.fullName?.familyName].filter(Boolean).join(' '),
  };
}

export async function registerWithApple(ageBand: AgeBand) {
  const { auth } = requireFirebase();
  const apple = await getAppleCredential();
  return saveRegisteredProfile(await signInWithCredential(auth, apple.credential), ageBand, apple.displayName);
}

async function loadExistingProfile(credential: UserCredential) {
  const { db } = requireFirebase();
  const snapshot = await getDoc(doc(db, 'users', credential.user.uid));
  if (!snapshot.exists()) {
    if (getAdditionalUserInfo(credential)?.isNewUser) await deleteUser(credential.user);
    else await signOut(firebaseAuth!);
    throw new Error('No eligible Moodify profile was found. Create a profile and complete the age check first.');
  }
  const data = snapshot.data() as UserProfile;
  const createdAt = data.createdAt && typeof (data.createdAt as unknown as { toDate?: unknown }).toDate === 'function'
    ? (data.createdAt as unknown as { toDate(): Date }).toDate().toISOString()
    : data.createdAt;
  return { ...data, createdAt, uid: credential.user.uid, email: credential.user.email ?? data.email, emailVerified: credential.user.emailVerified };
}

export async function loginWithEmail(email: string, password: string) {
  const { auth } = requireFirebase();
  return loadExistingProfile(await signInWithEmailAndPassword(auth, email, password));
}

export async function loginWithGoogleIdToken(idToken: string) {
  const { auth } = requireFirebase();
  return loadExistingProfile(await signInWithCredential(auth, GoogleAuthProvider.credential(idToken)));
}

export async function loginWithApple() {
  const { auth } = requireFirebase();
  const apple = await getAppleCredential();
  return loadExistingProfile(await signInWithCredential(auth, apple.credential));
}

export async function resetPassword(email: string) {
  const { auth } = requireFirebase();
  await sendPasswordResetEmail(auth, email);
}

export async function saveProfile(profile: UserProfile) {
  const { db } = requireFirebase();
  await setDoc(doc(db, 'users', profile.uid), updatedProfileDocument(profile), { merge: true });
}

export async function signOutAccount() {
  if (firebaseAuth) await signOut(firebaseAuth);
}
