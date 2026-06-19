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
const CURRENT_SAVE_FORMAT_VERSION = 5;

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
function normalizeMember(member: GuildState['roster'][number]): void {
  member.equippedItemIdentifiers ??= {};
  const raw = member as unknown as Record<string, unknown>;
  // v2 → v3: field renamed from baseClassIdentifier to classIdentifier.
  if (raw['classIdentifier'] === undefined && raw['baseClassIdentifier'] !== undefined) {
    raw['classIdentifier'] = raw['baseClassIdentifier'];
    delete raw['baseClassIdentifier'];
  }
  // v3 → v4: masteredClasses (BaseClassIdentifier[]) replaced by classLevelsReached.
  if (raw['masteredClasses'] !== undefined && raw['classLevelsReached'] === undefined) {
    const levelsReached: Record<string, number> = {};
    for (const classId of raw['masteredClasses'] as string[]) {
      levelsReached[classId] = 5;
    }
    raw['classLevelsReached'] = levelsReached;
    delete raw['masteredClasses'];
  }
  member.classLevelsReached ??= {};
}

function normalizeLoadedGuild(guild: GuildState, saveFormatVersion: number): GuildState {
  guild.equipmentInventory ??= {};
  guild.consumableInventory ??= {};
  guild.recruitsOnOffer ??= [];
  // v4 → v5: store stock and the quest board both became zone-scoped (a
  // flat array/map can't say which zone an entry belonged to), so pre-v5
  // saves reset both to empty — GameController's boot-time "empty ⇒
  // restock/refill" check heals every zone from there, the same way a
  // brand-new save does.
  if (saveFormatVersion < 5) {
    guild.storeStock = {};
    guild.questIdentifiersOnBoard = {};
  }
  guild.storeStock ??= {};
  guild.questIdentifiersOnBoard ??= {};
  for (const member of guild.roster) {
    normalizeMember(member);
  }
  for (const offer of guild.recruitsOnOffer) {
    normalizeMember(offer.member);
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
        parsedSave.saveFormatVersion === 3 ||
        parsedSave.saveFormatVersion === 4 ||
        parsedSave.saveFormatVersion === CURRENT_SAVE_FORMAT_VERSION;
      if (!isKnownVersion) {
        // Newer/unknown format than this build understands: start fresh
        // rather than corrupt.
        return undefined;
      }
      return normalizeLoadedGuild(parsedSave.guild, parsedSave.saveFormatVersion);
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
