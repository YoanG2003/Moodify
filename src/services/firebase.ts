import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
// Firebase's package exports the React Native persistence helper at runtime, but
// TypeScript resolves its browser declaration when compiling an Expo project.
// @ts-expect-error React Native conditional export is selected by Metro.
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { CustomProvider, initializeAppCheck } from 'firebase/app-check';

import { getNativeAppCheckToken, nativeFirebaseEnabled } from '@/services/native-firebase';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every(Boolean);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;

if (firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(config);
  if (nativeFirebaseEnabled) {
    initializeAppCheck(app, {
      provider: new CustomProvider({ getToken: async () => ({ ...(await getNativeAppCheckToken()), expireTimeMillis: Date.now() + 50 * 60 * 1000 }) }),
      isTokenAutoRefreshEnabled: true,
    });
  }
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Auth may already be initialized during Fast Refresh.
    auth = getAuth(app);
  }
  db = getFirestore(app);
  functions = getFunctions(app, process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION || 'europe-west1');
}

export { app as firebaseApp, auth as firebaseAuth, db as firestore, functions as firebaseFunctions };
