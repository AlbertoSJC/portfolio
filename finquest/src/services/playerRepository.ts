import { Player } from '@/domain/Player';
import { reconstructPlayer } from '@/stores/player';

/**
 * Persistence boundary for player state. The Zustand persist middleware acts
 * as the always-on local adapter (offline demo mode); ApiPlayerRepository
 * syncs the same state to the server for signed-in users.
 */
export interface PlayerRepository {
  load(): Promise<Player | null>;
  save(player: Player): Promise<void>;
}

export class ApiPlayerRepository implements PlayerRepository {
  async load(): Promise<Player | null> {
    const response = await fetch('/api/player');
    if (!response.ok) {
      throw new Error(`Failed to load player: ${response.status}`);
    }
    const { player } = (await response.json()) as { player: Record<string, unknown> | null };
    return player ? reconstructPlayer(player) : null;
  }

  async save(player: Player): Promise<void> {
    const response = await fetch('/api/player', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: JSON.parse(JSON.stringify(player)) }),
    });
    if (!response.ok) {
      throw new Error(`Failed to save player: ${response.status}`);
    }
  }
}
