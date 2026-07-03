import type { ZoneContentEntry } from './zoneContentEntry';

/** The blue-flowered meadow west of the heartland (LORE.md: Slumber Meadow / Travellers' Rest). */
export const SLUMBER_MEADOW_ZONE = {
  identifier: 'slumber_meadow',
  displayName: 'Slumber Meadow',
  description:
    'Green, rainy, and full of blue flowers that put walkers to sleep. The gentlest road out of the heartland — by daylight.',
  worldMapPosition: { x: 0.2, y: 0.55 },
  entryLocationIdentifier: 'slumber_meadow_gate',
  locations: [
    {
      identifier: 'slumber_meadow_gate',
      displayName: 'The Meadow Gate',
      kind: 'landmark',
      position: { x: 0.08, y: 0.5 },
    },
    {
      identifier: 'slumber_meadow_sleeping_field',
      displayName: 'The Sleeping Field',
      kind: 'landmark',
      position: { x: 0.32, y: 0.5 },
    },
    {
      identifier: 'slumber_meadow_old_willow',
      displayName: 'The Old Willow',
      kind: 'landmark',
      position: { x: 0.55, y: 0.2 },
    },
    {
      identifier: 'slumber_meadow_rain_pools',
      displayName: 'The Rain Pools',
      kind: 'landmark',
      position: { x: 0.55, y: 0.8 },
    },
    {
      identifier: 'slumber_meadow_tavern',
      displayName: "Travellers' Rest",
      kind: 'tavern',
      position: { x: 0.85, y: 0.5 },
    },
  ],
  roads: [
    { fromLocationIdentifier: 'slumber_meadow_gate', toLocationIdentifier: 'slumber_meadow_sleeping_field' },
    { fromLocationIdentifier: 'slumber_meadow_sleeping_field', toLocationIdentifier: 'slumber_meadow_old_willow' },
    { fromLocationIdentifier: 'slumber_meadow_sleeping_field', toLocationIdentifier: 'slumber_meadow_rain_pools' },
    // The willow overlooks the pools across open grass — and the odd
    // cycle keeps the bloom patch catchable.
    { fromLocationIdentifier: 'slumber_meadow_old_willow', toLocationIdentifier: 'slumber_meadow_rain_pools' },
    { fromLocationIdentifier: 'slumber_meadow_old_willow', toLocationIdentifier: 'slumber_meadow_tavern' },
    { fromLocationIdentifier: 'slumber_meadow_rain_pools', toLocationIdentifier: 'slumber_meadow_tavern' },
  ],
  roamingGroups: [
    {
      identifier: 'bloom_patch',
      patrolRoute: ['slumber_meadow_sleeping_field', 'slumber_meadow_old_willow', 'slumber_meadow_rain_pools'],
      monsterIdentifiers: ['maneater_bloom', 'twisted_wolf'],
      minimumEnemyCount: 1,
      maximumEnemyCount: 2,
    },
  ],
  battleMapIdentifier: 'slumber_meadow',
  // The gentlest zone in the game — fresh guilds cut their teeth here.
  monsterLevelRange: { minimumLevel: 1, maximumLevel: 3 },
  rewardGoldPerEncounter: 15,
} satisfies ZoneContentEntry;
