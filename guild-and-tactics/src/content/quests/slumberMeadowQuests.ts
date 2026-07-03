import type { QuestContentEntry } from './questContentEntry';

/** Travellers' Rest's board — lost sleepers, new roofs, and the night rumor. */
export const SLUMBER_MEADOW_QUESTS = {
  asleep_among_the_flowers: {
    identifier: 'asleep_among_the_flowers',
    displayName: 'Asleep Among the Flowers',
    description:
      'Two gatherers dozed off in the blue field, and the blooms that put them under are patient eaters. Wake the sleepers — kill the garden.',
    difficultyRank: 1,
    zoneIdentifier: 'slumber_meadow',
    battleMapIdentifier: 'slumber_meadow',
    enemySpawns: [
      { monsterIdentifier: 'maneater_bloom', position: { column: 4, row: 2 } },
      { monsterIdentifier: 'maneater_bloom', position: { column: 6, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 9, row: 1 } },
    ],
    rewardGold: 60,
    rewardExperience: 45,
  },
  raise_the_roofbeams: {
    identifier: 'raise_the_roofbeams',
    displayName: 'Raise the Roofbeams',
    description:
      'Settlers are building at the meadow’s edge, and the wolves treat half-finished walls as an invitation. Stand guard until the beams are up.',
    difficultyRank: 1,
    zoneIdentifier: 'slumber_meadow',
    battleMapIdentifier: 'slumber_meadow',
    enemySpawns: [
      { monsterIdentifier: 'twisted_wolf', position: { column: 2, row: 1 } },
      { monsterIdentifier: 'twisted_wolf', position: { column: 5, row: 0 } },
      { monsterIdentifier: 'maneater_bloom', position: { column: 6, row: 1 } },
    ],
    rewardGold: 65,
    rewardExperience: 45,
  },
  the_night_watch: {
    identifier: 'the_night_watch',
    displayName: 'The Night Watch',
    description:
      'The stories were true: when the rain stops after dark, pale figures walk the flower field. Travellers’ Rest wants one night it can sleep through.',
    difficultyRank: 2,
    zoneIdentifier: 'slumber_meadow',
    battleMapIdentifier: 'slumber_meadow',
    enemySpawns: [
      { monsterIdentifier: 'meadow_ghost', position: { column: 2, row: 1 } },
      { monsterIdentifier: 'meadow_ghost', position: { column: 6, row: 1 } },
      { monsterIdentifier: 'meadow_ghost', position: { column: 9, row: 1 } },
      { monsterIdentifier: 'maneater_bloom', position: { column: 4, row: 2 } },
    ],
    rewardGold: 125,
    rewardExperience: 85,
  },
} satisfies Record<string, QuestContentEntry>;
