import { describe, expect, it } from 'vitest';
import {
  BrowserLocalStorageSaveGameStorage,
  type KeyValueStore,
} from '../../src/platform/SaveGameStorage';
import { SeededRandomNumberGenerator } from '../../src/sim/SeededRandomNumberGenerator';
import { createNewGuild } from '../../src/content/newGame';

function createInMemoryKeyValueStore(): KeyValueStore {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
    removeItem: (key) => {
      entries.delete(key);
    },
  };
}

describe('BrowserLocalStorageSaveGameStorage', () => {
  it('round-trips a guild save losslessly', () => {
    const storage = new BrowserLocalStorageSaveGameStorage(createInMemoryKeyValueStore());
    const guild = createNewGuild(new SeededRandomNumberGenerator(11));
    storage.persistGuildSave(guild);
    expect(storage.loadGuildSave()).toEqual(guild);
  });

  it('returns undefined when nothing was saved', () => {
    const storage = new BrowserLocalStorageSaveGameStorage(createInMemoryKeyValueStore());
    expect(storage.loadGuildSave()).toBeUndefined();
  });

  it('treats a corrupt save as no save instead of crashing', () => {
    const keyValueStore = createInMemoryKeyValueStore();
    keyValueStore.setItem('guild-and-tactics.save', '{not valid json');
    const storage = new BrowserLocalStorageSaveGameStorage(keyValueStore);
    expect(storage.loadGuildSave()).toBeUndefined();
  });

  it('migrates a version-1 save by adding the missing equipment fields', () => {
    const keyValueStore = createInMemoryKeyValueStore();
    const versionOneGuild = {
      gold: 150,
      roster: [
        {
          identifier: 'member_old',
          displayName: 'Old Save Member',
          raceIdentifier: 'human',
          baseClassIdentifier: 'warrior', // pre-v3 field name — migration renames it
          level: 3,
          experiencePoints: 40,
          // version 1 members had no equippedItemIdentifiers
        },
      ],
      consumableInventory: { potion: 1 },
      // version 1 had no equipmentInventory
      questIdentifiersOnBoard: [],
      recruitsOnOffer: [],
      completedQuestCount: 2,
    };
    keyValueStore.setItem(
      'guild-and-tactics.save',
      JSON.stringify({ saveFormatVersion: 1, guild: versionOneGuild }),
    );
    const storage = new BrowserLocalStorageSaveGameStorage(keyValueStore);
    const migratedGuild = storage.loadGuildSave();
    expect(migratedGuild).toBeDefined();
    expect(migratedGuild?.equipmentInventory).toEqual({});
    expect(migratedGuild?.roster[0]?.equippedItemIdentifiers).toEqual({});
    expect(migratedGuild?.roster[0]?.classIdentifier).toBe('warrior');
    expect(migratedGuild?.roster[0]?.masteredClasses).toEqual([]);
    expect(migratedGuild?.gold).toBe(150);
  });

  it('heals a v2 save that is missing the equipment fields (mid-dev hot-reload artifact)', () => {
    const keyValueStore = createInMemoryKeyValueStore();
    const brokenVersionTwoGuild = {
      gold: 270,
      roster: [
        {
          identifier: 'member_broken',
          displayName: 'Broken Save Member',
          raceIdentifier: 'werecat',
          baseClassIdentifier: 'thief', // pre-v3 field name — migration renames it
          level: 2,
          experiencePoints: 10,
          // v2 label but no equippedItemIdentifiers — written by an in-between build
        },
      ],
      consumableInventory: { potion: 3 },
      // no equipmentInventory either
      questIdentifiersOnBoard: [],
      recruitsOnOffer: [],
      completedQuestCount: 1,
    };
    keyValueStore.setItem(
      'guild-and-tactics.save',
      JSON.stringify({ saveFormatVersion: 2, guild: brokenVersionTwoGuild }),
    );
    const storage = new BrowserLocalStorageSaveGameStorage(keyValueStore);
    const healedGuild = storage.loadGuildSave();
    expect(healedGuild?.equipmentInventory).toEqual({});
    expect(healedGuild?.roster[0]?.equippedItemIdentifiers).toEqual({});
    expect(healedGuild?.roster[0]?.classIdentifier).toBe('thief');
    expect(healedGuild?.roster[0]?.masteredClasses).toEqual([]);
    expect(healedGuild?.gold).toBe(270);
  });

  it('refuses saves from an unknown format version', () => {
    const keyValueStore = createInMemoryKeyValueStore();
    keyValueStore.setItem(
      'guild-and-tactics.save',
      JSON.stringify({ saveFormatVersion: 999, guild: {} }),
    );
    const storage = new BrowserLocalStorageSaveGameStorage(keyValueStore);
    expect(storage.loadGuildSave()).toBeUndefined();
  });

  it('clears a save on request', () => {
    const storage = new BrowserLocalStorageSaveGameStorage(createInMemoryKeyValueStore());
    storage.persistGuildSave(createNewGuild(new SeededRandomNumberGenerator(11)));
    storage.clearGuildSave();
    expect(storage.loadGuildSave()).toBeUndefined();
  });
});
