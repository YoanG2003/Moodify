import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { IconButton, MoodifyText, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { en } from '@/i18n/en';
import { createAiReply } from '@/services/chat';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing, typography } from '@/theme/tokens';
import type { ChatMessage } from '@/types/domain';

export default function ChatScreen() {
  const { colors, isDark } = useMoodifyTheme();
  const sessions = useAppStore((state) => state.chatSessions);
  const ensureSession = useAppStore((state) => state.ensureChatSession);
  const addMessage = useAppStore((state) => state.addChatMessage);
  const updateResponseId = useAppStore((state) => state.updateChatResponseId);
  const [started, setStarted] = useState(false);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const session = sessions[0];
  const active = started || Boolean(session?.messages.length);

  const begin = () => {
    ensureSession();
    setStarted(true);
  };

  const send = async () => {
    const message = draft.trim();
    if (!message || loading) return;
    const sessionId = session?.id ?? ensureSession();
    setDraft('');
    addMessage(sessionId, { role: 'user', text: message, safetyMode: 'standard' });
    setLoading(true);
    try {
      const reply = await createAiReply({ sessionId, message, locale: 'en', region: 'EU', previousResponseId: session?.previousResponseId });
      addMessage(sessionId, { role: 'assistant', text: reply.text, safetyMode: reply.safetyMode });
      if (reply.responseId) updateResponseId(sessionId, reply.responseId);
    } catch {
      addMessage(sessionId, { role: 'assistant', text: 'I could not connect right now. Your message remains private on this device; please try again when you are online.', safetyMode: 'support' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false} keyboard contentStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }] }>
        <IconButton icon="menu-outline" label="Open settings" color={colors.primary} onPress={() => router.push('/settings')} />
        <MoodifyText variant="h1" color={colors.navLabel} style={styles.headerTitle}>Chat</MoodifyText>
        <IconButton icon="person-circle-outline" label="Open profile" color={colors.primary} onPress={() => router.push('/profile')} />
      </View>

      {!active ? <ChatWelcome isDark={isDark} onBegin={begin} /> : (
        <View style={styles.chatBody}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.messages}>
            <View style={[styles.notice, { backgroundColor: colors.primarySoft }]}>
              <MoodifyText variant="small">A private wellbeing reflection space. Avoid sharing names, addresses, or identifying details.</MoodifyText>
            </View>
            {session?.messages.map((message) => <MessageBubble key={message.id} message={message} />)}
            {loading ? <ActivityIndicator accessibilityLabel="Moodify is replying" color={colors.primary} style={styles.loading} /> : null}
          </ScrollView>
          <View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput accessibilityLabel="Message" value={draft} onChangeText={setDraft} onSubmitEditing={send} multiline maxLength={1500} placeholder="Write what is on your mind…" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.heading }]} />
            <Pressable accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{ disabled: !draft.trim() || loading }} disabled={!draft.trim() || loading} onPress={send} style={({ pressed }) => [styles.send, { backgroundColor: colors.secondary, opacity: !draft.trim() || loading ? 0.45 : pressed ? 0.75 : 1 }]}><Ionicons name="arrow-up" size={22} color={palette.white} /></Pressable>
          </View>
          <MoodifyText variant="small" style={styles.disclaimer}>{en.wellnessDisclaimer} Chats auto-delete after 30 days.</MoodifyText>
        </View>
      )}
    </Screen>
  );
}

function ChatWelcome({ isDark, onBegin }: { isDark: boolean; onBegin: () => void }) {
  const { colors } = useMoodifyTheme();
  return (
    <View style={styles.welcome}>
      <Image source={isDark ? require('../../../assets/figma/chat/friendly-triangles-dark.png') : require('../../../assets/figma/friendly-triangles.png')} style={styles.triangleBackdrop} contentFit="fill" pointerEvents="none" />
      <View style={styles.chatArt} accessibilityRole="image" accessibilityLabel="Question marks growing among leafy plants">
        <Image source={isDark ? require('../../../assets/figma/chat/background-dark.svg') : require('../../../assets/figma/chat-illustration-background.svg')} style={StyleSheet.absoluteFill} contentFit="fill" />
        <Image source={isDark ? require('../../../assets/figma/chat/plants-dark.svg') : require('../../../assets/figma/chat-illustration-plants.svg')} style={styles.plants} contentFit="fill" />
        <Image source={isDark ? require('../../../assets/figma/chat/question-marks-dark.svg') : require('../../../assets/figma/chat-question-marks.svg')} style={styles.questionMarks} contentFit="fill" />
        <Image source={isDark ? require('../../../assets/figma/chat/question-mark-dark.svg') : require('../../../assets/figma/chat-question-mark.svg')} style={styles.mainQuestion} contentFit="fill" />
      </View>
      <Pressable accessibilityRole="button" onPress={onBegin} style={({ pressed }) => [styles.beginButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.78 : 1 }]}>
        <MoodifyText variant="button" color={palette.white}>Chat with AI for advice</MoodifyText>
      </Pressable>
    </View>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const { colors } = useMoodifyTheme();
  const user = message.role === 'user';
  const crisis = message.safetyMode === 'crisis';
  return (
    <View style={[styles.bubble, user ? styles.userBubble : styles.aiBubble, { backgroundColor: user ? colors.primary : crisis ? '#FDE8E5' : colors.surface, borderColor: user ? colors.primary : crisis ? lowBorder : colors.border }]}>
      {crisis ? <View style={styles.crisisHeading}><Ionicons name="call" size={20} color="#7A271A" /><MoodifyText variant="h2" color="#7A271A">Emergency support · 112</MoodifyText></View> : null}
      <MoodifyText color={user ? palette.white : crisis ? '#7A271A' : colors.text}>{message.text}</MoodifyText>
    </View>
  );
}

const lowBorder = '#E84233';

const styles = StyleSheet.create({
  content: { paddingTop: 0, paddingBottom: 0, gap: 0 },
  header: { height: 52, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3, zIndex: 3 },
  headerTitle: { fontFamily: typography.regular, fontWeight: '400' },
  welcome: { flex: 1, marginHorizontal: -spacing.xl, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 33 },
  triangleBackdrop: { position: 'absolute', width: 760, height: 438, top: 115, left: -192, transform: [{ rotate: '-90deg' }] },
  chatArt: { position: 'absolute', width: 375, height: 370, top: 186, left: 0 },
  plants: { position: 'absolute', width: 283, height: 264, left: 74, top: 59 },
  questionMarks: { position: 'absolute', width: 298, height: 291, left: 32, top: 9 },
  mainQuestion: { position: 'absolute', width: 145, height: 250, left: 117, top: 120 },
  beginButton: { width: 283, height: 60, paddingHorizontal: spacing.md, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  chatBody: { flex: 1, paddingTop: spacing.md, gap: spacing.sm },
  messages: { flexGrow: 1, gap: spacing.sm, paddingBottom: spacing.md },
  notice: { alignSelf: 'center', width: '94%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md },
  bubble: { maxWidth: '86%', padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: spacing.sm },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  crisisHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  loading: { marginVertical: spacing.sm },
  composer: { minHeight: 54, borderWidth: 1, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'flex-end', paddingLeft: spacing.md, paddingVertical: spacing.xs },
  input: { flex: 1, minHeight: 44, maxHeight: 110, fontFamily: typography.regular, fontSize: 16, paddingVertical: 10 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.xs },
  disclaimer: { textAlign: 'center', marginBottom: spacing.sm },
});
