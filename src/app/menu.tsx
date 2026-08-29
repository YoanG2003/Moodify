import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MoodifyText } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { signOutAccount } from '@/services/auth';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, typography } from '@/theme/tokens';

export default function MenuScreen() {
  const { colors, isDark } = useMoodifyTheme();
  const logout = useAppStore((state) => state.logout);
  const [notice, setNotice] = useState('');
  const signOut = async () => {
    await signOutAccount();
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.drawer, { backgroundColor: colors.surface }]}>
        <Image source={isDark ? require('../../assets/figma/menu/illustration-dark.png') : require('../../assets/figma/menu/illustration-light.png')} style={styles.illustration} contentFit="fill" />
        <MenuButton label="Join premium" premium onPress={() => setNotice('All Moodify beta tools are currently included. No purchase is required.')} />
        <MenuButton label="Settings" top={333} onPress={() => router.replace('/settings')} />
        <MenuButton label="Support" top={394} onPress={() => router.replace('/support')} />
        <MenuButton label="Theme" top={455} onPress={() => router.replace('/settings')} />
        <MenuButton label="Widgets" top={516} onPress={() => setNotice('Home-screen widgets are not included in this beta yet.')} />
        {notice ? <View style={[styles.notice, { backgroundColor: colors.primarySoft }]}><MoodifyText variant="small" style={styles.noticeText}>{notice}</MoodifyText></View> : null}
        <MenuButton label="Log out" bottom={68} onPress={() => void signOut()} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={() => router.back()} style={styles.scrim} />
    </View>
  );
}

function MenuButton({ label, onPress, top, bottom, premium = false }: { label: string; onPress: () => void; top?: number; bottom?: number; premium?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.button, premium ? styles.premium : styles.standard, top === undefined && bottom === undefined ? styles.premiumPosition : null, top !== undefined ? { top } : null, bottom !== undefined ? { bottom } : null, pressed && styles.pressed]}>
      {premium ? <Image source={require('../../assets/figma/menu/premium-crown.svg')} style={styles.crown} contentFit="contain" /> : null}
      <MoodifyText variant="button" color={premium ? palette.grey800 : palette.white}>{label}</MoodifyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.34)' },
  drawer: { width: 289, height: '100%', borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.28, shadowOffset: { width: 4, height: 0 }, shadowRadius: 8, elevation: 12 },
  scrim: { flex: 1 },
  illustration: { position: 'absolute', left: 0, top: 51, width: 290, height: 191 },
  button: { position: 'absolute', left: 23, width: 243, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, borderRadius: radius.sm },
  premiumPosition: { top: 258 },
  premium: { height: 44, backgroundColor: '#FFBB06' },
  standard: { height: 45, backgroundColor: palette.teal700 },
  pressed: { opacity: 0.72 },
  notice: { position: 'absolute', left: 23, top: 578, width: 243, minHeight: 58, borderRadius: radius.sm, padding: 8, justifyContent: 'center' },
  noticeText: { textAlign: 'center', fontFamily: typography.regular },
  crown: { width: 33, height: 29 },
});
