import { describe, expect, it } from 'vitest';
import { createUnitsForQuestBattle } from '../../../src/sim/guild/QuestBattleAssembly';
import { BASE_CLASSES } from '../../../src/content/baseClasses';
import { BATTLE_MAPS } from '../../../src/content/maps/battleMapRegistry';
import { MONSTERS } from '../../../src/content/monsters';
import { QUESTS } from '../../../src/content/quests';
import { RACES } from '../../../src/content/races';
import { isPositionInsideMap, tileAt } from '../../../src/sim/grid/BattleMap';
import type { GuildMember } from '../../../src/sim/guild/GuildState';

const CONTENT_TABLES = { races: RACES, baseClasses: BASE_CLASSES, monsters: MONSTERS };

const TEST_MEMBER: GuildMember = {
  identifier: 'member_test',
  displayName: 'Test Member',
  raceIdentifier: 'human',
  baseClassIdentifier: 'warrior',
  level: 2,
  experiencePoints: 0,
};

describe('createUnitsForQuestBattle', () => {
  it('builds guild units on deployment tiles and enemies on quest spawns', () => {
    const quest = QUESTS['wolves_on_the_north_road'];
    const mapEntry = BATTLE_MAPS['forest_clearing'];
    if (quest === undefined || mapEntry === undefined) {
      throw new Error('Missing test content');
    }
    const units = createUnitsForQuestBattle(quest, [TEST_MEMBER], mapEntry.deploymentTiles, CONTENT_TABLES);
    expect(units.filter((unit) => unit.team === 'guild')).toHaveLength(1);
    expect(units.filter((unit) => unit.team === 'enemy')).toHaveLength(quest.enemySpawns.length);
    expect(units[0]?.position).toEqual(mapEntry.deploymentTiles[0]);
  });

  it('refuses an empty deployment', () => {
    const quest = QUESTS['wolves_on_the_north_road'];
    const mapEntry = BATTLE_MAPS['forest_clearing'];
    if (quest === undefined || mapEntry === undefined) {
      throw new Error('Missing test content');
    }
    expect(() => createUnitsForQuestBattle(quest, [], mapEntry.deploymentTiles, CONTENT_TABLES)).toThrow();
  });
});

describe('quest content validity', () => {
  it('every quest references an existing map and existing monsters, with spawns on standable tiles', () => {
    for (const quest of Object.values(QUESTS)) {
      const mapEntry = BATTLE_MAPS[quest.battleMapIdentifier];
      expect(mapEntry, `map for ${quest.identifier}`).toBeDefined();
      if (mapEntry === undefined) {
        continue;
      }
      for (const enemySpawn of quest.enemySpawns) {
        expect(MONSTERS[enemySpawn.monsterIdentifier], `monster in ${quest.identifier}`).toBeDefined();
        expect(
          isPositionInsideMap(mapEntry.map, enemySpawn.position),
          `spawn inside map in ${quest.identifier}`,
        ).toBe(true);
        expect(
          tileAt(mapEntry.map, enemySpawn.position).isImpassable,
          `standable spawn in ${quest.identifier} at ${enemySpawn.position.column},${enemySpawn.position.row}`,
        ).toBe(false);
      }
    }
  });

  it('every map deployment tile is standable', () => {
    for (const [mapIdentifier, mapEntry] of Object.entries(BATTLE_MAPS)) {
      for (const deploymentTile of mapEntry.deploymentTiles) {
        expect(
          isPositionInsideMap(mapEntry.map, deploymentTile),
          `deployment inside ${mapIdentifier}`,
        ).toBe(true);
        expect(
          tileAt(mapEntry.map, deploymentTile).isImpassable,
          `standable deployment in ${mapIdentifier} at ${deploymentTile.column},${deploymentTile.row}`,
        ).toBe(false);
      }
    }
  });
});
