import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import { ALL_EQUIPMENT_SLOTS, canClassEquip } from '../items/EquipmentDefinition';
import type { ClassIdentifier } from '../units/Unit';
import type { RaceDefinition } from '../units/UnitDefinitions';
import { findRosterMember, type GuildState } from './GuildState';
import { unequipMemberSlot } from './MemberEquipment';

export function changeMemberBaseClass(
  guild: GuildState,
  memberIdentifier: string,
  newClassIdentifier: ClassIdentifier,
  raceTable: Record<string, RaceDefinition>,
  equipmentTable: Record<string, EquipmentDefinition>,
): boolean {
  const member = findRosterMember(guild, memberIdentifier);
  if (member === undefined || member.classIdentifier === newClassIdentifier) {
    return false;
  }
  const race = raceTable[member.raceIdentifier];
  const newClassString = newClassIdentifier as string;
  const isAllowed =
    (race?.allowedBaseClasses as string[] | undefined)?.includes(newClassString) === true ||
    (race?.allowedAdvancedClasses as string[] | undefined)?.includes(newClassString) === true;
  if (!isAllowed) {
    return false;
  }
  member.classIdentifier = newClassIdentifier;
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
