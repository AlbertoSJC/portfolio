import type { QuestDefinition } from '../sim/guild/QuestDefinition';

/**
 * The tavern quest pool (M2). Quests are repeatable guild work — holding
 * the line around Wanderer's Rest against the Darkness (LORE.md voice).
 */
export const QUESTS: Record<string, QuestDefinition> = {
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
  the_masons_complaint: {
    identifier: 'the_masons_complaint',
    displayName: 'The Masons’ Complaint',
    description:
      'One walking stone and the wolves that follow it have the cutting crews hiding in their sheds. Small work, honest pay.',
    difficultyRank: 1,
    zoneIdentifier: 'quarry_path',
    battleMapIdentifier: 'old_quarry',
    enemySpawns: [
      { monsterIdentifier: 'stoneling', position: { column: 6, row: 2 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 3, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 10, row: 2 } },
    ],
    rewardGold: 80,
    rewardExperience: 55,
  },
  the_quarry_stirs: {
    identifier: 'the_quarry_stirs',
    displayName: 'The Quarry Stirs',
    description:
      'The old quarry’s stones have started walking, as stones do now. The masons want their pit back.',
    difficultyRank: 2,
    zoneIdentifier: 'quarry_path',
    battleMapIdentifier: 'old_quarry',
    enemySpawns: [
      { monsterIdentifier: 'stoneling', position: { column: 6, row: 2 } },
      { monsterIdentifier: 'stoneling', position: { column: 8, row: 2 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 3, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 10, row: 2 } },
    ],
    rewardGold: 140,
    rewardExperience: 95,
  },
  stone_and_root: {
    identifier: 'stone_and_root',
    displayName: 'Stone and Root',
    description:
      'Living rock below, walking trees above — the quarry rim is becoming a fortress that nobody built.',
    difficultyRank: 2,
    zoneIdentifier: 'quarry_path',
    battleMapIdentifier: 'old_quarry',
    enemySpawns: [
      { monsterIdentifier: 'stoneling', position: { column: 4, row: 2 } },
      { monsterIdentifier: 'gnarlroot', position: { column: 2, row: 2 } },
      { monsterIdentifier: 'gnarlroot', position: { column: 9, row: 3 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 7, row: 1 } },
    ],
    rewardGold: 150,
    rewardExperience: 100,
  },
  the_pit_floor_wakes: {
    identifier: 'the_pit_floor_wakes',
    displayName: 'The Pit Floor Wakes',
    description:
      'The deep cut is moving all at once now — stone, root, and a pale light that has no business underground. The masons have stopped asking for their pit back; they want it sealed.',
    difficultyRank: 3,
    zoneIdentifier: 'quarry_path',
    battleMapIdentifier: 'old_quarry',
    enemySpawns: [
      { monsterIdentifier: 'stoneling', position: { column: 4, row: 2 } },
      { monsterIdentifier: 'stoneling', position: { column: 6, row: 2 } },
      { monsterIdentifier: 'stoneling', position: { column: 8, row: 2 } },
      { monsterIdentifier: 'gnarlroot', position: { column: 2, row: 2 } },
      { monsterIdentifier: 'gnarlroot', position: { column: 9, row: 3 } },
      { monsterIdentifier: 'hollow_wisp', position: { column: 7, row: 1 } },
    ],
    rewardGold: 260,
    rewardExperience: 175,
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
};
