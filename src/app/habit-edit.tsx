import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Chip, Field, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { cancelHabitReminders, requestReminderPermission, scheduleHabitReminders } from '@/services/notifications';
import { useAppStore } from '@/state/use-app-store';
import type { Habit } from '@/types/domain';
import { spacing } from '@/theme/tokens';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useAppStore((state) => state.habits.find((item) => item.id === id));
  const add = useAppStore((state) => state.addHabit);
  const update = useAppStore((state) => state.updateHabit);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [target, setTarget] = useState(String(existing?.target ?? 1));
  const [unit, setUnit] = useState(existing?.unit ?? 'times');
  const [weekdays, setWeekdays] = useState(existing?.weekdays ?? [0,1,2,3,4,5,6]);
  const [reminderEnabled, setReminder] = useState(existing?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(existing?.reminderTime ?? '20:00');
  const toggleDay = (day: number) => setWeekdays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort());
  const save = async () => {
    const numericTarget = Number(target);
    if (!title.trim() || !Number.isFinite(numericTarget) || numericTarget <= 0 || !weekdays.length || !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) { Alert.alert('Check the habit details', 'Add a title, positive target, at least one day, and a 24-hour time.'); return; }
    const habit: Omit<Habit, 'id' | 'createdAt'> = { title: title.trim(), kind: existing?.kind ?? 'custom', target: numericTarget, unit: unit.trim() || 'times', weekdays, reminderEnabled, reminderTime, active: existing?.active ?? true };
    let habitId: string;
    if (existing) { habitId = existing.id; update(existing.id, habit); } else habitId = add(habit);
    await cancelHabitReminders(habitId);
    if (reminderEnabled) {
      const granted = await requestReminderPermission();
      if (granted) await scheduleHabitReminders(habitId, habit.title, weekdays, reminderTime);
      else Alert.alert('Notifications are off', 'The habit was saved without a device reminder.');
    }
    router.back();
  };
  return <Screen keyboard>
    <Header title={existing ? 'Edit habit' : 'New habit'} onBack={() => router.back()} />
    <Field label="Habit name" value={title} onChangeText={setTitle} placeholder="e.g. Stretch" />
    <View style={styles.row}><View style={styles.flex}><Field label="Goal" value={target} onChangeText={setTarget} keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="Unit" value={unit} onChangeText={setUnit} /></View></View>
    <MoodifyText variant="h2">Schedule</MoodifyText>
    <View style={styles.days}>{dayLabels.map((label, day) => <Chip key={`${label}-${day}`} label={label} selected={weekdays.includes(day)} onPress={() => toggleDay(day)} />)}</View>
    <View style={styles.reminder}><View style={styles.flex}><MoodifyText variant="h2">Local reminder</MoodifyText><MoodifyText variant="small">Reschedules using local timezone rules.</MoodifyText></View><Switch value={reminderEnabled} onValueChange={setReminder} /></View>
    {reminderEnabled ? <Field label="Reminder time (24-hour)" value={reminderTime} onChangeText={setReminderTime} placeholder="20:00" /> : null}
    <PrimaryButton title="Save habit" onPress={() => void save()} />
  </Screen>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.md }, flex: { flex: 1 }, days: { flexDirection: 'row', justifyContent: 'space-between' }, reminder: { flexDirection: 'row', alignItems: 'center', gap: spacing.md } });
