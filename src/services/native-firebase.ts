import Constants from 'expo-constants';

let nativeAppCheck: Awaited<ReturnType<typeof createNativeAppCheck>> | null = null;

export const nativeFirebaseEnabled = Constants.expoConfig?.extra?.nativeFirebaseEnabled === true;

async function createNativeAppCheck() {
  const [{ getApp }, { getToken, initializeAppCheck, ReactNativeFirebaseAppCheckProvider }] = await Promise.all([
    import('@react-native-firebase/app'),
    import('@react-native-firebase/app-check'),
  ]);
  const provider = new ReactNativeFirebaseAppCheckProvider({
    apple: { provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback' },
    android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
  });
  const instance = initializeAppCheck(getApp(), { provider, isTokenAutoRefreshEnabled: true });
  return { instance, getToken };
}

export async function getNativeAppCheckToken() {
  if (!nativeFirebaseEnabled) throw new Error('Native Firebase credentials are not configured.');
  nativeAppCheck ??= await createNativeAppCheck();
  return nativeAppCheck.getToken(nativeAppCheck.instance, false);
}

export async function configureNativeDiagnostics(analyticsEnabled: boolean, crashReportingEnabled: boolean) {
  if (!nativeFirebaseEnabled) return;
  await getNativeAppCheckToken();
  const [{ getAnalytics, setAnalyticsCollectionEnabled }, { getCrashlytics, setCrashlyticsCollectionEnabled }] = await Promise.all([
    import('@react-native-firebase/analytics'),
    import('@react-native-firebase/crashlytics'),
  ]);
  await Promise.all([
    setAnalyticsCollectionEnabled(getAnalytics(), analyticsEnabled),
    setCrashlyticsCollectionEnabled(getCrashlytics(), crashReportingEnabled),
  ]);
}
