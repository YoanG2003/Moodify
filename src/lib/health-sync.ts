import type { HealthDaily, MetricSource } from '@/types/domain';

type SyncedMetrics = Pick<HealthDaily, 'steps' | 'sleepMinutes'>;

export function createSyncedHealthDaily(date: string, source: Exclude<MetricSource, 'manual'>, metrics: SyncedMetrics, syncedAt = new Date().toISOString()): HealthDaily {
  const daily: HealthDaily = { date, sources: {}, syncedAt };
  if (metrics.steps !== undefined) {
    daily.steps = Math.max(0, Math.round(metrics.steps));
    daily.sources.steps = source;
  }
  if (metrics.sleepMinutes !== undefined) {
    daily.sleepMinutes = Math.max(0, Math.round(metrics.sleepMinutes));
    daily.sources.sleepMinutes = source;
  }
  return daily;
}
