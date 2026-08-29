import { format, parseISO, startOfDay, subDays } from 'date-fns';
import type { HabitLog, HealthDaily, MoodEntry } from '@/types/domain';

export function averageMood(entries: MoodEntry[]): number {
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
}

export function moodSeries(entries: MoodEntry[], days = 7, now = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = subDays(startOfDay(now), days - index - 1);
    const key = format(date, 'yyyy-MM-dd');
    const values = entries.filter((entry) => format(parseISO(entry.occurredAt), 'yyyy-MM-dd') === key);
    return { date: key, value: averageMood(values) };
  });
}

export function topCauses(entries: MoodEntry[], limit = 3) {
  const counts = new Map<string, number>();
  entries.forEach((entry) => entry.causes.forEach((cause) => counts.set(cause, (counts.get(cause) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count }));
}

export function habitCompletion(logs: HabitLog[]): number {
  if (!logs.length) return 0;
  return logs.filter((log) => log.completed).length / logs.length;
}

export function resolveHealthMetric(
  daily: HealthDaily | undefined,
  metric: 'steps' | 'sleepMinutes' | 'waterMl',
) {
  return daily?.[metric] ?? 0;
}

export function mergeHealthDaily(existing: HealthDaily | undefined, incoming: HealthDaily): HealthDaily {
  return {
    ...existing,
    ...incoming,
    sources: { ...existing?.sources, ...incoming.sources },
  };
}
