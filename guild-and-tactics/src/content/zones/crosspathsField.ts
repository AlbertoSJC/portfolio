import type { ZoneContentEntry } from './zoneContentEntry';

/** The heartland crossroads and its Heartline halt (LORE.md: Crosspaths Field). */
export const CROSSPATHS_FIELD_ZONE = {
  identifier: 'crosspaths_field',
  displayName: 'Crosspaths Field',
  description:
    'A common field where two roads and the Heartline meet by the drinking lake. The caverns nearby are less common.',
  worldMapPosition: { x: 0.5, y: 0.52 },
  entryLocationIdentifier: 'crosspaths_field_waymark',
  locations: [
    {
      identifier: 'crosspaths_field_waymark',
      displayName: 'The Waymark',
      kind: 'landmark',
      position: { x: 0.08, y: 0.5 },
    },
    {
      identifier: 'crosspaths_field_old_crossing',
      displayName: 'The Old Crossing',
      kind: 'landmark',
      position: { x: 0.32, y: 0.5 },
    },
    {
      identifier: 'crosspaths_field_lake_shore',
      displayName: 'The Lake Shore',
      kind: 'landmark',
      position: { x: 0.55, y: 0.2 },
    },
    {
      identifier: 'crosspaths_field_cavern_mouth',
      displayName: 'The Cavern Mouth',
      kind: 'landmark',
      position: { x: 0.55, y: 0.8 },
    },
    {
      identifier: 'crosspaths_field_tavern',
      displayName: 'Crosspaths Halt',
      kind: 'tavern',
      position: { x: 0.85, y: 0.5 },
    },
  ],
  roads: [
    { fromLocationIdentifier: 'crosspaths_field_waymark', toLocationIdentifier: 'crosspaths_field_old_crossing' },
    { fromLocationIdentifier: 'crosspaths_field_old_crossing', toLocationIdentifier: 'crosspaths_field_lake_shore' },
    {
      fromLocationIdentifier: 'crosspaths_field_old_crossing',
      toLocationIdentifier: 'crosspaths_field_cavern_mouth',
    },
    // The shore path skirts the lake straight to the caverns — the odd
    // cycle that keeps the warband catchable.
    { fromLocationIdentifier: 'crosspaths_field_lake_shore', toLocationIdentifier: 'crosspaths_field_cavern_mouth' },
    { fromLocationIdentifier: 'crosspaths_field_lake_shore', toLocationIdentifier: 'crosspaths_field_tavern' },
    { fromLocationIdentifier: 'crosspaths_field_cavern_mouth', toLocationIdentifier: 'crosspaths_field_tavern' },
  ],
  roamingGroups: [
    {
      identifier: 'goblin_warband',
      patrolRoute: [
        'crosspaths_field_old_crossing',
        'crosspaths_field_lake_shore',
        'crosspaths_field_cavern_mouth',
      ],
      monsterIdentifiers: ['goblin_raider', 'orc_brute'],
      minimumEnemyCount: 2,
      maximumEnemyCount: 3,
    },
  ],
  battleMapIdentifier: 'crosspaths_field',
  monsterLevelRange: { minimumLevel: 3, maximumLevel: 5 },
  rewardGoldPerEncounter: 25,
} satisfies ZoneContentEntry;
