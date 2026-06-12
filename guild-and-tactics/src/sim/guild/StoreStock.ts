import type { ConsumableItemDefinition } from '../items/ConsumableItemDefinition';
import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import type { GuildState } from './GuildState';

/** How many of each item a fresh shipment puts on the shelves. */
export const CONSUMABLE_RESTOCK_QUANTITY = 5;
export const EQUIPMENT_RESTOCK_QUANTITY = 2;

/**
 * Fills the store shelves back to full — on a new game and after every
 * completed quest (caravans reach Wanderer's Rest when the roads are
 * cleared).
 */
export function restockStore(
  guild: GuildState,
  itemTable: Record<string, ConsumableItemDefinition>,
  equipmentTable: Record<string, EquipmentDefinition>,
): void {
  for (const itemIdentifier of Object.keys(itemTable)) {
    guild.storeStock[itemIdentifier] = CONSUMABLE_RESTOCK_QUANTITY;
  }
  for (const equipmentIdentifier of Object.keys(equipmentTable)) {
    guild.storeStock[equipmentIdentifier] = EQUIPMENT_RESTOCK_QUANTITY;
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
