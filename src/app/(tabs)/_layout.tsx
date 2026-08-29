import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useMoodifyTheme } from '@/hooks/use-moodify-theme';

const icons = { index: 'home-outline', tools: 'grid-outline', chat: 'chatbox-outline', insights: 'stats-chart-outline' } as const;

export default function TabsLayout() {
  const { colors } = useMoodifyTheme();
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.navActive,
      tabBarInactiveTintColor: colors.navInactive,
      tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, height: 65, paddingTop: 4, paddingBottom: 5, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: -2 }, shadowRadius: 5, elevation: 6 },
      tabBarItemStyle: { paddingTop: 2 },
      tabBarLabelStyle: { fontSize: 10, lineHeight: 12, fontWeight: '600' },
      tabBarIcon: ({ color, focused }) => route.name === 'add' ? <View style={[styles.addCircle, { backgroundColor: colors.navActive }]}><Ionicons name="add" size={30} color="#FFFFFF" /></View> : <View style={styles.iconWrap}>{focused ? <View style={[styles.activeLine, { backgroundColor: colors.navActive }]} /> : null}<Ionicons name={icons[route.name as keyof typeof icons] ?? 'ellipse-outline'} size={24} color={color} /></View>,
    })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tools" options={{ title: 'Tools' }} />
      <Tabs.Screen name="add" options={{ title: '', tabBarButton: ({ children, onPress, onLongPress, accessibilityState }) => <Pressable accessibilityRole="button" accessibilityLabel="Add mood" accessibilityState={accessibilityState} onPress={onPress} onLongPress={onLongPress} style={styles.addButton}>{children}</Pressable> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 80, alignItems: 'center', justifyContent: 'center' },
  activeLine: { position: 'absolute', top: -11, width: 80, height: 3, borderRadius: 2 },
  addCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: -9 },
  addButton: { alignItems: 'center', justifyContent: 'center' },
});
