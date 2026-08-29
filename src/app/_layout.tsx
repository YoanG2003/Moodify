import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { useCloudSync } from '@/hooks/use-cloud-sync';
import { useNativeDiagnostics } from '@/hooks/use-native-diagnostics';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useCloudSync();
  useNativeDiagnostics();
  const { isDark } = useMoodifyTheme();
  useEffect(() => { void SplashScreen.hideAsync(); }, []);
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_right' }} />
        <Stack.Screen name="content/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="mood-done" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="health-entry" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="mood/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="habits" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="habit-edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ThemeProvider>
  );
}
