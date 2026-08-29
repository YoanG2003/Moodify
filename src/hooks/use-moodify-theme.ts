import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from '@/theme/tokens';
import { useAppStore } from '@/state/use-app-store';

export function useMoodifyTheme() {
  const system = useColorScheme();
  const preference = useAppStore((state) => state.settings.theme);
  const isDark = preference === 'dark' || (preference === 'system' && system === 'dark');
  return { colors: isDark ? darkColors : lightColors, isDark };
}
