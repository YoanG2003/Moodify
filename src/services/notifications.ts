import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

export async function requestReminderPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', { name: 'Mood and habit reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function scheduleDailyMoodReminder(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.cancelScheduledNotificationAsync('mood-daily').catch(() => undefined);
  return Notifications.scheduleNotificationAsync({
    identifier: 'mood-daily',
    content: { title: 'How are you feeling?', body: 'Take a quiet moment to check in with yourself.', data: { url: '/(tabs)/add' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function cancelMoodReminder() {
  await Notifications.cancelScheduledNotificationAsync('mood-daily').catch(() => undefined);
}

export async function scheduleHabitReminders(habitId: string, title: string, weekdays: number[], time: string) {
  const [hour, minute] = time.split(':').map(Number);
  await Promise.all(weekdays.map((weekday) => Notifications.scheduleNotificationAsync({
    identifier: `habit-${habitId}-${weekday}`,
    content: { title: title, body: `A gentle reminder for your ${title.toLowerCase()} goal.`, data: { url: '/habits' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: weekday + 1, hour, minute },
  })));
}

export async function cancelHabitReminders(habitId: string) {
  await Promise.all(Array.from({ length: 7 }, (_, weekday) => Notifications.cancelScheduledNotificationAsync(`habit-${habitId}-${weekday}`).catch(() => undefined)));
}
