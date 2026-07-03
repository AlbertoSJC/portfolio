import type { ZoneContentEntry } from './zoneContentEntry';

/** The forest trade road between the heartland and the Breirwood — the starter zone. */
export const NORTH_ROAD_ZONE = {
  identifier: 'north_road',
  displayName: 'The North Road',
  description:
    'The forest road the carters use. Twisted wolves and walking roots still test it some days.',
  worldMapPosition: { x: 0.33, y: 0.34 },
  entryLocationIdentifier: 'north_road_gate',
  locations: [
    { identifier: 'north_road_gate', displayName: 'The Gate', kind: 'landmark', position: { x: 0.08, y: 0.5 } },
    {
      identifier: 'north_road_crossing',
      displayName: 'The Crossing',
      kind: 'landmark',
      position: { x: 0.32, y: 0.5 },
    },
    { identifier: 'north_road_grove', displayName: 'The Grove', kind: 'landmark', position: { x: 0.55, y: 0.22 } },
    { identifier: 'north_road_bridge', displayName: 'The Bridge', kind: 'landmark', position: { x: 0.55, y: 0.78 } },
    {
      identifier: 'north_road_tavern',
      displayName: "Carters' Respite",
      kind: 'tavern',
      position: { x: 0.85, y: 0.5 },
    },
  ],
  roads: [
    { fromLocationIdentifier: 'north_road_gate', toLocationIdentifier: 'north_road_crossing' },
    { fromLocationIdentifier: 'north_road_crossing', toLocationIdentifier: 'north_road_grove' },
    { fromLocationIdentifier: 'north_road_crossing', toLocationIdentifier: 'north_road_bridge' },
    { fromLocationIdentifier: 'north_road_grove', toLocationIdentifier: 'north_road_tavern' },
    { fromLocationIdentifier: 'north_road_bridge', toLocationIdentifier: 'north_road_tavern' },
  ],
  roamingGroups: [
    {
      identifier: 'wolf_pack',
      patrolRoute: ['north_road_crossing', 'north_road_grove', 'north_road_bridge'],
      monsterIdentifiers: ['twisted_wolf', 'gnarlroot'],
      minimumEnemyCount: 1,
      maximumEnemyCount: 2,
    },
  ],
  battleMapIdentifier: 'forest_clearing',
  // The starter road: spawns at or slightly below the pool's base levels.
  monsterLevelRange: { minimumLevel: 2, maximumLevel: 3 },
  rewardGoldPerEncounter: 20,
} satisfies ZoneContentEntry;
