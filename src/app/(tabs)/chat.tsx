import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Card, Header, MoodifyText, PageBackdrop, Screen } from '@/components/ui';
import { en } from '@/i18n/en';
import { createAiReply } from '@/services/chat';
import { useAppStore } from '@/state/use-app-store';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { radius, spacing } from '@/theme/tokens';

export default function ChatScreen() {
  const { colors } = useMoodifyTheme();
  const sessions = useAppStore((state) => state.chatSessions);
  const ensureSession = useAppStore((state) => state.ensureChatSession);
  const addMessage = useAppStore((state) => state.addChatMessage);
  const updateResponseId = useAppStore((state) => state.updateChatResponseId);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const session = sessions[0];
  const send = async () => {
    const message = draft.trim(); if (!message || loading) return;
    const sessionId = session?.id ?? ensureSession();
    setDraft(''); addMessage(sessionId, { role: 'user', text: message, safetyMode: 'standard' }); setLoading(true);
    try {
      const reply = await createAiReply({ sessionId, message, locale: 'en', region: 'EU', previousResponseId: session?.previousResponseId });
      addMessage(sessionId, { role: 'assistant', text: reply.text, safetyMode: reply.safetyMode });
      if (reply.responseId) updateResponseId(sessionId, reply.responseId);
    } catch {
      addMessage(sessionId, { role: 'assistant', text: 'I could not connect right now. Your message remains private on this device; please try again when you are online.', safetyMode: 'support' });
    } finally { setLoading(false); }
  };
  return (
    <Screen keyboard contentStyle={styles.content}>
      <PageBackdrop /><Header title="Chat" subtitle="AI wellbeing support" />
      {!session?.messages.length ? <Card style={styles.intro}><View style={styles.chatArt}><Image source={require('../../../assets/figma/chat-illustration-background.svg')} style={StyleSheet.absoluteFill} contentFit="contain" /><Image source={require('../../../assets/figma/chat-illustration-plants.svg')} style={StyleSheet.absoluteFill} contentFit="contain" /><Image source={require('../../../assets/figma/chat-question-marks.svg')} style={StyleSheet.absoluteFill} contentFit="contain" /></View><MoodifyText variant="h1" style={styles.center}>Chat with AI for advice</MoodifyText><MoodifyText style={styles.center}>Reflect on a feeling or choose one small next step. Do not share names, addresses, or other identifying details.</MoodifyText></Card> : null}
      <View style={styles.messages}>{session?.messages.map((message) => <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble, { backgroundColor: message.role === 'user' ? colors.primary : message.safetyMode === 'crisis' ? '#FDE8E5' : colors.surface }]}><MoodifyText color={message.role === 'user' ? colors.background : message.safetyMode === 'crisis' ? '#7A271A' : colors.text}>{message.text}</MoodifyText></View>)}</View>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput accessibilityLabel="Message" value={draft} onChangeText={setDraft} multiline maxLength={1500} placeholder="Write what is on your mind…" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.heading }]} /><Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={send} style={[styles.send, { backgroundColor: colors.secondary }]}><Ionicons name="arrow-up" size={22} color="#FFFFFF" /></Pressable></View>
      <MoodifyText variant="small" style={styles.center}>{en.wellnessDisclaimer} Chats auto-delete after 30 days.</MoodifyText>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { gap: spacing.md }, intro: { alignItems: 'center', gap: spacing.md }, chatArt: { width: 260, height: 190 }, center: { textAlign: 'center' }, messages: { gap: spacing.sm }, bubble: { maxWidth: '86%', padding: spacing.md, borderRadius: radius.lg }, userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 }, aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 }, composer: { minHeight: 54, borderWidth: 1, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'flex-end', paddingLeft: spacing.md, paddingVertical: spacing.xs }, input: { flex: 1, minHeight: 44, maxHeight: 130, fontSize: 16, paddingVertical: 10 }, send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' } });
