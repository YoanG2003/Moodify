import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch } from 'react-native';

import { Card, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import { cancelHabitReminders, scheduleHabitReminders } from '@/services/notifications';
import { spacing } from '@/theme/tokens';

export default function HabitsScreen() {
  const habits = useAppStore((state) => state.habits);
  const update = useAppStore((state) => state.updateHabit);
  const { colors } = useMoodifyTheme();
  const setActive = async (habit: typeof habits[number], active: boolean) => {
    update(habit.id, { active });
    if (!active) await cancelHabitReminders(habit.id);
    else if (habit.reminderEnabled && habit.reminderTime) await scheduleHabitReminders(habit.id, habit.title, habit.weekdays, habit.reminderTime);
  };
  return <Screen>
    <Header title="Habits and reminders" onBack={() => router.back()} />
    <MoodifyText>Use daily or selected-weekday goals. Reminder times follow the device’s current timezone.</MoodifyText>
    {habits.map((habit) => <Card key={habit.id} style={styles.card}>
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/habit-edit', params: { id: habit.id } })} style={styles.copy}>
        <MoodifyText variant="h2">{habit.title}</MoodifyText>
        <MoodifyText variant="small">{habit.target} {habit.unit} · {habit.weekdays.length === 7 ? 'Daily' : `${habit.weekdays.length} days/week`}{habit.reminderEnabled ? ` · ${habit.reminderTime}` : ''}</MoodifyText>
      </Pressable>
      <Switch value={habit.active} onValueChange={(active) => void setActive(habit, active)} trackColor={{ true: colors.primary }} />
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Card>)}
    <PrimaryButton title="Add custom habit" onPress={() => router.push('/habit-edit')} />
  </Screen>;
}

const styles = StyleSheet.create({ card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, copy: { flex: 1, minHeight: 44, justifyContent: 'center' } });
