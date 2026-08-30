import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useWellnessContent } from '@/hooks/use-wellness-content';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { areAllStepsComplete, toggleCompletedStep } from '@/lib/content-progress';
import { useAppStore } from '@/state/use-app-store';
import { radius, spacing } from '@/theme/tokens';

export default function ContentDetailScreen() {
  const wellnessContent = useWellnessContent();
  const { colors } = useMoodifyTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = wellnessContent.find((entry) => entry.id === id);
  const [remaining, setRemaining] = useState(item?.timerSeconds ?? 0);
  const [running, setRunning] = useState(false);
  const progress = useAppStore((state) => state.contentProgress[id ?? '']);
  const updateProgress = useAppStore((state) => state.updateContentProgress);
  const resetProgress = useAppStore((state) => state.resetContentProgress);
  const checked = progress?.checkedSteps ?? [];
  const stepIndexes = useMemo(() => item?.blocks.flatMap((block, index) => block.type === 'step' ? [index] : []) ?? [], [item]);
  const allStepsComplete = areAllStepsComplete(stepIndexes, checked);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = setTimeout(() => {
      if (remaining <= 1) {
        setRemaining(0);
        setRunning(false);
        if (item) updateProgress(item.id, { completedAt: new Date().toISOString() });
      } else {
        setRemaining(remaining - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [item, remaining, running, updateProgress]);

  const time = useMemo(() => `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`, [remaining]);
  if (!item) return <Screen><Header title="Not found" onBack={() => router.back()} /><MoodifyText>This content is no longer available.</MoodifyText></Screen>;

  const toggleStep = (index: number) => {
    const checkedSteps = toggleCompletedStep(checked, index);
    updateProgress(item.id, {
      checkedSteps,
      completedAt: areAllStepsComplete(stepIndexes, checkedSteps) ? new Date().toISOString() : remaining === 0 && item.timerSeconds ? progress?.completedAt : undefined,
    });
  };
  const resetPractice = () => {
    setRunning(false);
    setRemaining(item.timerSeconds ?? 0);
    resetProgress(item.id);
  };
  const restartPractice = () => {
    resetPractice();
    setRunning(true);
  };

  return (
    <Screen>
      <Header title={item.title} subtitle={item.category} onBack={() => router.back()} />
      <View style={[styles.hero, { backgroundColor: item.color }]}><Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={58} color="#363636" /><MoodifyText variant="hero" color="#363636">{item.title}</MoodifyText><MoodifyText color="#5B5B5B">{item.subtitle} · {item.durationMinutes} min</MoodifyText></View>
      <MoodifyText variant="h1">About this practice</MoodifyText><MoodifyText>{item.description}</MoodifyText>
      {progress?.completedAt || allStepsComplete ? <View accessibilityRole="alert" style={[styles.completeBanner, { backgroundColor: colors.primarySoft }]}><Ionicons name="checkmark-circle" size={24} color={colors.primary} /><MoodifyText variant="h2" color={colors.primary}>Practice complete</MoodifyText></View> : null}
      {item.timerSeconds ? <Card style={styles.timer}>
        <MoodifyText variant="small">PRACTICE TIMER</MoodifyText>
        <MoodifyText variant="hero" accessibilityLabel={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds remaining`}>{time}</MoodifyText>
        <PrimaryButton title={running ? 'Pause' : remaining === 0 ? 'Restart' : 'Start'} secondary onPress={() => remaining === 0 ? restartPractice() : setRunning((value) => !value)} />
        {remaining !== item.timerSeconds || progress ? <Pressable accessibilityRole="button" onPress={resetPractice} style={styles.resetButton}><Ionicons name="refresh" size={18} color={colors.primary} /><MoodifyText color={colors.primary}>Reset practice</MoodifyText></Pressable> : null}
      </Card> : null}
      <MoodifyText variant="h2">Steps</MoodifyText>
      {item.blocks.map((block, index) => {
        const selected = checked.includes(index);
        const content = <><View style={[styles.blockIcon, { backgroundColor: block.type === 'tip' ? colors.primary : selected ? colors.success : colors.border }]}><Ionicons name={block.type === 'tip' ? 'bulb' : selected ? 'checkmark' : 'ellipse-outline'} size={18} color={block.type === 'tip' || selected ? colors.background : colors.text} /></View><MoodifyText style={styles.blockText}>{block.text}</MoodifyText></>;
        const style = [styles.block, { backgroundColor: block.type === 'tip' ? colors.primarySoft : colors.surface, borderColor: colors.border }];
        return block.type === 'step'
          ? <Pressable key={`${block.type}-${index}`} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={block.text} onPress={() => toggleStep(index)} style={style}>{content}</Pressable>
          : <View key={`${block.type}-${index}`} style={style}>{content}</View>;
      })}
      {stepIndexes.length ? <MoodifyText variant="small">{checked.filter((index) => stepIndexes.includes(index)).length} of {stepIndexes.length} steps complete</MoodifyText> : null}
      <MoodifyText variant="small">Choose a comfortable pace and stop if the activity causes pain or distress. This content is informational and not medical treatment.</MoodifyText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 230, borderRadius: radius.xl, padding: spacing.xl, justifyContent: 'flex-end', gap: spacing.sm },
  completeBanner: { minHeight: 56, borderRadius: radius.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timer: { alignItems: 'center', gap: spacing.md },
  resetButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  block: { minHeight: 64, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  blockIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  blockText: { flex: 1 },
});
