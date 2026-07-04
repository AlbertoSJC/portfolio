import type { ZoneContentEntry } from './zoneContentEntry';

/** The masons' trail feeding Taurk's Wisdom its stone (LORE.md: Quarry Path). */
export const QUARRY_PATH_ZONE = {
  identifier: 'quarry_path',
  displayName: 'The Quarry Path',
  description:
    'The old masons’ trail up to the quarry rim. The stones there have a habit of standing up.',
  worldMapPosition: { x: 0.68, y: 0.3 },
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
    {
      identifier: 'quarry_path_tavern',
      displayName: "Masons' Rest",
      kind: 'tavern',
      position: { x: 0.9, y: 0.5 },
    },
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
  // Silver-rank roads: the roadwatch turns back unproven guilds.
  minimumReputationTier: 'silver',
  monsterLevelRange: { minimumLevel: 4, maximumLevel: 6 },
  rewardGoldPerEncounter: 25,
} satisfies ZoneContentEntry;
