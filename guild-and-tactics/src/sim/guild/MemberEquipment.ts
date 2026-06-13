import type { EquipmentDefinition, EquipmentSlot } from '../items/EquipmentDefinition';
import { canClassEquip } from '../items/EquipmentDefinition';
import {
  addEquipmentPiece,
  findRosterMember,
  removeEquipmentPiece,
  type GuildState,
} from './GuildState';

/**
 * Equips a piece from the guild stores onto a member's matching slot.
 * Whatever was in that slot returns to the stores. Returns false (and
 * changes nothing) when the piece is missing, or the class may not use it.
 */
export function equipItemOnMember(
  guild: GuildState,
  memberIdentifier: string,
  equipment: EquipmentDefinition,
): boolean {
  const member = findRosterMember(guild, memberIdentifier);
  if (member === undefined) {
    return false;
  }
  if (!canClassEquip(equipment, member.classIdentifier)) {
    return false;
  }
  if (!removeEquipmentPiece(guild, equipment.identifier)) {
    return false;
  }
  const previouslyEquippedIdentifier = member.equippedItemIdentifiers[equipment.slot];
  if (previouslyEquippedIdentifier !== undefined) {
    guild.equipmentInventory[previouslyEquippedIdentifier] =
      (guild.equipmentInventory[previouslyEquippedIdentifier] ?? 0) + 1;
  }
  member.equippedItemIdentifiers[equipment.slot] = equipment.identifier;
  return true;
}

/** Empties a member's slot back into the guild stores. */
export function unequipMemberSlot(
  guild: GuildState,
  memberIdentifier: string,
  slot: EquipmentSlot,
): boolean {
  const member = findRosterMember(guild, memberIdentifier);
  const equippedIdentifier = member?.equippedItemIdentifiers[slot];
  if (member === undefined || equippedIdentifier === undefined) {
    return false;
  }
  delete member.equippedItemIdentifiers[slot];
  addEquipmentPiece(guild, equippedIdentifier);
  return true;
}

/** Resolves a member's equipped identifiers into definitions, skipping unknowns. */
export function equippedDefinitionsForMember(
  equippedItemIdentifiers: Partial<Record<EquipmentSlot, string>>,
  equipmentTable: Record<string, EquipmentDefinition>,
): EquipmentDefinition[] {
  return Object.values(equippedItemIdentifiers)
    .map((equipmentIdentifier) => equipmentTable[equipmentIdentifier])
    .filter((definition) => definition !== undefined);
}
