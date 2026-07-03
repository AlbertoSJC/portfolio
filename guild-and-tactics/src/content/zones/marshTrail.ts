import type { ZoneContentEntry } from './zoneContentEntry';

/** The causeway over the eastern mire (LORE.md: Marsh Trail, toward the Broadwater). */
export const MARSH_TRAIL_ZONE = {
  identifier: 'marsh_trail',
  displayName: 'The Marsh Trail',
  description:
    'Causeway boards over the mire. Boars root up the path, and the pale lights are not always harmless.',
  worldMapPosition: { x: 0.76, y: 0.55 },
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
    {
      identifier: 'marsh_trail_tavern',
      displayName: "Peat-Cutters' Haven",
      kind: 'tavern',
      position: { x: 0.85, y: 0.5 },
    },
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
} satisfies ZoneContentEntry;
