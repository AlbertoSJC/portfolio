import { describe, expect, it } from 'vitest';
import { createUnitsForEncounterBattle } from '../../../src/sim/guild/EncounterBattleAssembly';
import { ADVANCED_CLASSES } from '../../../src/content/advancedClasses';
import { BASE_CLASSES } from '../../../src/content/baseClasses';
import { EQUIPMENT } from '../../../src/content/equipment';
import { BATTLE_MAPS } from '../../../src/content/maps/battleMapRegistry';
import { MONSTERS } from '../../../src/content/monsters';
import { RACES } from '../../../src/content/races';
import { ZONES } from '../../../src/content/zones';
import { isPositionInsideMap, tileAt } from '../../../src/sim/grid/BattleMap';
import { isWithinBounds } from '../../../src/sim/grid/ZonePathfinding';
import { positionKey, type GridPosition } from '../../../src/sim/grid/GridPosition';
import type { GuildMember } from '../../../src/sim/guild/GuildState';
import type { QuestEnemySpawn } from '../../../src/sim/guild/QuestDefinition';
import type { ZoneDefinition, ZoneRoamingGroupDefinition } from '../../../src/sim/guild/ZoneDefinition';

const SINGLE_STEP_OFFSETS: readonly GridPosition[] = [
  { column: 0, row: -1 },
  { column: 0, row: 1 },
  { column: -1, row: 0 },
  { column: 1, row: 0 },
];

/**
 * BFS over (playerPosition, patrolRouteIndex) states, one grid step per
 * transition (matching how ZoneSession actually advances), to prove a
 * roaming group can ever end up on the same tile as a player walking from
 * the entry tile. Patrol parity can make a group mathematically
 * uncatchable (player and group position parity flip every step — if the
 * entry tile's parity never matches the route's, they can never coincide)
 * regardless of how cleverly the player paths there.
 */
function isRoamingGroupCatchableFromEntry(zone: ZoneDefinition, group: ZoneRoamingGroupDefinition): boolean {
  const obstacleKeys = new Set(zone.obstacleTiles.map(positionKey));
  const visited = new Set<string>([`${positionKey(zone.entryTile)}|0`]);
  const queue: { position: GridPosition; routeIndex: number }[] = [{ position: zone.entryTile, routeIndex: 0 }];

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    if (current === undefined) continue;
    const { position, routeIndex } = current;
    for (const offset of SINGLE_STEP_OFFSETS) {
      const next = { column: position.column + offset.column, row: position.row + offset.row };
      if (
        next.column < 0 ||
        next.column >= zone.explorationGridWidth ||
        next.row < 0 ||
        next.row >= zone.explorationGridHeight ||
        obstacleKeys.has(positionKey(next))
      ) {
        continue;
      }
      const nextRouteIndex = (routeIndex + 1) % group.patrolRoute.length;
      const groupPosition = group.patrolRoute[nextRouteIndex];
      if (groupPosition !== undefined && positionKey(next) === positionKey(groupPosition)) {
        return true;
      }
      const stateKey = `${positionKey(next)}|${nextRouteIndex}`;
      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        queue.push({ position: next, routeIndex: nextRouteIndex });
      }
    }
  }
  return false;
}

const CONTENT_TABLES = {
  races: RACES,
  baseClasses: BASE_CLASSES,
  advancedClasses: ADVANCED_CLASSES,
  monsters: MONSTERS,
  equipment: EQUIPMENT,
};

const TEST_MEMBER: GuildMember = {
  identifier: 'member_test',
  displayName: 'Test Member',
  raceIdentifier: 'human',
  classIdentifier: 'warrior',
  classLevelsReached: {},
  level: 2,
  experiencePoints: 0,
  equippedItemIdentifiers: {},
};

describe('createUnitsForEncounterBattle', () => {
  it('builds guild units on deployment tiles and enemies on the rolled spawns', () => {
    const mapEntry = BATTLE_MAPS['forest_clearing'];
    if (mapEntry === undefined) {
      throw new Error('Missing test content');
    }
    const enemySpawns: QuestEnemySpawn[] = [{ monsterIdentifier: 'twisted_wolf', position: { column: 2, row: 1 } }];
    const units = createUnitsForEncounterBattle(enemySpawns, [TEST_MEMBER], mapEntry.deploymentTiles, CONTENT_TABLES);
    expect(units.filter((unit) => unit.team === 'guild')).toHaveLength(1);
    expect(units.filter((unit) => unit.team === 'enemy')).toHaveLength(enemySpawns.length);
    expect(units[0]?.position).toEqual(mapEntry.deploymentTiles[0]);
  });

  it('refuses an empty deployment', () => {
    const mapEntry = BATTLE_MAPS['forest_clearing'];
    if (mapEntry === undefined) {
      throw new Error('Missing test content');
    }
    expect(() =>
      createUnitsForEncounterBattle([], [], mapEntry.deploymentTiles, CONTENT_TABLES),
    ).toThrow();
  });
});

describe('zone content validity', () => {
  it('every zone references an existing battle map and existing monsters, with spawn tiles on standable ground', () => {
    for (const zone of Object.values(ZONES)) {
      const mapEntry = BATTLE_MAPS[zone.battleMapIdentifier];
      expect(mapEntry, `battle map for ${zone.identifier}`).toBeDefined();
      if (mapEntry === undefined) {
        continue;
      }
      for (const group of zone.roamingGroups) {
        for (const monsterIdentifier of group.monsterIdentifiers) {
          expect(MONSTERS[monsterIdentifier], `monster in ${zone.identifier}/${group.identifier}`).toBeDefined();
        }
      }
      for (const spawnTile of zone.encounterSpawnTiles) {
        expect(isPositionInsideMap(mapEntry.map, spawnTile), `spawn tile inside battle map in ${zone.identifier}`).toBe(
          true,
        );
        expect(
          tileAt(mapEntry.map, spawnTile).isImpassable,
          `standable spawn tile in ${zone.identifier} at ${spawnTile.column},${spawnTile.row}`,
        ).toBe(false);
      }
    }
  });

  it('every roaming group has a sane enemy count and enough spawn tiles for it', () => {
    for (const zone of Object.values(ZONES)) {
      for (const group of zone.roamingGroups) {
        const label = `${zone.identifier}/${group.identifier}`;
        expect(group.minimumEnemyCount, label).toBeGreaterThanOrEqual(1);
        expect(group.maximumEnemyCount, label).toBeGreaterThanOrEqual(group.minimumEnemyCount);
        expect(zone.encounterSpawnTiles.length, label).toBeGreaterThanOrEqual(group.maximumEnemyCount);
      }
    }
  });

  it('every exploration-grid tile (entry, tavern, obstacles, patrol routes) is in bounds', () => {
    for (const zone of Object.values(ZONES)) {
      const { explorationGridWidth: width, explorationGridHeight: height } = zone;
      expect(isWithinBounds(zone.entryTile, width, height), `${zone.identifier} entry tile`).toBe(true);
      expect(isWithinBounds(zone.tavernTile, width, height), `${zone.identifier} tavern tile`).toBe(true);
      for (const obstacle of zone.obstacleTiles) {
        expect(isWithinBounds(obstacle, width, height), `${zone.identifier} obstacle`).toBe(true);
      }
      for (const group of zone.roamingGroups) {
        for (const step of group.patrolRoute) {
          expect(isWithinBounds(step, width, height), `${zone.identifier}/${group.identifier} patrol step`).toBe(
            true,
          );
        }
      }
    }
  });

  it('entry, tavern, and patrol tiles never sit on an obstacle', () => {
    for (const zone of Object.values(ZONES)) {
      const obstacleKeys = new Set(zone.obstacleTiles.map((tile) => `${tile.column},${tile.row}`));
      expect(obstacleKeys.has(`${zone.entryTile.column},${zone.entryTile.row}`), `${zone.identifier} entry`).toBe(
        false,
      );
      expect(obstacleKeys.has(`${zone.tavernTile.column},${zone.tavernTile.row}`), `${zone.identifier} tavern`).toBe(
        false,
      );
      for (const group of zone.roamingGroups) {
        for (const step of group.patrolRoute) {
          expect(
            obstacleKeys.has(`${step.column},${step.row}`),
            `${zone.identifier}/${group.identifier} patrol step`,
          ).toBe(false);
        }
      }
    }
  });

  it('every roaming group can actually be caught by walking from the entry tile', () => {
    for (const zone of Object.values(ZONES)) {
      for (const group of zone.roamingGroups) {
        expect(
          isRoamingGroupCatchableFromEntry(zone, group),
          `${zone.identifier}/${group.identifier} is unreachable from the entry tile (likely a parity mismatch)`,
        ).toBe(true);
      }
    }
  });
});
