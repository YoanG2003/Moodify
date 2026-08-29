import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Chip, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import type { MoodValue } from '@/types/domain';
import { radius, spacing } from '@/theme/tokens';

const moods: { value: MoodValue; face: string }[] = [{ value: 1, face: '😞' }, { value: 2, face: '🙁' }, { value: 3, face: '😐' }, { value: 4, face: '🙂' }, { value: 5, face: '😄' }];
const causes = ['Work', 'School', 'Family', 'Friends', 'Health', 'Sleep', 'Food', 'Exercise'];

export default function MoodEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useAppStore((state) => state.moodEntries.find((item) => item.id === id));
  const update = useAppStore((state) => state.updateMoodEntry);
  const remove = useAppStore((state) => state.deleteMoodEntry);
  const { colors } = useMoodifyTheme();
  const [mood, setMood] = useState<MoodValue>(entry?.mood ?? 3);
  const [selectedCauses, setCauses] = useState(entry?.causes ?? []);
  const [note, setNote] = useState(entry?.note ?? '');
  if (!entry) return <Screen><Header title="Mood not found" onBack={() => router.back()} /></Screen>;
  const toggle = (cause: string) => setCauses((current) => current.includes(cause) ? current.filter((item) => item !== cause) : [...current, cause]);
  const save = () => { update(entry.id, { mood, causes: selectedCauses, note: note.trim() || undefined }); router.back(); };
  const confirmDelete = () => Alert.alert('Delete this mood?', 'This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { remove(entry.id); router.back(); } }]);
  return <Screen keyboard>
    <Header title="Edit mood" onBack={() => router.back()} />
    <View style={styles.moods}>{moods.map((item) => <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ selected: mood === item.value }} onPress={() => setMood(item.value)} style={[styles.mood, { backgroundColor: mood === item.value ? colors.primarySoft : colors.surface, borderColor: mood === item.value ? colors.primary : colors.border }]}><MoodifyText style={styles.face}>{item.face}</MoodifyText></Pressable>)}</View>
    <MoodifyText variant="h2">Contributing causes</MoodifyText>
    <View style={styles.chips}>{causes.map((item) => <Chip key={item} label={item} selected={selectedCauses.includes(item)} onPress={() => toggle(item)} />)}</View>
    <MoodifyText variant="h2">Note</MoodifyText>
    <TextInput accessibilityLabel="Mood note" multiline maxLength={1000} value={note} onChangeText={setNote} style={[styles.note, { color: colors.heading, backgroundColor: colors.input, borderColor: colors.border }]} />
    <PrimaryButton title="Save changes" onPress={save} />
    <PrimaryButton title="Delete mood" secondary onPress={confirmDelete} />
  </Screen>;
}

const styles = StyleSheet.create({ moods: { flexDirection: 'row', justifyContent: 'space-between' }, mood: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, face: { fontSize: 28, lineHeight: 34 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, note: { minHeight: 130, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, fontSize: 16, textAlignVertical: 'top' } });
