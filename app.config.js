const base = require('./app.json');

module.exports = () => {
  const iosServicesFile = process.env.GOOGLE_SERVICES_PLIST;
  const androidServicesFile = process.env.GOOGLE_SERVICES_JSON;
  const nativeFirebaseEnabled = Boolean(iosServicesFile && androidServicesFile);
  const expo = {
    ...base.expo,
    ios: { ...base.expo.ios, ...(iosServicesFile ? { googleServicesFile: iosServicesFile } : {}) },
    android: { ...base.expo.android, ...(androidServicesFile ? { googleServicesFile: androidServicesFile } : {}) },
    plugins: nativeFirebaseEnabled ? [
      ...base.expo.plugins,
      '@react-native-firebase/app',
      '@react-native-firebase/app-check',
      '@react-native-firebase/analytics',
      '@react-native-firebase/crashlytics',
    ] : base.expo.plugins,
    extra: { ...base.expo.extra, nativeFirebaseEnabled },
  };
  return { expo };
};
