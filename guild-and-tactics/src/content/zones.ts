import type { ZoneDefinition } from '../sim/guild/ZoneDefinition';

/**
 * Zones reachable from the world map (M4, PRD §6.0/§6.1). Each is a small
 * walkable exploration grid with its own tavern (quests + store) and a
 * roaming monster group you can see and choose to walk into.
 *
 * v1 reuses the 3 existing battle maps/monster pools as the first 3 zones.
 * More zones/settlements are planned for future iterations — see
 * CLAUDE.md's M4 status.
 */
export const ZONES: Record<string, ZoneDefinition> = {
  north_road: {
    identifier: 'north_road',
    displayName: 'The North Road',
    description:
      'The forest road the carters use. Twisted wolves and walking roots still test it some days.',
    explorationGridWidth: 9,
    explorationGridHeight: 7,
    obstacleTiles: [],
    entryTile: { column: 4, row: 6 },
    tavernTile: { column: 4, row: 1 },
    roamingGroups: [
      {
        identifier: 'wolf_pack',
        patrolRoute: [
          { column: 3, row: 3 },
          { column: 4, row: 3 },
          { column: 4, row: 4 },
          { column: 3, row: 4 },
        ],
        monsterIdentifiers: ['twisted_wolf', 'gnarlroot'],
        minimumEnemyCount: 1,
        maximumEnemyCount: 2,
      },
    ],
    battleMapIdentifier: 'forest_clearing',
    encounterSpawnTiles: [
      { column: 2, row: 1 },
      { column: 5, row: 0 },
      { column: 9, row: 1 },
      { column: 4, row: 2 },
      { column: 6, row: 1 },
    ],
    rewardGoldPerEncounter: 20,
  },
  marsh_trail: {
    identifier: 'marsh_trail',
    displayName: 'The Marsh Trail',
    description:
      'Causeway boards over the mire. Boars root up the path, and the pale lights are not always harmless.',
    explorationGridWidth: 9,
    explorationGridHeight: 7,
    obstacleTiles: [],
    entryTile: { column: 4, row: 6 },
    tavernTile: { column: 1, row: 1 },
    roamingGroups: [
      {
        identifier: 'boar_herd',
        patrolRoute: [
          { column: 6, row: 2 },
          { column: 7, row: 2 },
          { column: 7, row: 3 },
          { column: 6, row: 3 },
        ],
        monsterIdentifiers: ['twisted_boar', 'hollow_wisp'],
        minimumEnemyCount: 1,
        maximumEnemyCount: 2,
      },
    ],
    battleMapIdentifier: 'marsh_road',
    encounterSpawnTiles: [
      { column: 3, row: 2 },
      { column: 8, row: 2 },
      { column: 4, row: 1 },
      { column: 8, row: 1 },
      { column: 6, row: 2 },
    ],
    rewardGoldPerEncounter: 25,
  },
  quarry_path: {
    identifier: 'quarry_path',
    displayName: 'The Quarry Path',
    description:
      'The old masons’ trail up to the quarry rim. The stones there have a habit of standing up.',
    explorationGridWidth: 9,
    explorationGridHeight: 7,
    obstacleTiles: [],
    entryTile: { column: 4, row: 6 },
    tavernTile: { column: 7, row: 1 },
    roamingGroups: [
      {
        identifier: 'stoneling_watch',
        patrolRoute: [
          { column: 2, row: 2 },
          { column: 2, row: 3 },
          { column: 3, row: 3 },
          { column: 3, row: 2 },
        ],
        monsterIdentifiers: ['stoneling', 'twisted_wolf'],
        minimumEnemyCount: 1,
        maximumEnemyCount: 2,
      },
    ],
    battleMapIdentifier: 'old_quarry',
    encounterSpawnTiles: [
      { column: 6, row: 2 },
      { column: 8, row: 2 },
      { column: 3, row: 1 },
      { column: 10, row: 2 },
      { column: 4, row: 2 },
    ],
    rewardGoldPerEncounter: 25,
  },
};
