import type { DispatchQuestDefinition } from '../sim/guild/DispatchQuest';
import type { ZoneIdentifier } from './zones';

/**
 * A dispatch as authored in content: its zone reference is compile-checked
 * against the zone record.
 */
type DispatchQuestContentEntry = DispatchQuestDefinition & {
  zoneIdentifier: ZoneIdentifier;
};

/**
 * The tavern dispatch board (M4): errands that need one guild member, not
 * a battle party. Rewards sit deliberately below active-quest pay for the
 * time they take — quests stay the main loop, dispatches are the passive
 * side income (PRD §5 spirit).
 */
const DISPATCH_QUEST_ENTRIES = {
  escort_the_carters: {
    identifier: 'escort_the_carters',
    displayName: 'Escort the Carters',
    description:
      'The wagons roll again, but the carters want a blade riding along until the forest stops watching them.',
    zoneIdentifier: 'north_road',
    difficultyRank: 1,
    durationInBattles: 2,
    rewardGold: 60,
    rewardExperience: 40,
  },
  walk_the_forest_bounds: {
    identifier: 'walk_the_forest_bounds',
    displayName: 'Walk the Forest Bounds',
    description:
      'Walk the wood-cutters’ boundary stones and mark what moves beyond them. Long work, quiet pay.',
    zoneIdentifier: 'north_road',
    difficultyRank: 2,
    durationInBattles: 4,
    rewardGold: 140,
    rewardExperience: 90,
  },
  guide_the_peat_cutters: {
    identifier: 'guide_the_peat_cutters',
    displayName: 'Guide the Peat-Cutters',
    description:
      'The peat-cutters know the mire better than anyone — except at night. Walk them home for a week of evenings.',
    zoneIdentifier: 'marsh_trail',
    difficultyRank: 1,
    durationInBattles: 3,
    rewardGold: 90,
    rewardExperience: 60,
  },
  watch_the_masons_camp: {
    identifier: 'watch_the_masons_camp',
    displayName: "Watch the Masons' Camp",
    description:
      'The masons sleep badly with the quarry stirring below. A guild badge by their fire buys them rest.',
    zoneIdentifier: 'quarry_path',
    difficultyRank: 2,
    durationInBattles: 3,
    rewardGold: 110,
    rewardExperience: 70,
  },
  walk_the_sleepers_home: {
    identifier: 'walk_the_sleepers_home',
    displayName: 'Walk the Sleepers Home',
    description:
      'Someone wanders into the blue field every market day, and someone has to carry them out before the blooms notice. Light work, if you hold your breath.',
    zoneIdentifier: 'slumber_meadow',
    difficultyRank: 1,
    durationInBattles: 2,
    rewardGold: 55,
    rewardExperience: 35,
  },
  mind_the_halts_freight: {
    identifier: 'mind_the_halts_freight',
    displayName: "Mind the Halt's Freight",
    description:
      'Crates stack up at Crosspaths Halt between trains, and the goblins count them from the tree line. Sit on the pile until the Heartline comes.',
    zoneIdentifier: 'crosspaths_field',
    difficultyRank: 1,
    durationInBattles: 3,
    rewardGold: 100,
    rewardExperience: 65,
  },
  ride_the_southline: {
    identifier: 'ride_the_southline',
    displayName: 'Ride the Southline',
    description:
      'A freight run to Dusthalt wants one more blade in the guard car. The pay reflects what the last guard didn’t come back with.',
    zoneIdentifier: 'thorns_plain',
    difficultyRank: 2,
    durationInBattles: 3,
    rewardGold: 130,
    rewardExperience: 80,
  },
  tend_the_shrine_lamps: {
    identifier: 'tend_the_shrine_lamps',
    displayName: 'Tend the Shrine Lamps',
    description:
      'The Wardens are stretched thin and the lamps at Breir’s and Taurk’s shrines must not go out. Long nights, deep wood, good coin.',
    zoneIdentifier: 'breirwood',
    difficultyRank: 3,
    durationInBattles: 4,
    rewardGold: 170,
    rewardExperience: 105,
  },
} satisfies Record<string, DispatchQuestContentEntry>;

export const DISPATCH_QUESTS: Record<string, DispatchQuestDefinition> = DISPATCH_QUEST_ENTRIES;
