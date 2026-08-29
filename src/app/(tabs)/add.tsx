import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { IconButton, MoodifyText, PageBackdrop, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing, typography } from '@/theme/tokens';
import type { MoodValue } from '@/types/domain';

const moods: { value: MoodValue; label: string }[] = [
  { value: 1, label: 'Very low' }, { value: 2, label: 'Low' }, { value: 3, label: 'Okay' }, { value: 4, label: 'Good' }, { value: 5, label: 'Great' },
];
const causes: { label: string; source: ImageSource }[] = [
  { label: 'Family', source: require('../../../assets/figma/mood/cause-family.png') },
  { label: 'Friends', source: require('../../../assets/figma/mood/cause-friends.png') },
  { label: 'Stranger', source: require('../../../assets/figma/mood/cause-stranger.png') },
  { label: 'Workout', source: require('../../../assets/figma/mood/cause-workout.png') },
  { label: 'Party', source: require('../../../assets/figma/mood/cause-party.png') },
  { label: 'Traveling', source: require('../../../assets/figma/mood/cause-traveling.png') },
  { label: 'Beloved', source: require('../../../assets/figma/mood/cause-beloved.png') },
  { label: 'Music', source: require('../../../assets/figma/mood/cause-music.png') },
];
const weather: { label: string; source: ImageSource }[] = [
  { label: 'Sunny', source: require('../../../assets/figma/mood/weather-sunny.png') },
  { label: 'Partly cloudy', source: require('../../../assets/figma/mood/weather-partly-cloudy.png') },
  { label: 'Cloudy', source: require('../../../assets/figma/mood/weather-cloudy.png') },
  { label: 'Sun and rain', source: require('../../../assets/figma/mood/weather-sun-rain.png') },
  { label: 'Rain', source: require('../../../assets/figma/mood/weather-rain.png') },
  { label: 'Snow', source: require('../../../assets/figma/mood/weather-snow.png') },
];
const darkCauses: Record<string, ImageSource> = {
  Family: require('../../../assets/figma/mood/cause-family-dark.png'), Friends: require('../../../assets/figma/mood/cause-friends-dark.png'), Stranger: require('../../../assets/figma/mood/cause-stranger-dark.png'), Workout: require('../../../assets/figma/mood/cause-workout-dark.png'), Party: require('../../../assets/figma/mood/cause-party-dark.png'), Traveling: require('../../../assets/figma/mood/cause-traveling-dark.png'), Beloved: require('../../../assets/figma/mood/cause-beloved-dark.png'), Music: require('../../../assets/figma/mood/cause-music-dark.png'),
};
const darkWeather: Record<string, ImageSource> = {
  Sunny: require('../../../assets/figma/mood/weather-sunny-dark.png'), 'Partly cloudy': require('../../../assets/figma/mood/weather-partly-cloudy-dark.png'), Cloudy: require('../../../assets/figma/mood/weather-cloudy-dark.png'), 'Sun and rain': require('../../../assets/figma/mood/weather-sun-rain-dark.png'), Rain: require('../../../assets/figma/mood/weather-rain-dark.png'), Snow: require('../../../assets/figma/mood/weather-snow-dark.png'),
};

export default function AddMoodScreen() {
  const { colors, isDark } = useMoodifyTheme();
  const addMood = useAppStore((state) => state.addMoodEntry);
  const [mood, setMood] = useState<MoodValue>(3);
  const [selectedCauses, setCauses] = useState<string[]>([]);
  const [selectedWeather, setWeather] = useState<string>();
  const [note, setNote] = useState('');
  const saving = useRef(false);
  useFocusEffect(useCallback(() => { saving.current = false; }, []));
  const toggleCause = (cause: string) => setCauses((current) => current.includes(cause) ? current.filter((item) => item !== cause) : [...current, cause]);
  const selectedLabel = useMemo(() => moods.find((item) => item.value === mood)?.label ?? 'Okay', [mood]);
  const nudgeMood = (amount: -1 | 1) => setMood((current) => Math.max(1, Math.min(5, current + amount)) as MoodValue);
  const save = () => {
    if (saving.current) return;
    saving.current = true;
    const entryId = addMood({ occurredAt: new Date().toISOString(), mood, causes: selectedCauses, weather: selectedWeather, note: note.trim() || undefined });
    setMood(3); setCauses([]); setWeather(undefined); setNote('');
    router.push({ pathname: '/mood-done', params: { entryId } });
  };

  return (
    <Screen keyboard contentStyle={styles.content}>
      <PageBackdrop />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }] }>
        <IconButton icon="menu-outline" label="Open menu" color={colors.primary} onPress={() => router.push('/menu')} />
        <MoodifyText variant="h1" color={colors.primary}>Add mood</MoodifyText>
        <IconButton icon="person-circle-outline" label="Open profile" color={colors.primary} onPress={() => router.push('/profile')} />
      </View>
      <View style={styles.nowRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mood time: now" style={[styles.nowButton, { backgroundColor: colors.secondary }]}>
          <Ionicons name="calendar-outline" size={20} color={palette.white} />
          <MoodifyText variant="button" color={palette.white}>Now</MoodifyText>
        </Pressable>
      </View>
      <View style={styles.carouselWrap} accessibilityRole="radiogroup">
        <Image source={isDark ? require('../../../assets/figma/mood/carousel-dark.png') : require('../../../assets/figma/mood/carousel.png')} style={styles.carousel} contentFit="fill" accessibilityLabel={`Current mood: ${selectedLabel}`} />
        <Pressable accessibilityRole="button" accessibilityLabel="Choose a lower mood" accessibilityState={{ disabled: mood === 1 }} disabled={mood === 1} onPress={() => nudgeMood(-1)} style={styles.carouselLeft} />
        <Pressable accessibilityRole="button" accessibilityLabel="Choose a higher mood" accessibilityState={{ disabled: mood === 5 }} disabled={mood === 5} onPress={() => nudgeMood(1)} style={styles.carouselRight} />
        <View style={[styles.moodLabel, { backgroundColor: colors.surface }]}><MoodifyText variant="label" color={colors.primary}>{selectedLabel} · {mood}/5</MoodifyText></View>
      </View>

      <MoodifyText variant="h1" style={styles.center}>What made you feel this way?</MoodifyText>
      <View style={styles.causeGrid} accessibilityRole="radiogroup">
        {causes.map((item) => {
          const selected = selectedCauses.includes(item.label);
          return <Pressable key={item.label} accessibilityRole="checkbox" accessibilityLabel={item.label} accessibilityState={{ checked: selected }} onPress={() => toggleCause(item.label)} style={[styles.cause, selected && { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}><Image source={isDark ? darkCauses[item.label] : item.source} style={styles.causeImage} contentFit="fill" /></Pressable>;
        })}
      </View>

      <View style={[styles.weatherCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MoodifyText variant="h1">Weather</MoodifyText>
        <View style={styles.weatherRow} accessibilityRole="radiogroup">
          {weather.map((item) => {
            const selected = selectedWeather === item.label;
            return <Pressable key={item.label} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ selected }} onPress={() => setWeather(item.label)} style={[styles.weatherChoice, selected && { borderColor: colors.primary }]}><Image source={isDark ? darkWeather[item.label] : item.source} style={styles.weatherImage} contentFit="fill" /></Pressable>;
          })}
        </View>
      </View>

      <TextInput accessibilityLabel="Mood note" multiline maxLength={1000} value={note} onChangeText={setNote} placeholder="Leave note to self" placeholderTextColor={colors.inputPlaceholder} style={[styles.note, { color: colors.inputText, backgroundColor: colors.input, borderColor: colors.border }]} />
      <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.secondary }, pressed && styles.pressed]}>
        <MoodifyText variant="button" color={palette.white}>Add mood</MoodifyText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, gap: spacing.lg },
  header: { height: 52, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  nowRow: { alignItems: 'center', marginTop: -spacing.xs },
  nowButton: { minWidth: 99, height: 39, borderRadius: radius.sm, paddingHorizontal: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  carouselWrap: { height: 215, position: 'relative', borderRadius: radius.sm, overflow: 'hidden' },
  carousel: { width: '100%', height: 215 },
  carouselLeft: { position: 'absolute', left: 0, top: 0, width: '32%', height: '100%' },
  carouselRight: { position: 'absolute', right: 0, top: 0, width: '32%', height: '100%' },
  moodLabel: { position: 'absolute', bottom: 8, alignSelf: 'center', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  center: { textAlign: 'center' },
  causeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 15 },
  cause: { width: 68, height: 65, borderWidth: 2, borderColor: 'transparent', borderRadius: radius.sm, overflow: 'hidden' },
  causeImage: { width: 64, height: 61 },
  weatherCard: { minHeight: 110, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, gap: spacing.sm },
  weatherRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weatherChoice: { width: 47, height: 47, borderRadius: 24, borderWidth: 2, borderColor: 'transparent' },
  weatherImage: { width: 43, height: 43 },
  note: { minHeight: 130, borderWidth: 1, borderRadius: radius.sm, padding: spacing.sm, fontFamily: typography.regular, fontSize: 16, textAlignVertical: 'top' },
  addButton: { width: 147, minHeight: 52, borderRadius: radius.sm, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.78 },
});
