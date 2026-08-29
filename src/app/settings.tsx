import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { Alert, Pressable, Share, StyleSheet, Switch, View } from 'react-native';

import { Card, Chip, Header, MoodifyText, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { cancelMoodReminder, requestReminderPermission, scheduleDailyMoodReminder } from '@/services/notifications';
import { getHealthAdapter } from '@/services/health';
import { useAppStore } from '@/state/use-app-store';
import type { ThemePreference } from '@/types/domain';
import { palette, spacing } from '@/theme/tokens';
import { firebaseConfigured, firebaseFunctions } from '@/services/firebase';
import { signOutAccount } from '@/services/auth';
import { httpsCallable } from 'firebase/functions';
import { useShallow } from 'zustand/react/shallow';

export default function SettingsScreen() {
  const { colors } = useMoodifyTheme();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const logout = useAppStore((state) => state.logout);
  const clearChat = useAppStore((state) => state.clearChatHistory);
  const deleteAccount = useAppStore((state) => state.deleteAccountData);
  const upsertHealth = useAppStore((state) => state.upsertHealthDaily);
  const exportState = useAppStore(useShallow((state) => ({ profile: state.profile, settings: state.settings, moodEntries: state.moodEntries, habits: state.habits, habitLogs: state.habitLogs, healthDaily: state.healthDaily })));
  const toggleMoodReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestReminderPermission();
      if (!granted) { Alert.alert('Notifications are off', 'Enable notifications in device settings to receive reminders.'); return; }
      await scheduleDailyMoodReminder(settings.moodReminderTime);
    } else await cancelMoodReminder();
    updateSettings({ moodReminderEnabled: enabled });
  };
  const shareExport = async () => {
    let data: unknown = exportState;
    if (firebaseConfigured && firebaseFunctions) data = (await httpsCallable(firebaseFunctions, 'exportAccountData')()).data;
    await Share.share({ title: `Moodify export ${format(new Date(), 'yyyy-MM-dd')}`, message: JSON.stringify(data, null, 2) });
  };
  const toggleHealth = async (healthSyncEnabled: boolean) => {
    if (!healthSyncEnabled) { updateSettings({ healthSyncEnabled: false }); return; }
    const adapter = getHealthAdapter();
    const available = await adapter.isAvailable();
    if (!available) { Alert.alert('Health data unavailable', 'Use an EAS development build on a supported device, or continue with manual entries.'); return; }
    const granted = await adapter.requestReadPermission();
    if (!granted) { Alert.alert('Permission not granted', 'Moodify will continue with manual entries. You can reconnect later.'); return; }
    const daily = await adapter.readToday();
    upsertHealth(daily);
    updateSettings({ healthSyncEnabled: true });
  };
  const signOutNow = async () => { await signOutAccount(); logout(); router.replace('/(auth)/login'); };
  const clearChatNow = async () => {
    if (firebaseConfigured && firebaseFunctions) await httpsCallable(firebaseFunctions, 'clearChatHistory')();
    clearChat();
  };
  const deleteNow = async () => {
    if (firebaseConfigured && firebaseFunctions) await httpsCallable(firebaseFunctions, 'deleteAccountData')();
    deleteAccount();
    router.replace('/(auth)/login');
  };
  const confirmDelete = () => Alert.alert('Delete account and data?', 'This permanently removes your Moodify account and personal data.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void deleteNow().catch((error) => Alert.alert('Deletion failed', error instanceof Error ? error.message : 'Please try again.')) }]);
  return (
    <Screen>
      <Header title="Settings" onBack={() => router.back()} />
      <MoodifyText variant="h2">Appearance</MoodifyText>
      <View style={styles.row}>{(['system','light','dark'] as ThemePreference[]).map((theme) => <Chip key={theme} label={theme[0].toUpperCase() + theme.slice(1)} selected={settings.theme === theme} onPress={() => updateSettings({ theme })} />)}</View>
      <Card style={styles.setting}><View style={styles.settingCopy}><MoodifyText variant="h2">Daily mood reminder</MoodifyText><MoodifyText variant="small">Every day at {settings.moodReminderTime}, local time</MoodifyText></View><Switch value={settings.moodReminderEnabled} onValueChange={(value) => void toggleMoodReminder(value)} trackColor={{ true: colors.primary }} /></Card>
      <Card style={styles.setting}><View style={styles.settingCopy}><MoodifyText variant="h2">Health data sync</MoodifyText><MoodifyText variant="small">Optional, read-only steps and sleep. Manual entry remains available.</MoodifyText></View><Switch value={settings.healthSyncEnabled} onValueChange={(value) => void toggleHealth(value)} trackColor={{ true: colors.primary }} /></Card>
      <Card style={styles.setting}><View style={styles.settingCopy}><MoodifyText variant="h2">Anonymous usage analytics</MoodifyText><MoodifyText variant="small">Off by default. Never include mood notes, chat text, or health values.</MoodifyText></View><Switch value={Boolean(settings.analyticsEnabled)} onValueChange={(analyticsEnabled) => updateSettings({ analyticsEnabled })} trackColor={{ true: colors.primary }} /></Card>
      <Card style={styles.setting}><View style={styles.settingCopy}><MoodifyText variant="h2">Crash reports</MoodifyText><MoodifyText variant="small">Off by default. Helps diagnose technical failures without wellbeing content.</MoodifyText></View><Switch value={Boolean(settings.crashReportingEnabled)} onValueChange={(crashReportingEnabled) => updateSettings({ crashReportingEnabled })} trackColor={{ true: colors.primary }} /></Card>
      <MoodifyText variant="h2">Privacy and data</MoodifyText>
      <Action icon="download-outline" label="Export my data" onPress={() => void shareExport()} />
      <Action icon="trash-bin-outline" label="Clear AI chat history" onPress={() => Alert.alert('Clear chat history?', 'This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: () => void clearChatNow().catch((error) => Alert.alert('Could not clear chat', error instanceof Error ? error.message : 'Please try again.')) }])} />
      <Action icon="log-out-outline" label="Sign out" onPress={() => void signOutNow()} />
      <Action icon="warning-outline" label="Delete account and all data" danger onPress={confirmDelete} />
      <MoodifyText variant="small">Moodify beta · EU/EEA · Ages 16+{`\n`}Terms version 2026-08-28 · Privacy version 2026-08-28</MoodifyText>
    </Screen>
  );
}

function Action({ icon, label, onPress, danger = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}><Ionicons name={icon} size={22} color={danger ? '#B42318' : palette.teal800} /><MoodifyText color={danger ? '#B42318' : undefined} style={styles.settingCopy}>{label}</MoodifyText><Ionicons name="chevron-forward" size={20} color="#808080" /></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.sm }, setting: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, settingCopy: { flex: 1 }, action: { minHeight: 54, flexDirection: 'row', gap: spacing.md, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#AAAAAA' } });
