import type { QuestContentEntry } from './questContentEntry';

/** Crosspaths Halt's board — goblin trouble where the roads meet. */
export const CROSSPATHS_FIELD_QUESTS = {
  toll_at_the_old_crossing: {
    identifier: 'toll_at_the_old_crossing',
    displayName: 'Toll at the Old Crossing',
    description:
      'Goblins have started charging a "toll" where the two roads meet — paid in whatever the traveler was carrying, including fingers. Waive it.',
    difficultyRank: 1,
    zoneIdentifier: 'crosspaths_field',
    battleMapIdentifier: 'crosspaths_field',
    enemySpawns: [
      { monsterIdentifier: 'goblin_raider', position: { column: 2, row: 1 } },
      { monsterIdentifier: 'goblin_raider', position: { column: 5, row: 2 } },
      { monsterIdentifier: 'goblin_raider', position: { column: 8, row: 2 } },
    ],
    rewardGold: 75,
    rewardExperience: 55,
  },
  smoke_from_the_caverns: {
    identifier: 'smoke_from_the_caverns',
    displayName: 'Smoke from the Caverns',
    description:
      'Cookfire smoke is rising from the cavern mouth, which means the goblins found something big enough to guard the door. Two somethings, by the footprints.',
    difficultyRank: 2,
    zoneIdentifier: 'crosspaths_field',
    battleMapIdentifier: 'crosspaths_field',
    enemySpawns: [
      { monsterIdentifier: 'orc_brute', position: { column: 4, row: 1 } },
      { monsterIdentifier: 'orc_brute', position: { column: 6, row: 1 } },
      { monsterIdentifier: 'goblin_raider', position: { column: 2, row: 1 } },
      { monsterIdentifier: 'goblin_raider', position: { column: 8, row: 2 } },
    ],
    rewardGold: 140,
    rewardExperience: 95,
  },
} satisfies Record<string, QuestContentEntry>;
