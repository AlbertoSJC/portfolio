import type { QuestContentEntry } from './questContentEntry';

/** Carters' Respite's board — wolf-and-root work on the starter road. */
export const NORTH_ROAD_QUESTS = {
  wolves_on_the_north_road: {
    identifier: 'wolves_on_the_north_road',
    displayName: 'Wolves on the North Road',
    description:
      'Carters refuse the forest road again. Thin out the twisted wolves so the wagons roll.',
    difficultyRank: 1,
    zoneIdentifier: 'north_road',
    battleMapIdentifier: 'forest_clearing',
    enemySpawns: [
      { monsterIdentifier: 'twisted_wolf', position: { column: 2, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 5, row: 0 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 9, row: 1 } },
    ],
    rewardGold: 70,
    rewardExperience: 50,
  },
  roots_run_deep: {
    identifier: 'roots_run_deep',
    displayName: 'Roots Run Deep',
    description:
      'The walking trees have reached the wood-cutters’ clearing. Burn them out before the forest closes its fist.',
    difficultyRank: 1,
    zoneIdentifier: 'north_road',
    battleMapIdentifier: 'forest_clearing',
    enemySpawns: [
      { monsterIdentifier: 'gnarlroot', position: { column: 4, row: 2 } },
      { monsterIdentifier: 'gnarlroot', position: { column: 8, row: 2 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 6, row: 1 } },
    ],
    rewardGold: 85,
    rewardExperience: 60,
  },
  the_pack_alpha: {
    identifier: 'the_pack_alpha',
    displayName: 'The Pack Alpha',
    description:
      'A whole twisted pack runs the north woods now, and something fast and tusked runs with it. Bring friends.',
    difficultyRank: 3,
    zoneIdentifier: 'north_road',
    battleMapIdentifier: 'forest_clearing',
    enemySpawns: [
      { monsterIdentifier: 'twisted_wolf', position: { column: 2, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 5, row: 0 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 9, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 4, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 7, row: 2 } },
      { monsterIdentifier: 'twisted_boar', position: { column: 6, row: 0 } },
    ],
    rewardGold: 220,
    rewardExperience: 150,
  },
} satisfies Record<string, QuestContentEntry>;
