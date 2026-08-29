import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Chip, Header, MoodifyText, PageBackdrop, PrimaryButton, ProgressBar, Screen } from '@/components/ui';
import { averageMood, habitCompletion, moodSeries, topCauses } from '@/lib/insights';
import { useAppStore } from '@/state/use-app-store';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { radius, spacing } from '@/theme/tokens';

export default function InsightsScreen() {
  const { colors } = useMoodifyTheme();
  const moods = useAppStore((state) => state.moodEntries);
  const logs = useAppStore((state) => state.habitLogs);
  const health = useAppStore((state) => state.healthDaily);
  const [range, setRange] = useState<'Week' | 'Month'>('Week');
  const series = moodSeries(moods, range === 'Week' ? 7 : 30);
  const overall = averageMood(moods);
  const causes = topCauses(moods);
  const today = health.find((item) => item.date === format(new Date(), 'yyyy-MM-dd'));
  return (
    <Screen>
      <PageBackdrop /><Header title="Insights" subtitle="Patterns, not judgments" />
      <View style={styles.range}><Chip label="Week" selected={range === 'Week'} onPress={() => setRange('Week')} /><Chip label="Month" selected={range === 'Month'} onPress={() => setRange('Month')} /></View>
      <Card style={styles.card}><View style={styles.metricRow}><View><MoodifyText variant="small">Overall mood</MoodifyText><MoodifyText variant="hero">{overall ? overall.toFixed(1) : '—'}</MoodifyText></View><MoodifyText variant="small">out of 5</MoodifyText></View><View style={styles.chart}>{series.map((point) => <View key={point.date} style={styles.barSlot}><View style={[styles.bar, { height: `${Math.max(4, point.value * 18)}%`, backgroundColor: point.value ? colors.primary : colors.border }]} /><MoodifyText variant="small">{format(new Date(`${point.date}T12:00:00`), range === 'Week' ? 'EEEEE' : 'd')}</MoodifyText></View>)}</View></Card>
      <View style={styles.grid}><MetricCard label="Steps" value={(today?.steps ?? 0).toLocaleString()} target="10,000" progress={(today?.steps ?? 0) / 10000} /><MetricCard label="Sleep" value={`${((today?.sleepMinutes ?? 0) / 60).toFixed(1)} h`} target="8 h" progress={(today?.sleepMinutes ?? 0) / 480} /><MetricCard label="Water" value={`${today?.waterMl ?? 0} ml`} target="2,000 ml" progress={(today?.waterMl ?? 0) / 2000} /><MetricCard label="Habits" value={`${Math.round(habitCompletion(logs) * 100)}%`} target="completed" progress={habitCompletion(logs)} /></View>
      <PrimaryButton title="Add manual health data" secondary onPress={() => router.push('/health-entry')} />
      <Card style={styles.card}><MoodifyText variant="h2">What shows up often</MoodifyText>{causes.length ? causes.map((cause) => <View key={cause.label} style={styles.cause}><MoodifyText>{cause.label}</MoodifyText><MoodifyText variant="small">{cause.count} check-ins</MoodifyText></View>) : <MoodifyText>Log a few moods to reveal recurring causes.</MoodifyText>}</Card>
      <Card style={styles.card}><MoodifyText variant="h2">Recent check-ins</MoodifyText>{moods.slice(0, 5).map((mood) => <MoodRow key={mood.id} mood={mood.mood} date={mood.occurredAt} onPress={() => router.push({ pathname: '/mood/[id]', params: { id: mood.id } })} />)}{!moods.length ? <MoodifyText>No moods yet.</MoodifyText> : null}</Card>
      <MoodifyText variant="small">Insights describe your entries and are not medical conclusions. Device health data is optional and can be disconnected at any time.</MoodifyText>
    </Screen>
  );
}

function MetricCard({ label, value, target, progress }: { label: string; value: string; target: string; progress: number }) { return <Card style={styles.metricCard}><MoodifyText variant="small">{label}</MoodifyText><MoodifyText variant="h2">{value}</MoodifyText><ProgressBar value={progress} /><MoodifyText variant="small">Target: {target}</MoodifyText></Card>; }
function MoodRow({ mood, date, onPress }: { mood: number; date: string; onPress: () => void }) { return <Chip label={`${['😞','🙁','😐','🙂','😄'][mood - 1]}  ${format(new Date(date), 'd MMM · HH:mm')}  · Edit`} onPress={onPress} />; }
const styles = StyleSheet.create({ range: { flexDirection: 'row', gap: spacing.sm }, card: { gap: spacing.md }, metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, chart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }, barSlot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }, bar: { width: '70%', minHeight: 4, borderRadius: radius.pill }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, metricCard: { width: '47%', gap: spacing.sm }, cause: { flexDirection: 'row', justifyContent: 'space-between' } });
