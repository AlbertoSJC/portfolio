import { describe, expect, it } from 'vitest';
import { SeededRandomNumberGenerator } from '../../../src/sim/SeededRandomNumberGenerator';
import type { GuildState } from '../../../src/sim/guild/GuildState';
import { QUEST_BOARD_SIZE, completeQuestOnBoard, refillQuestBoard } from '../../../src/sim/guild/QuestBoard';

const ZONE_A = 'north_road';
const ZONE_B = 'marsh_trail';
const ALL_TEST_QUESTS = ['quest_a', 'quest_b', 'quest_c', 'quest_d', 'quest_e', 'quest_f'];

function createTestGuild(): GuildState {
  return {
    gold: 0,
    roster: [],
    consumableInventory: {},
    equipmentInventory: {},
    storeStock: {},
    questIdentifiersOnBoard: {},
    recruitsOnOffer: [],
    activeDispatches: [],
    completedQuestCount: 0,
  };
}

describe('refillQuestBoard', () => {
  it('fills the zone board to its size without duplicates', () => {
    const guild = createTestGuild();
    refillQuestBoard(guild, ZONE_A, ALL_TEST_QUESTS, new SeededRandomNumberGenerator(5));
    const board = guild.questIdentifiersOnBoard[ZONE_A] ?? [];
    expect(board).toHaveLength(QUEST_BOARD_SIZE);
    expect(new Set(board).size).toBe(QUEST_BOARD_SIZE);
  });

  it('keeps each zone board independent', () => {
    const guild = createTestGuild();
    const randomNumberGenerator = new SeededRandomNumberGenerator(5);
    refillQuestBoard(guild, ZONE_A, ALL_TEST_QUESTS, randomNumberGenerator);
    expect(guild.questIdentifiersOnBoard[ZONE_B]).toBeUndefined();
    refillQuestBoard(guild, ZONE_B, ALL_TEST_QUESTS, randomNumberGenerator);
    expect(guild.questIdentifiersOnBoard[ZONE_B]).toHaveLength(QUEST_BOARD_SIZE);
  });
});

describe('completeQuestOnBoard', () => {
  it('removes the finished quest, counts it, and draws a replacement', () => {
    const guild = createTestGuild();
    const randomNumberGenerator = new SeededRandomNumberGenerator(5);
    refillQuestBoard(guild, ZONE_A, ALL_TEST_QUESTS, randomNumberGenerator);
    const completedIdentifier = guild.questIdentifiersOnBoard[ZONE_A]?.[0];
    if (completedIdentifier === undefined) {
      throw new Error('Board unexpectedly empty');
    }
    completeQuestOnBoard(guild, ZONE_A, completedIdentifier, ALL_TEST_QUESTS, randomNumberGenerator);
    expect(guild.completedQuestCount).toBe(1);
    const board = guild.questIdentifiersOnBoard[ZONE_A] ?? [];
    expect(board).toHaveLength(QUEST_BOARD_SIZE);
    expect(new Set(board).size).toBe(QUEST_BOARD_SIZE);
  });
});
