import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingArt, OnboardingShapes } from '@/components/onboarding-art';
import { MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import { palette, spacing, typography } from '@/theme/tokens';

const slides = [
  { title: 'Welcome to Moodify', body: '' },
  { title: 'Feeling overwhelmed?', body: 'Don’t worry, we are here to help!' },
  { title: 'Relax', body: 'Find new ways to relax and enjoy life!' },
  { title: 'Get motivated', body: 'We will help you reach every goal!' },
  { title: 'Destroy the negative emotions', body: 'Let’s work through them together!' },
] as const;

type Step = 0 | 1 | 2 | 3 | 4;

export default function WelcomeScreen() {
  const { colors } = useMoodifyTheme();
  const complete = useAppStore((state) => state.completeOnboarding);
  const [step, setStep] = useState<Step>(0);
  const slide = slides[step];
  const proceed = () => {
    if (step < slides.length - 1) {
      setStep((step + 1) as Step);
      return;
    }
    complete();
    router.replace('/(auth)/login');
  };
  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.stage} accessibilityLiveRegion="polite">
        <OnboardingShapes step={step} />
        <View style={styles.visual}>
          {step === 0 ? (
            <View style={styles.welcomeTitle}>
              <MoodifyText variant="hero" style={styles.center}>Welcome to</MoodifyText>
              <View style={styles.wordmark}>
                <Image source={require('../../../assets/brand/moodify-logo.png')} style={styles.logo} contentFit="contain" />
                <MoodifyText color={colors.primary} style={styles.brandName}>Moodify</MoodifyText>
              </View>
            </View>
          ) : null}
          <View style={[styles.artSlot, step === 0 && styles.welcomeArtSlot]}>
            <OnboardingArt step={step} />
          </View>
        </View>
        {step > 0 ? (
          <View style={styles.copy}>
            <MoodifyText variant="hero" style={styles.center}>{slide.title}</MoodifyText>
            <MoodifyText style={styles.center}>{slide.body}</MoodifyText>
          </View>
        ) : <View style={styles.copyPlaceholder} />}
      </View>
      <View style={styles.controls}>
        <View style={styles.dots} accessibilityRole="tablist">
          {slides.map((item, index) => (
            <Pressable
              key={item.title}
              accessibilityRole="tab"
              accessibilityLabel={`Onboarding step ${index + 1} of ${slides.length}`}
              accessibilityState={{ selected: index === step }}
              hitSlop={8}
              onPress={() => setStep(index as Step)}
              style={[styles.dot, { backgroundColor: index === step ? colors.navActive : palette.grey300 }]}
            />
          ))}
        </View>
        <PrimaryButton title={step === slides.length - 1 ? 'Get started' : 'Proceed'} secondary onPress={proceed} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 69, gap: 0 },
  stage: { flex: 1, overflow: 'hidden' },
  visual: { height: 440, justifyContent: 'flex-start', paddingTop: 70, zIndex: 1 },
  welcomeTitle: { alignItems: 'center', paddingTop: spacing.sm },
  wordmark: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: -spacing.sm },
  logo: { width: 58, height: 58 },
  brandName: { fontFamily: typography.bold, fontWeight: '700', fontSize: 48, lineHeight: 58 },
  artSlot: { minHeight: 338, alignItems: 'center', justifyContent: 'center' },
  welcomeArtSlot: { minHeight: 300 },
  copy: { minHeight: 106, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, zIndex: 1 },
  copyPlaceholder: { height: 12 },
  center: { textAlign: 'center' },
  controls: { paddingHorizontal: spacing.xxl, gap: spacing.xxl },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 16, height: 16, borderRadius: 8 },
});
