import { averageMood, habitCompletion, mergeHealthDaily, moodSeries, resolveHealthMetric, topCauses } from './insights';
import type { MoodEntry } from '@/types/domain';

const entry = (id: string, mood: 1 | 2 | 3 | 4 | 5, occurredAt: string, causes: string[]): MoodEntry => ({ id, mood, occurredAt, causes, createdAt: occurredAt, updatedAt: occurredAt });

test('aggregates mood values and cause frequency', () => {
  const entries = [entry('a', 2, '2026-08-27T10:00:00Z', ['work']), entry('b', 4, '2026-08-27T18:00:00Z', ['work', 'sleep'])];
  expect(averageMood(entries)).toBe(3);
  expect(topCauses(entries)).toEqual([{ label: 'work', count: 2 }, { label: 'sleep', count: 1 }]);
  expect(moodSeries(entries, 2, new Date('2026-08-28T12:00:00Z'))).toEqual([{ date: '2026-08-27', value: 3 }, { date: '2026-08-28', value: 0 }]);
});

test('calculates habit completion and preserves manual health values', () => {
  expect(habitCompletion([{ id: '1', habitId: 'water', date: '2026-08-28', value: 2000, completed: true, updatedAt: '' }, { id: '2', habitId: 'sleep', date: '2026-08-28', value: 6, completed: false, updatedAt: '' }])).toBe(0.5);
  expect(resolveHealthMetric({ date: '2026-08-28', steps: 4200, sources: { steps: 'manual' } }, 'steps')).toBe(4200);
  expect(mergeHealthDaily(
    { date: '2026-08-28', steps: 1000, waterMl: 1500, sources: { steps: 'manual', waterMl: 'manual' } },
    { date: '2026-08-28', steps: 4200, sleepMinutes: 450, sources: { steps: 'healthkit', sleepMinutes: 'healthkit' } },
  )).toMatchObject({ steps: 4200, sleepMinutes: 450, waterMl: 1500, sources: { steps: 'healthkit', sleepMinutes: 'healthkit', waterMl: 'manual' } });
});
