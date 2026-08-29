import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Field, MoodifyText, PageBackdrop, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { saveProfile } from '@/services/auth';
import { firebaseConfigured } from '@/services/firebase';
import { useAppStore } from '@/state/use-app-store';
import { radius, spacing } from '@/theme/tokens';

export default function NicknameScreen() {
  const { colors } = useMoodifyTheme();
  const profile = useAppStore((state) => state.profile);
  const update = useAppStore((state) => state.updateProfile);
  if (!profile) return null;

  const next = async () => {
    const displayName = profile.displayName.trim();
    if (!displayName) return;
    update({ displayName });
    if (firebaseConfigured) await saveProfile({ ...profile, displayName });
    router.push('/(auth)/profile-setup');
  };

  return (
    <Screen keyboard contentStyle={styles.content}>
      <PageBackdrop />
      <Image source={require('../../../assets/figma/auth/nickname-celebration.png')} style={styles.celebration} contentFit="contain" accessibilityLabel="Friends celebrating and welcoming you" />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <MoodifyText variant="h1" style={styles.question}>How should we call you?</MoodifyText>
        <Field label="Nickname" value={profile.displayName} onChangeText={(displayName) => update({ displayName })} autoCapitalize="words" autoComplete="nickname" placeholder="Your first name or nickname" />
      </View>
      <View style={styles.actions}>
        <View style={styles.action}><PrimaryButton secondary title="Back" onPress={() => router.back()} /></View>
        <View style={styles.action}><PrimaryButton title="Next" icon="chevron-forward" disabled={!profile.displayName.trim()} onPress={() => void next()} /></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 0, gap: spacing.lg },
  celebration: { width: '100%', aspectRatio: 375 / 408 },
  card: { marginHorizontal: spacing.xl, borderRadius: radius.md, padding: spacing.lg, gap: spacing.lg },
  question: { textAlign: 'center' },
  actions: { marginHorizontal: spacing.xl, flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
});
