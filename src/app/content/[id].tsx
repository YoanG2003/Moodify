import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useWellnessContent } from '@/hooks/use-wellness-content';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { radius, spacing } from '@/theme/tokens';

export default function ContentDetailScreen() {
  const wellnessContent = useWellnessContent();
  const { colors } = useMoodifyTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = wellnessContent.find((entry) => entry.id === id);
  const [remaining, setRemaining] = useState(item?.timerSeconds ?? 0);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [running, remaining]);
  const time = useMemo(() => `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`, [remaining]);
  if (!item) return <Screen><Header title="Not found" onBack={() => router.back()} /><MoodifyText>This content is no longer available.</MoodifyText></Screen>;
  return (
    <Screen>
      <Header title={item.title} subtitle={item.category} onBack={() => router.back()} />
      <View style={[styles.hero, { backgroundColor: item.color }]}><Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={58} color="#363636" /><MoodifyText variant="hero" color="#363636">{item.title}</MoodifyText><MoodifyText color="#5B5B5B">{item.subtitle} · {item.durationMinutes} min</MoodifyText></View>
      <MoodifyText variant="h1">About this practice</MoodifyText><MoodifyText>{item.description}</MoodifyText>
      {item.timerSeconds ? <Card style={styles.timer}><MoodifyText variant="hero">{time}</MoodifyText><PrimaryButton title={running ? 'Pause' : remaining ? 'Start' : 'Done'} secondary onPress={() => setRunning((value) => !value)} disabled={remaining === 0} /></Card> : null}
      <MoodifyText variant="h2">Steps</MoodifyText>
      {item.blocks.map((block, index) => <Pressable key={`${block.type}-${index}`} onPress={() => block.type === 'step' && setChecked((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])} style={[styles.block, { backgroundColor: block.type === 'tip' ? colors.primarySoft : colors.surface, borderColor: colors.border }]}><View style={[styles.blockIcon, { backgroundColor: block.type === 'tip' ? colors.primary : checked.includes(index) ? colors.success : colors.border }]}><Ionicons name={block.type === 'tip' ? 'bulb' : checked.includes(index) ? 'checkmark' : 'ellipse-outline'} size={18} color={block.type === 'tip' || checked.includes(index) ? colors.background : colors.text} /></View><MoodifyText style={styles.blockText}>{block.text}</MoodifyText></Pressable>)}
      <MoodifyText variant="small">Choose a comfortable pace and stop if the activity causes pain or distress. This content is informational and not medical treatment.</MoodifyText>
    </Screen>
  );
}

const styles = StyleSheet.create({ hero: { minHeight: 230, borderRadius: radius.xl, padding: spacing.xl, justifyContent: 'flex-end', gap: spacing.sm }, timer: { alignItems: 'center', gap: spacing.md }, block: { minHeight: 64, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, blockIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, blockText: { flex: 1 } });
