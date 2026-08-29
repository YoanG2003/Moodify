import { useEffect } from 'react';

import { watchCloudUser } from '@/services/cloud-sync';
import { useAppStore } from '@/state/use-app-store';

export function useCloudSync() {
  const uid = useAppStore((state) => state.profile?.uid);
  const applyCloudData = useAppStore((state) => state.applyCloudData);
  useEffect(() => {
    if (!uid) return;
    return watchCloudUser(uid, applyCloudData);
  }, [applyCloudData, uid]);
}
