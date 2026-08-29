import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Field, MoodifyText, PageBackdrop, PrimaryButton, Screen } from '@/components/ui';
import { validateAge } from '@/lib/age';
import { spacing } from '@/theme/tokens';

const schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter your date of birth as YYYY-MM-DD'),
});

type Form = z.infer<typeof schema>;

function parseBirthDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export default function AgeGateScreen() {
  const [eligibilityError, setEligibilityError] = useState<string>();
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { birthDate: '' },
  });

  const submit = ({ birthDate }: Form) => {
    const date = parseBirthDate(birthDate);
    if (!date) {
      setEligibilityError('Enter a real calendar date.');
      return;
    }
    const result = validateAge(date);
    if (!result.eligible || !result.ageBand) {
      setEligibilityError('Moodify accounts are currently available to people aged 16 and over.');
      return;
    }
    setEligibilityError(undefined);
    router.push({ pathname: '/(auth)/register', params: { ageBand: result.ageBand } });
  };

  return (
    <Screen keyboard contentStyle={styles.content}>
      <PageBackdrop />
      <Image source={require('../../../assets/figma/auth/registration-illustration.png')} style={styles.illustration} contentFit="contain" accessibilityLabel="People creating a community profile" />
      <View style={styles.copy}>
        <MoodifyText variant="hero" style={styles.title}>Before we begin</MoodifyText>
        <MoodifyText>Enter your date of birth so we can confirm that you are eligible to use Moodify.</MoodifyText>
      </View>
      <Controller control={control} name="birthDate" render={({ field }) => (
        <Field label="Date of birth" value={field.value} onChangeText={(value) => { field.onChange(value); setEligibilityError(undefined); }} onBlur={field.onBlur} keyboardType="numbers-and-punctuation" autoComplete="birthdate-full" placeholder="YYYY-MM-DD" error={errors.birthDate?.message ?? eligibilityError} />
      )} />
      <MoodifyText variant="small">Your birth date is used for this check only. Moodify stores only the age group 16–17 or 18+.</MoodifyText>
      <PrimaryButton secondary title="Continue" icon="chevron-forward" onPress={handleSubmit(submit)} />
      <PrimaryButton title="Back" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  illustration: { width: '100%', aspectRatio: 364 / 212, marginTop: spacing.sm },
  copy: { gap: spacing.sm },
  title: { maxWidth: 320 },
});
