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
const CURRENT_SAVE_FORMAT_VERSION = 3;

interface VersionedSaveFile {
  saveFormatVersion: number;
  guild: GuildState;
}

/**
 * Heals any accepted save to the current shape: fields added by newer
 * formats (the v2 equipment fields) are filled with empty defaults when
 * missing. Runs on every load, so a save written by an in-between dev
 * build can never crash the game.
 */
function normalizeLoadedGuild(guild: GuildState): GuildState {
  guild.equipmentInventory ??= {};
  guild.consumableInventory ??= {};
  // An empty stock map means "never stocked" — the GameController restocks it.
  guild.storeStock ??= {};
  for (const member of guild.roster) {
    member.equippedItemIdentifiers ??= {};
    const raw = member as unknown as Record<string, unknown>;
    // v2 → v3: field renamed from baseClassIdentifier to classIdentifier.
    if (raw['classIdentifier'] === undefined && raw['baseClassIdentifier'] !== undefined) {
      raw['classIdentifier'] = raw['baseClassIdentifier'];
      delete raw['baseClassIdentifier'];
    }
    member.masteredClasses ??= [];
  }
  return guild;
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
      const isKnownVersion =
        parsedSave.saveFormatVersion === 1 ||
        parsedSave.saveFormatVersion === 2 ||
        parsedSave.saveFormatVersion === CURRENT_SAVE_FORMAT_VERSION;
      if (!isKnownVersion) {
        // Newer/unknown format than this build understands: start fresh
        // rather than corrupt.
        return undefined;
      }
      return normalizeLoadedGuild(parsedSave.guild);
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
