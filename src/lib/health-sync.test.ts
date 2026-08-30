import { createSyncedHealthDaily } from './health-sync';

test('labels only the health metrics that were actually available', () => {
  expect(createSyncedHealthDaily('2026-08-30', 'health-connect', { steps: 4321 }, '2026-08-30T12:00:00.000Z')).toEqual({
    date: '2026-08-30',
    steps: 4321,
    sources: { steps: 'health-connect' },
    syncedAt: '2026-08-30T12:00:00.000Z',
  });
});
