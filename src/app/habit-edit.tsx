import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import { z } from 'zod';

import { Chip, Field, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { cancelHabitReminders, requestReminderPermission, scheduleHabitReminders } from '@/services/notifications';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing } from '@/theme/tokens';
import type { Habit } from '@/types/domain';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const schema = z.object({
  title: z.string().trim().min(1, 'Enter a habit name').max(50, 'Use 50 characters or fewer'),
  target: z.string().refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, 'Enter a positive goal'),
  unit: z.string().trim().min(1, 'Enter a unit').max(20, 'Use 20 characters or fewer'),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour time, for example 20:00'),
});
type Form = z.infer<typeof schema>;

export default function HabitEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useAppStore((state) => state.habits.find((item) => item.id === id));
  const add = useAppStore((state) => state.addHabit);
  const update = useAppStore((state) => state.updateHabit);
  const remove = useAppStore((state) => state.deleteHabit);
  const { colors } = useMoodifyTheme();
  const [weekdays, setWeekdays] = useState(existing?.weekdays ?? [0, 1, 2, 3, 4, 5, 6]);
  const [reminderEnabled, setReminder] = useState(existing?.reminderEnabled ?? false);
  const [scheduleError, setScheduleError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { title: existing?.title ?? '', target: String(existing?.target ?? 1), unit: existing?.unit ?? 'times', reminderTime: existing?.reminderTime ?? '20:00' },
  });

  const toggleDay = (day: number) => {
    setScheduleError(undefined);
    setWeekdays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort());
  };

  const save = async (form: Form) => {
    if (!weekdays.length) {
      setScheduleError('Choose at least one day.');
      return;
    }
    setBusy(true);
    setScheduleError(undefined);
    try {
      if (reminderEnabled && !(await requestReminderPermission())) {
        setScheduleError('Notifications are off. Enable them in device settings, then save again.');
        return;
      }
      const habit: Omit<Habit, 'id' | 'createdAt'> = {
        title: form.title.trim(), kind: existing?.kind ?? 'custom', target: Number(form.target), unit: form.unit.trim(), weekdays,
        reminderEnabled, reminderTime: form.reminderTime, active: existing?.active ?? true,
      };
      const habitId = existing?.id ?? add(habit);
      if (existing) update(existing.id, habit);
      await cancelHabitReminders(habitId);
      if (reminderEnabled) await scheduleHabitReminders(habitId, habit.title, weekdays, form.reminderTime);
      router.back();
    } catch {
      setScheduleError('The habit could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const deleteHabit = async () => {
    if (!existing || existing.kind !== 'custom') return;
    setBusy(true);
    try {
      await cancelHabitReminders(existing.id);
      remove(existing.id);
      setDeleteVisible(false);
      router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen keyboard contentStyle={styles.content}>
      <Header title={existing ? 'Edit habit' : 'New habit'} onBack={() => router.back()} />
      <Controller control={control} name="title" render={({ field }) => <Field label="Habit name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="e.g. Stretch" error={errors.title?.message} />} />
      <View style={styles.row}>
        <View style={styles.flex}><Controller control={control} name="target" render={({ field }) => <Field label="Goal" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="decimal-pad" error={errors.target?.message} />} /></View>
        <View style={styles.flex}><Controller control={control} name="unit" render={({ field }) => <Field label="Unit" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="times" error={errors.unit?.message} />} /></View>
      </View>
      <MoodifyText variant="h2">Schedule</MoodifyText>
      <MoodifyText variant="small">Choose the days this goal contributes to your streak.</MoodifyText>
      <View accessible accessibilityLabel="Habit days" style={styles.days}>{dayLabels.map((label, day) => <Chip key={`${label}-${day}`} label={label} selected={weekdays.includes(day)} onPress={() => toggleDay(day)} />)}</View>
      {scheduleError ? <View accessibilityRole="alert" style={[styles.errorBox, { backgroundColor: '#FEE4E2', borderColor: colors.danger }]}><Ionicons name="alert-circle-outline" size={20} color={colors.danger} /><MoodifyText variant="small" color={colors.danger} style={styles.flex}>{scheduleError}</MoodifyText></View> : null}
      <View style={[styles.reminder, { borderColor: colors.border, backgroundColor: colors.surface }]}><View style={styles.flex}><MoodifyText variant="h2">Local reminder</MoodifyText><MoodifyText variant="small">Repeats on selected days in local time.</MoodifyText></View><Switch accessibilityLabel="Local habit reminder" value={reminderEnabled} onValueChange={setReminder} trackColor={{ true: colors.primary }} /></View>
      {reminderEnabled ? <Controller control={control} name="reminderTime" render={({ field }) => <Field label="Reminder time (24-hour)" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="20:00" keyboardType="numbers-and-punctuation" maxLength={5} error={errors.reminderTime?.message} />} /> : null}
      <PrimaryButton title="Save habit" loading={busy} onPress={handleSubmit((form) => void save(form))} />
      {existing?.kind === 'custom' ? <Pressable accessibilityRole="button" onPress={() => setDeleteVisible(true)} style={styles.deleteButton}><Ionicons name="trash-outline" size={20} color={colors.danger} /><MoodifyText color={colors.danger}>Delete custom habit</MoodifyText></Pressable> : null}

      <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.warningIcon}><Ionicons name="warning-outline" size={28} color={colors.danger} /></View>
          <MoodifyText variant="h2" style={styles.center}>Delete this habit?</MoodifyText>
          <MoodifyText style={styles.center}>The habit and all of its progress logs will be permanently removed.</MoodifyText>
          <View style={styles.modalButtons}><Pressable accessibilityRole="button" disabled={busy} onPress={() => setDeleteVisible(false)} style={[styles.modalButton, { borderColor: colors.border }]}><MoodifyText>Cancel</MoodifyText></Pressable><Pressable accessibilityRole="button" disabled={busy} onPress={() => void deleteHabit()} style={[styles.modalButton, { backgroundColor: colors.danger, borderColor: colors.danger }]}>{busy ? <ActivityIndicator color={palette.white} /> : <MoodifyText variant="button" color={palette.white}>Delete</MoodifyText>}</Pressable></View>
        </View></View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  reminder: { minHeight: 76, borderWidth: 1, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  errorBox: { minHeight: 46, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  deleteButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  warningIcon: { width: 52, height: 52, alignSelf: 'center', borderRadius: radius.pill, backgroundColor: '#FEE4E2', alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: spacing.md },
  modalButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
