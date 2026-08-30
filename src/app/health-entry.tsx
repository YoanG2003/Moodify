import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Field, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import { radius, spacing } from '@/theme/tokens';
import type { MetricSource } from '@/types/domain';

const optionalNumber = (label: string, max: number) => z.string().refine((value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= max), `${label} must be between 0 and ${max.toLocaleString()}`);
const schema = z.object({
  steps: optionalNumber('Steps', 250_000),
  sleep: optionalNumber('Sleep', 24),
  water: optionalNumber('Water', 20_000),
});
type Form = z.infer<typeof schema>;

const sourceLabels: Record<MetricSource, string> = { manual: 'Manual', healthkit: 'Apple Health', 'health-connect': 'Health Connect' };

export default function HealthEntryScreen() {
  const date = format(new Date(), 'yyyy-MM-dd');
  const existing = useAppStore((state) => state.healthDaily.find((item) => item.date === date));
  const saveDaily = useAppStore((state) => state.upsertHealthDaily);
  const { colors } = useMoodifyTheme();
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      steps: existing?.steps === undefined ? '' : String(existing.steps),
      sleep: existing?.sleepMinutes === undefined ? '' : String(Number((existing.sleepMinutes / 60).toFixed(2))),
      water: existing?.waterMl === undefined ? '' : String(existing.waterMl),
    },
  });

  const save = (form: Form) => {
    const hasSteps = form.steps !== '';
    const hasSleep = form.sleep !== '';
    const hasWater = form.water !== '';
    saveDaily({
      date,
      steps: hasSteps ? Math.round(Number(form.steps)) : existing?.steps,
      sleepMinutes: hasSleep ? Math.round(Number(form.sleep) * 60) : existing?.sleepMinutes,
      waterMl: hasWater ? Math.round(Number(form.water)) : existing?.waterMl,
      sources: {
        ...existing?.sources,
        ...(hasSteps ? { steps: 'manual' as const } : {}),
        ...(hasSleep ? { sleepMinutes: 'manual' as const } : {}),
        ...(hasWater ? { waterMl: 'manual' as const } : {}),
      },
      syncedAt: existing?.syncedAt,
    });
    router.back();
  };

  return (
    <Screen keyboard contentStyle={styles.content}>
      <Header title="Today’s health data" subtitle={format(new Date(), 'd MMMM yyyy')} onBack={() => router.back()} />
      <View style={[styles.info, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}><Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} /><MoodifyText variant="small" style={styles.flex}>Moodify stores daily summaries, never raw health samples. Manual values remain clearly labeled in Insights.</MoodifyText></View>
      <MetricField label="Steps" source={existing?.sources.steps}>
        <Controller control={control} name="steps" render={({ field }) => <Field label="Steps" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="number-pad" placeholder="e.g. 6500" error={errors.steps?.message} />} />
      </MetricField>
      <MetricField label="Sleep" source={existing?.sources.sleepMinutes}>
        <Controller control={control} name="sleep" render={({ field }) => <Field label="Sleep hours" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="decimal-pad" placeholder="e.g. 7.5" error={errors.sleep?.message} />} />
      </MetricField>
      <MetricField label="Water" source={existing?.sources.waterMl}>
        <Controller control={control} name="water" render={({ field }) => <Field label="Water (ml)" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="number-pad" placeholder="e.g. 1500" error={errors.water?.message} />} />
      </MetricField>
      <MoodifyText variant="small">Entering a value marks that metric as manual for today. Leaving an existing value unchanged preserves it.</MoodifyText>
      <PrimaryButton title="Save health summary" onPress={handleSubmit(save)} />
    </Screen>
  );
}

function MetricField({ label, source, children }: { label: string; source?: MetricSource; children: ReactNode }) {
  const { colors } = useMoodifyTheme();
  return <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.metricHeader}><MoodifyText variant="h2">{label}</MoodifyText>{source ? <View style={[styles.source, { backgroundColor: source === 'manual' ? colors.primarySoft : '#E7F5EA' }]}><MoodifyText variant="small" color={source === 'manual' ? colors.primary : colors.success}>{sourceLabels[source]}</MoodifyText></View> : <MoodifyText variant="small">No value yet</MoodifyText>}</View>{children}</View>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  flex: { flex: 1 },
  info: { minHeight: 58, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metric: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
  metricHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  source: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
