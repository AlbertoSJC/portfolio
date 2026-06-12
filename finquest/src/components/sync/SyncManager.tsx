'use client';

import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth-client';
import { usePlayerStore } from '@/stores/player';
import { ApiPlayerRepository } from '@/services/playerRepository';

const repository = new ApiPlayerRepository();
const SAVE_DEBOUNCE_MS = 1500;

export function SyncManager() {
  const { data: session } = authClient.useSession();
  const player = usePlayerStore((state) => state.player);
  const hasHydrated = usePlayerStore((state) => state._hasHydrated);
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);
  const syncedUserId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId || !hasHydrated) {
      if (!userId) syncedUserId.current = null;
      return;
    }
    if (syncedUserId.current === userId) return;

    const localPlayer = usePlayerStore.getState().player;
    repository
      .load()
      .then((serverPlayer) => {
        if (serverPlayer) {
          initializePlayer(serverPlayer);
        } else if (localPlayer) {
          return repository.save(localPlayer);
        }
      })
      .then(() => {
        syncedUserId.current = userId;
      })
      .catch((error) => console.error('Player sync failed:', error));
  }, [userId, hasHydrated, initializePlayer]);

  useEffect(() => {
    if (!userId || !player || syncedUserId.current !== userId) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      repository.save(player).catch((error) => console.error('Player sync failed:', error));
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [player, userId]);

  return null;
}
