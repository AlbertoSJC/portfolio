import type { QuestContentEntry } from './questContentEntry';

/** Masons' Rest's board — the quarry's stones keep standing up. */
export const QUARRY_PATH_QUESTS = {
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
} satisfies Record<string, QuestContentEntry>;
