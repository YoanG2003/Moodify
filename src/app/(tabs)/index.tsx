import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconButton, MoodifyText, PageBackdrop, Screen } from '@/components/ui';
import { quotes } from '@/data/seed';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing } from '@/theme/tokens';
import type { Habit } from '@/types/domain';

const habitArtwork: Partial<Record<Habit['kind'], ImageSource>> = {
  sleep: require('../../../assets/figma/home/habit-sleeping.png'),
  water: require('../../../assets/figma/home/habit-water.png'),
  food: require('../../../assets/figma/home/habit-eating.png'),
  workout: require('../../../assets/figma/home/habit-workout.png'),
};

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

function avatarSource(hair?: string): ImageSource {
  if (hair?.startsWith('blonde-bun')) return require('../../../assets/figma/avatar/preview-rose.png');
  if (hair?.startsWith('short-curls')) return require('../../../assets/figma/avatar/preview-green.png');
  return require('../../../assets/figma/avatar/preview-blonde.png');
}

export default function HomeScreen() {
  const { colors, isDark } = useMoodifyTheme();
  const profile = useAppStore((state) => state.profile);
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.habitLogs);
  const logHabit = useAppStore((state) => state.logHabit);
  const today = format(new Date(), 'yyyy-MM-dd');
  const quote = quotes[new Date().getDate() % quotes.length];

  return (
    <Screen contentStyle={styles.content}>
      <PageBackdrop />
      <View style={[styles.homeHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }] }>
        <IconButton icon="menu-outline" label="Open settings" color={colors.primary} onPress={() => router.push('/settings')} />
        <MoodifyText variant="h1" color={colors.primary}>Home</MoodifyText>
        <IconButton icon="person-circle-outline" label="Open profile" color={colors.primary} onPress={() => router.push('/profile')} />
      </View>

      <View style={styles.greeting}>
        <MoodifyText style={styles.center}>{greeting()} <MoodifyText variant="label">{profile?.displayName || 'there'}</MoodifyText>! Today is</MoodifyText>
        <MoodifyText style={styles.center}>{format(new Date(), 'dd/MM/yyyy/EEEE')}</MoodifyText>
      </View>

      <MoodifyText variant="h2" style={styles.quote}>“{quote}”</MoodifyText>
      <View style={[styles.avatarCircle, { backgroundColor: colors.secondary }] }>
        <Image source={avatarSource(profile?.avatar.hair)} style={styles.avatar} contentFit="contain" accessibilityLabel={`${profile?.displayName || 'Your'} avatar`} />
      </View>

      <MoodifyText variant="h2" style={styles.sectionTitle}>Recommended for today</MoodifyText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendations}>
        <View style={styles.recommendationStrip}>
          <Image source={isDark ? require('../../../assets/figma/home/recommendations-dark.png') : require('../../../assets/figma/home/recommendations-light.png')} style={styles.recommendationImage} contentFit="fill" />
          <Pressable accessibilityRole="button" accessibilityLabel="Open Yoga" onPress={() => router.push('/content/yoga')} style={[styles.recommendationHit, { left: 0 }]} />
          <Pressable accessibilityRole="button" accessibilityLabel="Open Be in nature" onPress={() => router.push('/content/nature')} style={[styles.recommendationHit, { left: 168 }]} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open Eating habits" onPress={() => router.push('/content/eating-habits')} style={[styles.eatingCard, { backgroundColor: colors.surface, borderColor: colors.border }] }>
          <Ionicons name="nutrition-outline" size={46} color={palette.coral} />
          <MoodifyText variant="h2" style={styles.center}>Eating habits</MoodifyText>
          <MoodifyText variant="small">Body</MoodifyText>
        </Pressable>
      </ScrollView>

      <MoodifyText variant="h2" style={styles.sectionTitle}>My habits</MoodifyText>
      <View style={styles.habitList}>
        {habits.filter((habit) => habit.active).map((habit) => {
          const log = logs.find((item) => item.habitId === habit.id && item.date === today);
          const value = log?.value ?? 0;
          const increment = Math.max(1, habit.target / 4);
          return (
            <Pressable key={habit.id} accessibilityRole="button" accessibilityLabel={`${habit.title}, ${Math.round(value)} of ${habit.target} ${habit.unit}. Tap to add progress.`} onPress={() => logHabit(habit.id, Math.min(habit.target, value + increment))} style={({ pressed }) => [styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
              {habitArtwork[habit.kind] ? <Image source={habitArtwork[habit.kind]} style={styles.habitImage} contentFit="contain" /> : <Ionicons name="sparkles-outline" size={44} color={colors.primary} style={styles.customHabitIcon} />}
              <View style={styles.habitCopy}>
                <MoodifyText variant="h1">{habit.title}</MoodifyText>
                <MoodifyText variant="small">{Math.round(value)} / {habit.target} {habit.unit}</MoodifyText>
              </View>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" onPress={() => router.push('/habits')} style={({ pressed }) => [styles.addMore, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
          <MoodifyText variant="h1">Add more</MoodifyText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, gap: spacing.lg },
  homeHeader: { height: 52, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  greeting: { alignItems: 'center', gap: 1 },
  center: { textAlign: 'center' },
  quote: { minHeight: 58, textAlign: 'center', paddingHorizontal: spacing.sm },
  avatarCircle: { width: 135, height: 135, borderRadius: 68, alignSelf: 'center', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  avatar: { width: 126, height: 135 },
  sectionTitle: { marginLeft: spacing.md },
  recommendations: { paddingLeft: spacing.md, paddingRight: spacing.xl },
  recommendationStrip: { width: 352, height: 138, position: 'relative' },
  recommendationImage: { width: 352, height: 138 },
  recommendationHit: { position: 'absolute', top: 5, width: 139, height: 133, borderRadius: radius.sm },
  eatingCard: { width: 139, height: 133, marginTop: 5, marginLeft: -16, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', gap: 2 },
  habitList: { gap: 18, paddingHorizontal: spacing.md },
  habitCard: { minHeight: 98, borderWidth: 1, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  habitImage: { width: 161, height: 77, marginLeft: 8 },
  customHabitIcon: { width: 161, textAlign: 'center' },
  habitCopy: { flex: 1, alignItems: 'center', paddingRight: spacing.md, gap: 2 },
  addMore: { minHeight: 98, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.68, transform: [{ scale: 0.995 }] },
});
