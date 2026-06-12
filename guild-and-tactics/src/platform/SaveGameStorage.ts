import type { GuildState } from '../sim/guild/GuildState';

/**
 * Platform boundary for persistence (PRD §10): the game only ever talks to
 * this interface. Browser builds use localStorage; a future Steam build
 * swaps in file system + Steam Cloud without touching sim/ui/render code.
 */
export interface SaveGameStorage {
  loadGuildSave(): GuildState | undefined;
  persistGuildSave(guild: GuildState): void;
  clearGuildSave(): void;
}

const SAVE_STORAGE_KEY = 'guild-and-tactics.save';
const CURRENT_SAVE_FORMAT_VERSION = 1;

interface VersionedSaveFile {
  saveFormatVersion: number;
  guild: GuildState;
}

/** Minimal slice of the Web Storage API, so tests can inject a stub. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class BrowserLocalStorageSaveGameStorage implements SaveGameStorage {
  private readonly keyValueStore: KeyValueStore;

  constructor(keyValueStore: KeyValueStore) {
    this.keyValueStore = keyValueStore;
  }

  loadGuildSave(): GuildState | undefined {
    const rawSave = this.keyValueStore.getItem(SAVE_STORAGE_KEY);
    if (rawSave === null) {
      return undefined;
    }
    try {
      const parsedSave = JSON.parse(rawSave) as VersionedSaveFile;
      if (parsedSave.saveFormatVersion !== CURRENT_SAVE_FORMAT_VERSION) {
        // Older/newer format than this build understands: start fresh
        // rather than corrupt; migrations arrive when the format changes.
        return undefined;
      }
      return parsedSave.guild;
    } catch {
      return undefined; // a corrupt save never crashes the game
    }
  }

  persistGuildSave(guild: GuildState): void {
    const saveFile: VersionedSaveFile = {
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      guild,
    };
    this.keyValueStore.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveFile));
  }

  clearGuildSave(): void {
    this.keyValueStore.removeItem(SAVE_STORAGE_KEY);
  }
}
