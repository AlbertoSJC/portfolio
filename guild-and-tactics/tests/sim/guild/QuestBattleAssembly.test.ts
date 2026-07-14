import { describe, expect, it } from 'vitest';
import { createUnitsForQuestBattle } from '@/sim/guild/QuestBattleAssembly';
import { ADVANCED_CLASSES } from '@/content/advancedClasses';
import { BASE_CLASSES } from '@/content/baseClasses';
import { EQUIPMENT } from '@/content/equipment';
import { BATTLE_MAPS } from '@/content/maps/battleMapRegistry';
import { MONSTERS } from '@/content/monsters';
import { QUESTS } from '@/content/quests';
import { RACES } from '@/content/races';
import { ZONES } from '@/content/zones';
import { isPositionInsideMap, tileAt } from '@/sim/grid/BattleMap';
import { questIdentifiersForZone } from '@/sim/guild/QuestBoard';
import type { GuildMember } from '@/sim/guild/GuildState';

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
  skillMasteryProgress: {},
  equippedItemIdentifiers: {},
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

  it('carries gear-granted and mastered skills onto the assembled unit', () => {
    const quest = QUESTS['wolves_on_the_north_road'];
    const mapEntry = BATTLE_MAPS['forest_clearing'];
    if (quest === undefined || mapEntry === undefined) {
      throw new Error('Missing test content');
    }
    const armedMember: GuildMember = {
      ...TEST_MEMBER,
      equippedItemIdentifiers: { weapon: 'greathorn_cleaver' },
      skillMasteryProgress: { tide_surge: 99 }, // mastered long ago, item since sold
    };
    const units = createUnitsForQuestBattle(quest, [armedMember], mapEntry.deploymentTiles, CONTENT_TABLES);
    const guildUnit = units[0];
    expect(guildUnit?.skillIdentifiers).toContain('cleaving_arc');
    expect(guildUnit?.equipmentGrantedSkillIdentifiers).toEqual(['cleaving_arc']);
    expect(guildUnit?.skillIdentifiers).toContain('tide_surge');
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

  it('every quest belongs to an existing zone', () => {
    for (const quest of Object.values(QUESTS)) {
      expect(ZONES[quest.zoneIdentifier], `zone for ${quest.identifier}`).toBeDefined();
    }
  });

  it('every zone offers at least one quest to a fresh bronze guild', () => {
    // Rank gating hides harder quests from low-reputation guilds — a zone
    // whose pool is all rank 2+ would present an empty tavern board.
    for (const zone of Object.values(ZONES)) {
      expect(
        questIdentifiersForZone(zone, QUESTS, 'bronze').length,
        `bronze-offerable quests in ${zone.identifier}`,
      ).toBeGreaterThan(0);
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
