import { describe, expect, it } from 'vitest';
import { SeededRandomNumberGenerator } from '../../../src/sim/SeededRandomNumberGenerator';
import type { GuildState } from '../../../src/sim/guild/GuildState';
import { QUEST_BOARD_SIZE, completeQuestOnBoard, refillQuestBoard } from '../../../src/sim/guild/QuestBoard';

const ALL_TEST_QUESTS = ['quest_a', 'quest_b', 'quest_c', 'quest_d', 'quest_e', 'quest_f'];

function createTestGuild(): GuildState {
  return {
    gold: 0,
    roster: [],
    consumableInventory: {},
    equipmentInventory: {},
    storeStock: {},
    questIdentifiersOnBoard: [],
    recruitsOnOffer: [],
    completedQuestCount: 0,
  };
}

describe('refillQuestBoard', () => {
  it('fills the board to its size without duplicates', () => {
    const guild = createTestGuild();
    refillQuestBoard(guild, ALL_TEST_QUESTS, new SeededRandomNumberGenerator(5));
    expect(guild.questIdentifiersOnBoard).toHaveLength(QUEST_BOARD_SIZE);
    expect(new Set(guild.questIdentifiersOnBoard).size).toBe(QUEST_BOARD_SIZE);
  });
});

describe('completeQuestOnBoard', () => {
  it('removes the finished quest, counts it, and draws a replacement', () => {
    const guild = createTestGuild();
    const randomNumberGenerator = new SeededRandomNumberGenerator(5);
    refillQuestBoard(guild, ALL_TEST_QUESTS, randomNumberGenerator);
    const completedIdentifier = guild.questIdentifiersOnBoard[0];
    if (completedIdentifier === undefined) {
      throw new Error('Board unexpectedly empty');
    }
    completeQuestOnBoard(guild, completedIdentifier, ALL_TEST_QUESTS, randomNumberGenerator);
    expect(guild.completedQuestCount).toBe(1);
    expect(guild.questIdentifiersOnBoard).toHaveLength(QUEST_BOARD_SIZE);
    expect(new Set(guild.questIdentifiersOnBoard).size).toBe(QUEST_BOARD_SIZE);
  });
});
