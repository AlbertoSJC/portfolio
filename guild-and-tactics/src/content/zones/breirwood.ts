import type { ZoneContentEntry } from './zoneContentEntry';

/** The Werecat old-growth north of the heartland (LORE.md: The Breirwood). */
export const BREIRWOOD_ZONE = {
  identifier: 'breirwood',
  displayName: 'The Breirwood',
  description:
    'The Werecat old-growth north of the heartland. The wind never quite stops, and some of the trees walk.',
  worldMapPosition: { x: 0.4, y: 0.14 },
  entryLocationIdentifier: 'breirwood_wood_gate',
  locations: [
    {
      identifier: 'breirwood_wood_gate',
      displayName: 'The Wood Gate',
      kind: 'landmark',
      position: { x: 0.07, y: 0.5 },
    },
    {
      identifier: 'breirwood_walker_grove',
      displayName: 'Walker Grove',
      kind: 'landmark',
      position: { x: 0.28, y: 0.5 },
    },
    {
      identifier: 'breirwood_breir_shrine',
      displayName: "Breir's Shrine",
      kind: 'landmark',
      position: { x: 0.5, y: 0.2 },
    },
    {
      identifier: 'breirwood_taurk_shrine',
      displayName: "Taurk's Shrine",
      kind: 'landmark',
      position: { x: 0.5, y: 0.8 },
    },
    {
      identifier: 'breirwood_deep_stand',
      displayName: 'The Deep Stand',
      kind: 'landmark',
      position: { x: 0.7, y: 0.5 },
    },
    { identifier: 'breirwood_tavern', displayName: 'Highbranch', kind: 'tavern', position: { x: 0.91, y: 0.5 } },
  ],
  roads: [
    { fromLocationIdentifier: 'breirwood_wood_gate', toLocationIdentifier: 'breirwood_walker_grove' },
    { fromLocationIdentifier: 'breirwood_walker_grove', toLocationIdentifier: 'breirwood_breir_shrine' },
    { fromLocationIdentifier: 'breirwood_walker_grove', toLocationIdentifier: 'breirwood_taurk_shrine' },
    // The pilgrims' loop between the two shrines — an odd cycle that
    // keeps both patrols below catchable (see EncounterBattleAssembly.test.ts).
    { fromLocationIdentifier: 'breirwood_breir_shrine', toLocationIdentifier: 'breirwood_taurk_shrine' },
    { fromLocationIdentifier: 'breirwood_breir_shrine', toLocationIdentifier: 'breirwood_deep_stand' },
    { fromLocationIdentifier: 'breirwood_taurk_shrine', toLocationIdentifier: 'breirwood_deep_stand' },
    { fromLocationIdentifier: 'breirwood_deep_stand', toLocationIdentifier: 'breirwood_tavern' },
  ],
  roamingGroups: [
    {
      identifier: 'owl_watch',
      patrolRoute: ['breirwood_walker_grove', 'breirwood_breir_shrine', 'breirwood_taurk_shrine'],
      monsterIdentifiers: ['dire_owl', 'wind_sprite'],
      minimumEnemyCount: 1,
      maximumEnemyCount: 2,
    },
    {
      identifier: 'walking_stand',
      patrolRoute: ['breirwood_breir_shrine', 'breirwood_deep_stand', 'breirwood_taurk_shrine'],
      monsterIdentifiers: ['treewalker', 'thornback_boar'],
      minimumEnemyCount: 1,
      maximumEnemyCount: 2,
    },
  ],
  battleMapIdentifier: 'breirwood_deep',
  // The hardest zone on the map: the deep wood is not starter country.
  monsterLevelRange: { minimumLevel: 6, maximumLevel: 8 },
  rewardGoldPerEncounter: 35,
} satisfies ZoneContentEntry;
