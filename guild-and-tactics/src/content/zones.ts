import type { ZoneDefinition } from '../sim/guild/ZoneDefinition';

/**
 * Zones reachable from the world map (M4, PRD §6.0/§6.1). Each is a small
 * named-location road network with its own tavern (quests + store) and a
 * roaming monster group you can see, patrolling across several of the
 * zone's locations, and choose to avoid.
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
      { identifier: 'north_road_tavern', displayName: "Wanderer's Rest", kind: 'tavern', position: { x: 0.85, y: 0.5 } },
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
  },
  marsh_trail: {
    identifier: 'marsh_trail',
    displayName: 'The Marsh Trail',
    description:
      'Causeway boards over the mire. Boars root up the path, and the pale lights are not always harmless.',
    entryLocationIdentifier: 'marsh_trail_landing',
    locations: [
      { identifier: 'marsh_trail_landing', displayName: 'The Landing', kind: 'landmark', position: { x: 0.08, y: 0.5 } },
      {
        identifier: 'marsh_trail_causeway',
        displayName: 'The Causeway',
        kind: 'landmark',
        position: { x: 0.32, y: 0.5 },
      },
      { identifier: 'marsh_trail_reeds', displayName: 'The Reeds', kind: 'landmark', position: { x: 0.55, y: 0.2 } },
      {
        identifier: 'marsh_trail_lights',
        displayName: 'The Pale Lights',
        kind: 'landmark',
        position: { x: 0.55, y: 0.8 },
      },
      { identifier: 'marsh_trail_tavern', displayName: "Wanderer's Rest", kind: 'tavern', position: { x: 0.85, y: 0.5 } },
    ],
    roads: [
      { fromLocationIdentifier: 'marsh_trail_landing', toLocationIdentifier: 'marsh_trail_causeway' },
      { fromLocationIdentifier: 'marsh_trail_causeway', toLocationIdentifier: 'marsh_trail_reeds' },
      { fromLocationIdentifier: 'marsh_trail_causeway', toLocationIdentifier: 'marsh_trail_lights' },
      { fromLocationIdentifier: 'marsh_trail_reeds', toLocationIdentifier: 'marsh_trail_tavern' },
      { fromLocationIdentifier: 'marsh_trail_lights', toLocationIdentifier: 'marsh_trail_tavern' },
    ],
    roamingGroups: [
      {
        identifier: 'boar_herd',
        patrolRoute: ['marsh_trail_causeway', 'marsh_trail_reeds', 'marsh_trail_lights'],
        monsterIdentifiers: ['twisted_boar', 'hollow_wisp'],
        minimumEnemyCount: 1,
        maximumEnemyCount: 2,
      },
    ],
    battleMapIdentifier: 'marsh_road',
    monsterLevelRange: { minimumLevel: 3, maximumLevel: 5 },
    rewardGoldPerEncounter: 25,
  },
  quarry_path: {
    identifier: 'quarry_path',
    displayName: 'The Quarry Path',
    description:
      'The old masons’ trail up to the quarry rim. The stones there have a habit of standing up.',
    entryLocationIdentifier: 'quarry_path_trailhead',
    locations: [
      {
        identifier: 'quarry_path_trailhead',
        displayName: 'The Trailhead',
        kind: 'landmark',
        position: { x: 0.06, y: 0.5 },
      },
      {
        identifier: 'quarry_path_switchback',
        displayName: 'The Switchback',
        kind: 'landmark',
        position: { x: 0.28, y: 0.5 },
      },
      { identifier: 'quarry_path_rim', displayName: 'The Quarry Rim', kind: 'landmark', position: { x: 0.48, y: 0.22 } },
      { identifier: 'quarry_path_pit', displayName: 'The Quarry Pit', kind: 'landmark', position: { x: 0.48, y: 0.78 } },
      {
        identifier: 'quarry_path_camp',
        displayName: "Mason's Camp",
        kind: 'landmark',
        position: { x: 0.68, y: 0.5 },
      },
      { identifier: 'quarry_path_tavern', displayName: "Wanderer's Rest", kind: 'tavern', position: { x: 0.9, y: 0.5 } },
    ],
    roads: [
      { fromLocationIdentifier: 'quarry_path_trailhead', toLocationIdentifier: 'quarry_path_switchback' },
      { fromLocationIdentifier: 'quarry_path_switchback', toLocationIdentifier: 'quarry_path_rim' },
      { fromLocationIdentifier: 'quarry_path_switchback', toLocationIdentifier: 'quarry_path_pit' },
      // Rim overlooks the pit directly — also keeps stoneling_watch's 4-stop
      // loop catchable (an even-length patrol on an otherwise bipartite road
      // graph can be mathematically uncatchable; see EncounterBattleAssembly.test.ts).
      { fromLocationIdentifier: 'quarry_path_rim', toLocationIdentifier: 'quarry_path_pit' },
      { fromLocationIdentifier: 'quarry_path_rim', toLocationIdentifier: 'quarry_path_camp' },
      { fromLocationIdentifier: 'quarry_path_pit', toLocationIdentifier: 'quarry_path_camp' },
      { fromLocationIdentifier: 'quarry_path_camp', toLocationIdentifier: 'quarry_path_tavern' },
    ],
    roamingGroups: [
      {
        identifier: 'stoneling_watch',
        patrolRoute: ['quarry_path_switchback', 'quarry_path_rim', 'quarry_path_camp', 'quarry_path_pit'],
        monsterIdentifiers: ['stoneling', 'twisted_wolf'],
        minimumEnemyCount: 1,
        maximumEnemyCount: 2,
      },
    ],
    battleMapIdentifier: 'old_quarry',
    // The hardest of the first three zones: stonelings and wolves patrol
    // well above their base levels.
    monsterLevelRange: { minimumLevel: 4, maximumLevel: 6 },
    rewardGoldPerEncounter: 25,
  },
};
