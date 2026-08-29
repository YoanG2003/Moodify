import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Chip, Header, MoodifyText, PageBackdrop, Screen } from '@/components/ui';
import { useWellnessContent } from '@/hooks/use-wellness-content';
import { radius, spacing } from '@/theme/tokens';

export default function ToolsScreen() {
  const wellnessContent = useWellnessContent();
  const categories = ['All', ...new Set(wellnessContent.filter((item) => item.type === 'tool').map((item) => item.category))];
  const [category, setCategory] = useState('All');
  const tools = wellnessContent.filter((item) => item.type === 'tool' && (category === 'All' || item.category === category));
  return (
    <Screen>
      <PageBackdrop /><Header title="Tools" right={<Ionicons name="sparkles-outline" size={22} color="#007474" />} />
      <MoodifyText variant="h2">Choose category</MoodifyText>
      <View style={styles.chips}>{categories.map((item) => <Chip key={item} label={item} selected={item === category} onPress={() => setCategory(item)} />)}</View>
      <MoodifyText variant="h1">Discover</MoodifyText>
      <View style={styles.list}>{tools.map((item) => <Card key={item.id} onPress={() => router.push(`/content/${item.id}`)} accessibilityLabel={`Open ${item.title}`} style={styles.toolCard}><View style={[styles.art, { backgroundColor: item.color }]}><Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={34} color="#363636" /></View><View style={styles.toolCopy}><MoodifyText variant="h2">{item.title}</MoodifyText><MoodifyText variant="small">{item.subtitle}</MoodifyText><MoodifyText variant="small">{item.durationMinutes} min</MoodifyText></View><Ionicons name="chevron-forward" size={22} color="#808080" /></Card>)}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, list: { gap: spacing.md }, toolCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }, art: { width: 88, height: 80, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, toolCopy: { flex: 1, gap: 2 } });
