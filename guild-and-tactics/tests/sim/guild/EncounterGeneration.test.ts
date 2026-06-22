import { describe, expect, it } from 'vitest';
import { generateEncounterEnemySpawns } from '../../../src/sim/guild/EncounterGeneration';
import type { ZoneRoamingGroupDefinition } from '../../../src/sim/guild/ZoneDefinition';
import { SeededRandomNumberGenerator } from '../../../src/sim/SeededRandomNumberGenerator';

const TEST_GROUP: ZoneRoamingGroupDefinition = {
  identifier: 'test_group',
  patrolRoute: ['test_location'],
  monsterIdentifiers: ['twisted_wolf', 'gnarlroot'],
  minimumEnemyCount: 1,
  maximumEnemyCount: 2,
};

const TEST_SPAWN_TILES = [
  { column: 2, row: 1 },
  { column: 5, row: 0 },
  { column: 9, row: 1 },
];

describe('generateEncounterEnemySpawns', () => {
  it('rolls a spawn count within the group range', () => {
    const randomNumberGenerator = new SeededRandomNumberGenerator(1);
    const spawns = generateEncounterEnemySpawns(TEST_GROUP, TEST_SPAWN_TILES, randomNumberGenerator);
    expect(spawns.length).toBeGreaterThanOrEqual(TEST_GROUP.minimumEnemyCount);
    expect(spawns.length).toBeLessThanOrEqual(TEST_GROUP.maximumEnemyCount);
  });

  it('only spawns monsters from the group table, on unique tiles from the spawn pool', () => {
    const randomNumberGenerator = new SeededRandomNumberGenerator(42);
    const spawns = generateEncounterEnemySpawns(TEST_GROUP, TEST_SPAWN_TILES, randomNumberGenerator);
    for (const spawn of spawns) {
      expect(TEST_GROUP.monsterIdentifiers).toContain(spawn.monsterIdentifier);
      expect(TEST_SPAWN_TILES).toContainEqual(spawn.position);
    }
    const positionKeys = spawns.map((spawn) => `${spawn.position.column},${spawn.position.row}`);
    expect(new Set(positionKeys).size).toBe(positionKeys.length);
  });

  it('is deterministic for a given seed', () => {
    const first = generateEncounterEnemySpawns(TEST_GROUP, TEST_SPAWN_TILES, new SeededRandomNumberGenerator(7));
    const second = generateEncounterEnemySpawns(TEST_GROUP, TEST_SPAWN_TILES, new SeededRandomNumberGenerator(7));
    expect(second).toEqual(first);
  });

  it('never spawns more than the available tile pool', () => {
    const twoEnemyGroup: ZoneRoamingGroupDefinition = {
      ...TEST_GROUP,
      minimumEnemyCount: 2,
      maximumEnemyCount: 2,
    };
    const randomNumberGenerator = new SeededRandomNumberGenerator(3);
    const spawns = generateEncounterEnemySpawns(twoEnemyGroup, [{ column: 2, row: 1 }], randomNumberGenerator);
    expect(spawns.length).toBe(1);
  });
});
