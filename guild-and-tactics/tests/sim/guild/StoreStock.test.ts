import { describe, expect, it } from 'vitest';
import { EQUIPMENT } from '../../../src/content/equipment';
import { ITEMS } from '../../../src/content/items';
import type { GuildState } from '../../../src/sim/guild/GuildState';
import {
  CONSUMABLE_RESTOCK_QUANTITY,
  EQUIPMENT_RESTOCK_QUANTITY,
  restockStore,
  storeStockOf,
  takeOneFromStoreStock,
} from '../../../src/sim/guild/StoreStock';

function createTestGuild(): GuildState {
  return {
    gold: 0,
    roster: [],
    consumableInventory: {},
    equipmentInventory: {},
    storeStock: {},
    questIdentifiersOnBoard: [],
    recruitsOnOffer: [],
    completedQuestCount: 0,
  };
}

describe('restockStore', () => {
  it('fills every consumable and equipment shelf to its quantity', () => {
    const guild = createTestGuild();
    restockStore(guild, ITEMS, EQUIPMENT);
    expect(storeStockOf(guild, 'potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
    expect(storeStockOf(guild, 'iron_sword')).toBe(EQUIPMENT_RESTOCK_QUANTITY);
  });

  it('refills shelves the player bought empty', () => {
    const guild = createTestGuild();
    restockStore(guild, ITEMS, EQUIPMENT);
    while (takeOneFromStoreStock(guild, 'potion')) {
      // buy the shelf empty
    }
    expect(storeStockOf(guild, 'potion')).toBe(0);
    restockStore(guild, ITEMS, EQUIPMENT);
    expect(storeStockOf(guild, 'potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
  });
});

describe('takeOneFromStoreStock', () => {
  it('decrements stock until the shelf is empty, then refuses', () => {
    const guild = createTestGuild();
    guild.storeStock['potion'] = 2;
    expect(takeOneFromStoreStock(guild, 'potion')).toBe(true);
    expect(takeOneFromStoreStock(guild, 'potion')).toBe(true);
    expect(takeOneFromStoreStock(guild, 'potion')).toBe(false);
    expect(storeStockOf(guild, 'potion')).toBe(0);
  });
});
