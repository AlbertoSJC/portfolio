import type { QuestContentEntry } from './questContentEntry';

/** Highbranch's board — the Shrine Wardens' work in the deep wood. */
export const BREIRWOOD_QUESTS = {
  boars_on_the_shrine_path: {
    identifier: 'boars_on_the_shrine_path',
    displayName: 'Boars on the Shrine Path',
    description:
      'Thornback boars have torn up the pilgrim path between the shrines, and the Shrine Wardens are needed at their posts, not herding pigs.',
    difficultyRank: 1,
    zoneIdentifier: 'breirwood',
    battleMapIdentifier: 'breirwood_deep',
    enemySpawns: [
      { monsterIdentifier: 'thornback_boar', position: { column: 3, row: 3 } },
      { monsterIdentifier: 'thornback_boar', position: { column: 8, row: 2 } },
      { monsterIdentifier: 'dire_owl', position: { column: 5, row: 1 } },
    ],
    rewardGold: 90,
    rewardExperience: 65,
  },
  the_unquiet_stand: {
    identifier: 'the_unquiet_stand',
    displayName: 'The Unquiet Stand',
    description:
      'Two of the deep stand’s walkers have stopped being peaceful, and the Wardens can’t say why. They ask that it be done quickly, and burned after.',
    difficultyRank: 2,
    zoneIdentifier: 'breirwood',
    battleMapIdentifier: 'breirwood_deep',
    enemySpawns: [
      { monsterIdentifier: 'treewalker', position: { column: 4, row: 2 } },
      { monsterIdentifier: 'treewalker', position: { column: 8, row: 2 } },
      { monsterIdentifier: 'wind_sprite', position: { column: 6, row: 2 } },
    ],
    rewardGold: 165,
    rewardExperience: 110,
  },
  when_the_forest_marches: {
    identifier: 'when_the_forest_marches',
    displayName: 'When the Forest Marches',
    description:
      'The wind has gone wrong around Breir’s shrine and the trees are moving toward Highbranch in step — in step. The Wardens are calling it a march.',
    difficultyRank: 3,
    zoneIdentifier: 'breirwood',
    battleMapIdentifier: 'breirwood_deep',
    enemySpawns: [
      { monsterIdentifier: 'treewalker', position: { column: 1, row: 1 } },
      { monsterIdentifier: 'treewalker', position: { column: 8, row: 1 } },
      { monsterIdentifier: 'thornback_boar', position: { column: 3, row: 3 } },
      { monsterIdentifier: 'wind_sprite', position: { column: 5, row: 1 } },
      { monsterIdentifier: 'wind_sprite', position: { column: 6, row: 2 } },
    ],
    rewardGold: 280,
    rewardExperience: 190,
  },
} satisfies Record<string, QuestContentEntry>;
