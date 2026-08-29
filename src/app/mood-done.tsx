import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useAppStore } from '@/state/use-app-store';
import { palette, spacing } from '@/theme/tokens';

export default function MoodDoneScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const rate = useAppStore((state) => state.rateMoodEntry);
  const [rating, setRating] = useState(0);
  const choose = (value: number) => { setRating(value); if (entryId) rate(entryId, value); };
  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.success}><Ionicons name="checkmark-circle" size={104} color={palette.teal700} /><MoodifyText variant="hero" style={styles.center}>Mood added!</MoodifyText><MoodifyText style={styles.center}>Your check-in is saved. You can edit or delete it from Insights.</MoodifyText></View>
      <View style={styles.feedback}><MoodifyText variant="h2" style={styles.center}>Rank your experience</MoodifyText><View style={styles.stars}>{[1,2,3,4,5].map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected: rating === value }} accessibilityLabel={`${value} stars`} onPress={() => choose(value)}><Ionicons name={value <= rating ? 'star' : 'star-outline'} size={36} color={palette.gold500} /></Pressable>)}</View></View>
      <PrimaryButton title="Back home" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { justifyContent: 'space-around', paddingVertical: spacing.xxl }, success: { alignItems: 'center', gap: spacing.lg }, feedback: { gap: spacing.md }, center: { textAlign: 'center' }, stars: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm } });
