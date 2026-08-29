import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Google from 'expo-auth-session/providers/google';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Field, MoodifyText, PageBackdrop, PrimaryButton, Screen, SocialButton } from '@/components/ui';
import { registerWithApple, registerWithEmail, registerWithGoogleIdToken } from '@/services/auth';
import { firebaseConfigured } from '@/services/firebase';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing } from '@/theme/tokens';
import type { AgeBand, UserProfile } from '@/types/domain';

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
  remember: z.boolean(),
  terms: z.boolean().refine(Boolean, 'You must accept the terms and privacy policy'),
}).refine((form) => form.password === form.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

type Form = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { ageBand: ageBandParam } = useLocalSearchParams<{ ageBand?: string }>();
  const ageBand: AgeBand | undefined = ageBandParam === '16-17' || ageBandParam === '18+' ? ageBandParam : undefined;
  const register = useAppStore((state) => state.register);
  const setProfile = useAppStore((state) => state.setProfile);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '', remember: true, terms: false },
  });
  const remember = useWatch({ control, name: 'remember' });
  const terms = useWatch({ control, name: 'terms' });

  const finish = (profile: UserProfile) => {
    setProfile(profile);
    router.push('/(auth)/nickname');
  };

  const submit = async (form: Form) => {
    if (!ageBand) {
      router.replace('/(auth)/age-gate');
      return;
    }
    setLoading(true);
    try {
      if (firebaseConfigured) finish(await registerWithEmail(form.email.toLowerCase(), form.password, ageBand));
      else {
        register({ email: form.email.toLowerCase(), displayName: '', ageBand });
        router.push('/(auth)/nickname');
      }
    } catch (error) {
      Alert.alert('Account could not be created', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const apple = async () => {
    if (!ageBand || !terms) {
      Alert.alert('Consent required', 'Complete the age check and accept the Terms and Privacy Policy first.');
      return;
    }
    setLoading(true);
    try { finish(await registerWithApple(ageBand)); }
    catch (error) {
      if ((error as { code?: string }).code !== 'ERR_REQUEST_CANCELED') Alert.alert('Apple registration failed', error instanceof Error ? error.message : 'Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Screen keyboard contentStyle={styles.content}>
      <PageBackdrop />
      <Image source={require('../../../assets/figma/auth/registration-illustration.png')} style={styles.illustration} contentFit="contain" accessibilityLabel="People creating a community profile" />
      <MoodifyText variant="hero" style={styles.title}>Let’s create your profile!</MoodifyText>
      <View style={styles.socialRow}>
        {firebaseConfigured && ageBand ? <GoogleRegistrationButton ageBand={ageBand} enabled={terms} onProfile={finish} /> : <SocialButton provider="google" onPress={() => Alert.alert('Firebase setup needed', 'Add the Firebase and Google client IDs to enable Google registration.')} />}
        {Platform.OS === 'ios' ? <SocialButton provider="apple" onPress={() => void apple()} /> : null}
      </View>
      <Controller control={control} name="email" render={({ field }) => <Field label="Email" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="Enter your email address" error={errors.email?.message} />} />
      <Controller control={control} name="password" render={({ field }) => <Field label="Password" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} secureTextEntry autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} />} />
      <Controller control={control} name="confirmPassword" render={({ field }) => <Field label="Confirm password" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} secureTextEntry autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} />} />
      <CheckRow checked={remember} label="Remember me" onPress={() => setValue('remember', !remember)} />
      <CheckRow checked={terms} label="I agree to the Terms and Privacy Policy and understand Moodify is a wellness app, not medical care." onPress={() => setValue('terms', !terms, { shouldValidate: true })} />
      {errors.terms ? <MoodifyText variant="small" color={palette.red}>{errors.terms.message}</MoodifyText> : null}
      <View style={styles.actions}>
        <View style={styles.action}><PrimaryButton secondary title="Back" onPress={() => router.back()} /></View>
        <View style={styles.action}><PrimaryButton title="Next" icon="chevron-forward" loading={loading} onPress={handleSubmit((form) => void submit(form))} /></View>
      </View>
    </Screen>
  );
}

function CheckRow({ checked, label, onPress }: { checked: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.checkRow}>
      <View style={[styles.checkbox, checked && styles.checked]}>{checked ? <Ionicons name="checkmark" size={17} color={palette.white} /> : null}</View>
      <MoodifyText variant="small" style={styles.checkCopy}>{label}</MoodifyText>
    </Pressable>
  );
}

function GoogleRegistrationButton({ ageBand, enabled, onProfile }: { ageBand: AgeBand; enabled: boolean; onProfile: (profile: UserProfile) => void }) {
  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.authentication?.idToken ?? response.params.id_token;
    if (!idToken) { Alert.alert('Google registration failed', 'Google did not return an identity token.'); return; }
    void registerWithGoogleIdToken(idToken, ageBand).then(onProfile).catch((error) => Alert.alert('Google registration failed', error instanceof Error ? error.message : 'Please try again.'));
  }, [ageBand, onProfile, response]);
  return <SocialButton provider="google" onPress={() => enabled ? void promptAsync() : Alert.alert('Consent required', 'Accept the Terms and Privacy Policy first.')} />;
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  illustration: { width: '100%', aspectRatio: 364 / 212 },
  title: { textAlign: 'center' },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  checkRow: { minHeight: 44, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.xs },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: palette.grey500, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: palette.teal800, borderColor: palette.teal800 },
  checkCopy: { flex: 1, paddingTop: 3 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  action: { flex: 1 },
});
