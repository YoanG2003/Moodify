import type { MoodEntry, WellnessContent } from '@/types/domain';

export function recommendContent(content: WellnessContent[], entries: MoodEntry[], limit = 3) {
  const latest = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
  const tags = latest?.mood && latest.mood <= 2 ? ['low'] : latest?.mood === 3 ? ['neutral'] : [];
  return [...content]
    .filter((item) => item.published && item.type === 'recommendation')
    .sort((a, b) => Number(b.tags.some((tag) => tags.includes(tag))) - Number(a.tags.some((tag) => tags.includes(tag))))
    .slice(0, limit);
}
