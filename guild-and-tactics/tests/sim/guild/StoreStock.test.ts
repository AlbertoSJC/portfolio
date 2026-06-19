import { describe, expect, it } from 'vitest';
import { EQUIPMENT } from '../../../src/content/equipment';
import { ITEMS } from '../../../src/content/items';
import type { GuildState } from '../../../src/sim/guild/GuildState';
import {
  CONSUMABLE_RESTOCK_QUANTITY,
  EQUIPMENT_RESTOCK_QUANTITY,
  hasZoneBeenStocked,
  restockStore,
  storeStockOf,
  takeOneFromStoreStock,
} from '../../../src/sim/guild/StoreStock';

const ZONE_A = 'north_road';
const ZONE_B = 'marsh_trail';

function createTestGuild(): GuildState {
  return {
    gold: 0,
    roster: [],
    consumableInventory: {},
    equipmentInventory: {},
    storeStock: {},
    questIdentifiersOnBoard: {},
    recruitsOnOffer: [],
    completedQuestCount: 0,
  };
}

describe('restockStore', () => {
  it('fills bronze-tier items at bronze reputation', () => {
    const guild = createTestGuild();
    restockStore(guild, ZONE_A, ITEMS, EQUIPMENT, 'bronze');
    expect(storeStockOf(guild, ZONE_A, 'potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
    expect(storeStockOf(guild, ZONE_A, 'iron_sword')).toBe(EQUIPMENT_RESTOCK_QUANTITY);
  });

  it('excludes silver-gated items at bronze reputation', () => {
    const guild = createTestGuild();
    restockStore(guild, ZONE_A, ITEMS, EQUIPMENT, 'bronze');
    expect(storeStockOf(guild, ZONE_A, 'strong_potion')).toBe(0);
    expect(storeStockOf(guild, ZONE_A, 'steel_greatblade')).toBe(0);
    expect(storeStockOf(guild, ZONE_A, 'iron_mail')).toBe(0);
  });

  it('includes silver-gated items at silver reputation', () => {
    const guild = createTestGuild();
    restockStore(guild, ZONE_A, ITEMS, EQUIPMENT, 'silver');
    expect(storeStockOf(guild, ZONE_A, 'strong_potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
    expect(storeStockOf(guild, ZONE_A, 'steel_greatblade')).toBe(EQUIPMENT_RESTOCK_QUANTITY);
    expect(storeStockOf(guild, ZONE_A, 'iron_mail')).toBe(EQUIPMENT_RESTOCK_QUANTITY);
  });

  it('refills shelves the player bought empty', () => {
    const guild = createTestGuild();
    restockStore(guild, ZONE_A, ITEMS, EQUIPMENT, 'bronze');
    while (takeOneFromStoreStock(guild, ZONE_A, 'potion')) {
      // buy the shelf empty
    }
    expect(storeStockOf(guild, ZONE_A, 'potion')).toBe(0);
    restockStore(guild, ZONE_A, ITEMS, EQUIPMENT, 'bronze');
    expect(storeStockOf(guild, ZONE_A, 'potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
  });

  it('keeps each zone independent', () => {
    const guild = createTestGuild();
    restockStore(guild, ZONE_A, ITEMS, EQUIPMENT, 'bronze');
    restockStore(guild, ZONE_B, ITEMS, EQUIPMENT, 'bronze');
    while (takeOneFromStoreStock(guild, ZONE_A, 'potion')) {
      // buy zone A's potions out
    }
    expect(storeStockOf(guild, ZONE_A, 'potion')).toBe(0);
    expect(storeStockOf(guild, ZONE_B, 'potion')).toBe(CONSUMABLE_RESTOCK_QUANTITY);
  });
});

describe('takeOneFromStoreStock', () => {
  it('decrements stock until the shelf is empty, then refuses', () => {
    const guild = createTestGuild();
    guild.storeStock[`${ZONE_A}:potion`] = 2;
    expect(takeOneFromStoreStock(guild, ZONE_A, 'potion')).toBe(true);
    expect(takeOneFromStoreStock(guild, ZONE_A, 'potion')).toBe(true);
    expect(takeOneFromStoreStock(guild, ZONE_A, 'potion')).toBe(false);
    expect(storeStockOf(guild, ZONE_A, 'potion')).toBe(0);
  });
});

describe('hasZoneBeenStocked', () => {
  it('is false before the first restock and true after', () => {
    const guild = createTestGuild();
    expect(hasZoneBeenStocked(guild, ZONE_A)).toBe(false);
    restockStore(guild, ZONE_A, ITEMS, EQUIPMENT, 'bronze');
    expect(hasZoneBeenStocked(guild, ZONE_A)).toBe(true);
    expect(hasZoneBeenStocked(guild, ZONE_B)).toBe(false);
  });
});
