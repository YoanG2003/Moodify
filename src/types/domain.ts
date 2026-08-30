export type AgeBand = '16-17' | '18+';
export type ThemePreference = 'system' | 'light' | 'dark';
export type MoodValue = 1 | 2 | 3 | 4 | 5;
export type MetricSource = 'manual' | 'healthkit' | 'health-connect';

export interface AvatarSelection {
  hair: string;
  skin: string;
  eyes: string;
  clothes: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  ageBand: AgeBand;
  avatar: AvatarSelection;
  termsVersion: string;
  privacyVersion: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: ThemePreference;
  locale: string;
  region: 'EU';
  timeZone: string;
  moodReminderEnabled: boolean;
  moodReminderTime: string;
  healthSyncEnabled: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

export interface MoodEntry {
  id: string;
  occurredAt: string;
  mood: MoodValue;
  causes: string[];
  weather?: string;
  note?: string;
  feedback?: number;
  createdAt: string;
  updatedAt: string;
}

export type HabitKind = 'sleep' | 'water' | 'food' | 'workout' | 'custom';

export interface Habit {
  id: string;
  title: string;
  kind: HabitKind;
  target: number;
  unit: string;
  weekdays: number[];
  reminderEnabled: boolean;
  reminderTime?: string;
  active: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
  updatedAt: string;
}

export interface HealthDaily {
  date: string;
  steps?: number;
  sleepMinutes?: number;
  waterMl?: number;
  sources: Partial<Record<'steps' | 'sleepMinutes' | 'waterMl', MetricSource>>;
  syncedAt?: string;
}

export interface ContentBlock {
  type: 'paragraph' | 'step' | 'tip';
  text: string;
}

export interface WellnessContent {
  id: string;
  type: 'recommendation' | 'tool';
  category: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  icon: string;
  color: string;
  tags: string[];
  blocks: ContentBlock[];
  timerSeconds?: number;
  published: boolean;
}

export interface ContentProgress {
  checkedSteps: number[];
  completedAt?: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  safetyMode: 'standard' | 'support' | 'crisis';
  expiresAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  previousResponseId?: string;
  messages: ChatMessage[];
  createdAt: string;
  expiresAt: string;
}
