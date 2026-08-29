import { wellnessContent } from '@/data/seed';
import { recommendContent } from './recommendations';

test('prioritizes low-mood recommendations deterministically', () => {
  const recommendations = recommendContent(wellnessContent, [{ id: 'm', mood: 1, causes: [], occurredAt: '2026-08-28T10:00:00Z', createdAt: '', updatedAt: '' }]);
  expect(recommendations[0]?.tags).toContain('low');
  expect(recommendations).toHaveLength(3);
});
