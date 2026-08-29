import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MoodifyText } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing } from '@/theme/tokens';

const tabs = [
  { label: 'Home', icon: 'home-outline', route: '/(tabs)' },
  { label: 'Tools', icon: 'grid-outline', route: '/(tabs)/tools' },
  { label: 'Chat', icon: 'chatbox-outline', route: '/(tabs)/chat' },
  { label: 'Insights', icon: 'stats-chart-outline', route: '/(tabs)/insights' },
] as const;

export default function MoodDoneScreen() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const { colors, isDark } = useMoodifyTheme();
  const savedRating = useAppStore((state) => state.moodEntries.find((entry) => entry.id === entryId)?.feedback ?? 0);
  const rate = useAppStore((state) => state.rateMoodEntry);
  const [rating, setRating] = useState(savedRating);
  const [feedbackVisible, setFeedbackVisible] = useState(true);

  const chooseRating = (value: number) => {
    setRating(value);
    if (entryId) rate(entryId, value);
  };

  const navigate = (route: (typeof tabs)[number]['route']) => router.replace(route);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open menu" hitSlop={8} onPress={() => router.push('/menu')} style={styles.headerButton}>
          <Ionicons name="menu" size={27} color={colors.navLabel} />
        </Pressable>
        <MoodifyText style={styles.headerTitle} color={colors.navLabel}>Mood</MoodifyText>
        <Pressable accessibilityRole="button" accessibilityLabel="Open profile" hitSlop={8} onPress={() => router.push('/(tabs)/profile')} style={styles.headerButton}>
          <Ionicons name="person-circle-outline" size={31} color={colors.navLabel} />
        </Pressable>
      </View>

      <View style={styles.canvas}>
        <View pointerEvents="none" style={styles.backgroundFrame}>
          <Image
            source={isDark ? require('../../assets/figma/done/background-dark.png') : require('../../assets/figma/done/background-light.png')}
            style={styles.backgroundArtwork}
            contentFit="contain"
          />
        </View>
        <MoodifyText variant="hero" style={styles.title}>Mood added!</MoodifyText>
        <Image
          accessibilityLabel="A hand holding a phone with a completed check-in"
          source={isDark ? require('../../assets/figma/done/phone-dark.png') : require('../../assets/figma/done/phone-light.png')}
          style={styles.phone}
          contentFit="contain"
        />

        {feedbackVisible ? (
          <View accessibilityRole="radiogroup" accessibilityLabel="Rank your experience" style={[styles.feedback, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Dismiss rating" hitSlop={8} onPress={() => setFeedbackVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
            <MoodifyText variant="h2" style={styles.feedbackTitle}>Rank your experience</MoodifyText>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: rating === value }}
                  accessibilityLabel={`${value} star${value === 1 ? '' : 's'}`}
                  hitSlop={2}
                  onPress={() => chooseRating(value)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Ionicons name={value <= rating ? 'star' : 'star-outline'} size={42} color={value <= rating ? colors.secondary : colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.navbar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <TabButton item={tabs[0]} color={colors.navInactive} onPress={() => navigate(tabs[0].route)} />
        <TabButton item={tabs[1]} color={colors.navInactive} onPress={() => navigate(tabs[1].route)} />
        <Pressable accessibilityRole="button" accessibilityLabel="Add another mood" onPress={() => router.replace('/(tabs)/add')} style={[styles.addButton, { backgroundColor: colors.navActive }]}>
          <Ionicons name="add" size={30} color={palette.white} />
        </Pressable>
        <TabButton item={tabs[2]} color={colors.navInactive} onPress={() => navigate(tabs[2].route)} />
        <TabButton item={tabs[3]} color={colors.navInactive} onPress={() => navigate(tabs[3].route)} />
      </View>
    </SafeAreaView>
  );
}

function TabButton({ item, color, onPress }: { item: (typeof tabs)[number]; color: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="tab" accessibilityLabel={item.label} onPress={onPress} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <Ionicons name={item.icon} size={23} color={color} />
      <MoodifyText color={color} style={styles.tabLabel}>{item.label}</MoodifyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  header: { height: 51, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, shadowColor: '#000000', shadowOpacity: 0.16, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 3, zIndex: 5 },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 25, lineHeight: 30 },
  canvas: { flex: 1, overflow: 'hidden' },
  backgroundFrame: { position: 'absolute', width: 545, height: 924, left: -117, top: -113, alignItems: 'center', justifyContent: 'center' },
  backgroundArtwork: { width: 922, height: 542, transform: [{ rotate: '-89.78deg' }] },
  title: { position: 'absolute', top: 193, left: 35, width: 251, textAlign: 'center' },
  phone: { position: 'absolute', top: 244, left: 0, width: '100%', height: 393 },
  feedback: { position: 'absolute', left: '50%', bottom: spacing.lg, width: 295, minHeight: 126, marginLeft: -147.5, borderWidth: 1, borderRadius: radius.sm, paddingTop: 25, paddingHorizontal: 3, paddingBottom: 12, shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 4, elevation: 5 },
  closeButton: { position: 'absolute', right: 3, top: 3, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  feedbackTitle: { textAlign: 'center', fontWeight: '700' },
  stars: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navbar: { height: 65, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', shadowOpacity: 0.12, shadowOffset: { width: 0, height: -3 }, shadowRadius: 6, elevation: 8, zIndex: 6 },
  tab: { width: 75, height: 65, paddingTop: 8, alignItems: 'center', gap: 5 },
  tabLabel: { fontSize: 10, lineHeight: 12 },
  addButton: { width: 51, height: 51, marginTop: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
});
