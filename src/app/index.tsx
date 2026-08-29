import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';

export default function Index() {
  const { colors } = useMoodifyTheme();
  const hydrated = useAppStore((state) => state.hasHydrated);
  const seen = useAppStore((state) => state.hasSeenOnboarding);
  const profile = useAppStore((state) => state.profile);
  if (!hydrated) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  if (!seen) return <Redirect href="/(auth)/welcome" />;
  if (!profile) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
