import type { DispatchQuestDefinition } from '../sim/guild/DispatchQuest';

/**
 * The tavern dispatch board (M4): errands that need one guild member, not
 * a battle party. Rewards sit deliberately below active-quest pay for the
 * time they take — quests stay the main loop, dispatches are the passive
 * side income (PRD §5 spirit).
 */
export const DISPATCH_QUESTS: Record<string, DispatchQuestDefinition> = {
  escort_the_carters: {
    identifier: 'escort_the_carters',
    displayName: 'Escort the Carters',
    description:
      'The wagons roll again, but the carters want a blade riding along until the forest stops watching them.',
    zoneIdentifier: 'north_road',
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
    durationInBattles: 3,
    rewardGold: 110,
    rewardExperience: 70,
  },
};
