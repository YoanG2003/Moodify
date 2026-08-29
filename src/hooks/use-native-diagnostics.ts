import { useEffect } from 'react';

import { configureNativeDiagnostics } from '@/services/native-firebase';
import { useAppStore } from '@/state/use-app-store';

export function useNativeDiagnostics() {
  const analyticsEnabled = useAppStore((state) => state.settings.analyticsEnabled);
  const crashReportingEnabled = useAppStore((state) => state.settings.crashReportingEnabled);
  useEffect(() => {
    void configureNativeDiagnostics(Boolean(analyticsEnabled), Boolean(crashReportingEnabled));
  }, [analyticsEnabled, crashReportingEnabled]);
}
