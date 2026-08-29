import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { IconButton, MoodifyText, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { saveProfile } from '@/services/auth';
import { firebaseConfigured } from '@/services/firebase';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing, typography } from '@/theme/tokens';
import type { AvatarSelection } from '@/types/domain';

const hairColors = ['#C93305', '#ECDCBF', '#724133', '#6A9E4F', '#444FB2', '#B79D54', '#010100', '#FFFFFF'];
const skinColors = ['#F9E4D4', '#F8D2B3', '#FFB678', '#DB9860', '#B37D4D', '#84552D', '#5D3B20', '#3E2617'];
const eyes: { id: string; label: string; source: ImageSource }[] = [
  { id: 'happy', label: 'Happy eyes', source: require('../../../assets/figma/avatar/eyes-happy.svg') },
  { id: 'hearts', label: 'Heart eyes', source: require('../../../assets/figma/avatar/eyes-hearts.svg') },
  { id: 'side', label: 'Side-looking eyes', source: require('../../../assets/figma/avatar/eyes-side.svg') },
  { id: 'cry', label: 'Crying eyes', source: require('../../../assets/figma/avatar/eyes-cry.svg') },
];
const clothes: { id: string; label: string; source: ImageSource }[] = [
  { id: 'suit', label: 'Suit', source: require('../../../assets/figma/avatar/clothes-suit.svg') },
  { id: 'hoodie', label: 'Hoodie', source: require('../../../assets/figma/avatar/clothes-hoodie.svg') },
  { id: 'graphic', label: 'Graphic shirt', source: require('../../../assets/figma/avatar/clothes-graphic.svg') },
  { id: 'overall', label: 'Overalls', source: require('../../../assets/figma/avatar/clothes-overall.svg') },
];

export default function ProfileScreen() {
  const { colors, isDark } = useMoodifyTheme();
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [name, setName] = useState(profile?.displayName ?? '');
  const [avatar, setAvatar] = useState<AvatarSelection>(normalizeAvatar(profile?.avatar));
  const [saved, setSaved] = useState(false);
  if (!profile) return null;

  const choose = (key: keyof AvatarSelection, value: string) => {
    setSaved(false);
    setAvatar((current) => ({ ...current, [key]: value }));
  };
  const save = async () => {
    const next = { ...profile, displayName: name.trim() || profile.displayName, avatar };
    updateProfile({ displayName: next.displayName, avatar });
    if (firebaseConfigured) await saveProfile(next);
    setSaved(true);
  };

  return (
    <Screen contentStyle={styles.content} keyboard>
      <Image source={isDark ? require('../../../assets/figma/profile/background-dark.png') : require('../../../assets/figma/profile/background-light.png')} style={styles.background} contentFit="fill" pointerEvents="none" />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }] }>
        <IconButton icon="menu-outline" label="Open menu" color={colors.primary} onPress={() => router.push('/menu')} />
        <MoodifyText variant="h1" color={colors.navLabel} style={styles.headerTitle}>Profile</MoodifyText>
        <IconButton icon="shield-checkmark-outline" label="Privacy settings" color={colors.primary} onPress={() => router.push('/settings')} />
      </View>

      <View style={[styles.avatarCircle, { backgroundColor: colors.secondary }]}>
        <Image source={require('../../../assets/figma/avatar-default.png')} style={styles.avatar} contentFit="contain" />
      </View>

      <View style={[styles.nameField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput accessibilityLabel="Profile name" value={name} onChangeText={(value) => { setSaved(false); setName(value); }} maxLength={40} selectTextOnFocus style={[styles.nameInput, { color: colors.heading }]} />
        <Ionicons name="pencil-outline" size={24} color={colors.text} />
      </View>

      <View style={[styles.customizeTitle, { backgroundColor: colors.surface, borderColor: colors.border }]}><MoodifyText style={styles.customizeText}>Customize</MoodifyText></View>

      <OptionSection label="Hair">
        <View style={[styles.colorPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {hairColors.map((color) => <ColorOption key={color} color={color} selected={avatar.hair === color} label={`Hair color ${color}`} onPress={() => choose('hair', color)} />)}
        </View>
      </OptionSection>

      <OptionSection label="Skin">
        <View style={[styles.colorPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {skinColors.map((color) => <ColorOption key={color} color={color} selected={avatar.skin === color} label={`Skin tone ${color}`} onPress={() => choose('skin', color)} />)}
        </View>
      </OptionSection>

      <OptionSection label="Eyes">
        <View style={styles.assetRow} accessibilityRole="radiogroup">
          {eyes.map((item) => <AssetOption key={item.id} source={item.source} label={item.label} selected={avatar.eyes === item.id} onPress={() => choose('eyes', item.id)} />)}
        </View>
      </OptionSection>

      <OptionSection label="Clothes">
        <View style={styles.assetRow} accessibilityRole="radiogroup">
          {clothes.map((item) => <AssetOption key={item.id} source={item.source} label={item.label} selected={avatar.clothes === item.id} onPress={() => choose('clothes', item.id)} />)}
        </View>
      </OptionSection>

      <Pressable accessibilityRole="button" accessibilityLabel="Save profile" onPress={() => void save()} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.78 : 1 }]}>
        <MoodifyText variant="button" color={palette.white}>{saved ? 'Saved' : 'Save'}</MoodifyText>
      </Pressable>
      <MoodifyText variant="small" style={styles.accountLine}>{profile.email} · Age {profile.ageBand}</MoodifyText>
    </Screen>
  );
}

function OptionSection({ label, children }: { label: string; children: ReactNode }) {
  return <View style={styles.optionSection}><MoodifyText variant="label" style={styles.optionLabel}>{label}</MoodifyText>{children}</View>;
}

function normalizeAvatar(avatar?: AvatarSelection): AvatarSelection {
  return {
    hair: avatar && hairColors.includes(avatar.hair) ? avatar.hair : '#C93305',
    skin: avatar && skinColors.includes(avatar.skin) ? avatar.skin : '#F8D2B3',
    eyes: avatar && eyes.some((item) => item.id === avatar.eyes) ? avatar.eyes : 'happy',
    clothes: avatar && clothes.some((item) => item.id === avatar.clothes) ? avatar.clothes : 'suit',
  };
}

function ColorOption({ color, selected, label, onPress }: { color: string; selected: boolean; label: string; onPress: () => void }) {
  const { colors } = useMoodifyTheme();
  return <Pressable accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={[styles.colorRing, selected && { borderColor: colors.primary }]}><View style={[styles.colorDot, { backgroundColor: color, borderColor: color === '#FFFFFF' ? palette.grey300 : color }]} /></Pressable>;
}

function AssetOption({ source, selected, label, onPress }: { source: ImageSource; selected: boolean; label: string; onPress: () => void }) {
  const { colors } = useMoodifyTheme();
  return <Pressable accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={[styles.assetOption, { borderColor: selected ? colors.primary : colors.border, backgroundColor: palette.white }]}><Image source={source} style={styles.assetImage} contentFit="contain" /></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, gap: 10, alignItems: 'center' },
  background: { position: 'absolute', width: 824, height: 440, left: -222, top: 250, transform: [{ rotate: '-90deg' }] },
  header: { width: '100%', height: 52, marginHorizontal: -spacing.xl, marginBottom: 6, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3, zIndex: 2 },
  headerTitle: { fontFamily: typography.regular, fontWeight: '400' },
  avatarCircle: { width: 174, height: 174, borderRadius: 87, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 4 },
  avatar: { width: 171, height: 171 },
  nameField: { width: 200, height: 42, borderWidth: 1, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7 },
  nameInput: { width: 157, height: 40, textAlign: 'center', fontFamily: typography.medium, fontWeight: '600', fontSize: 20 },
  customizeTitle: { width: 339, height: 45, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  customizeText: { fontFamily: typography.bold, fontWeight: '700', fontSize: 31, lineHeight: 37 },
  optionSection: { width: 347, gap: 2 },
  optionLabel: { marginLeft: 18, fontSize: 16, lineHeight: 24 },
  colorPanel: { height: 46, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  colorRing: { width: 34, height: 34, borderWidth: 2, borderColor: 'transparent', borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 29, height: 29, borderWidth: StyleSheet.hairlineWidth, borderRadius: 15 },
  assetRow: { width: 317, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  assetOption: { width: 71, height: 68, borderWidth: 1, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  assetImage: { width: 63, height: 40 },
  saveButton: { width: 147, height: 52, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 2, elevation: 4 },
  accountLine: { textAlign: 'center', marginTop: 2 },
});
