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
      questIdentifiersOnBoard: [], // pre-v5 flat array — migration resets it
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
    expect(migratedGuild?.roster[0]?.classLevelsReached).toEqual({});
    expect(migratedGuild?.gold).toBe(150);
    expect(migratedGuild?.questIdentifiersOnBoard).toEqual({});
    expect(migratedGuild?.storeStock).toEqual({});
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
    expect(healedGuild?.roster[0]?.classLevelsReached).toEqual({});
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

  it('migrates a version-3 save by converting masteredClasses to classLevelsReached', () => {
    const keyValueStore = createInMemoryKeyValueStore();
    const versionThreeGuild = {
      gold: 400,
      roster: [
        {
          identifier: 'member_v3',
          displayName: 'V3 Member',
          raceIdentifier: 'human',
          classIdentifier: 'warrior',
          masteredClasses: ['warrior', 'thief'],
          level: 6,
          experiencePoints: 0,
          equippedItemIdentifiers: {},
        },
      ],
      consumableInventory: {},
      equipmentInventory: {},
      storeStock: {},
      questIdentifiersOnBoard: [],
      recruitsOnOffer: [],
      completedQuestCount: 3,
    };
    keyValueStore.setItem(
      'guild-and-tactics.save',
      JSON.stringify({ saveFormatVersion: 3, guild: versionThreeGuild }),
    );
    const storage = new BrowserLocalStorageSaveGameStorage(keyValueStore);
    const migratedGuild = storage.loadGuildSave();
    expect(migratedGuild).toBeDefined();
    // masteredClasses is gone; each entry becomes classLevelsReached[id] = 5.
    expect((migratedGuild?.roster[0] as unknown as Record<string, unknown>)?.['masteredClasses']).toBeUndefined();
    expect(migratedGuild?.roster[0]?.classLevelsReached).toEqual({ warrior: 5, thief: 5 });
  });

  it('migrates a version-4 save by resetting the flat quest board and store stock', () => {
    const keyValueStore = createInMemoryKeyValueStore();
    const versionFourGuild = {
      gold: 500,
      roster: [],
      consumableInventory: {},
      equipmentInventory: {},
      storeStock: { potion: 5, iron_sword: 2 }, // pre-v5: not zone-scoped
      questIdentifiersOnBoard: ['wolves_on_the_north_road'], // pre-v5: flat array
      recruitsOnOffer: [],
      completedQuestCount: 4,
    };
    keyValueStore.setItem(
      'guild-and-tactics.save',
      JSON.stringify({ saveFormatVersion: 4, guild: versionFourGuild }),
    );
    const storage = new BrowserLocalStorageSaveGameStorage(keyValueStore);
    const migratedGuild = storage.loadGuildSave();
    expect(migratedGuild).toBeDefined();
    expect(migratedGuild?.storeStock).toEqual({});
    expect(migratedGuild?.questIdentifiersOnBoard).toEqual({});
    expect(migratedGuild?.gold).toBe(500);
    expect(migratedGuild?.completedQuestCount).toBe(4);
  });

  it('clears a save on request', () => {
    const storage = new BrowserLocalStorageSaveGameStorage(createInMemoryKeyValueStore());
    storage.persistGuildSave(createNewGuild(new SeededRandomNumberGenerator(11)));
    storage.clearGuildSave();
    expect(storage.loadGuildSave()).toBeUndefined();
  });
});
