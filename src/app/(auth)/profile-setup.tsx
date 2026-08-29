import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Header, MoodifyText, PageBackdrop, PrimaryButton, Screen } from '@/components/ui';
import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { saveProfile } from '@/services/auth';
import { firebaseConfigured } from '@/services/firebase';
import { useAppStore } from '@/state/use-app-store';
import { palette, radius, spacing } from '@/theme/tokens';

const presets: { name: string; source: ImageSource; hair: string; skin: string; eyes: string; clothes: string }[] = [
  { name: 'Blonde bun', source: require('../../../assets/figma/avatar/preview-rose.png'), hair: 'blonde-bun', skin: '#5D3B20', eyes: 'happy', clothes: 'overall' },
  { name: 'Red bob', source: require('../../../assets/figma/avatar/preview-blonde.png'), hair: 'red-bob', skin: '#F8D2B3', eyes: 'hearts', clothes: 'suit' },
  { name: 'Short curls', source: require('../../../assets/figma/avatar/preview-green.png'), hair: 'short-curls', skin: '#DB9860', eyes: 'side', clothes: 'hoodie' },
];

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

export default function ProfileSetupScreen() {
  const { colors } = useMoodifyTheme();
  const profile = useAppStore((state) => state.profile);
  const update = useAppStore((state) => state.updateProfile);
  const initialPreset = Math.max(0, presets.findIndex((item) => item.hair === profile?.avatar.hair));
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  if (!profile) return null;

  const choose = (key: 'hair' | 'skin' | 'eyes' | 'clothes', value: string) => update({ avatar: { ...profile.avatar, [key]: value } });
  const choosePreset = (index: number) => {
    const preset = presets[index];
    setSelectedPreset(index);
    update({ avatar: { hair: preset.hair, skin: preset.skin, eyes: preset.eyes, clothes: preset.clothes } });
  };
  const save = async () => {
    if (firebaseConfigured) await saveProfile(profile);
    router.replace('/(tabs)');
  };

  return (
    <Screen contentStyle={styles.content}>
      <PageBackdrop />
      <Header title="Pick an avatar" onBack={() => router.back()} />
      <View style={styles.avatarRow} accessibilityRole="radiogroup">
        {presets.map((preset, index) => {
          const selected = selectedPreset === index;
          return (
            <Pressable key={preset.name} accessibilityRole="radio" accessibilityLabel={preset.name} accessibilityState={{ selected }} onPress={() => choosePreset(index)} style={[styles.avatarChoice, selected && { borderColor: colors.primary }] }>
              <Image source={preset.source} style={selected ? styles.avatarLarge : styles.avatarSmall} contentFit="contain" />
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.customize, { backgroundColor: colors.surface }]}>
        <MoodifyText variant="h2" style={styles.customizeTitle}>Customize</MoodifyText>
        <OptionRow label="Hair">
          {hairColors.map((color) => <ColorOption key={color} color={color} selected={profile.avatar.hair === color} label={`Hair color ${color}`} onPress={() => choose('hair', color)} />)}
        </OptionRow>
        <OptionRow label="Skin">
          {skinColors.map((color) => <ColorOption key={color} color={color} selected={profile.avatar.skin === color} label={`Skin tone ${color}`} onPress={() => choose('skin', color)} />)}
        </OptionRow>
        <OptionRow label="Eyes">
          {eyes.map((item) => <AssetOption key={item.id} source={item.source} label={item.label} selected={profile.avatar.eyes === item.id} onPress={() => choose('eyes', item.id)} />)}
        </OptionRow>
        <OptionRow label="Clothes">
          {clothes.map((item) => <AssetOption key={item.id} source={item.source} label={item.label} selected={profile.avatar.clothes === item.id} onPress={() => choose('clothes', item.id)} />)}
        </OptionRow>
      </View>
      <PrimaryButton title="Ready" icon="checkmark" onPress={() => void save()} />
    </Screen>
  );
}

function OptionRow({ label, children }: { label: string; children: ReactNode }) {
  return <View style={styles.optionSection}><MoodifyText variant="label">{label}</MoodifyText><View style={styles.optionRow} accessibilityRole="radiogroup">{children}</View></View>;
}

function ColorOption({ color, selected, label, onPress }: { color: string; selected: boolean; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={[styles.colorRing, selected && styles.selectedRing]}><View style={[styles.colorDot, { backgroundColor: color, borderColor: color === '#FFFFFF' ? palette.grey300 : color }]} /></Pressable>;
}

function AssetOption({ source, selected, label, onPress }: { source: ImageSource; selected: boolean; label: string; onPress: () => void }) {
  const { colors } = useMoodifyTheme();
  return <Pressable accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={[styles.assetOption, { borderColor: selected ? colors.primary : 'transparent', backgroundColor: colors.background }]}><Image source={source} style={styles.assetImage} contentFit="contain" /></Pressable>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  avatarRow: { minHeight: 184, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: spacing.sm },
  avatarChoice: { width: 92, minHeight: 140, borderWidth: 2, borderColor: 'transparent', borderRadius: radius.lg, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  avatarSmall: { width: 84, height: 118 },
  avatarLarge: { width: 108, height: 156 },
  customize: { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.lg },
  customizeTitle: { textAlign: 'center' },
  optionSection: { gap: spacing.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  colorRing: { width: 36, height: 36, borderWidth: 2, borderColor: 'transparent', borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  selectedRing: { borderColor: palette.teal800 },
  colorDot: { width: 26, height: 26, borderWidth: 1, borderRadius: radius.pill },
  assetOption: { width: 70, height: 46, borderWidth: 2, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  assetImage: { width: 62, height: 34 },
});
