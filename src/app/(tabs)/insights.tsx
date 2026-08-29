import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, subDays } from 'date-fns';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Chip, IconButton, MoodifyText, PageBackdrop, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { averageMood, moodSeries, topCauses } from '@/lib/insights';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing, typography } from '@/theme/tokens';
import type { HealthDaily, MetricSource, MoodEntry } from '@/types/domain';

const chartTeal = '#34B5BE';
const warning = '#FFB900';
const low = '#E84233';

export default function InsightsScreen() {
  const { colors } = useMoodifyTheme();
  const moods = useAppStore((state) => state.moodEntries);
  const health = useAppStore((state) => state.healthDaily);
  const [range, setRange] = useState<'Week' | 'Month'>('Week');
  const days = range === 'Week' ? 7 : 30;
  const fullSeries = moodSeries(moods, days);
  const chartSeries = range === 'Week'
    ? fullSeries
    : fullSeries.filter((_, index) => index % 5 === 4 || index === fullSeries.length - 1);
  const periodStart = subDays(new Date(), days - 1);
  const periodMoods = moods.filter((entry) => parseISO(entry.occurredAt) >= periodStart);
  const overall = averageMood(periodMoods);
  const causes = topCauses(periodMoods);
  const today = health.find((item) => item.date === format(new Date(), 'yyyy-MM-dd'));
  const weeklyHealth = useMemo(() => recentHealth(health), [health]);

  return (
    <Screen contentStyle={styles.content}>
      <PageBackdrop />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }] }>
        <IconButton icon="menu-outline" label="Open menu" color={colors.primary} onPress={() => router.push('/menu')} />
        <MoodifyText variant="h1" color={colors.primary}>Insights</MoodifyText>
        <IconButton icon="person-circle-outline" label="Open profile" color={colors.primary} onPress={() => router.push('/profile')} />
      </View>

      <View style={styles.range} accessibilityRole="tablist">
        <Chip label="Week" selected={range === 'Week'} onPress={() => setRange('Week')} />
        <Chip label="Month" selected={range === 'Month'} onPress={() => setRange('Month')} />
      </View>

      <InsightCard>
        <CardTitle title="Mood" editLabel="Edit recent moods" onEdit={() => moods[0] && router.push({ pathname: '/mood/[id]', params: { id: moods[0].id } })} />
        <MoodChart points={chartSeries} range={range} />
      </InsightCard>

      <InsightCard>
        <CardTitle title="Sleep" editLabel="Edit sleep" onEdit={() => router.push('/health-entry')} />
        <View style={styles.legend}>
          <Legend color={chartTeal} label="Target reached" />
          <Legend color={warning} label="Warning" />
          <Legend color={low} label="Low" />
        </View>
        <SleepChart values={weeklyHealth} />
        <SourceLabel source={today?.sources.sleepMinutes} />
      </InsightCard>

      <InsightCard compact>
        <CardTitle title="Overall mood" />
        <SplitProgress value={overall / 5} leftIcon="happy-outline" rightIcon="sad-outline" label={overall ? `${overall.toFixed(1)} out of 5` : 'No mood data yet'} />
      </InsightCard>

      <InsightCard compact>
        <CardTitle title="Water" editLabel="Edit water" onEdit={() => router.push('/health-entry')} />
        <View style={styles.progressLabels}><MoodifyText variant="small">0L</MoodifyText><MoodifyText variant="small">2L</MoodifyText></View>
        <SplitProgress value={(today?.waterMl ?? 0) / 2000} label={`${today?.waterMl ?? 0} ml of 2,000 ml`} />
        <SourceLabel source={today?.sources.waterMl} />
      </InsightCard>

      <InsightCard compact>
        <CardTitle title="Average steps" editLabel="Edit steps" onEdit={() => router.push('/health-entry')} />
        <View style={styles.stepsRow}>
          <MoodifyText style={styles.stepsValue} color={chartTeal}>{(today?.steps ?? 0).toLocaleString()}</MoodifyText>
          <View style={styles.stepTarget}><MoodifyText variant="small">Target</MoodifyText><MoodifyText variant="small">15,000</MoodifyText></View>
        </View>
        <SourceLabel source={today?.sources.steps} />
      </InsightCard>

      <InsightCard>
        <MoodifyText variant="h2">What shows up often</MoodifyText>
        {causes.length ? causes.map((cause) => (
          <View key={cause.label} style={styles.cause}>
            <MoodifyText>{cause.label}</MoodifyText>
            <MoodifyText variant="small">{cause.count} check-in{cause.count === 1 ? '' : 's'}</MoodifyText>
          </View>
        )) : <MoodifyText>Log a few moods to reveal recurring causes.</MoodifyText>}
      </InsightCard>

      <InsightCard>
        <MoodifyText variant="h2">Recent check-ins</MoodifyText>
        {moods.slice(0, 5).map((mood) => <MoodRow key={mood.id} mood={mood} />)}
        {!moods.length ? <MoodifyText>No moods yet.</MoodifyText> : null}
      </InsightCard>

      <MoodifyText variant="small" style={styles.disclaimer}>Insights describe your entries and are not medical conclusions. Device health data is optional and can be disconnected at any time.</MoodifyText>
    </Screen>
  );
}

function InsightCard({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const { colors, isDark } = useMoodifyTheme();
  return <View style={[styles.card, compact && styles.compactCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : 'transparent' }]}>{children}</View>;
}

function CardTitle({ title, editLabel, onEdit }: { title: string; editLabel?: string; onEdit?: () => void }) {
  const { colors } = useMoodifyTheme();
  return (
    <View style={styles.cardTitleRow}>
      <MoodifyText variant="h1" style={styles.cardTitle}>{title}</MoodifyText>
      {editLabel ? <IconButton icon="pencil-outline" label={editLabel} onPress={onEdit} color={colors.heading} /> : null}
    </View>
  );
}

function MoodChart({ points, range }: { points: ReturnType<typeof moodSeries>; range: 'Week' | 'Month' }) {
  const { colors } = useMoodifyTheme();
  const { width } = useWindowDimensions();
  const plotWidth = Math.min(260, Math.max(216, width - 116));
  const plotHeight = 178;
  const spacingX = points.length > 1 ? plotWidth / (points.length - 1) : plotWidth;
  const plotted = points.map((point, index) => ({
    ...point,
    x: index * spacingX,
    y: point.value ? ((5 - point.value) / 4) * (plotHeight - 14) + 7 : plotHeight - 7,
  }));

  return (
    <View>
      <View style={styles.moodChartRow}>
        <View style={[styles.moodAxis, { height: plotHeight }]}>
          {(['happy-outline', 'happy-outline', 'remove-circle-outline', 'sad-outline', 'sad-outline'] as const).map((icon, index) => <Ionicons key={`${icon}-${index}`} name={icon} size={20} color={index < 2 ? chartTeal : index === 2 ? colors.textMuted : low} />)}
        </View>
        <View style={{ width: plotWidth, height: plotHeight }} accessibilityRole="image" accessibilityLabel={`Mood trend for this ${range.toLowerCase()}`}>
          {[0, 1, 2, 3, 4].map((row) => <View key={row} style={[styles.gridLine, { top: 7 + row * ((plotHeight - 14) / 4), backgroundColor: colors.border }]} />)}
          {plotted.slice(0, -1).map((point, index) => {
            const next = plotted[index + 1];
            if (!point.value || !next.value) return null;
            const dx = next.x - point.x;
            const dy = next.y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = `${Math.atan2(dy, dx)}rad`;
            return <View key={`line-${point.date}`} style={[styles.chartLine, { width: length, left: point.x, top: point.y, transform: [{ translateY: -1.5 }, { rotate: angle }] }]} />;
          })}
          {plotted.map((point) => point.value ? <View key={point.date} style={[styles.chartDot, { left: point.x - 5, top: point.y - 5 }]} /> : null)}
        </View>
      </View>
      <View style={[styles.dayLabels, { marginLeft: 29, width: plotWidth + 1 }]}>
        {points.map((point) => <MoodifyText key={point.date} variant="small" style={styles.dayLabel}>{format(new Date(`${point.date}T12:00:00`), range === 'Week' ? 'EEEEE' : 'd')}</MoodifyText>)}
      </View>
      {!points.some((point) => point.value) ? <MoodifyText variant="small" style={styles.noData}>Your mood line will appear after your first check-in.</MoodifyText> : null}
    </View>
  );
}

function SleepChart({ values }: { values: { date: string; minutes: number }[] }) {
  const { colors } = useMoodifyTheme();
  return (
    <View>
      <View style={styles.sleepChart}>
        <View style={styles.sleepAxis}>
          {[12, 9, 6, 3, 0].map((hour) => <MoodifyText key={hour} variant="small">{hour}h</MoodifyText>)}
        </View>
        <View style={[styles.barsArea, { borderBottomColor: colors.border }]}>
          {[0, 1, 2, 3].map((row) => <View key={row} style={[styles.sleepGridLine, { top: row * 40, backgroundColor: colors.border }]} />)}
          {values.map((item) => {
            const hours = item.minutes / 60;
            const color = hours >= 7 && hours <= 9 ? chartTeal : hours >= 4 ? warning : low;
            return <View key={item.date} style={styles.barColumn}><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 12, now: Math.round(hours) }} style={[styles.sleepBar, { height: Math.max(item.minutes ? 5 : 2, Math.min(120, hours * 10)), backgroundColor: item.minutes ? color : colors.border }]} /></View>;
          })}
        </View>
      </View>
      <View style={styles.sleepDayLabels}>{values.map((item) => <MoodifyText key={item.date} variant="small" style={styles.sleepDay}>{format(new Date(`${item.date}T12:00:00`), 'EEEEE')}</MoodifyText>)}</View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><MoodifyText variant="small">{label}</MoodifyText></View>;
}

function SplitProgress({ value, label, leftIcon, rightIcon }: { value: number; label: string; leftIcon?: keyof typeof Ionicons.glyphMap; rightIcon?: keyof typeof Ionicons.glyphMap }) {
  const progress = Math.min(1, Math.max(0, value));
  return (
    <View style={styles.splitProgressRow}>
      {leftIcon ? <Ionicons name={leftIcon} size={27} color={chartTeal} /> : null}
      <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={styles.splitTrack}>
        <View style={[styles.splitPart, { flex: Math.max(progress, 0.015), backgroundColor: chartTeal }]} />
        <View style={[styles.splitPart, { flex: Math.max(1 - progress, 0.015), backgroundColor: low }]} />
      </View>
      {rightIcon ? <Ionicons name={rightIcon} size={27} color={low} /> : null}
    </View>
  );
}

function SourceLabel({ source }: { source?: MetricSource }) {
  if (!source) return null;
  const labels: Record<MetricSource, string> = { manual: 'Manual value', healthkit: 'Apple Health', 'health-connect': 'Health Connect' };
  return <MoodifyText variant="small" style={styles.source}>{labels[source]}</MoodifyText>;
}

function MoodRow({ mood }: { mood: MoodEntry }) {
  const labels = ['Very low', 'Low', 'Okay', 'Good', 'Great'];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${labels[mood.mood - 1]} mood from ${format(parseISO(mood.occurredAt), 'd MMMM')}`} onPress={() => router.push({ pathname: '/mood/[id]', params: { id: mood.id } })} style={styles.moodRow}>
      <MoodifyText>{labels[mood.mood - 1]}</MoodifyText>
      <View style={styles.moodRowRight}><MoodifyText variant="small">{format(parseISO(mood.occurredAt), 'd MMM · HH:mm')}</MoodifyText><Ionicons name="chevron-forward" size={18} color={palette.grey500} /></View>
    </Pressable>
  );
}

function recentHealth(health: HealthDaily[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = format(subDays(new Date(), 6 - index), 'yyyy-MM-dd');
    return { date, minutes: health.find((item) => item.date === date)?.sleepMinutes ?? 0 };
  });
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, gap: spacing.lg },
  header: { height: 52, marginHorizontal: -spacing.xl, marginBottom: 2, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  range: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: 20, gap: spacing.md, shadowColor: '#101828', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  compactCard: { minHeight: 139, justifyContent: 'center' },
  cardTitleRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: typography.regular, fontWeight: '400' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  moodChartRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  moodAxis: { width: 21, justifyContent: 'space-between', alignItems: 'center' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, opacity: 0.42 },
  chartLine: { position: 'absolute', height: 3, borderRadius: 3, backgroundColor: chartTeal, transformOrigin: 'left center' },
  chartDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: chartTeal, borderWidth: 2, borderColor: palette.white },
  dayLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  dayLabel: { width: 18, textAlign: 'center' },
  noData: { textAlign: 'center', marginTop: spacing.sm },
  sleepChart: { height: 140, flexDirection: 'row', gap: spacing.sm },
  sleepAxis: { width: 25, height: 128, justifyContent: 'space-between', alignItems: 'flex-end' },
  barsArea: { flex: 1, height: 128, flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: StyleSheet.hairlineWidth, position: 'relative' },
  sleepGridLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, opacity: 0.35 },
  barColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1 },
  sleepBar: { width: 15, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  sleepDayLabels: { flexDirection: 'row', marginLeft: 33 },
  sleepDay: { flex: 1, textAlign: 'center' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: -8 },
  splitProgressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  splitTrack: { height: 18, borderRadius: radius.pill, overflow: 'hidden', flex: 1, flexDirection: 'row' },
  splitPart: { height: '100%' },
  stepsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  stepsValue: { fontFamily: typography.regular, fontWeight: '400', fontSize: 39, lineHeight: 45 },
  stepTarget: { alignItems: 'flex-end', paddingBottom: 3 },
  source: { textAlign: 'right', marginTop: -8 },
  cause: { minHeight: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moodRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moodRowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  disclaimer: { textAlign: 'center', marginHorizontal: spacing.sm },
});
