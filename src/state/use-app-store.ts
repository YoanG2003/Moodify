import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, format } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { defaultHabits } from '@/data/seed';
import type {
  AppSettings,
  ChatMessage,
  ChatSession,
  ContentProgress,
  Habit,
  HabitLog,
  HealthDaily,
  MoodEntry,
  UserProfile,
} from '@/types/domain';
import { deleteCloudRecord, syncHabit, syncHabitLog, syncHealthDaily, syncMoodEntry, syncSettings, type CloudUserData } from '@/services/cloud-sync';
import { mergeHealthDaily } from '@/lib/insights';

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const expiresIn30Days = () => addDays(new Date(), 30).toISOString();

const defaultSettings: AppSettings = {
  theme: 'system',
  locale: 'en',
  region: 'EU',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Sofia',
  moodReminderEnabled: false,
  moodReminderTime: '20:00',
  healthSyncEnabled: false,
  analyticsEnabled: false,
  crashReportingEnabled: false,
};

const emptyPersonalData = () => ({
  settings: defaultSettings,
  moodEntries: [] as MoodEntry[],
  habits: defaultHabits,
  habitLogs: [] as HabitLog[],
  healthDaily: [] as HealthDaily[],
  chatSessions: [] as ChatSession[],
  contentProgress: {} as Record<string, ContentProgress>,
});

type RegisterInput = Pick<UserProfile, 'email' | 'displayName' | 'ageBand'>;

interface AppState {
  hasHydrated: boolean;
  hasSeenOnboarding: boolean;
  profile: UserProfile | null;
  settings: AppSettings;
  moodEntries: MoodEntry[];
  habits: Habit[];
  habitLogs: HabitLog[];
  healthDaily: HealthDaily[];
  chatSessions: ChatSession[];
  contentProgress: Record<string, ContentProgress>;
  setHydrated: (value: boolean) => void;
  setProfile: (profile: UserProfile | null) => void;
  applyCloudData: (data: CloudUserData) => void;
  completeOnboarding: () => void;
  loginDemo: (email: string) => void;
  register: (input: RegisterInput) => void;
  logout: () => void;
  updateProfile: (update: Partial<UserProfile>) => void;
  updateSettings: (update: Partial<AppSettings>) => void;
  addMoodEntry: (input: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMoodEntry: (entryId: string, update: Partial<MoodEntry>) => void;
  deleteMoodEntry: (entryId: string) => void;
  rateMoodEntry: (entryId: string, rating: number) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => string;
  updateHabit: (habitId: string, update: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  logHabit: (habitId: string, value: number, date?: string) => void;
  upsertHealthDaily: (daily: HealthDaily) => void;
  ensureChatSession: () => string;
  addChatMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'createdAt' | 'expiresAt'>) => ChatMessage;
  updateChatResponseId: (sessionId: string, responseId: string) => void;
  clearChatHistory: () => void;
  updateContentProgress: (contentId: string, update: Partial<ContentProgress>) => void;
  resetContentProgress: (contentId: string) => void;
  deleteAccountData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      hasSeenOnboarding: false,
      profile: null,
      settings: defaultSettings,
      moodEntries: [],
      habits: defaultHabits,
      habitLogs: [],
      healthDaily: [],
      chatSessions: [],
      contentProgress: {},
      setHydrated: (value) => set({ hasHydrated: value }),
      setProfile: (profile) => set((state) => state.profile?.uid === profile?.uid ? { profile } : { ...emptyPersonalData(), profile }),
      applyCloudData: (data) => set(data),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      loginDemo: (email) => set({
        ...emptyPersonalData(),
        profile: {
          uid: 'local-demo', email, displayName: 'Lily', ageBand: '18+',
          avatar: { hair: 'waves', skin: 'medium', eyes: 'happy', clothes: 'hoodie' },
          termsVersion: '2026-08-28', privacyVersion: '2026-08-28', emailVerified: true,
          createdAt: new Date().toISOString(),
        },
      }),
      register: (input) => set({
        ...emptyPersonalData(),
        profile: {
          uid: `local-${id()}`,
          ...input,
          avatar: { hair: 'waves', skin: 'medium', eyes: 'happy', clothes: 'hoodie' },
          termsVersion: '2026-08-28', privacyVersion: '2026-08-28', emailVerified: false,
          createdAt: new Date().toISOString(),
        },
      }),
      logout: () => set({ ...emptyPersonalData(), profile: null }),
      updateProfile: (update) => set((state) => ({ profile: state.profile ? { ...state.profile, ...update } : null })),
      updateSettings: (update) => set((state) => {
        const settings = { ...state.settings, ...update };
        void syncSettings(state.profile?.uid, settings);
        return { settings };
      }),
      addMoodEntry: (input) => {
        const entryId = id();
        const timestamp = new Date().toISOString();
        const entry: MoodEntry = { ...input, id: entryId, createdAt: timestamp, updatedAt: timestamp };
        void syncMoodEntry(get().profile?.uid, entry);
        set((state) => ({ moodEntries: [entry, ...state.moodEntries] }));
        return entryId;
      },
      updateMoodEntry: (entryId, update) => set((state) => ({
        moodEntries: state.moodEntries.map((entry) => {
          if (entry.id !== entryId) return entry;
          const next = { ...entry, ...update, updatedAt: new Date().toISOString() };
          void syncMoodEntry(state.profile?.uid, next);
          return next;
        }),
      })),
      deleteMoodEntry: (entryId) => set((state) => {
        void deleteCloudRecord(state.profile?.uid, 'moodEntries', entryId);
        return { moodEntries: state.moodEntries.filter((entry) => entry.id !== entryId) };
      }),
      rateMoodEntry: (entryId, rating) => get().updateMoodEntry(entryId, { feedback: rating }),
      addHabit: (habit) => {
        const next = { ...habit, id: id(), createdAt: new Date().toISOString() };
        void syncHabit(get().profile?.uid, next);
        set((state) => ({ habits: [...state.habits, next] }));
        return next.id;
      },
      updateHabit: (habitId, update) => set((state) => ({ habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const next = { ...habit, ...update };
        void syncHabit(state.profile?.uid, next);
        return next;
      }) })),
      deleteHabit: (habitId) => set((state) => {
        void deleteCloudRecord(state.profile?.uid, 'habits', habitId);
        state.habitLogs.filter((log) => log.habitId === habitId).forEach((log) => void deleteCloudRecord(state.profile?.uid, 'habitLogs', log.id));
        return { habits: state.habits.filter((habit) => habit.id !== habitId), habitLogs: state.habitLogs.filter((log) => log.habitId !== habitId) };
      }),
      logHabit: (habitId, value, date = format(new Date(), 'yyyy-MM-dd')) => set((state) => {
        const habit = state.habits.find((item) => item.id === habitId);
        if (!habit) return state;
        const logId = `${habitId}-${date}`;
        const next: HabitLog = { id: logId, habitId, date, value, completed: value >= habit.target, updatedAt: new Date().toISOString() };
        void syncHabitLog(state.profile?.uid, next);
        return { habitLogs: [...state.habitLogs.filter((log) => log.id !== logId), next] };
      }),
      upsertHealthDaily: (daily) => set((state) => {
        const merged = mergeHealthDaily(state.healthDaily.find((item) => item.date === daily.date), daily);
        void syncHealthDaily(state.profile?.uid, merged);
        return { healthDaily: [...state.healthDaily.filter((item) => item.date !== daily.date), merged] };
      }),
      ensureChatSession: () => {
        const existing = get().chatSessions[0];
        if (existing && new Date(existing.expiresAt) > new Date()) return existing.id;
        const session: ChatSession = { id: id(), title: 'Wellbeing chat', messages: [], createdAt: new Date().toISOString(), expiresAt: expiresIn30Days() };
        set((state) => ({ chatSessions: [session, ...state.chatSessions] }));
        return session.id;
      },
      addChatMessage: (sessionId, message) => {
        const created: ChatMessage = { ...message, id: id(), createdAt: new Date().toISOString(), expiresAt: expiresIn30Days() };
        set((state) => ({ chatSessions: state.chatSessions.map((session) => session.id === sessionId ? { ...session, messages: [...session.messages, created] } : session) }));
        return created;
      },
      updateChatResponseId: (sessionId, responseId) => set((state) => ({ chatSessions: state.chatSessions.map((session) => session.id === sessionId ? { ...session, previousResponseId: responseId } : session) })),
      clearChatHistory: () => set({ chatSessions: [] }),
      updateContentProgress: (contentId, update) => set((state) => {
        const current = state.contentProgress[contentId] ?? { checkedSteps: [], updatedAt: '' };
        return {
          contentProgress: {
            ...state.contentProgress,
            [contentId]: { ...current, ...update, updatedAt: new Date().toISOString() },
          },
        };
      }),
      resetContentProgress: (contentId) => set((state) => {
        const contentProgress = { ...state.contentProgress };
        delete contentProgress[contentId];
        return { contentProgress };
      }),
      deleteAccountData: () => set({ ...emptyPersonalData(), profile: null }),
    }),
    {
      name: 'moodify-state-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...state }) => state,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
