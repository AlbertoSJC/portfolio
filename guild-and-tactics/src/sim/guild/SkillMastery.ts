import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import type { GuildMember } from './GuildState';
import { equippedDefinitionsForMember } from './MemberEquipment';

/**
 * Equipment-skill mastery (PRD §7, FFTA-style): a piece of gear with a
 * `grantedSkillIdentifier` lets its wearer use that skill in battle. Each
 * use earns one point of mastery progress; at SKILL_USES_TO_MASTER the
 * skill is mastered — known permanently, with or without the item.
 */
export const SKILL_USES_TO_MASTER = 3;

export function isSkillMastered(member: GuildMember, skillIdentifier: string): boolean {
  return (member.skillMasteryProgress[skillIdentifier] ?? 0) >= SKILL_USES_TO_MASTER;
}

export function masteredSkillIdentifiersForMember(member: GuildMember): string[] {
  return Object.keys(member.skillMasteryProgress).filter((skillIdentifier) =>
    isSkillMastered(member, skillIdentifier),
  );
}

/** Skills granted by the member's currently worn gear (mastered or not). */
export function equipmentGrantedSkillIdentifiersForMember(
  member: GuildMember,
  equipmentTable: Record<string, EquipmentDefinition>,
): string[] {
  return equippedDefinitionsForMember(member.equippedItemIdentifiers, equipmentTable)
    .map((equipment) => equipment.grantedSkillIdentifier)
    .filter((skillIdentifier) => skillIdentifier !== undefined);
}

/**
 * Credits a battle's skill uses toward mastery. Only skills granted by the
 * member's currently worn gear and not yet mastered earn progress — the
 * same condition under which the skill was usable at all. Returns the
 * identifiers of skills that crossed the mastery threshold this battle.
 */
export function recordEquipmentSkillUses(
  member: GuildMember,
  skillUseCounts: Record<string, number>,
  equipmentTable: Record<string, EquipmentDefinition>,
): string[] {
  const newlyMasteredSkillIdentifiers: string[] = [];
  for (const skillIdentifier of equipmentGrantedSkillIdentifiersForMember(member, equipmentTable)) {
    const usesThisBattle = skillUseCounts[skillIdentifier] ?? 0;
    if (usesThisBattle === 0 || isSkillMastered(member, skillIdentifier)) {
      continue;
    }
    member.skillMasteryProgress[skillIdentifier] =
      (member.skillMasteryProgress[skillIdentifier] ?? 0) + usesThisBattle;
    if (isSkillMastered(member, skillIdentifier)) {
      newlyMasteredSkillIdentifiers.push(skillIdentifier);
    }
  }
  return newlyMasteredSkillIdentifiers;
}
