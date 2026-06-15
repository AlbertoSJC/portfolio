import type { GridPosition } from '../grid/GridPosition';
import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import type { Unit } from '../units/Unit';
import type {
  AdvancedClassDefinition,
  BaseClassDefinition,
  MonsterDefinition,
  RaceDefinition,
} from '../units/UnitDefinitions';
import { createUnitFromCharacter, createUnitFromMonster } from '../units/UnitFactory';
import type { GuildMember } from './GuildState';
import { equippedDefinitionsForMember } from './MemberEquipment';
import type { QuestDefinition } from './QuestDefinition';

export interface UnitContentTables {
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  advancedClasses: Record<string, AdvancedClassDefinition>;
  monsters: Record<string, MonsterDefinition>;
  equipment: Record<string, EquipmentDefinition>;
}

/**
 * Builds the battle roster for a quest: deployed guild members on the
 * map's deployment tiles facing the enemy, quest spawns facing back.
 */
export function createUnitsForQuestBattle(
  quest: QuestDefinition,
  deployedMembers: readonly GuildMember[],
  deploymentTiles: readonly GridPosition[],
  contentTables: UnitContentTables,
): Unit[] {
  if (deployedMembers.length === 0) {
    throw new Error(`Cannot start "${quest.displayName}" with nobody deployed`);
  }
  if (deployedMembers.length > deploymentTiles.length) {
    throw new Error(
      `"${quest.displayName}" has ${deploymentTiles.length} deployment tiles but ${deployedMembers.length} members were deployed`,
    );
  }

  const guildUnits = deployedMembers.map((member, memberIndex) => {
    const race = contentTables.races[member.raceIdentifier];
    const classDefinition =
      contentTables.baseClasses[member.classIdentifier] ??
      contentTables.advancedClasses[member.classIdentifier];
    const deploymentTile = deploymentTiles[memberIndex];
    if (race === undefined || classDefinition === undefined || deploymentTile === undefined) {
      throw new Error(`Broken content for guild member "${member.displayName}"`);
    }
    const secondarySkillIdentifiers = computeSecondarySkillIdentifiers(member, contentTables);
    return createUnitFromCharacter({
      identifier: member.identifier,
      displayName: member.displayName,
      team: 'guild',
      race,
      baseClass: classDefinition,
      level: member.level,
      position: deploymentTile,
      facing: 'north',
      equipment: equippedDefinitionsForMember(member.equippedItemIdentifiers, contentTables.equipment),
      secondarySkillIdentifiers,
    });
  });

  const enemyUnits = quest.enemySpawns.map((enemySpawn, spawnIndex) => {
    const monster = contentTables.monsters[enemySpawn.monsterIdentifier];
    if (monster === undefined) {
      throw new Error(
        `Quest "${quest.displayName}" spawns unknown monster "${enemySpawn.monsterIdentifier}"`,
      );
    }
    return createUnitFromMonster(
      monster,
      `enemy_${spawnIndex}_${monster.identifier}`,
      enemySpawn.position,
      'south',
    );
  });

  return [...guildUnits, ...enemyUnits];
}

function computeSecondarySkillIdentifiers(
  member: GuildMember,
  contentTables: UnitContentTables,
): string[] {
  const secondaryClassId = member.secondarySkillClassIdentifier;
  if (secondaryClassId === undefined) return [];
  const secondaryClass = contentTables.baseClasses[secondaryClassId];
  if (secondaryClass === undefined) return [];
  const levelReached = member.classLevelsReached[secondaryClassId] ?? 0;
  return secondaryClass.skills
    .filter((entry) => entry.learnedAtLevel <= levelReached)
    .map((entry) => entry.skillIdentifier);
}
