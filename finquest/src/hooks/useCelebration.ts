'use client';

import { useEffect } from 'react';
import { useNotificationStore, CelebrationEvent } from '@/stores/notification';

const AUTO_DISMISS_MS = 3500;

export function useCelebration(): { current: CelebrationEvent | null; dismiss: () => void } {
  const current = useNotificationStore((state) => state.celebrations[0] ?? null);
  const dismiss = useNotificationStore((state) => state.dismissCelebration);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  return { current, dismiss };
}
