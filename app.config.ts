import type { ConfigContext, ExpoConfig } from 'expo/config';

declare const process: { env: Record<string, string | undefined> };

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosGoogleServicesFile = process.env.GOOGLE_SERVICES_PLIST;
  const androidGoogleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  const nativeFirebaseEnabled = Boolean(iosGoogleServicesFile || androidGoogleServicesFile);
  const firebasePlugins: NonNullable<ExpoConfig['plugins']> = nativeFirebaseEnabled ? [
    '@react-native-firebase/app',
    ['@react-native-firebase/analytics', { ios: { withoutAdIdSupport: true } }],
    '@react-native-firebase/crashlytics',
    '@react-native-firebase/app-check',
  ] : [];

  return {
    ...config,
    name: config.name ?? 'Moodify',
    slug: config.slug ?? 'moodify',
    ios: {
      ...config.ios,
      ...(iosGoogleServicesFile ? { googleServicesFile: iosGoogleServicesFile } : {}),
    },
    android: {
      ...config.android,
      ...(androidGoogleServicesFile ? { googleServicesFile: androidGoogleServicesFile } : {}),
    },
    extra: {
      ...config.extra,
      nativeFirebaseEnabled,
    },
    plugins: [...(config.plugins ?? []), ...firebasePlugins],
  };
};
