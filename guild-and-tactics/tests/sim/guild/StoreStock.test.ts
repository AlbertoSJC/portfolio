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
  it('fills bronze-tier items at bronze reputation', () => {
    const guild = createTestGuild();
    restockStore(guild, ITEMS, EQUIPMENT, 'bronze');
    expect(storeStockOf(guild, 'potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
    expect(storeStockOf(guild, 'iron_sword')).toBe(EQUIPMENT_RESTOCK_QUANTITY);
  });

  it('excludes silver-gated items at bronze reputation', () => {
    const guild = createTestGuild();
    restockStore(guild, ITEMS, EQUIPMENT, 'bronze');
    expect(storeStockOf(guild, 'strong_potion')).toBe(0);
    expect(storeStockOf(guild, 'steel_greatblade')).toBe(0);
    expect(storeStockOf(guild, 'iron_mail')).toBe(0);
  });

  it('includes silver-gated items at silver reputation', () => {
    const guild = createTestGuild();
    restockStore(guild, ITEMS, EQUIPMENT, 'silver');
    expect(storeStockOf(guild, 'strong_potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
    expect(storeStockOf(guild, 'steel_greatblade')).toBe(EQUIPMENT_RESTOCK_QUANTITY);
    expect(storeStockOf(guild, 'iron_mail')).toBe(EQUIPMENT_RESTOCK_QUANTITY);
  });

  it('refills shelves the player bought empty', () => {
    const guild = createTestGuild();
    restockStore(guild, ITEMS, EQUIPMENT, 'bronze');
    while (takeOneFromStoreStock(guild, 'potion')) {
      // buy the shelf empty
    }
    expect(storeStockOf(guild, 'potion')).toBe(0);
    restockStore(guild, ITEMS, EQUIPMENT, 'bronze');
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
