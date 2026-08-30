import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Chip, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing, typography } from '@/theme/tokens';
import type { MoodValue } from '@/types/domain';

const moods: { value: MoodValue; face: string; label: string }[] = [
  { value: 1, face: '😞', label: 'Very low' }, { value: 2, face: '🙁', label: 'Low' }, { value: 3, face: '😐', label: 'Okay' }, { value: 4, face: '🙂', label: 'Good' }, { value: 5, face: '😄', label: 'Great' },
];
const causes = ['Family', 'Friends', 'Stranger', 'Workout', 'Party', 'Traveling', 'Beloved', 'Music'];
const weatherOptions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Sun and rain', 'Rain', 'Snow'];

export default function MoodEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useAppStore((state) => state.moodEntries.find((item) => item.id === id));
  const update = useAppStore((state) => state.updateMoodEntry);
  const remove = useAppStore((state) => state.deleteMoodEntry);
  const { colors } = useMoodifyTheme();
  const [mood, setMood] = useState<MoodValue>(entry?.mood ?? 3);
  const [selectedCauses, setCauses] = useState(entry?.causes ?? []);
  const [weather, setWeather] = useState(entry?.weather);
  const [note, setNote] = useState(entry?.note ?? '');
  const [deleteVisible, setDeleteVisible] = useState(false);

  if (!entry) return <Screen><Header title="Mood not found" onBack={() => router.back()} /><MoodifyText>This check-in may have been deleted on another device.</MoodifyText></Screen>;

  const toggleCause = (cause: string) => setCauses((current) => current.includes(cause) ? current.filter((item) => item !== cause) : [...current, cause]);
  const save = () => {
    update(entry.id, { mood, causes: selectedCauses, weather, note: note.trim() || undefined });
    router.back();
  };
  const deleteMood = () => {
    remove(entry.id);
    setDeleteVisible(false);
    router.back();
  };

  return (
    <Screen keyboard contentStyle={styles.content}>
      <Header title="Edit mood" onBack={() => router.back()} />
      <MoodifyText variant="h2">How did you feel?</MoodifyText>
      <View style={styles.moods} accessibilityRole="radiogroup">
        {moods.map((item) => (
          <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ checked: mood === item.value }} onPress={() => setMood(item.value)} style={[styles.mood, { backgroundColor: mood === item.value ? colors.primarySoft : colors.surface, borderColor: mood === item.value ? colors.primary : colors.border }]}>
            <MoodifyText style={styles.face}>{item.face}</MoodifyText>
          </Pressable>
        ))}
      </View>

      <MoodifyText variant="h2">What contributed?</MoodifyText>
      <View style={styles.chips}>{causes.map((item) => <Chip key={item} label={item} selected={selectedCauses.includes(item)} onPress={() => toggleCause(item)} />)}</View>

      <MoodifyText variant="h2">Weather</MoodifyText>
      <View style={styles.chips}>
        {weatherOptions.map((item) => <Chip key={item} label={item} selected={weather === item} onPress={() => setWeather(weather === item ? undefined : item)} />)}
      </View>

      <MoodifyText variant="h2">Note</MoodifyText>
      <TextInput accessibilityLabel="Mood note" multiline maxLength={1500} value={note} onChangeText={setNote} placeholder="Leave a note to yourself" placeholderTextColor={colors.inputPlaceholder} style={[styles.note, { color: colors.inputText, backgroundColor: colors.input, borderColor: colors.border }]} />
      <MoodifyText variant="small" style={styles.count}>{note.length} / 1,500</MoodifyText>
      <PrimaryButton title="Save changes" onPress={save} />
      <Pressable accessibilityRole="button" onPress={() => setDeleteVisible(true)} style={styles.deleteButton}><Ionicons name="trash-outline" size={20} color={colors.danger} /><MoodifyText color={colors.danger}>Delete mood</MoodifyText></Pressable>

      <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.warningIcon}><Ionicons name="warning-outline" size={28} color={colors.danger} /></View>
            <MoodifyText variant="h2" style={styles.center}>Delete this mood?</MoodifyText>
            <MoodifyText style={styles.center}>This check-in will be permanently removed from Moodify and your synced devices.</MoodifyText>
            <View style={styles.modalButtons}>
              <Pressable accessibilityRole="button" onPress={() => setDeleteVisible(false)} style={[styles.modalButton, { borderColor: colors.border }]}><MoodifyText>Cancel</MoodifyText></Pressable>
              <Pressable accessibilityRole="button" onPress={deleteMood} style={[styles.modalButton, { backgroundColor: colors.danger, borderColor: colors.danger }]}><MoodifyText variant="button" color={palette.white}>Delete</MoodifyText></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  moods: { flexDirection: 'row', justifyContent: 'space-between' },
  mood: { width: 58, height: 58, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  face: { fontSize: 28, lineHeight: 34 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  note: { minHeight: 130, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, fontFamily: typography.regular, fontSize: 16, textAlignVertical: 'top' },
  count: { textAlign: 'right', marginTop: -spacing.sm },
  deleteButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  warningIcon: { width: 52, height: 52, alignSelf: 'center', borderRadius: radius.pill, backgroundColor: '#FEE4E2', alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: spacing.md },
  modalButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
