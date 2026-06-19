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
import type { QuestDefinition, QuestEnemySpawn } from './QuestDefinition';

export interface UnitContentTables {
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  advancedClasses: Record<string, AdvancedClassDefinition>;
  monsters: Record<string, MonsterDefinition>;
  equipment: Record<string, EquipmentDefinition>;
}

/**
 * Builds the guild side of a battle roster: deployed members on the map's
 * deployment tiles, facing the enemy. Shared by quest and encounter battle
 * assembly — `battleLabel` is only used for error messages.
 */
export function createGuildUnitsFromDeployedMembers(
  deployedMembers: readonly GuildMember[],
  deploymentTiles: readonly GridPosition[],
  contentTables: UnitContentTables,
  battleLabel: string,
): Unit[] {
  if (deployedMembers.length === 0) {
    throw new Error(`Cannot start "${battleLabel}" with nobody deployed`);
  }
  if (deployedMembers.length > deploymentTiles.length) {
    throw new Error(
      `"${battleLabel}" has ${deploymentTiles.length} deployment tiles but ${deployedMembers.length} members were deployed`,
    );
  }

  return deployedMembers.map((member, memberIndex) => {
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
}

/**
 * Builds the enemy side of a battle roster from a list of spawns. Shared by
 * quest and encounter battle assembly — `battleLabel` is only used for
 * error messages.
 */
export function createEnemyUnitsFromSpawns(
  enemySpawns: readonly QuestEnemySpawn[],
  monsters: Record<string, MonsterDefinition>,
  battleLabel: string,
): Unit[] {
  return enemySpawns.map((enemySpawn, spawnIndex) => {
    const monster = monsters[enemySpawn.monsterIdentifier];
    if (monster === undefined) {
      throw new Error(
        `"${battleLabel}" spawns unknown monster "${enemySpawn.monsterIdentifier}"`,
      );
    }
    return createUnitFromMonster(
      monster,
      `enemy_${spawnIndex}_${monster.identifier}`,
      enemySpawn.position,
      'south',
    );
  });
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
  const guildUnits = createGuildUnitsFromDeployedMembers(
    deployedMembers,
    deploymentTiles,
    contentTables,
    quest.displayName,
  );
  const enemyUnits = createEnemyUnitsFromSpawns(quest.enemySpawns, contentTables.monsters, quest.displayName);
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
