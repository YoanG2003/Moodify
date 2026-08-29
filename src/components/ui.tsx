import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMoodifyTheme } from '@/hooks/use-moodify-theme';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type TextVariant = 'hero' | 'h1' | 'h2' | 'body' | 'small' | 'label' | 'button';

export function MoodifyText({ variant = 'body', color, style, ...props }: TextProps & { variant?: TextVariant; color?: string }) {
  const { colors } = useMoodifyTheme();
  const variantStyle = variant === 'button' ? styles.buttonText : styles[variant];
  return <Text {...props} style={[styles.text, variantStyle, { color: color ?? (variant.startsWith('h') || variant === 'hero' ? colors.heading : colors.text) }, style]} />;
}

export function Screen({ children, scroll = true, keyboard = false, contentStyle }: PropsWithChildren<{ scroll?: boolean; keyboard?: boolean; contentStyle?: ViewStyle }>) {
  const { colors } = useMoodifyTheme();
  const content = scroll ? (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.screenContent, contentStyle]}>{children}</ScrollView>
  ) : <View style={[styles.screenContent, styles.flex, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: colors.background }]}>
      {keyboard ? <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{content}</KeyboardAvoidingView> : content}
    </SafeAreaView>
  );
}

export function PageBackdrop() {
  const { isDark } = useMoodifyTheme();
  return <Image source={require('../../assets/figma/auth-background.svg')} style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.18 : 1 }]} contentFit="cover" pointerEvents="none" />;
}

export function Header({ title, subtitle, onBack, left, right }: { title: string; subtitle?: string; onBack?: () => void; left?: ReactNode; right?: ReactNode }) {
  const { colors } = useMoodifyTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>{onBack ? <IconButton icon="chevron-back" label="Go back" onPress={onBack} /> : left}</View>
      <View style={styles.headerTitle}>
        <MoodifyText variant="h2" color={colors.primary} numberOfLines={1}>{title}</MoodifyText>
        {subtitle ? <MoodifyText variant="small" numberOfLines={1}>{subtitle}</MoodifyText> : null}
      </View>
      <View style={styles.headerSide}>{right}</View>
      <View style={[styles.headerRule, { backgroundColor: colors.border }]} />
    </View>
  );
}

export function IconButton({ icon, label, onPress, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; color?: string }) {
  const { colors } = useMoodifyTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><Ionicons name={icon} size={24} color={color ?? colors.heading} /></Pressable>;
}

export function PrimaryButton({ title, onPress, secondary = false, disabled = false, loading = false, icon }: { title: string; onPress?: () => void; secondary?: boolean; disabled?: boolean; loading?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useMoodifyTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled, busy: loading }} onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [
      styles.button,
      { backgroundColor: secondary ? colors.primary : colors.secondary, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 },
    ]}>
      {loading ? <ActivityIndicator color={palette.white} /> : <>{icon ? <Ionicons name={icon} size={19} color={palette.white} /> : null}<MoodifyText variant="button" color={palette.white}>{title}</MoodifyText></>}
    </Pressable>
  );
}

export function SocialButton({ provider, onPress }: { provider: 'google' | 'apple'; onPress?: () => void }) {
  const { colors } = useMoodifyTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Continue with ${provider}`} onPress={onPress} style={({ pressed }) => [styles.socialButton, { backgroundColor: provider === 'apple' ? palette.black : colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
      <Image source={provider === 'google' ? require('../../assets/figma/google.svg') : require('../../assets/figma/apple.svg')} style={styles.socialIcon} contentFit="contain" />
    </Pressable>
  );
}

export function Field({ label, error, rightIcon, onRightPress, ...props }: TextInputProps & { label: string; error?: string; rightIcon?: keyof typeof Ionicons.glyphMap; onRightPress?: () => void }) {
  const { colors } = useMoodifyTheme();
  return (
    <View style={styles.fieldWrap}>
      <MoodifyText variant="label" style={styles.fieldLabel}>{label}</MoodifyText>
      <View style={[styles.field, { backgroundColor: colors.input, borderColor: error ? colors.danger : colors.border }]}>
        <TextInput placeholderTextColor={colors.inputPlaceholder} {...props} style={[styles.fieldInput, { color: colors.inputText }]} />
        {rightIcon ? <IconButton icon={rightIcon} label={`${label} action`} onPress={onRightPress} color={colors.textMuted} /> : null}
      </View>
      {error ? <MoodifyText variant="small" color={colors.danger}>{error}</MoodifyText> : null}
    </View>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: PropsWithChildren<{ style?: ViewStyle; onPress?: () => void; accessibilityLabel?: string }>) {
  const { colors } = useMoodifyTheme();
  const content = <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
  if (!onPress) return content;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>{content}</Pressable>;
}

export function Chip({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { colors } = useMoodifyTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }, pressed && styles.pressed]}>
      <MoodifyText variant="small" color={selected ? colors.background : colors.text}>{label}</MoodifyText>
    </Pressable>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const { colors } = useMoodifyTheme();
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressValue, { width: `${Math.min(100, Math.max(0, value * 100))}%`, backgroundColor: color ?? colors.primary }]} /></View>;
}

export function AuthIllustration() {
  return (
    <View style={styles.authIllustration} accessibilityRole="image" accessibilityLabel="Person saying hello from a window">
      <Image source={require('../../assets/figma/auth-illustration-background.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
      <Image source={require('../../assets/figma/auth-illustration-shape.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
      <Image source={require('../../assets/figma/auth-illustration-window.svg')} style={[StyleSheet.absoluteFill, { margin: 24 }]} contentFit="contain" />
      <Image source={require('../../assets/figma/auth-illustration-character.svg')} style={[StyleSheet.absoluteFill, { marginTop: 80, marginHorizontal: 52 }]} contentFit="contain" />
      <Image source={require('../../assets/figma/auth-illustration-speech.svg')} style={styles.speech} contentFit="contain" />
    </View>
  );
}

export function HeroGradient({ children }: PropsWithChildren) {
  const { isDark } = useMoodifyTheme();
  return <LinearGradient colors={isDark ? ['#173F3F', '#332F23'] : [palette.teal300, palette.gold100]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>{children}</LinearGradient>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screenContent: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.lg },
  text: { fontFamily: typography.regular, lineHeight: 24 },
  hero: { fontSize: 39, lineHeight: 47, fontFamily: typography.bold, fontWeight: '700' },
  h1: { fontSize: 25, lineHeight: 30, fontFamily: typography.bold, fontWeight: '700' },
  h2: { fontSize: 20, lineHeight: 24, fontFamily: typography.medium, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  small: { fontSize: 13, lineHeight: 16 },
  label: { fontSize: 13, lineHeight: 16, fontWeight: '700' },
  buttonText: { fontSize: 16, lineHeight: 19, fontWeight: '700', textTransform: 'uppercase' },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', marginHorizontal: -8, marginBottom: spacing.sm },
  headerSide: { width: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerRule: { height: StyleSheet.hairlineWidth, position: 'absolute', bottom: 0, left: 0, right: 0 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  pressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
  button: { minHeight: 52, borderRadius: radius.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  socialButton: { flex: 1, height: 48, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  socialIcon: { width: 24, height: 24 },
  fieldWrap: { gap: 5 },
  fieldLabel: { marginLeft: 1 },
  field: { minHeight: 48, borderRadius: radius.sm, borderWidth: 1, paddingLeft: spacing.md, flexDirection: 'row', alignItems: 'center' },
  fieldInput: { flex: 1, minHeight: 46, fontFamily: typography.regular, fontSize: 16 },
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, shadowColor: '#101828', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  chip: { minHeight: 36, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  progressValue: { height: '100%', borderRadius: radius.pill },
  authIllustration: { width: '100%', alignSelf: 'center', height: 250, flexShrink: 0, position: 'relative' },
  speech: { position: 'absolute', width: 76, height: 58, top: 50, right: 42 },
  heroGradient: { borderRadius: radius.xl, padding: spacing.xl, overflow: 'hidden' },
});
