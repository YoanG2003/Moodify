import { endOfDay, format, startOfDay } from 'date-fns';
import { Platform } from 'react-native';

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
    const [stepSamples, sleepSamples] = await Promise.all([
      kit.queryQuantitySamples('HKQuantityTypeIdentifierStepCount', { limit: -1, unit: 'count', filter: { date: { startDate: start, endDate: end } } }),
      kit.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', { limit: -1, filter: { date: { startDate: start, endDate: end } } }),
    ]);
    const steps = stepSamples.reduce((sum, sample) => sum + sample.quantity, 0);
    const sleepMinutes = sleepSamples
      .filter((sample) => Number(sample.value) >= 1 && Number(sample.value) !== 2)
      .reduce((sum, sample) => sum + Math.max(0, (sample.endDate.getTime() - sample.startDate.getTime()) / 60_000), 0);
    return { date: format(start, 'yyyy-MM-dd'), steps: Math.round(steps), sleepMinutes: Math.round(sleepMinutes), sources: { steps: 'healthkit', sleepMinutes: 'healthkit' }, syncedAt: new Date().toISOString() };
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
      return granted.some((permission) => permission.accessType === 'read' && permission.recordType === 'Steps');
    } catch { return false; }
  }

  async readToday(): Promise<HealthDaily> {
    const health = await import('react-native-health-connect');
    await health.initialize();
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    const timeRangeFilter = { operator: 'between' as const, startTime: start.toISOString(), endTime: end.toISOString() };
    const [stepsResult, sleepResult] = await Promise.all([
      health.readRecords('Steps', { timeRangeFilter }),
      health.readRecords('SleepSession', { timeRangeFilter }),
    ]);
    const steps = stepsResult.records.reduce((sum, record) => sum + record.count, 0);
    const sleepMinutes = sleepResult.records.reduce((sum, record) => sum + Math.max(0, (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60_000), 0);
    return { date: format(start, 'yyyy-MM-dd'), steps: Math.round(steps), sleepMinutes: Math.round(sleepMinutes), sources: { steps: 'health-connect', sleepMinutes: 'health-connect' }, syncedAt: new Date().toISOString() };
  }
}

// Native modules require an EAS development build. Manual entry remains available in Expo Go.
export function getHealthAdapter(): HealthAdapter {
  if (Platform.OS === 'ios') return new IosHealthAdapter();
  if (Platform.OS === 'android') return new AndroidHealthAdapter();
  return new ManualHealthAdapter();
}
