import { zodResolver } from '@hookform/resolvers/zod';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { AuthIllustration, Field, MoodifyText, PageBackdrop, PrimaryButton, Screen, SocialButton } from '@/components/ui';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/use-app-store';
import { spacing } from '@/theme/tokens';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { firebaseConfigured } from '@/services/firebase';
import { loginWithApple, loginWithEmail, loginWithGoogleIdToken, resetPassword } from '@/services/auth';
import type { UserProfile } from '@/types/domain';

const schema = z.object({ email: z.email('Enter a valid email address'), password: z.string().min(8, 'Use at least 8 characters') });
type Form = z.infer<typeof schema>;

export default function LoginScreen() {
  const { colors } = useMoodifyTheme();
  const loginDemo = useAppStore((state) => state.loginDemo);
  const setProfile = useAppStore((state) => state.setProfile);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  const finish = (profile: UserProfile) => { setProfile(profile); router.replace('/(tabs)'); };
  const login = async ({ email, password }: Form) => {
    setLoading(true);
    try { finish(await loginWithEmail(email.toLowerCase(), password)); }
    catch (error) { Alert.alert('Sign-in failed', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setLoading(false); }
  };
  const apple = async () => {
    setLoading(true);
    try { finish(await loginWithApple()); }
    catch (error) { if ((error as { code?: string }).code !== 'ERR_REQUEST_CANCELED') Alert.alert('Apple sign-in failed', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setLoading(false); }
  };
  const reset = async () => {
    const email = getValues('email').trim().toLowerCase();
    if (!email) { Alert.alert('Enter your email first'); return; }
    try { await resetPassword(email); Alert.alert('Check your inbox', 'If the address belongs to a Moodify account, Firebase has sent a reset link.'); }
    catch (error) { Alert.alert('Reset unavailable', error instanceof Error ? error.message : 'Please try again.'); }
  };
  return (
    <Screen keyboard contentStyle={styles.content}>
      <PageBackdrop />
      <AuthIllustration />
      <MoodifyText variant="h1" style={styles.center}>{en.auth.loginTitle}</MoodifyText>
      <View style={styles.socialRow}>
        {firebaseConfigured ? <GoogleButton onProfile={finish} /> : <SocialButton provider="google" onPress={() => Alert.alert('Firebase setup needed', 'Add the Firebase and Google client IDs from .env.example to enable Google sign-in.')} />}
        {Platform.OS === 'ios' ? <SocialButton provider="apple" onPress={() => void apple()} /> : null}
      </View>
      <Controller control={control} name="email" render={({ field }) => <Field label={en.auth.email} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="Enter your email address" error={errors.email?.message} />} />
      <Controller control={control} name="password" render={({ field }) => <Field label={en.auth.password} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} secureTextEntry autoComplete="current-password" placeholder="Enter your password here" error={errors.password?.message} />} />
      <Pressable onPress={() => firebaseConfigured ? void reset() : Alert.alert('Firebase setup needed', 'Password reset is ready once Firebase credentials are added.')}><MoodifyText variant="small" color={colors.primary} style={styles.link}>{en.auth.forgot}</MoodifyText></Pressable>
      <Pressable onPress={() => router.push('/(auth)/register')}><MoodifyText color={colors.primary} style={[styles.link, styles.underline]}>{en.auth.create}</MoodifyText></Pressable>
      <PrimaryButton title={en.auth.login} loading={loading} onPress={handleSubmit((form) => void login(form))} />
      {!firebaseConfigured ? <PrimaryButton secondary title="Try local beta" onPress={() => { loginDemo('demo@moodify.app'); router.replace('/(tabs)'); }} /> : null}
    </Screen>
  );
}

function GoogleButton({ onProfile }: { onProfile: (profile: UserProfile) => void }) {
  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.authentication?.idToken ?? response.params.id_token;
    if (!idToken) { Alert.alert('Google sign-in failed', 'Google did not return an identity token.'); return; }
    void loginWithGoogleIdToken(idToken).then(onProfile).catch((error) => Alert.alert('Google sign-in failed', error instanceof Error ? error.message : 'Please try again.'));
  }, [onProfile, response]);
  return <SocialButton provider="google" onPress={() => void promptAsync()} />;
}

const styles = StyleSheet.create({ content: { gap: spacing.md }, center: { textAlign: 'center' }, socialRow: { flexDirection: 'row', gap: spacing.md }, link: { textAlign: 'center' }, underline: { textDecorationLine: 'underline' } });
