import { endOfDay, format, startOfDay } from 'date-fns';
import { Platform } from 'react-native';

import { createSyncedHealthDaily } from '@/lib/health-sync';
import type { HealthDaily } from '@/types/domain';

export interface HealthAdapter {
  isAvailable(): Promise<boolean>;
  requestReadPermission(): Promise<boolean>;
  readToday(): Promise<HealthDaily>;
}

class ManualHealthAdapter implements HealthAdapter {
  async isAvailable() { return false; }
  async requestReadPermission() { return false; }
  async readToday(): Promise<HealthDaily> { return { date: format(new Date(), 'yyyy-MM-dd'), sources: {} }; }
}

class IosHealthAdapter implements HealthAdapter {
  async isAvailable() {
    try {
      const kit = await import('@kingstinct/react-native-healthkit');
      return kit.isHealthDataAvailableAsync();
    } catch { return false; }
  }

  async requestReadPermission() {
    try {
      const kit = await import('@kingstinct/react-native-healthkit');
      return kit.requestAuthorization({ toRead: ['HKQuantityTypeIdentifierStepCount', 'HKCategoryTypeIdentifierSleepAnalysis'] });
    } catch { return false; }
  }

  async readToday(): Promise<HealthDaily> {
    const kit = await import('@kingstinct/react-native-healthkit');
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    const [stepResult, sleepResult] = await Promise.allSettled([
      kit.queryQuantitySamples('HKQuantityTypeIdentifierStepCount', { limit: -1, unit: 'count', filter: { date: { startDate: start, endDate: end } } }),
      kit.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', { limit: -1, filter: { date: { startDate: start, endDate: end } } }),
    ]);
    const stepSamples = stepResult.status === 'fulfilled' ? stepResult.value : [];
    const sleepSamples = sleepResult.status === 'fulfilled' ? sleepResult.value : [];
    const steps = stepSamples.length ? stepSamples.reduce((sum, sample) => sum + sample.quantity, 0) : undefined;
    const sleepMinutes = sleepSamples.length ? sleepSamples
      .filter((sample) => Number(sample.value) >= 1 && Number(sample.value) !== 2)
      .reduce((sum, sample) => sum + Math.max(0, (sample.endDate.getTime() - sample.startDate.getTime()) / 60_000), 0) : undefined;
    return createSyncedHealthDaily(format(start, 'yyyy-MM-dd'), 'healthkit', { steps, sleepMinutes });
  }
}

class AndroidHealthAdapter implements HealthAdapter {
  async isAvailable() {
    try {
      const health = await import('react-native-health-connect');
      return health.initialize();
    } catch { return false; }
  }

  async requestReadPermission() {
    try {
      const health = await import('react-native-health-connect');
      const granted = await health.requestPermission([{ accessType: 'read', recordType: 'Steps' }, { accessType: 'read', recordType: 'SleepSession' }]);
      return granted.some((permission) => permission.accessType === 'read' && (permission.recordType === 'Steps' || permission.recordType === 'SleepSession'));
    } catch { return false; }
  }

  async readToday(): Promise<HealthDaily> {
    const health = await import('react-native-health-connect');
    await health.initialize();
    const granted = await health.getGrantedPermissions();
    const canReadSteps = granted.some((permission) => permission.accessType === 'read' && permission.recordType === 'Steps');
    const canReadSleep = granted.some((permission) => permission.accessType === 'read' && permission.recordType === 'SleepSession');
    if (!canReadSteps && !canReadSleep) throw new Error('Health Connect permission is unavailable or was revoked.');
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    const timeRangeFilter = { operator: 'between' as const, startTime: start.toISOString(), endTime: end.toISOString() };
    const [stepsResult, sleepResult] = await Promise.allSettled([
      canReadSteps ? health.readRecords('Steps', { timeRangeFilter }) : Promise.resolve(undefined),
      canReadSleep ? health.readRecords('SleepSession', { timeRangeFilter }) : Promise.resolve(undefined),
    ]);
    const stepRecords = stepsResult.status === 'fulfilled' ? stepsResult.value?.records ?? [] : [];
    const sleepRecords = sleepResult.status === 'fulfilled' ? sleepResult.value?.records ?? [] : [];
    const steps = canReadSteps && stepRecords.length ? stepRecords.reduce((sum, record) => sum + record.count, 0) : undefined;
    const sleepMinutes = canReadSleep && sleepRecords.length ? sleepRecords.reduce((sum, record) => sum + Math.max(0, (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60_000), 0) : undefined;
    return createSyncedHealthDaily(format(start, 'yyyy-MM-dd'), 'health-connect', { steps, sleepMinutes });
  }
}

// Native modules require an EAS development build. Manual entry remains available in Expo Go.
export function getHealthAdapter(): HealthAdapter {
  if (Platform.OS === 'ios') return new IosHealthAdapter();
  if (Platform.OS === 'android') return new AndroidHealthAdapter();
  return new ManualHealthAdapter();
}
