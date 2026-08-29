import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Field, Header, MoodifyText, PageBackdrop, PrimaryButton, Screen } from '@/components/ui';
import { useAppStore } from '@/state/use-app-store';
import { firebaseConfigured } from '@/services/firebase';
import { saveProfile } from '@/services/auth';
import { palette, radius, spacing } from '@/theme/tokens';

const eyes = ['happy', 'side', 'cry', 'hearts'];
const clothes = ['hoodie', 'graphic', 'overall', 'suit'];

export default function ProfileSetupScreen() {
  const profile = useAppStore((state) => state.profile);
  const update = useAppStore((state) => state.updateProfile);
  if (!profile) return null;
  const choose = (key: 'eyes' | 'clothes', value: string) => update({ avatar: { ...profile.avatar, [key]: value } });
  const save = async () => {
    if (firebaseConfigured) await saveProfile(profile);
    router.replace('/(tabs)');
  };
  return (
    <Screen>
      <PageBackdrop />
      <Header title="Pick an avatar" onBack={() => router.back()} />
      <Image source={require('../../../assets/figma/avatar-default.png')} style={styles.avatar} contentFit="contain" />
      <Field label="How should we call you?" value={profile.displayName} onChangeText={(displayName) => update({ displayName })} placeholder="Your first name or nickname" />
      <MoodifyText variant="h2">Customize</MoodifyText>
      <MoodifyText variant="label">Eyes</MoodifyText>
      <View style={styles.options}>{eyes.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected: profile.avatar.eyes === item }} onPress={() => choose('eyes', item)} style={[styles.option, profile.avatar.eyes === item && styles.selected]}><MoodifyText>{item}</MoodifyText></Pressable>)}</View>
      <MoodifyText variant="label">Clothes</MoodifyText>
      <View style={styles.options}>{clothes.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected: profile.avatar.clothes === item }} onPress={() => choose('clothes', item)} style={[styles.option, profile.avatar.clothes === item && styles.selected]}><MoodifyText>{item}</MoodifyText></Pressable>)}</View>
      <PrimaryButton title="Save" disabled={!profile.displayName.trim()} onPress={() => void save()} />
    </Screen>
  );
}

const styles = StyleSheet.create({ avatar: { width: 180, height: 180, alignSelf: 'center', borderRadius: 90 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, option: { minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: '#AAAAAA', alignItems: 'center', justifyContent: 'center' }, selected: { borderColor: palette.teal700, backgroundColor: palette.teal100 } });
