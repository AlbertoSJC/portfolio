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
import { buildZoneRoadAdjacency } from '../../../src/sim/graph/ZoneRoadGraph';
import type { GuildMember } from '../../../src/sim/guild/GuildState';
import type { QuestEnemySpawn } from '../../../src/sim/guild/QuestDefinition';
import type { ZoneDefinition, ZoneRoamingGroupDefinition } from '../../../src/sim/guild/ZoneDefinition';

/**
 * BFS over (locationIdentifier, patrolRouteIndex) states, one road hop per
 * transition (matching how ZoneSession actually advances), to prove a
 * roaming group can ever end up on the same location as a player walking
 * from the entry location. A patrol route whose length shares no useful
 * relationship with the road network's cycle structure can make a group
 * mathematically uncatchable (the road-graph equivalent of the tile-parity
 * bug this exact check caught once before) regardless of how cleverly the
 * player paths there.
 */
function isRoamingGroupCatchableFromEntry(zone: ZoneDefinition, group: ZoneRoamingGroupDefinition): boolean {
  const adjacency = buildZoneRoadAdjacency(zone.roads);
  const visited = new Set<string>([`${zone.entryLocationIdentifier}|0`]);
  const queue: { locationIdentifier: string; routeIndex: number }[] = [
    { locationIdentifier: zone.entryLocationIdentifier, routeIndex: 0 },
  ];

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    if (current === undefined) continue;
    const { locationIdentifier, routeIndex } = current;
    for (const neighbor of adjacency.get(locationIdentifier) ?? []) {
      const nextRouteIndex = (routeIndex + 1) % group.patrolRoute.length;
      const groupLocationIdentifier = group.patrolRoute[nextRouteIndex];
      if (groupLocationIdentifier !== undefined && neighbor === groupLocationIdentifier) {
        return true;
      }
      const stateKey = `${neighbor}|${nextRouteIndex}`;
      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        queue.push({ locationIdentifier: neighbor, routeIndex: nextRouteIndex });
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

  it('every location reference (entry, roads, patrol stops) points at a real location', () => {
    for (const zone of Object.values(ZONES)) {
      const locationIdentifiers = new Set(zone.locations.map((location) => location.identifier));
      expect(locationIdentifiers.has(zone.entryLocationIdentifier), `${zone.identifier} entry location`).toBe(true);
      for (const road of zone.roads) {
        expect(locationIdentifiers.has(road.fromLocationIdentifier), `${zone.identifier} road from`).toBe(true);
        expect(locationIdentifiers.has(road.toLocationIdentifier), `${zone.identifier} road to`).toBe(true);
      }
      for (const group of zone.roamingGroups) {
        for (const stop of group.patrolRoute) {
          expect(locationIdentifiers.has(stop), `${zone.identifier}/${group.identifier} patrol stop`).toBe(true);
        }
      }
    }
  });

  it('every roaming group patrol route has at least two distinct stops, so it can actually roam', () => {
    for (const zone of Object.values(ZONES)) {
      for (const group of zone.roamingGroups) {
        const distinctStops = new Set(group.patrolRoute);
        expect(distinctStops.size, `${zone.identifier}/${group.identifier}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('every roaming group can actually be caught by walking from the entry location', () => {
    for (const zone of Object.values(ZONES)) {
      for (const group of zone.roamingGroups) {
        expect(
          isRoamingGroupCatchableFromEntry(zone, group),
          `${zone.identifier}/${group.identifier} is unreachable from the entry location (likely a road/route-length mismatch)`,
        ).toBe(true);
      }
    }
  });
});
