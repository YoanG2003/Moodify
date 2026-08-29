import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconButton, MoodifyText, PageBackdrop, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useWellnessContent } from '@/hooks/use-wellness-content';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const categories = ['MIND', 'BODY', 'FOCUS', 'SLEEP', 'TESTS'] as const;
const featured: { id: string; title: string; categories: string[]; source: ImageSource }[] = [
  { id: 'grounding', title: 'Focus', categories: ['MIND', 'FOCUS'], source: require('../../../assets/figma/tools/focus.png') },
  { id: 'decision-helper', title: 'Mental\nstability', categories: ['MIND', 'TESTS'], source: require('../../../assets/figma/tools/mental-stability.png') },
  { id: 'self-care-plan', title: 'First aid', categories: ['MIND'], source: require('../../../assets/figma/tools/first-aid.png') },
  { id: 'movement', title: 'Cardio', categories: ['BODY'], source: require('../../../assets/figma/tools/cardio.png') },
];

export default function ToolsScreen() {
  const { colors } = useMoodifyTheme();
  const wellnessContent = useWellnessContent();
  const [category, setCategory] = useState<string>();
  const [showAll, setShowAll] = useState(false);
  const availableIds = useMemo(() => new Set(wellnessContent.filter((item) => item.type === 'tool').map((item) => item.id)), [wellnessContent]);
  const visible = featured.filter((item) => availableIds.has(item.id) && (!category || item.categories.includes(category)));
  const additional = showAll ? wellnessContent.filter((item) => item.type === 'tool' && !featured.some((featuredItem) => featuredItem.id === item.id)) : [];

  return (
    <Screen contentStyle={styles.content}>
      <PageBackdrop />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }] }>
        <IconButton icon="menu-outline" label="Open menu" color={colors.primary} onPress={() => router.push('/menu')} />
        <MoodifyText variant="h1" color={colors.primary}>Tools</MoodifyText>
        <IconButton icon="person-circle-outline" label="Open profile" color={colors.primary} onPress={() => router.push('/profile')} />
      </View>
      <MoodifyText>Choose category</MoodifyText>
      <View style={styles.categories}>
        {categories.map((item) => {
          const selected = item === category;
          return <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { setCategory(selected ? undefined : item); setShowAll(false); }} style={[styles.category, { borderColor: colors.secondary, backgroundColor: selected ? palette.gold100 : 'transparent' }]}><MoodifyText variant="button" color={colors.secondary}>{item}</MoodifyText></Pressable>;
        })}
      </View>
      <MoodifyText>Discover</MoodifyText>
      <View style={styles.list}>
        {visible.map((item) => <ToolCard key={item.id} title={item.title} source={item.source} onPress={() => router.push(`/content/${item.id}`)} />)}
        {additional.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={() => router.push(`/content/${item.id}`)} style={[styles.extraCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><MoodifyText variant="h1">{item.title}</MoodifyText><MoodifyText variant="small">{item.subtitle} · {item.durationMinutes} min</MoodifyText></Pressable>)}
        <Pressable accessibilityRole="button" onPress={() => { setCategory(undefined); setShowAll((value) => !value); }} style={[styles.seeAll, { backgroundColor: colors.surface, borderColor: colors.border }]}><MoodifyText variant="h1" style={styles.regularTitle}>{showAll ? 'Show featured' : 'See all'}</MoodifyText></Pressable>
      </View>
    </Screen>
  );
}

function ToolCard({ title, source, onPress }: { title: string; source: ImageSource; onPress: () => void }) {
  const { colors } = useMoodifyTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${title.replace('\n', ' ')}`} onPress={onPress} style={({ pressed }) => [styles.toolCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={styles.artWrap}><Image source={source} style={styles.art} contentFit="contain" /></View><MoodifyText variant="h1" style={[styles.toolTitle, styles.regularTitle]}>{title}</MoodifyText></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, gap: spacing.sm },
  header: { height: 52, marginHorizontal: -spacing.xl, marginBottom: spacing.sm, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.sm, rowGap: 10, marginHorizontal: -5, marginBottom: spacing.sm },
  category: { width: 107, height: 31, borderWidth: 2, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 19, marginHorizontal: -5 },
  toolCard: { height: 106, borderWidth: 1, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  artWrap: { width: 158, alignItems: 'center', justifyContent: 'center' },
  art: { width: 132, height: 96 },
  toolTitle: { flex: 1, textAlign: 'center' },
  regularTitle: { fontFamily: typography.regular, fontWeight: '400' },
  extraCard: { minHeight: 88, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', padding: spacing.md, gap: 2 },
  seeAll: { height: 106, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
