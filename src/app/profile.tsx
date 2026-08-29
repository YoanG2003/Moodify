import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Field, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useAppStore } from '@/state/use-app-store';
import { spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const profile = useAppStore((state) => state.profile);
  const update = useAppStore((state) => state.updateProfile);
  if (!profile) return null;
  return (
    <Screen>
      <Header title="Profile" onBack={() => router.back()} />
      <Image source={require('../../assets/figma/avatar-default.png')} style={styles.avatar} contentFit="contain" />
      <Field label="Name" value={profile.displayName} onChangeText={(displayName) => update({ displayName })} placeholder="Your name" />
      <View style={styles.info}><MoodifyText variant="label">Account</MoodifyText><MoodifyText>{profile.email}</MoodifyText><MoodifyText variant="small">Age band: {profile.ageBand}</MoodifyText></View>
      <PrimaryButton title="Customize avatar" secondary onPress={() => router.push('/(auth)/profile-setup')} />
      <PrimaryButton title="Settings and privacy" onPress={() => router.push('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({ avatar: { width: 210, height: 210, borderRadius: 105, alignSelf: 'center' }, info: { gap: spacing.xs } });
