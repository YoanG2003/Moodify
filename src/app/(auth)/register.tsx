import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Field, Header, MoodifyText, PageBackdrop, PrimaryButton, Screen } from '@/components/ui';
import { validateAge } from '@/lib/age';
import { useAppStore } from '@/state/use-app-store';
import { palette, spacing } from '@/theme/tokens';
import { firebaseConfigured } from '@/services/firebase';
import { registerWithEmail } from '@/services/auth';

const schema = z.object({ email: z.email('Enter a valid email address'), password: z.string().min(8, 'Use at least 8 characters'), birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'), terms: z.boolean().refine(Boolean, 'You must accept the terms and privacy policy') });
type Form = z.infer<typeof schema>;

export default function RegisterScreen() {
  const register = useAppStore((state) => state.register);
  const setProfile = useAppStore((state) => state.setProfile);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', birthDate: '', terms: false } });
  const terms = useWatch({ control, name: 'terms' });
  const submit = async (form: Form) => {
    const result = validateAge(new Date(`${form.birthDate}T12:00:00`));
    if (!result.eligible || !result.ageBand) { Alert.alert('Moodify is for ages 16+', 'Accounts cannot be created for people under 16 in this beta.'); return; }
    try {
      if (firebaseConfigured) setProfile(await registerWithEmail(form.email.toLowerCase(), form.password, result.ageBand));
      else register({ email: form.email.toLowerCase(), displayName: '', ageBand: result.ageBand });
      router.push('/(auth)/profile-setup');
    } catch (error) {
      Alert.alert('Account could not be created', error instanceof Error ? error.message : 'Please try again.');
    }
  };
  return (
    <Screen keyboard>
      <PageBackdrop />
      <Header title="Create profile" onBack={() => router.back()} />
      <MoodifyText variant="h1">Let’s create your profile!</MoodifyText>
      <MoodifyText>We ask your age only to confirm eligibility. We store an age band, not your date of birth.</MoodifyText>
      <Controller control={control} name="email" render={({ field }) => <Field label="Email" value={field.value} onChangeText={field.onChange} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" error={errors.email?.message} />} />
      <Controller control={control} name="password" render={({ field }) => <Field label="Password" value={field.value} onChangeText={field.onChange} secureTextEntry placeholder="At least 8 characters" error={errors.password?.message} />} />
      <Controller control={control} name="birthDate" render={({ field }) => <Field label="Date of birth" value={field.value} onChangeText={field.onChange} keyboardType="numbers-and-punctuation" placeholder="YYYY-MM-DD" error={errors.birthDate?.message} />} />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: terms }} onPress={() => setValue('terms', !terms, { shouldValidate: true })} style={styles.checkRow}>
        <View style={[styles.checkbox, terms && styles.checked]}>{terms ? <MoodifyText color="#FFFFFF">✓</MoodifyText> : null}</View>
        <MoodifyText style={styles.checkCopy}>I agree to the Terms and Privacy Policy and understand Moodify is not medical care.</MoodifyText>
      </Pressable>
      {errors.terms ? <MoodifyText variant="small" color="#B42318">{errors.terms.message}</MoodifyText> : null}
      <PrimaryButton title="Continue" onPress={handleSubmit((form) => void submit(form))} />
    </Screen>
  );
}

const styles = StyleSheet.create({ checkRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }, checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: '#808080', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: palette.teal800, borderColor: palette.teal800 }, checkCopy: { flex: 1 } });
