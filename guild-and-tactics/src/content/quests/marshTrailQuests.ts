import type { QuestContentEntry } from './questContentEntry';

/** Peat-Cutters' Haven's board — boars, wisps, and worse in the mire. */
export const MARSH_TRAIL_QUESTS = {
  boar_season: {
    identifier: 'boar_season',
    displayName: 'Boar Season',
    description:
      'Twisted boars are rooting up the causeway dikes. The marsh farmers will pay to keep their feet dry.',
    difficultyRank: 1,
    zoneIdentifier: 'marsh_trail',
    battleMapIdentifier: 'marsh_road',
    enemySpawns: [
      { monsterIdentifier: 'twisted_boar', position: { column: 3, row: 2 } },
      { monsterIdentifier: 'twisted_boar', position: { column: 8, row: 2 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 5, row: 3 } },
    ],
    rewardGold: 90,
    rewardExperience: 60,
  },
  fangs_at_the_ford: {
    identifier: 'fangs_at_the_ford',
    displayName: 'Fangs at the Ford',
    description:
      'Twisted wolves have come down from the woods to hunt the causeway crossings. Clear the ford before the fish-carts stop running.',
    difficultyRank: 1,
    zoneIdentifier: 'marsh_trail',
    battleMapIdentifier: 'marsh_road',
    enemySpawns: [
      { monsterIdentifier: 'twisted_wolf', position: { column: 4, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 8, row: 1 } },
      { monsterIdentifier: 'twisted_boar', position: { column: 6, row: 2 } },
    ],
    rewardGold: 75,
    rewardExperience: 50,
  },
  lights_in_the_mire: {
    identifier: 'lights_in_the_mire',
    displayName: 'Lights in the Mire',
    description:
      'Pale lights drift over the marsh road by night, and travelers follow them under. Snuff them out.',
    difficultyRank: 2,
    zoneIdentifier: 'marsh_trail',
    battleMapIdentifier: 'marsh_road',
    enemySpawns: [
      { monsterIdentifier: 'hollow_wisp', position: { column: 4, row: 1 } },
      { monsterIdentifier: 'hollow_wisp', position: { column: 8, row: 1 } },
      { monsterIdentifier: 'hollow_wisp', position: { column: 2, row: 3 } },
      { monsterIdentifier: 'twisted_boar', position: { column: 6, row: 2 } },
    ],
    rewardGold: 130,
    rewardExperience: 90,
  },
  heart_of_the_dark_grove: {
    identifier: 'heart_of_the_dark_grove',
    displayName: 'Heart of the Dark Grove',
    description:
      'Past the drowned willows the marsh light gathers thick, and the trees walk in circles around something. Break it.',
    difficultyRank: 3,
    zoneIdentifier: 'marsh_trail',
    battleMapIdentifier: 'marsh_road',
    enemySpawns: [
      { monsterIdentifier: 'hollow_wisp', position: { column: 4, row: 1 } },
      { monsterIdentifier: 'hollow_wisp', position: { column: 8, row: 1 } },
      { monsterIdentifier: 'gnarlroot', position: { column: 3, row: 2 } },
      { monsterIdentifier: 'gnarlroot', position: { column: 7, row: 2 } },
      { monsterIdentifier: 'stoneling', position: { column: 5, row: 3 } },
    ],
    rewardGold: 250,
    rewardExperience: 170,
  },
} satisfies Record<string, QuestContentEntry>;
