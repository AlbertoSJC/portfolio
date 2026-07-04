import type { ZoneContentEntry } from './zoneContentEntry';

/** Bandit country on the Southline (LORE.md: Thorns Plain / Rocky Dwelling). */
export const THORNS_PLAIN_ZONE = {
  identifier: 'thorns_plain',
  displayName: 'Thorns Plain',
  description:
    'Grassland pinched by thorny outcrops, with the Southline rails running through. The bandits picked this ground on purpose.',
  worldMapPosition: { x: 0.44, y: 0.78 },
  entryLocationIdentifier: 'thorns_plain_gap',
  locations: [
    {
      identifier: 'thorns_plain_gap',
      displayName: 'The Thorn Gap',
      kind: 'landmark',
      position: { x: 0.07, y: 0.5 },
    },
    {
      identifier: 'thorns_plain_outcrops',
      displayName: 'The Outcrops',
      kind: 'landmark',
      position: { x: 0.3, y: 0.5 },
    },
    {
      identifier: 'thorns_plain_rail_cut',
      displayName: 'The Rail Cut',
      kind: 'landmark',
      position: { x: 0.52, y: 0.2 },
    },
    {
      identifier: 'thorns_plain_bull_run',
      displayName: 'The Bull Run',
      kind: 'landmark',
      position: { x: 0.52, y: 0.8 },
    },
    {
      identifier: 'thorns_plain_tavern',
      displayName: 'Rocky Dwelling',
      kind: 'tavern',
      position: { x: 0.88, y: 0.5 },
    },
  ],
  roads: [
    { fromLocationIdentifier: 'thorns_plain_gap', toLocationIdentifier: 'thorns_plain_outcrops' },
    { fromLocationIdentifier: 'thorns_plain_outcrops', toLocationIdentifier: 'thorns_plain_rail_cut' },
    { fromLocationIdentifier: 'thorns_plain_outcrops', toLocationIdentifier: 'thorns_plain_bull_run' },
    // The old drovers' shortcut between cut and run — the odd cycle that
    // keeps both patrols catchable.
    { fromLocationIdentifier: 'thorns_plain_rail_cut', toLocationIdentifier: 'thorns_plain_bull_run' },
    { fromLocationIdentifier: 'thorns_plain_rail_cut', toLocationIdentifier: 'thorns_plain_tavern' },
    { fromLocationIdentifier: 'thorns_plain_bull_run', toLocationIdentifier: 'thorns_plain_tavern' },
  ],
  roamingGroups: [
    {
      identifier: 'bandit_toll',
      patrolRoute: ['thorns_plain_outcrops', 'thorns_plain_rail_cut', 'thorns_plain_bull_run'],
      monsterIdentifiers: ['plains_bandit', 'goblin_raider'],
      minimumEnemyCount: 2,
      maximumEnemyCount: 3,
    },
    {
      identifier: 'the_bull',
      patrolRoute: ['thorns_plain_bull_run', 'thorns_plain_rail_cut', 'thorns_plain_outcrops'],
      monsterIdentifiers: ['minotaur', 'orc_brute'],
      minimumEnemyCount: 1,
      maximumEnemyCount: 2,
    },
  ],
  battleMapIdentifier: 'thorn_flats',
  // Silver-rank roads: the roadwatch turns back unproven guilds.
  minimumReputationTier: 'silver',
  monsterLevelRange: { minimumLevel: 5, maximumLevel: 7 },
  rewardGoldPerEncounter: 30,
} satisfies ZoneContentEntry;
