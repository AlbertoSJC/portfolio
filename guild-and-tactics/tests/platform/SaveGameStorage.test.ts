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
