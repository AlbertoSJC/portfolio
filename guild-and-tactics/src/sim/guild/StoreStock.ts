import type { ConsumableItemDefinition } from '../items/ConsumableItemDefinition';
import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import type { GuildState } from './GuildState';
import { meetsReputationRequirement, type ReputationTier } from './ReputationTier';

/** How many of each item a fresh shipment puts on the shelves. */
export const CONSUMABLE_RESTOCK_QUANTITY = 5;
export const EQUIPMENT_RESTOCK_QUANTITY = 2;

/**
 * Each zone keeps its own shelves — buying out one zone's potions never
 * touches another's. Stock lives in the same flat `guild.storeStock` map,
 * keyed by zone so the save shape doesn't need a nested record.
 */
function zoneStockKey(zoneIdentifier: string, merchandiseIdentifier: string): string {
  return `${zoneIdentifier}:${merchandiseIdentifier}`;
}

/**
 * Fills one zone's shelves back to full — on a new game and after every
 * completed quest in that zone. Items with a minimumReputationTier above
 * the guild's current tier are excluded until the guild ranks up.
 */
export function restockStore(
  guild: GuildState,
  zoneIdentifier: string,
  itemTable: Record<string, ConsumableItemDefinition>,
  equipmentTable: Record<string, EquipmentDefinition>,
  currentTier: ReputationTier,
): void {
  for (const item of Object.values(itemTable)) {
    if (item.minimumReputationTier === undefined || meetsReputationRequirement(currentTier, item.minimumReputationTier)) {
      guild.storeStock[zoneStockKey(zoneIdentifier, item.identifier)] = CONSUMABLE_RESTOCK_QUANTITY;
    }
  }
  for (const equipment of Object.values(equipmentTable)) {
    if (equipment.minimumReputationTier === undefined || meetsReputationRequirement(currentTier, equipment.minimumReputationTier)) {
      guild.storeStock[zoneStockKey(zoneIdentifier, equipment.identifier)] = EQUIPMENT_RESTOCK_QUANTITY;
    }
  }
}

export function storeStockOf(guild: GuildState, zoneIdentifier: string, merchandiseIdentifier: string): number {
  return guild.storeStock[zoneStockKey(zoneIdentifier, merchandiseIdentifier)] ?? 0;
}

/** Returns false (and changes nothing) when the shelf is empty. */
export function takeOneFromStoreStock(guild: GuildState, zoneIdentifier: string, merchandiseIdentifier: string): boolean {
  const stock = storeStockOf(guild, zoneIdentifier, merchandiseIdentifier);
  if (stock < 1) {
    return false;
  }
  guild.storeStock[zoneStockKey(zoneIdentifier, merchandiseIdentifier)] = stock - 1;
  return true;
}

/** True once a zone has ever been stocked — distinguishes "never visited" from "sold out". */
export function hasZoneBeenStocked(guild: GuildState, zoneIdentifier: string): boolean {
  const prefix = `${zoneIdentifier}:`;
  return Object.keys(guild.storeStock).some((key) => key.startsWith(prefix));
}
