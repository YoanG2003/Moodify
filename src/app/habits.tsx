import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Card, Header, MoodifyText, PrimaryButton, ProgressBar, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { cancelHabitReminders, requestReminderPermission, scheduleHabitReminders } from '@/services/notifications';
import { useAppStore } from '@/state/use-app-store';
import { radius, spacing } from '@/theme/tokens';
import type { Habit } from '@/types/domain';

const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function scheduleLabel(habit: Habit) {
  if (habit.weekdays.length === 7) return 'Every day';
  return habit.weekdays.map((day) => shortDays[day]).join(', ');
}

function incrementFor(habit: Habit) {
  if (habit.kind === 'water') return 250;
  if (habit.kind === 'sleep') return 0.5;
  if (habit.kind === 'food') return 1;
  if (habit.kind === 'workout') return 5;
  return Math.max(1, habit.target / 4);
}

export default function HabitsScreen() {
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.habitLogs);
  const update = useAppStore((state) => state.updateHabit);
  const logHabit = useAppStore((state) => state.logHabit);
  const { colors } = useMoodifyTheme();
  const [notice, setNotice] = useState<string>();
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekday = new Date().getDay();

  const setActive = async (habit: Habit, active: boolean) => {
    try {
      if (!active) await cancelHabitReminders(habit.id);
      if (active && habit.reminderEnabled && habit.reminderTime) {
        const granted = await requestReminderPermission();
        if (!granted) {
          setNotice('Notifications are off. The habit is active without a device reminder.');
        } else {
          await cancelHabitReminders(habit.id);
          await scheduleHabitReminders(habit.id, habit.title, habit.weekdays, habit.reminderTime);
        }
      }
      update(habit.id, { active });
    } catch {
      setNotice('The reminder could not be updated, but your habit changes are saved.');
      update(habit.id, { active });
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Header title="Habits and reminders" onBack={() => router.back()} />
      <MoodifyText>Log measurable progress here or from Home. Reminder schedules follow the device’s local timezone.</MoodifyText>
      {notice ? <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}><MoodifyText variant="small" style={styles.flex}>{notice}</MoodifyText><Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={() => setNotice(undefined)}><Ionicons name="close" size={20} color={colors.textMuted} /></Pressable></View> : null}

      {habits.map((habit) => {
        const log = logs.find((item) => item.habitId === habit.id && item.date === today);
        const value = log?.value ?? 0;
        const increment = incrementFor(habit);
        const scheduledToday = habit.weekdays.includes(weekday);
        const progress = habit.target > 0 ? value / habit.target : 0;
        return (
          <Card key={habit.id} style={habit.active ? styles.card : styles.inactiveCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.habitIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name={log?.completed ? 'checkmark' : habit.kind === 'water' ? 'water-outline' : habit.kind === 'sleep' ? 'moon-outline' : habit.kind === 'workout' ? 'barbell-outline' : habit.kind === 'food' ? 'nutrition-outline' : 'sparkles-outline'} size={23} color={colors.primary} /></View>
              <View style={styles.flex}>
                <MoodifyText variant="h2">{habit.title}</MoodifyText>
                <MoodifyText variant="small">{scheduleLabel(habit)}{habit.reminderEnabled && habit.reminderTime ? ` · ${habit.reminderTime}` : ''}</MoodifyText>
              </View>
              <Switch accessibilityLabel={`${habit.title} active`} value={habit.active} onValueChange={(active) => void setActive(habit, active)} trackColor={{ true: colors.primary }} />
              <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${habit.title}`} hitSlop={6} onPress={() => router.push({ pathname: '/habit-edit', params: { id: habit.id } })} style={styles.editButton}><Ionicons name="create-outline" size={22} color={colors.textMuted} /></Pressable>
            </View>

            {habit.active ? (
              <View style={[styles.progressArea, { borderTopColor: colors.border }]}>
                <View style={styles.progressCopy}><MoodifyText variant="small">{scheduledToday ? 'Today' : 'Rest day'}</MoodifyText><MoodifyText variant="label" color={log?.completed ? colors.success : colors.heading}>{Number(value.toFixed(1))} / {habit.target} {habit.unit}</MoodifyText></View>
                <ProgressBar value={progress} color={log?.completed ? colors.success : colors.primary} />
                <View style={styles.logControls}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${habit.title} progress`} disabled={value <= 0} onPress={() => logHabit(habit.id, Math.max(0, value - increment))} style={[styles.stepButton, { borderColor: colors.border }, value <= 0 && styles.disabled]}><Ionicons name="remove" size={22} color={colors.primary} /></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Add ${increment} ${habit.unit} to ${habit.title}`} onPress={() => logHabit(habit.id, Math.min(habit.target, value + increment))} style={[styles.addProgress, { backgroundColor: colors.primary }]}><Ionicons name="add" size={20} color="#FFFFFF" /><MoodifyText variant="label" color="#FFFFFF">Add {Number(increment.toFixed(1))}</MoodifyText></Pressable>
                </View>
              </View>
            ) : null}
          </Card>
        );
      })}

      <PrimaryButton title="Add custom habit" icon="add" onPress={() => router.push('/habit-edit')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  flex: { flex: 1 },
  notice: { minHeight: 46, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  card: { padding: 0, overflow: 'hidden' },
  inactiveCard: { padding: 0, overflow: 'hidden', opacity: 0.62 },
  cardHeader: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  habitIcon: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  editButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  progressArea: { borderTopWidth: StyleSheet.hairlineWidth, padding: spacing.md, gap: spacing.md },
  progressCopy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logControls: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  stepButton: { width: 48, minHeight: 44, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  addProgress: { minWidth: 104, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  disabled: { opacity: 0.35 },
});
