import type { ConsumableItemDefinition } from '../items/ConsumableItemDefinition';
import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import type { GuildState } from './GuildState';
import { meetsReputationRequirement, type ReputationTier } from './ReputationTier';

/** How many of each item a fresh shipment puts on the shelves. */
export const CONSUMABLE_RESTOCK_QUANTITY = 5;
export const EQUIPMENT_RESTOCK_QUANTITY = 2;

/**
 * Fills the store shelves back to full — on a new game and after every
 * completed quest. Items with a minimumReputationTier above the guild's
 * current tier are excluded until the guild ranks up.
 */
export function restockStore(
  guild: GuildState,
  itemTable: Record<string, ConsumableItemDefinition>,
  equipmentTable: Record<string, EquipmentDefinition>,
  currentTier: ReputationTier,
): void {
  for (const item of Object.values(itemTable)) {
    if (item.minimumReputationTier === undefined || meetsReputationRequirement(currentTier, item.minimumReputationTier)) {
      guild.storeStock[item.identifier] = CONSUMABLE_RESTOCK_QUANTITY;
    }
  }
  for (const equipment of Object.values(equipmentTable)) {
    if (equipment.minimumReputationTier === undefined || meetsReputationRequirement(currentTier, equipment.minimumReputationTier)) {
      guild.storeStock[equipment.identifier] = EQUIPMENT_RESTOCK_QUANTITY;
    }
  }
}

export function storeStockOf(guild: GuildState, itemIdentifier: string): number {
  return guild.storeStock[itemIdentifier] ?? 0;
}

/** Returns false (and changes nothing) when the shelf is empty. */
export function takeOneFromStoreStock(guild: GuildState, itemIdentifier: string): boolean {
  const stock = storeStockOf(guild, itemIdentifier);
  if (stock < 1) {
    return false;
  }
  guild.storeStock[itemIdentifier] = stock - 1;
  return true;
}
