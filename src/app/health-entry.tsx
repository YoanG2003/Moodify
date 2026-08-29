import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';

import { Field, Header, MoodifyText, PrimaryButton, Screen } from '@/components/ui';
import { useAppStore } from '@/state/use-app-store';

export default function HealthEntryScreen() {
  const date = format(new Date(), 'yyyy-MM-dd');
  const existing = useAppStore((state) => state.healthDaily.find((item) => item.date === date));
  const saveDaily = useAppStore((state) => state.upsertHealthDaily);
  const [steps, setSteps] = useState(existing?.steps ? String(existing.steps) : '');
  const [sleep, setSleep] = useState(existing?.sleepMinutes ? String(existing.sleepMinutes / 60) : '');
  const [water, setWater] = useState(existing?.waterMl ? String(existing.waterMl) : '');
  const save = () => {
    saveDaily({
      date,
      steps: steps ? Number(steps) : existing?.steps,
      sleepMinutes: sleep ? Math.round(Number(sleep) * 60) : existing?.sleepMinutes,
      waterMl: water ? Number(water) : existing?.waterMl,
      sources: {
        ...existing?.sources,
        ...(steps ? { steps: 'manual' as const } : {}),
        ...(sleep ? { sleepMinutes: 'manual' as const } : {}),
        ...(water ? { waterMl: 'manual' as const } : {}),
      },
      syncedAt: existing?.syncedAt,
    });
    router.back();
  };
  return (
    <Screen keyboard>
      <Header title="Today’s health data" subtitle={date} onBack={() => router.back()} />
      <MoodifyText>Manual values override the displayed device aggregate for today and remain labeled as manual.</MoodifyText>
      <Field label="Steps" value={steps} onChangeText={setSteps} keyboardType="number-pad" placeholder="e.g. 6500" />
      <Field label="Sleep hours" value={sleep} onChangeText={setSleep} keyboardType="decimal-pad" placeholder="e.g. 7.5" />
      <Field label="Water (ml)" value={water} onChangeText={setWater} keyboardType="number-pad" placeholder="e.g. 1500" />
      <PrimaryButton title="Save" onPress={save} disabled={[steps, sleep, water].some((value) => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0))} />
    </Screen>
  );
}
