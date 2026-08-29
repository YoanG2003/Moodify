import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { palette } from '@/theme/tokens';

const icons = { index: 'home', tools: 'apps', add: 'add-circle', chat: 'chatbubble-ellipses', insights: 'bar-chart' } as const;

export default function TabsLayout() {
  const { colors } = useMoodifyTheme();
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.navInactive,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 74, paddingTop: 8, paddingBottom: 10 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name as keyof typeof icons] ?? 'ellipse'} size={route.name === 'add' ? size + 10 : size} color={route.name === 'add' ? palette.teal800 : color} />,
    })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tools" options={{ title: 'Tools' }} />
      <Tabs.Screen name="add" options={{ title: 'Add mood' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
    </Tabs>
  );
}
