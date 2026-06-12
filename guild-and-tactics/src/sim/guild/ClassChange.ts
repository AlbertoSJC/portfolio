import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import { ALL_EQUIPMENT_SLOTS, canClassEquip } from '../items/EquipmentDefinition';
import type { BaseClassIdentifier } from '../units/Unit';
import type { RaceDefinition } from '../units/UnitDefinitions';
import { findRosterMember, type GuildState } from './GuildState';
import { unequipMemberSlot } from './MemberEquipment';

/**
 * Switches a member to another base class their race allows (PRD §4:
 * class changes happen in the village). Equipment the new class cannot
 * use returns to the guild stores automatically.
 */
export function changeMemberBaseClass(
  guild: GuildState,
  memberIdentifier: string,
  newClassIdentifier: BaseClassIdentifier,
  raceTable: Record<string, RaceDefinition>,
  equipmentTable: Record<string, EquipmentDefinition>,
): boolean {
  const member = findRosterMember(guild, memberIdentifier);
  if (member === undefined || member.baseClassIdentifier === newClassIdentifier) {
    return false;
  }
  const race = raceTable[member.raceIdentifier];
  if (race === undefined || !race.allowedBaseClasses.includes(newClassIdentifier)) {
    return false;
  }
  member.baseClassIdentifier = newClassIdentifier;
  for (const slot of ALL_EQUIPMENT_SLOTS) {
    const equippedIdentifier = member.equippedItemIdentifiers[slot];
    const equippedDefinition =
      equippedIdentifier === undefined ? undefined : equipmentTable[equippedIdentifier];
    if (equippedDefinition !== undefined && !canClassEquip(equippedDefinition, newClassIdentifier)) {
      unequipMemberSlot(guild, memberIdentifier, slot);
    }
  }
  return true;
}
