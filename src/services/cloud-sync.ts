import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';

import { firestore } from '@/services/firebase';
import type { AppSettings, Habit, HabitLog, HealthDaily, MoodEntry } from '@/types/domain';

export interface CloudUserData {
  settings?: AppSettings;
  moodEntries?: MoodEntry[];
  habits?: Habit[];
  habitLogs?: HabitLog[];
  healthDaily?: HealthDaily[];
}

const usableUid = (uid?: string) => Boolean(firestore && uid && !uid.startsWith('local-'));
const clean = <T extends object>(value: T) => JSON.parse(JSON.stringify(value)) as T;

async function put(uid: string | undefined, path: string[], value: object) {
  if (!firestore || !usableUid(uid)) return;
  await setDoc(doc(firestore, 'users', uid!, ...path), { ...clean(value), updatedAt: serverTimestamp() }, { merge: true });
}

export const syncSettings = (uid: string | undefined, settings: AppSettings) => put(uid, ['settings', 'main'], settings);
export const syncMoodEntry = (uid: string | undefined, entry: MoodEntry) => put(uid, ['moodEntries', entry.id], entry);
export const syncHabit = (uid: string | undefined, habit: Habit) => put(uid, ['habits', habit.id], habit);
export const syncHabitLog = (uid: string | undefined, log: HabitLog) => put(uid, ['habitLogs', log.id], log);
export const syncHealthDaily = (uid: string | undefined, daily: HealthDaily) => put(uid, ['healthDaily', daily.date], daily);

export async function deleteCloudRecord(uid: string | undefined, collectionName: string, id: string) {
  if (!firestore || !usableUid(uid)) return;
  await deleteDoc(doc(firestore, 'users', uid!, collectionName, id));
}

const rows = <T>(snapshot: { docs: { id: string; data(): DocumentData }[] }) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T));

export function watchCloudUser(uid: string, onData: (data: CloudUserData) => void): Unsubscribe {
  if (!firestore || !usableUid(uid)) return () => undefined;
  const stops = [
    onSnapshot(doc(firestore, 'users', uid, 'settings', 'main'), (snapshot) => { if (snapshot.exists()) onData({ settings: snapshot.data() as AppSettings }); }),
    onSnapshot(collection(firestore, 'users', uid, 'moodEntries'), (snapshot) => onData({ moodEntries: rows<MoodEntry>(snapshot).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) })),
    onSnapshot(collection(firestore, 'users', uid, 'habits'), (snapshot) => { if (!snapshot.empty) onData({ habits: rows<Habit>(snapshot) }); }),
    onSnapshot(collection(firestore, 'users', uid, 'habitLogs'), (snapshot) => onData({ habitLogs: rows<HabitLog>(snapshot) })),
    onSnapshot(collection(firestore, 'users', uid, 'healthDaily'), (snapshot) => onData({ healthDaily: rows<HealthDaily>(snapshot) })),
  ];
  return () => stops.forEach((stop) => stop());
}
