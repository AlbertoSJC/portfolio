import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import { ALL_EQUIPMENT_SLOTS, canClassEquip } from '../items/EquipmentDefinition';
import type { ClassIdentifier } from '../units/Unit';
import { isBaseClassIdentifier } from '../units/Unit';
import type { AdvancedClassDefinition, RaceDefinition } from '../units/UnitDefinitions';
import { findRosterMember, type GuildState } from './GuildState';
import { unequipMemberSlot } from './MemberEquipment';

export function changeMemberClass(
  guild: GuildState,
  memberIdentifier: string,
  newClassIdentifier: ClassIdentifier,
  raceTable: Record<string, RaceDefinition>,
  advancedClassTable: Record<string, AdvancedClassDefinition>,
  equipmentTable: Record<string, EquipmentDefinition>,
): boolean {
  const member = findRosterMember(guild, memberIdentifier);
  if (member === undefined || member.classIdentifier === newClassIdentifier) {
    return false;
  }
  const race = raceTable[member.raceIdentifier];
  const newClassString = newClassIdentifier as string;
  const isAllowedByRace =
    (race?.allowedBaseClasses as string[] | undefined)?.includes(newClassString) === true ||
    (race?.allowedAdvancedClasses as string[] | undefined)?.includes(newClassString) === true;
  if (!isAllowedByRace) {
    return false;
  }

  if (!isBaseClassIdentifier(newClassIdentifier)) {
    const advancedClass = advancedClassTable[newClassIdentifier];
    if (advancedClass === undefined) {
      return false;
    }
    const { prerequisite } = advancedClass;
    const primaryLevelReached = member.classLevelsReached[prerequisite.primaryBaseClass] ?? 0;
    if (primaryLevelReached < prerequisite.primaryBaseClassLevel) {
      return false;
    }
    if (prerequisite.secondaryBaseClass !== undefined) {
      const secondaryLevelReached =
        member.classLevelsReached[prerequisite.secondaryBaseClass] ?? 0;
      if (secondaryLevelReached < (prerequisite.secondaryBaseClassLevel ?? 0)) {
        return false;
      }
    }
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
