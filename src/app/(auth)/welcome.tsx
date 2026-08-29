import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthIllustration, MoodifyText, PageBackdrop, PrimaryButton, Screen } from '@/components/ui';
import { useAppStore } from '@/state/use-app-store';
import { spacing } from '@/theme/tokens';

export default function WelcomeScreen() {
  const complete = useAppStore((state) => state.completeOnboarding);
  const continueToLogin = () => { complete(); router.replace('/(auth)/login'); };
  return (
    <Screen contentStyle={styles.content}>
      <PageBackdrop />
      <View style={styles.brand}><MoodifyText variant="hero">Moodify</MoodifyText><MoodifyText>Understand your moods. Build gentler habits.</MoodifyText></View>
      <AuthIllustration />
      <View style={styles.copy}>
        <MoodifyText variant="h1">A private place to check in</MoodifyText>
        <MoodifyText>Track how you feel, notice patterns, and discover practical wellbeing tools—one day at a time.</MoodifyText>
        <MoodifyText variant="small">For people aged 16+. Moodify is not medical or emergency care.</MoodifyText>
      </View>
      <PrimaryButton title="Get started" onPress={continueToLogin} />
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: spacing.xl, paddingBottom: spacing.xl }, brand: { gap: spacing.xs }, copy: { gap: spacing.md } });
