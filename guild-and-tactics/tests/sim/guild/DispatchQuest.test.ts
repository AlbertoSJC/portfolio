import { describe, expect, it } from 'vitest';
import {
  calculateDispatchSuccessChance,
  dispatchQuestIdentifiersForZone,
  isMemberDispatched,
  startDispatch,
  tickDispatchesAfterBattle,
  type DispatchQuestDefinition,
} from '../../../src/sim/guild/DispatchQuest';
import type { GuildMember, GuildState } from '../../../src/sim/guild/GuildState';
import { SeededRandomNumberGenerator } from '../../../src/sim/SeededRandomNumberGenerator';
import { DISPATCH_QUESTS } from '../../../src/content/dispatchQuests';
import { ZONES } from '../../../src/content/zones';

const TEST_DISPATCH: DispatchQuestDefinition = {
  identifier: 'test_errand',
  displayName: 'Test Errand',
  description: 'An errand used only in tests.',
  zoneIdentifier: 'north_road',
  difficultyRank: 1,
  durationInBattles: 2,
  rewardGold: 50,
  rewardExperience: 40,
};

function createAlwaysSucceedingRandomNumberGenerator(): SeededRandomNumberGenerator {
  const generator = new SeededRandomNumberGenerator(1);
  generator.rollChance = () => true;
  return generator;
}

function createAlwaysFailingRandomNumberGenerator(): SeededRandomNumberGenerator {
  const generator = new SeededRandomNumberGenerator(1);
  generator.rollChance = () => false;
  return generator;
}

function createTestMember(identifier: string): GuildMember {
  return {
    identifier,
    displayName: `Member ${identifier}`,
    raceIdentifier: 'human',
    classIdentifier: 'warrior',
    classLevelsReached: {},
    skillMasteryProgress: {},
    level: 2,
    experiencePoints: 0,
    equippedItemIdentifiers: {},
  };
}

function createTestGuild(memberIdentifiers: string[]): GuildState {
  return {
    gold: 100,
    roster: memberIdentifiers.map(createTestMember),
    consumableInventory: {},
    equipmentInventory: {},
    storeStock: {},
    questIdentifiersOnBoard: {},
    recruitsOnOffer: [],
    activeDispatches: [],
    completedQuestCount: 0,
  };
}

describe('startDispatch', () => {
  it('sends an available member away for the quest duration', () => {
    const guild = createTestGuild(['member_a']);
    expect(startDispatch(guild, TEST_DISPATCH, 'member_a')).toBe(true);
    expect(isMemberDispatched(guild, 'member_a')).toBe(true);
    expect(guild.activeDispatches).toEqual([
      { dispatchQuestIdentifier: 'test_errand', memberIdentifier: 'member_a', remainingBattles: 2 },
    ]);
  });

  it('refuses an unknown member', () => {
    const guild = createTestGuild(['member_a']);
    expect(startDispatch(guild, TEST_DISPATCH, 'member_ghost')).toBe(false);
    expect(guild.activeDispatches).toEqual([]);
  });

  it('refuses a member who is already away', () => {
    const guild = createTestGuild(['member_a']);
    startDispatch(guild, TEST_DISPATCH, 'member_a');
    const secondErrand = { ...TEST_DISPATCH, identifier: 'second_errand' };
    expect(startDispatch(guild, secondErrand, 'member_a')).toBe(false);
  });

  it('refuses a quest that is already underway with someone else', () => {
    const guild = createTestGuild(['member_a', 'member_b']);
    startDispatch(guild, TEST_DISPATCH, 'member_a');
    expect(startDispatch(guild, TEST_DISPATCH, 'member_b')).toBe(false);
  });
});

describe('tickDispatchesAfterBattle', () => {
  const dispatchTable = { [TEST_DISPATCH.identifier]: TEST_DISPATCH };

  it('counts down and resolves at zero: gold paid, experience earned, dispatch removed', () => {
    const guild = createTestGuild(['member_a']);
    startDispatch(guild, TEST_DISPATCH, 'member_a');
    const randomNumberGenerator = createAlwaysSucceedingRandomNumberGenerator();

    expect(tickDispatchesAfterBattle(guild, dispatchTable, randomNumberGenerator)).toEqual([]);
    expect(guild.activeDispatches[0]?.remainingBattles).toBe(1);
    expect(guild.gold).toBe(100);

    const resolved = tickDispatchesAfterBattle(guild, dispatchTable, randomNumberGenerator);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.dispatchQuest.identifier).toBe('test_errand');
    expect(resolved[0]?.member.identifier).toBe('member_a');
    expect(resolved[0]?.outcome).toBe('success');
    expect(guild.gold).toBe(150);
    expect(guild.roster[0]?.experiencePoints).toBe(40);
    expect(guild.activeDispatches).toEqual([]);
    expect(isMemberDispatched(guild, 'member_a')).toBe(false);
  });

  it('resolves independent dispatches on their own clocks', () => {
    const guild = createTestGuild(['member_a', 'member_b']);
    const shortErrand = { ...TEST_DISPATCH, identifier: 'short_errand', durationInBattles: 1 };
    const dispatchTables = {
      [TEST_DISPATCH.identifier]: TEST_DISPATCH,
      [shortErrand.identifier]: shortErrand,
    };
    startDispatch(guild, TEST_DISPATCH, 'member_a');
    startDispatch(guild, shortErrand, 'member_b');
    const randomNumberGenerator = createAlwaysSucceedingRandomNumberGenerator();

    const firstBattle = tickDispatchesAfterBattle(guild, dispatchTables, randomNumberGenerator);
    expect(firstBattle.map((report) => report.member.identifier)).toEqual(['member_b']);
    expect(isMemberDispatched(guild, 'member_a')).toBe(true);

    const secondBattle = tickDispatchesAfterBattle(guild, dispatchTables, randomNumberGenerator);
    expect(secondBattle.map((report) => report.member.identifier)).toEqual(['member_a']);
    expect(guild.activeDispatches).toEqual([]);
  });

  it('reports level-ups earned from the dispatch experience', () => {
    const guild = createTestGuild(['member_a']);
    const generousErrand = { ...TEST_DISPATCH, durationInBattles: 1, rewardExperience: 10000 };
    startDispatch(guild, generousErrand, 'member_a');
    const resolved = tickDispatchesAfterBattle(
      guild,
      { [generousErrand.identifier]: generousErrand },
      createAlwaysSucceedingRandomNumberGenerator(),
    );
    expect(resolved[0]?.levelsGained).toBeGreaterThan(0);
    expect(guild.roster[0]?.level).toBeGreaterThan(2);
  });

  it('pays no reward and reports failure when the roll fails', () => {
    const guild = createTestGuild(['member_a']);
    const shortErrand = { ...TEST_DISPATCH, durationInBattles: 1 };
    startDispatch(guild, shortErrand, 'member_a');
    const resolved = tickDispatchesAfterBattle(
      guild,
      { [shortErrand.identifier]: shortErrand },
      createAlwaysFailingRandomNumberGenerator(),
    );
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.outcome).toBe('failure');
    expect(resolved[0]?.levelsGained).toBe(0);
    expect(guild.gold).toBe(100);
    expect(guild.roster[0]?.experiencePoints).toBe(0);
    expect(guild.activeDispatches).toEqual([]);
    expect(isMemberDispatched(guild, 'member_a')).toBe(false);
  });
});

describe('calculateDispatchSuccessChance', () => {
  it('saturates near-certain success for a strong member on an easy dispatch', () => {
    const member = createTestMember('member_a');
    member.level = 20;
    const easyErrand = { ...TEST_DISPATCH, difficultyRank: 1 as const, durationInBattles: 1 };
    expect(calculateDispatchSuccessChance(member, easyErrand)).toBe(0.99);
  });

  it('bottoms out for a weak member on a long, high-rank dispatch', () => {
    const member = createTestMember('member_a');
    member.level = 1;
    const hardErrand = { ...TEST_DISPATCH, difficultyRank: 3 as const, durationInBattles: 10 };
    expect(calculateDispatchSuccessChance(member, hardErrand)).toBe(0.05);
  });

  it('is worse for longer dispatches at the same rank and level', () => {
    const member = createTestMember('member_a');
    const shortErrand = { ...TEST_DISPATCH, difficultyRank: 2 as const, durationInBattles: 1 };
    const longErrand = { ...TEST_DISPATCH, difficultyRank: 2 as const, durationInBattles: 5 };
    expect(calculateDispatchSuccessChance(member, longErrand)).toBeLessThan(
      calculateDispatchSuccessChance(member, shortErrand),
    );
  });
});

describe('dispatch content validity', () => {
  it('every dispatch quest belongs to an existing zone with sane numbers', () => {
    for (const dispatchQuest of Object.values(DISPATCH_QUESTS)) {
      expect(ZONES[dispatchQuest.zoneIdentifier], `zone for ${dispatchQuest.identifier}`).toBeDefined();
      expect([1, 2, 3], dispatchQuest.identifier).toContain(dispatchQuest.difficultyRank);
      expect(dispatchQuest.durationInBattles, dispatchQuest.identifier).toBeGreaterThanOrEqual(1);
      expect(dispatchQuest.rewardGold, dispatchQuest.identifier).toBeGreaterThanOrEqual(0);
      expect(dispatchQuest.rewardExperience, dispatchQuest.identifier).toBeGreaterThanOrEqual(0);
    }
  });

  it('every zone posts at least one dispatch quest', () => {
    for (const zone of Object.values(ZONES)) {
      expect(
        dispatchQuestIdentifiersForZone(zone, DISPATCH_QUESTS).length,
        `dispatch quests for ${zone.identifier}`,
      ).toBeGreaterThan(0);
    }
  });
});
