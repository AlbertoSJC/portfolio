import type { GridPosition } from '../grid/GridPosition';
import type { Unit } from '../units/Unit';
import { createEnemyUnitsFromSpawns, createGuildUnitsFromDeployedMembers, type UnitContentTables } from './QuestBattleAssembly';
import type { GuildMember } from './GuildState';
import type { QuestEnemySpawn } from './QuestDefinition';

/**
 * Builds the battle roster for a random encounter: deployed guild members
 * on the map's deployment tiles, rolled enemy spawns facing back. Mirrors
 * `createUnitsForQuestBattle`, but the enemy side comes from
 * `generateEncounterEnemySpawns` instead of authored quest data.
 */
export function createUnitsForEncounterBattle(
  enemySpawns: readonly QuestEnemySpawn[],
  deployedMembers: readonly GuildMember[],
  deploymentTiles: readonly GridPosition[],
  contentTables: UnitContentTables,
): Unit[] {
  const guildUnits = createGuildUnitsFromDeployedMembers(
    deployedMembers,
    deploymentTiles,
    contentTables,
    'the encounter',
  );
  const enemyUnits = createEnemyUnitsFromSpawns(enemySpawns, contentTables.monsters, 'the encounter');
  return [...guildUnits, ...enemyUnits];
}
