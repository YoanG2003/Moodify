import { useAppStore } from './use-app-store';

jest.mock('@react-native-async-storage/async-storage', () => jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('@/services/cloud-sync', () => ({
  deleteCloudRecord: jest.fn(),
  syncHabit: jest.fn(),
  syncHabitLog: jest.fn(),
  syncHealthDaily: jest.fn(),
  syncMoodEntry: jest.fn(),
  syncSettings: jest.fn(),
}));

test('removes personal device data when signing out', () => {
  useAppStore.setState({
    profile: {
      uid: 'user-a',
      email: 'user@example.com',
      displayName: 'User',
      ageBand: '18+',
      avatar: { hair: 'waves', skin: 'medium', eyes: 'happy', clothes: 'hoodie' },
      termsVersion: '1',
      privacyVersion: '1',
      emailVerified: true,
      createdAt: '2026-08-30T00:00:00.000Z',
    },
    moodEntries: [{ id: 'mood', occurredAt: '2026-08-30T00:00:00.000Z', mood: 4, causes: [], createdAt: '2026-08-30T00:00:00.000Z', updatedAt: '2026-08-30T00:00:00.000Z' }],
    healthDaily: [{ date: '2026-08-30', steps: 5000, sources: { steps: 'manual' } }],
    chatSessions: [{ id: 'chat', title: 'Private', messages: [], createdAt: '2026-08-30T00:00:00.000Z', expiresAt: '2026-09-29T00:00:00.000Z' }],
    contentProgress: { breathing: { checkedSteps: [0], updatedAt: '2026-08-30T00:00:00.000Z' } },
  });

  useAppStore.getState().logout();

  const state = useAppStore.getState();
  expect(state.profile).toBeNull();
  expect(state.moodEntries).toEqual([]);
  expect(state.healthDaily).toEqual([]);
  expect(state.chatSessions).toEqual([]);
  expect(state.contentProgress).toEqual({});
  expect(state.settings.analyticsEnabled).toBe(false);
  expect(state.settings.crashReportingEnabled).toBe(false);
});
