import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, HeroGradient, IconButton, MoodifyText, PageBackdrop, ProgressBar, Screen } from '@/components/ui';
import { quotes } from '@/data/seed';
import { useWellnessContent } from '@/hooks/use-wellness-content';
import { recommendContent } from '@/lib/recommendations';
import { useAppStore } from '@/state/use-app-store';
import { radius, spacing } from '@/theme/tokens';

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
      <View style={styles.topRow}>
        <View style={styles.greeting}><MoodifyText variant="h1">{greeting()} {profile?.displayName || 'there'}!</MoodifyText><MoodifyText variant="small">Today is {format(new Date(), 'dd/MM/yyyy · EEEE')}</MoodifyText></View>
        <IconButton icon="person-circle-outline" label="Open profile" onPress={() => router.push('/profile')} />
      </View>
      <HeroGradient>
        <View style={styles.heroRow}>
          <Image source={require('../../../assets/figma/avatar-default.png')} style={styles.avatar} contentFit="contain" />
          <View style={styles.heroCopy}><MoodifyText variant="h2">A moment for you</MoodifyText><MoodifyText>“{quote}”</MoodifyText></View>
        </View>
      </HeroGradient>
      <View style={styles.sectionHeader}><MoodifyText variant="h1">Recommended for today</MoodifyText><MoodifyText variant="small">Based on your recent check-ins</MoodifyText></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
        {recs.map((item) => <Pressable key={item.id} onPress={() => router.push(`/content/${item.id}`)} style={[styles.recCard, { backgroundColor: item.color }]} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`}><Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={30} color="#363636" /><MoodifyText variant="h2" color="#363636">{item.title}</MoodifyText><MoodifyText variant="small" color="#5B5B5B">{item.subtitle} · {item.durationMinutes} min</MoodifyText></Pressable>)}
      </ScrollView>
      <View style={styles.sectionHeader}><MoodifyText variant="h1">My habits</MoodifyText><MoodifyText variant="small">Tap + to log progress</MoodifyText></View>
      <View style={styles.habitGrid}>{habits.filter((habit) => habit.active).map((habit) => {
        const log = logs.find((item) => item.habitId === habit.id && item.date === today);
        const value = log?.value ?? 0;
        return <Card key={habit.id} style={styles.habitCard}><View style={styles.habitTop}><Ionicons name={habit.kind === 'sleep' ? 'moon' : habit.kind === 'water' ? 'water' : habit.kind === 'food' ? 'nutrition' : 'walk'} size={24} color="#007474" /><IconButton icon="add" label={`Log ${habit.title}`} onPress={() => logHabit(habit.id, Math.min(habit.target, value + Math.max(1, habit.target / 4)))} /></View><MoodifyText variant="h2">{habit.title}</MoodifyText><MoodifyText variant="small">{Math.round(value)} / {habit.target} {habit.unit}</MoodifyText><ProgressBar value={value / habit.target} /></Card>;
      })}</View>
      <Pressable onPress={() => router.push('/habits')} style={styles.manage}><Ionicons name="options-outline" size={20} color="#007474" /><MoodifyText color="#007474">Manage habits and reminders</MoodifyText></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm }, topRow: { flexDirection: 'row', alignItems: 'center' }, greeting: { flex: 1, gap: 2 }, heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg }, avatar: { width: 112, height: 112, borderRadius: 56 }, heroCopy: { flex: 1, gap: spacing.sm }, sectionHeader: { gap: 2 }, horizontal: { gap: spacing.md, paddingRight: spacing.xl }, recCard: { width: 188, minHeight: 150, borderRadius: radius.lg, padding: spacing.lg, justifyContent: 'space-between' }, habitGrid: { gap: spacing.md }, habitCard: { gap: spacing.sm }, habitTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, manage: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
