import type { GridPosition } from '../grid/GridPosition';
import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { QuestEnemySpawn } from './QuestDefinition';
import type { ZoneRoamingGroupDefinition } from './ZoneDefinition';

/**
 * Rolls a fresh enemy party for a roaming group caught on the exploration
 * grid: a random count in the group's range, each on a unique tile from
 * the zone's battle-map spawn pool with a random monster from the group's
 * table.
 */
export function generateEncounterEnemySpawns(
  roamingGroup: ZoneRoamingGroupDefinition,
  encounterSpawnTiles: readonly GridPosition[],
  randomNumberGenerator: SeededRandomNumberGenerator,
): QuestEnemySpawn[] {
  const enemyCount = randomNumberGenerator.nextIntegerBetween(
    roamingGroup.minimumEnemyCount,
    roamingGroup.maximumEnemyCount,
  );
  const availableTiles = [...encounterSpawnTiles];
  const spawns: QuestEnemySpawn[] = [];
  for (let spawnIndex = 0; spawnIndex < enemyCount && availableTiles.length > 0; spawnIndex += 1) {
    const tileIndex = randomNumberGenerator.nextIntegerBetween(0, availableTiles.length - 1);
    const [position] = availableTiles.splice(tileIndex, 1);
    const monsterIdentifier =
      roamingGroup.monsterIdentifiers[
        randomNumberGenerator.nextIntegerBetween(0, roamingGroup.monsterIdentifiers.length - 1)
      ];
    if (position === undefined || monsterIdentifier === undefined) {
      continue;
    }
    spawns.push({ monsterIdentifier, position });
  }
  return spawns;
}
