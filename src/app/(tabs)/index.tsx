import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Header, HeroGradient, IconButton, MoodifyText, PageBackdrop, ProgressBar, Screen } from '@/components/ui';
import { quotes } from '@/data/seed';
import { useWellnessContent } from '@/hooks/use-wellness-content';
import { recommendContent } from '@/lib/recommendations';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing } from '@/theme/tokens';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export default function HomeScreen() {
  const wellnessContent = useWellnessContent();
  const profile = useAppStore((state) => state.profile);
  const moods = useAppStore((state) => state.moodEntries);
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.habitLogs);
  const logHabit = useAppStore((state) => state.logHabit);
  const today = format(new Date(), 'yyyy-MM-dd');
  const recs = recommendContent(wellnessContent, moods);
  const quote = quotes[new Date().getDate() % quotes.length];
  return (
    <Screen contentStyle={styles.content}>
      <PageBackdrop />
      <Header title="Home" left={<IconButton icon="menu-outline" label="Open settings" onPress={() => router.push('/settings')} />} right={<IconButton icon="person-circle-outline" label="Open profile" onPress={() => router.push('/profile')} />} />
      <View style={styles.greeting}><MoodifyText>{greeting()} {profile?.displayName || 'there'}! Today is</MoodifyText><MoodifyText variant="small">{format(new Date(), 'dd/MM/yyyy · EEEE')}</MoodifyText></View>
      <HeroGradient>
        <View style={styles.heroCopy}><MoodifyText variant="h2" style={styles.center}>“{quote}”</MoodifyText><View style={styles.quoteCircle} /></View>
      </HeroGradient>
      <View style={styles.sectionHeader}><MoodifyText variant="h1">Recommended for today</MoodifyText><MoodifyText variant="small">Based on your recent check-ins</MoodifyText></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
        {recs.map((item) => <Pressable key={item.id} onPress={() => router.push(`/content/${item.id}`)} style={[styles.recCard, { backgroundColor: item.color }]} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`}><Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={30} color="#363636" /><MoodifyText variant="h2" color="#363636">{item.title}</MoodifyText><MoodifyText variant="small" color="#5B5B5B">{item.subtitle} · {item.durationMinutes} min</MoodifyText></Pressable>)}
      </ScrollView>
      <View style={styles.sectionHeader}><MoodifyText variant="h1">My habits</MoodifyText><MoodifyText variant="small">Tap + to log progress</MoodifyText></View>
      <View style={styles.habitGrid}>{habits.filter((habit) => habit.active).map((habit) => {
        const log = logs.find((item) => item.habitId === habit.id && item.date === today);
        const value = log?.value ?? 0;
        return <Card key={habit.id} style={styles.habitCard}><View style={styles.habitTop}><Ionicons name={habit.kind === 'sleep' ? 'moon' : habit.kind === 'water' ? 'water' : habit.kind === 'food' ? 'nutrition' : 'walk'} size={24} color={palette.teal800} /><IconButton icon="add" label={`Log ${habit.title}`} onPress={() => logHabit(habit.id, Math.min(habit.target, value + Math.max(1, habit.target / 4)))} /></View><MoodifyText variant="h2">{habit.title}</MoodifyText><MoodifyText variant="small">{Math.round(value)} / {habit.target} {habit.unit}</MoodifyText><ProgressBar value={value / habit.target} /></Card>;
      })}</View>
      <Pressable onPress={() => router.push('/habits')} style={styles.manage}><Ionicons name="options-outline" size={20} color={palette.teal800} /><MoodifyText color={palette.teal800}>Manage habits and reminders</MoodifyText></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 }, greeting: { alignItems: 'center', gap: 2 }, heroCopy: { minHeight: 150, alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg }, center: { textAlign: 'center' }, quoteCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: palette.gold500 }, sectionHeader: { gap: 2 }, horizontal: { gap: spacing.md, paddingRight: spacing.xl }, recCard: { width: 148, minHeight: 150, borderRadius: radius.lg, padding: spacing.lg, justifyContent: 'space-between' }, habitGrid: { gap: spacing.md }, habitCard: { gap: spacing.sm }, habitTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, manage: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
