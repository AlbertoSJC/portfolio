import type { ClassIdentifier, UnitStatistics } from '../units/Unit';
import { ITEM_SELL_PRICE_FRACTION } from './ConsumableItemDefinition';

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export const ALL_EQUIPMENT_SLOTS: readonly EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

export const EQUIPMENT_SLOT_DISPLAY_NAMES: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  accessory: 'Accessory',
};

export interface EquipmentDefinition {
  identifier: string;
  displayName: string;
  description: string;
  slot: EquipmentSlot;
  priceInGold: number;
  /** Flat additions to the wearer's derived statistics. */
  statisticBonuses: Partial<UnitStatistics>;
  /** When set, only these classes may equip it (weapons mostly; advanced classes added in M3). */
  allowedClasses?: ClassIdentifier[];
}

export function sellPriceForEquipment(equipment: EquipmentDefinition): number {
  return Math.floor(equipment.priceInGold * ITEM_SELL_PRICE_FRACTION);
}

export function canClassEquip(
  equipment: EquipmentDefinition,
  classIdentifier: ClassIdentifier,
): boolean {
  return (
    equipment.allowedClasses === undefined ||
    (equipment.allowedClasses as string[]).includes(classIdentifier)
  );
}
