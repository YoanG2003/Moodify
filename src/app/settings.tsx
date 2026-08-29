import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { httpsCallable } from 'firebase/functions';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, Share, StyleSheet, Switch, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

import { Card, Chip, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { signOutAccount } from '@/services/auth';
import { firebaseConfigured, firebaseFunctions } from '@/services/firebase';
import { getHealthAdapter } from '@/services/health';
import { cancelMoodReminder, requestReminderPermission, scheduleDailyMoodReminder } from '@/services/notifications';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing } from '@/theme/tokens';
import type { ThemePreference } from '@/types/domain';

type ConfirmAction = 'clearChat' | 'signOut' | 'deleteAccount';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use 24-hour time, for example 20:00.');

const confirmations: Record<ConfirmAction, { title: string; body: string; confirm: string; danger?: boolean }> = {
  clearChat: { title: 'Clear AI chat history?', body: 'All saved Moodify chat sessions will be removed immediately. This cannot be undone.', confirm: 'Clear history', danger: true },
  signOut: { title: 'Sign out?', body: 'Your synced information stays with your account. You can sign in again at any time.', confirm: 'Sign out' },
  deleteAccount: { title: 'Delete account and data?', body: 'This permanently removes your Moodify account, moods, habits, health summaries, and chat history.', confirm: 'Delete permanently', danger: true },
};

export default function SettingsScreen() {
  const { colors } = useMoodifyTheme();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const logout = useAppStore((state) => state.logout);
  const clearChat = useAppStore((state) => state.clearChatHistory);
  const deleteAccount = useAppStore((state) => state.deleteAccountData);
  const upsertHealth = useAppStore((state) => state.upsertHealthDaily);
  const exportState = useAppStore(useShallow((state) => ({ profile: state.profile, settings: state.settings, moodEntries: state.moodEntries, habits: state.habits, habitLogs: state.habitLogs, healthDaily: state.healthDaily })));
  const [timeEditorVisible, setTimeEditorVisible] = useState(false);
  const [timeDraft, setTimeDraft] = useState(settings.moodReminderTime);
  const [timeError, setTimeError] = useState<string>();
  const [pendingAction, setPendingAction] = useState<ConfirmAction>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();

  const setMessage = (message: string) => {
    setNotice(message);
  };

  const toggleMoodReminder = async (enabled: boolean) => {
    setNotice(undefined);
    try {
      if (enabled) {
        const granted = await requestReminderPermission();
        if (!granted) {
          setMessage('Notifications are off. Enable them in device settings to receive reminders.');
          return;
        }
        await scheduleDailyMoodReminder(settings.moodReminderTime);
      } else {
        await cancelMoodReminder();
      }
      updateSettings({ moodReminderEnabled: enabled });
    } catch {
      setMessage('The reminder could not be updated. Please try again on your device.');
    }
  };

  const saveReminderTime = async () => {
    const parsed = timeSchema.safeParse(timeDraft.trim());
    if (!parsed.success) {
      setTimeError(parsed.error.issues[0]?.message);
      return;
    }
    setBusy(true);
    try {
      if (settings.moodReminderEnabled) await scheduleDailyMoodReminder(parsed.data);
      updateSettings({ moodReminderTime: parsed.data });
      setTimeEditorVisible(false);
      setTimeError(undefined);
      setMessage(`Daily reminder set for ${parsed.data} local time.`);
    } catch {
      setTimeError('The reminder could not be rescheduled. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const shareExport = async () => {
    setNotice(undefined);
    try {
      let data: unknown = exportState;
      if (firebaseConfigured && firebaseFunctions) data = (await httpsCallable(firebaseFunctions, 'exportAccountData')()).data;
      await Share.share({ title: `Moodify export ${format(new Date(), 'yyyy-MM-dd')}`, message: JSON.stringify(data, null, 2) });
    } catch {
      setMessage('Your export could not be prepared. Please try again.');
    }
  };

  const toggleHealth = async (healthSyncEnabled: boolean) => {
    setNotice(undefined);
    if (!healthSyncEnabled) {
      updateSettings({ healthSyncEnabled: false });
      setMessage('Health sync disconnected. Existing daily summaries remain in Moodify.');
      return;
    }
    setBusy(true);
    try {
      const adapter = getHealthAdapter();
      const available = await adapter.isAvailable();
      if (!available) {
        setMessage('Health data is unavailable here. Use a supported device build or continue with manual entries.');
        return;
      }
      const granted = await adapter.requestReadPermission();
      if (!granted) {
        setMessage('Health permission was not granted. Manual entries remain available.');
        return;
      }
      upsertHealth(await adapter.readToday());
      updateSettings({ healthSyncEnabled: true });
      setMessage('Today’s step and sleep summaries are connected.');
    } catch {
      setMessage('Moodify could not read today’s health summary. You can reconnect later.');
    } finally {
      setBusy(false);
    }
  };

  const clearChatNow = async () => {
    if (firebaseConfigured && firebaseFunctions) await httpsCallable(firebaseFunctions, 'clearChatHistory')();
    clearChat();
    setMessage('AI chat history cleared.');
  };

  const deleteNow = async () => {
    if (firebaseConfigured && firebaseFunctions) await httpsCallable(firebaseFunctions, 'deleteAccountData')();
    deleteAccount();
    router.replace('/(auth)/login');
  };

  const runConfirmedAction = async () => {
    if (!pendingAction) return;
    setBusy(true);
    setNotice(undefined);
    try {
      if (pendingAction === 'clearChat') await clearChatNow();
      if (pendingAction === 'signOut') {
        await signOutAccount();
        logout();
        router.replace('/(auth)/login');
      }
      if (pendingAction === 'deleteAccount') await deleteNow();
      setPendingAction(undefined);
    } catch (error) {
      setPendingAction(undefined);
      setMessage(error instanceof Error ? error.message : 'The action could not be completed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const healthService = Platform.OS === 'ios' ? 'Apple Health' : Platform.OS === 'android' ? 'Health Connect' : 'Device health';

  return (
    <Screen contentStyle={styles.content}>
      <Header title="Settings" onBack={() => router.back()} />

      {notice ? (
        <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <MoodifyText variant="small" style={styles.flex}>{notice}</MoodifyText>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" hitSlop={8} onPress={() => setNotice(undefined)}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}

      <SectionLabel>Appearance</SectionLabel>
      <View accessibilityRole="radiogroup" accessibilityLabel="Theme" style={[styles.themePicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(['system', 'light', 'dark'] as ThemePreference[]).map((theme) => (
          <Chip key={theme} label={theme[0].toUpperCase() + theme.slice(1)} selected={settings.theme === theme} onPress={() => updateSettings({ theme })} />
        ))}
      </View>

      <SectionLabel>Reminders</SectionLabel>
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="notifications-outline" size={23} color={colors.primary} /></View>
          <View style={styles.flex}>
            <MoodifyText variant="h2">Daily mood reminder</MoodifyText>
            <MoodifyText variant="small">Uses your current timezone and adjusts with daylight saving.</MoodifyText>
          </View>
          <Switch accessibilityLabel="Daily mood reminder" value={settings.moodReminderEnabled} disabled={busy} onValueChange={(value) => void toggleMoodReminder(value)} trackColor={{ true: colors.primary }} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Change reminder time, currently ${settings.moodReminderTime}`} onPress={() => { setTimeDraft(settings.moodReminderTime); setTimeError(undefined); setTimeEditorVisible(true); }} style={[styles.timeRow, { borderTopColor: colors.border }]}>
          <MoodifyText variant="small">Reminder time</MoodifyText>
          <View style={styles.inlineValue}><MoodifyText color={colors.primary} style={styles.timeValue}>{settings.moodReminderTime}</MoodifyText><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></View>
        </Pressable>
      </Card>

      <SectionLabel>Health connection</SectionLabel>
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="heart-outline" size={23} color={colors.primary} /></View>
          <View style={styles.flex}>
            <MoodifyText variant="h2">{healthService}</MoodifyText>
            <MoodifyText variant="small">Read-only daily steps and sleep. Raw samples never leave your device.</MoodifyText>
          </View>
          <Switch accessibilityLabel="Health data sync" value={settings.healthSyncEnabled} disabled={busy} onValueChange={(value) => void toggleHealth(value)} trackColor={{ true: colors.primary }} />
        </View>
        <View style={[styles.statusRow, { borderTopColor: colors.border }]}>
          <View style={[styles.statusDot, { backgroundColor: settings.healthSyncEnabled ? colors.success : colors.textMuted }]} />
          <MoodifyText variant="small">{settings.healthSyncEnabled ? 'Connected · tap the switch to disconnect' : 'Not connected · manual entry is available'}</MoodifyText>
        </View>
      </Card>

      <SectionLabel>Consent preferences</SectionLabel>
      <SettingToggle icon="analytics-outline" title="Anonymous usage analytics" body="Off by default. Never includes mood notes, chat text, or health values." value={Boolean(settings.analyticsEnabled)} onChange={(analyticsEnabled) => updateSettings({ analyticsEnabled })} />
      <SettingToggle icon="bug-outline" title="Crash reports" body="Off by default. Helps diagnose technical failures without wellbeing content." value={Boolean(settings.crashReportingEnabled)} onChange={(crashReportingEnabled) => updateSettings({ crashReportingEnabled })} />

      <SectionLabel>Privacy and data</SectionLabel>
      <View style={[styles.actions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Action icon="download-outline" label="Export my data" onPress={() => void shareExport()} />
        <Action icon="trash-bin-outline" label="Clear AI chat history" onPress={() => setPendingAction('clearChat')} />
        <Action icon="log-out-outline" label="Sign out" onPress={() => setPendingAction('signOut')} />
        <Action icon="warning-outline" label="Delete account and all data" danger onPress={() => setPendingAction('deleteAccount')} last />
      </View>

      <MoodifyText variant="small" style={styles.legal}>Moodify beta · EU/EEA · Ages 16+{`\n`}Terms version 2026-08-28 · Privacy version 2026-08-28</MoodifyText>

      <Modal visible={timeEditorVisible} transparent animationType="fade" onRequestClose={() => setTimeEditorVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MoodifyText variant="h2">Daily reminder time</MoodifyText>
            <MoodifyText variant="small">Enter a 24-hour local time. Moodify reschedules it when your timezone changes.</MoodifyText>
            <TextInput
              accessibilityLabel="Reminder time"
              autoFocus
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              placeholder="20:00"
              placeholderTextColor={colors.inputPlaceholder}
              value={timeDraft}
              onChangeText={(value) => { setTimeDraft(value); setTimeError(undefined); }}
              style={[styles.timeInput, { backgroundColor: colors.input, borderColor: timeError ? colors.danger : colors.border, color: colors.inputText }]}
            />
            {timeError ? <MoodifyText variant="small" color={colors.danger}>{timeError}</MoodifyText> : null}
            <View style={styles.modalButtons}>
              <Pressable accessibilityRole="button" onPress={() => setTimeEditorVisible(false)} style={styles.cancelButton}><MoodifyText color={colors.primary}>Cancel</MoodifyText></Pressable>
              <View style={styles.saveButton}><PrimaryButton title="Save" loading={busy} onPress={() => void saveReminderTime()} /></View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(pendingAction)} transparent animationType="fade" onRequestClose={() => !busy && setPendingAction(undefined)}>
        <View style={styles.modalBackdrop}>
          {pendingAction ? (
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.confirmIcon, { backgroundColor: confirmations[pendingAction].danger ? '#FEE4E2' : colors.primarySoft }]}>
                <Ionicons name={confirmations[pendingAction].danger ? 'warning-outline' : 'log-out-outline'} size={28} color={confirmations[pendingAction].danger ? colors.danger : colors.primary} />
              </View>
              <MoodifyText variant="h2" style={styles.center}>{confirmations[pendingAction].title}</MoodifyText>
              <MoodifyText style={styles.center}>{confirmations[pendingAction].body}</MoodifyText>
              <View style={styles.confirmButtons}>
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => setPendingAction(undefined)} style={[styles.confirmButton, { borderColor: colors.border }]}><MoodifyText>Cancel</MoodifyText></Pressable>
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => void runConfirmedAction()} style={[styles.confirmButton, { backgroundColor: confirmations[pendingAction].danger ? colors.danger : colors.primary, borderColor: confirmations[pendingAction].danger ? colors.danger : colors.primary }]}>
                  {busy ? <ActivityIndicator color={palette.white} /> : <MoodifyText variant="button" color={palette.white} numberOfLines={1} style={styles.confirmButtonLabel}>{confirmations[pendingAction].confirm}</MoodifyText>}
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

function SectionLabel({ children }: { children: string }) {
  const { colors } = useMoodifyTheme();
  return <MoodifyText variant="label" color={colors.secondary} style={styles.sectionLabel}>{children}</MoodifyText>;
}

function SettingToggle({ icon, title, body, value, onChange }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; value: boolean; onChange: (value: boolean) => void }) {
  const { colors } = useMoodifyTheme();
  return (
    <Card style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name={icon} size={23} color={colors.primary} /></View>
      <View style={styles.flex}><MoodifyText variant="h2">{title}</MoodifyText><MoodifyText variant="small">{body}</MoodifyText></View>
      <Switch accessibilityLabel={title} value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </Card>
  );
}

function Action({ icon, label, onPress, danger = false, last = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean; last?: boolean }) {
  const { colors } = useMoodifyTheme();
  const actionColor = danger ? colors.danger : colors.primary;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, { borderBottomColor: colors.border }, last && styles.actionLast, pressed && styles.pressed]}>
      <Ionicons name={icon} size={22} color={actionColor} />
      <MoodifyText color={danger ? colors.danger : undefined} style={styles.flex}>{label}</MoodifyText>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  sectionLabel: { marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  notice: { minHeight: 48, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  themePicker: { flexDirection: 'row', gap: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: spacing.md },
  settingCard: { padding: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingIcon: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  timeRow: { minHeight: 50, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inlineValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  timeValue: { fontWeight: '700' },
  statusRow: { minHeight: 46, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: radius.pill },
  actions: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingHorizontal: spacing.lg, overflow: 'hidden' },
  action: { minHeight: 56, flexDirection: 'row', gap: spacing.md, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  actionLast: { borderBottomWidth: 0 },
  pressed: { opacity: 0.68 },
  legal: { textAlign: 'center', marginTop: spacing.lg },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, shadowColor: '#000000', shadowOpacity: 0.24, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 10 },
  timeInput: { height: 54, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.lg, fontSize: 22, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  cancelButton: { minWidth: 88, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  saveButton: { flex: 1 },
  confirmIcon: { width: 52, height: 52, borderRadius: radius.pill, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  confirmButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  confirmButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  confirmButtonLabel: { fontSize: 13, lineHeight: 16, textAlign: 'center' },
});
