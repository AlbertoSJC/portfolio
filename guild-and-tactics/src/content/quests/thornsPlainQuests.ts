import type { QuestContentEntry } from './questContentEntry';

/** Rocky Dwelling's board — bandits on the Southline and horns in the thorns. */
export const THORNS_PLAIN_QUESTS = {
  clearing_the_gap: {
    identifier: 'clearing_the_gap',
    displayName: 'Clearing the Gap',
    description:
      'The only cart-width gap in the thorns has a welcoming committee. Rocky Dwelling’s store shelves stay empty until it doesn’t.',
    difficultyRank: 1,
    zoneIdentifier: 'thorns_plain',
    battleMapIdentifier: 'thorn_flats',
    enemySpawns: [
      { monsterIdentifier: 'goblin_raider', position: { column: 3, row: 0 } },
      { monsterIdentifier: 'goblin_raider', position: { column: 7, row: 2 } },
      { monsterIdentifier: 'plains_bandit', position: { column: 5, row: 1 } },
    ],
    rewardGold: 85,
    rewardExperience: 60,
  },
  the_southline_toll: {
    identifier: 'the_southline_toll',
    displayName: 'The Southline Toll',
    description:
      'Bandits felled a thorn tree across the rail cut and are working the stopped freight cars like a market stall. The line pays well to reopen.',
    difficultyRank: 2,
    zoneIdentifier: 'thorns_plain',
    battleMapIdentifier: 'thorn_flats',
    enemySpawns: [
      { monsterIdentifier: 'plains_bandit', position: { column: 3, row: 0 } },
      { monsterIdentifier: 'plains_bandit', position: { column: 5, row: 1 } },
      { monsterIdentifier: 'plains_bandit', position: { column: 9, row: 2 } },
      { monsterIdentifier: 'minotaur', position: { column: 6, row: 3 } },
    ],
    rewardGold: 155,
    rewardExperience: 105,
  },
  the_bull_of_the_flats: {
    identifier: 'the_bull_of_the_flats',
    displayName: 'The Bull of the Flats',
    description:
      'The bandits are gone — driven out by what moved into the outcrops. Two sets of horns now, and the thorns shake when they argue. Settle it.',
    difficultyRank: 3,
    zoneIdentifier: 'thorns_plain',
    battleMapIdentifier: 'thorn_flats',
    enemySpawns: [
      { monsterIdentifier: 'minotaur', position: { column: 5, row: 1 } },
      { monsterIdentifier: 'minotaur', position: { column: 7, row: 2 } },
      { monsterIdentifier: 'orc_brute', position: { column: 2, row: 2 } },
      { monsterIdentifier: 'plains_bandit', position: { column: 3, row: 0 } },
      { monsterIdentifier: 'plains_bandit', position: { column: 9, row: 2 } },
    ],
    rewardGold: 250,
    rewardExperience: 170,
  },
} satisfies Record<string, QuestContentEntry>;
