import { Platform } from 'react-native';

export const palette = {
  teal900: '#005D61',
  teal800: '#007474',
  teal700: '#008080',
  teal600: '#008282',
  teal300: '#8AC5C5',
  teal100: '#DDF2F1',
  aqua: '#00A2AE',
  gold700: '#876200',
  gold500: '#B79D54',
  gold100: '#F5EBCF',
  coral: '#FF6D60',
  white: '#FFFFFF',
  black: '#121212',
  grey950: '#121212',
  grey900: '#202020',
  grey800: '#363636',
  grey700: '#444444',
  grey600: '#5B5B5B',
  grey500: '#808080',
  grey400: '#AAAAAA',
  grey300: '#D8D8D8',
  grey200: '#E8E8E8',
  grey100: '#F2F2F2',
  red: '#B42318',
  green: '#1D7A56',
} as const;

export type ThemeMode = 'system' | 'light' | 'dark';

export const lightColors = {
  background: palette.grey100,
  surface: palette.white,
  surfaceMuted: palette.teal100,
  heading: palette.grey800,
  text: palette.grey600,
  textMuted: palette.grey500,
  border: '#999999',
  primary: palette.teal800,
  primarySoft: palette.teal100,
  secondary: palette.gold700,
  navActive: palette.teal700,
  navLabel: palette.teal800,
  navInactive: palette.grey600,
  input: palette.white,
  inputText: palette.grey800,
  inputPlaceholder: palette.grey500,
  danger: palette.red,
  success: palette.green,
  shadow: '#101828',
} as const;

export const darkColors = {
  background: palette.grey950,
  surface: palette.grey950,
  surfaceMuted: '#003F42',
  heading: palette.grey100,
  text: palette.grey400,
  textMuted: palette.grey400,
  border: palette.grey300,
  primary: palette.teal700,
  primarySoft: '#004E52',
  secondary: palette.gold500,
  navActive: palette.teal300,
  navLabel: '#54AAAA',
  navInactive: '#C5C5C5',
  input: palette.white,
  inputText: palette.grey800,
  inputPlaceholder: palette.grey500,
  danger: '#FF1600',
  success: '#6A9E4F',
  shadow: '#000000',
} as const;

export type MoodifyColors = typeof lightColors | typeof darkColors;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 } as const;

export const typography = {
  regular: Platform.select({ web: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif', ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ web: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif', ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  bold: Platform.select({ web: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif', ios: 'System', android: 'sans-serif', default: 'System' }),
} as const;
