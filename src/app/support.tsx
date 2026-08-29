import { router } from 'expo-router';

import { Card, Header, MoodifyText, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';

export default function SupportScreen() {
  return (
    <Screen contentStyle={{ gap: spacing.lg }}>
      <Header title="Support" onBack={() => router.back()} />
      <Card><MoodifyText variant="h2">Using Moodify</MoodifyText><MoodifyText>Moodify is a wellbeing tracker for logging moods, habits, and optional daily health summaries. It does not diagnose conditions or replace professional care.</MoodifyText></Card>
      <Card><MoodifyText variant="h2">Privacy and data</MoodifyText><MoodifyText>Use Settings to export your information, clear AI chat history, disconnect health access, or permanently delete your account.</MoodifyText></Card>
      <Card><MoodifyText variant="h2">Immediate danger</MoodifyText><MoodifyText>If you or someone else may be in immediate danger in the EU/EEA, call 112 or go to the nearest emergency department.</MoodifyText></Card>
      <MoodifyText variant="small">A public support URL and contact channel will be added before TestFlight and Google Play internal testing.</MoodifyText>
    </Screen>
  );
}
