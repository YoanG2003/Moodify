import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Chip, Header, MoodifyText, PageBackdrop, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import type { MoodValue } from '@/types/domain';
import { radius, spacing } from '@/theme/tokens';

const moods: { value: MoodValue; label: string; face: string }[] = [{ value: 1, label: 'Very low', face: '😞' }, { value: 2, label: 'Low', face: '🙁' }, { value: 3, label: 'Okay', face: '😐' }, { value: 4, label: 'Good', face: '🙂' }, { value: 5, label: 'Great', face: '😄' }];
const causes = ['Work', 'School', 'Family', 'Friends', 'Health', 'Sleep', 'Food', 'Exercise'];
const weather = ['Sunny', 'Cloudy', 'Rain', 'Storm', 'Snow', 'Windy'];

export default function AddMoodScreen() {
  const { colors } = useMoodifyTheme();
  const addMood = useAppStore((state) => state.addMoodEntry);
  const [mood, setMood] = useState<MoodValue>(3);
  const [selectedCauses, setCauses] = useState<string[]>([]);
  const [selectedWeather, setWeather] = useState<string>();
  const [note, setNote] = useState('');
  const saving = useRef(false);
  const toggleCause = (cause: string) => setCauses((current) => current.includes(cause) ? current.filter((item) => item !== cause) : [...current, cause]);
  const selectedLabel = useMemo(() => moods.find((item) => item.value === mood)?.label, [mood]);
  const save = () => {
    if (saving.current) return;
    saving.current = true;
    const entryId = addMood({ occurredAt: new Date().toISOString(), mood, causes: selectedCauses, weather: selectedWeather, note: note.trim() || undefined });
    setMood(3); setCauses([]); setWeather(undefined); setNote('');
    router.push({ pathname: '/mood-done', params: { entryId } });
  };
  return (
    <Screen keyboard>
      <PageBackdrop /><Header title="Add mood" subtitle="A private check-in" />
      <MoodifyText variant="h1">How do you feel right now?</MoodifyText>
      <View style={styles.moods}>{moods.map((item) => <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ selected: mood === item.value }} accessibilityLabel={item.label} onPress={() => setMood(item.value)} style={[styles.mood, { backgroundColor: mood === item.value ? colors.primarySoft : colors.surface, borderColor: mood === item.value ? colors.primary : colors.border }]}><MoodifyText style={styles.face}>{item.face}</MoodifyText></Pressable>)}</View>
      <MoodifyText style={styles.center}>{selectedLabel}</MoodifyText>
      <MoodifyText variant="h1">What made you feel this way?</MoodifyText>
      <View style={styles.chips}>{causes.map((item) => <Chip key={item} label={item} selected={selectedCauses.includes(item)} onPress={() => toggleCause(item)} />)}</View>
      <MoodifyText variant="h2">Weather</MoodifyText>
      <View style={styles.chips}>{weather.map((item) => <Chip key={item} label={item} selected={selectedWeather === item} onPress={() => setWeather(item)} />)}</View>
      <MoodifyText variant="h2">Add a note</MoodifyText>
      <TextInput accessibilityLabel="Mood note" multiline maxLength={1000} value={note} onChangeText={setNote} placeholder="What is on your mind?" placeholderTextColor={colors.textMuted} style={[styles.note, { color: colors.heading, backgroundColor: colors.input, borderColor: colors.border }]} />
      <MoodifyText variant="small" style={styles.count}>{note.length}/1000</MoodifyText>
      <PrimaryButton title="Save mood" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({ moods: { flexDirection: 'row', justifyContent: 'space-between' }, mood: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, face: { fontSize: 28, lineHeight: 34 }, center: { textAlign: 'center' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, note: { minHeight: 130, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, fontSize: 16, textAlignVertical: 'top' }, count: { textAlign: 'right', marginTop: -spacing.md } });
