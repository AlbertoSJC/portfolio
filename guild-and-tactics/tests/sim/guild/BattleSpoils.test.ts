import { describe, expect, it } from 'vitest';
import { applyBattleSpoils, type BattleSpoilsInput } from '../../../src/sim/guild/BattleSpoils';
import type { DispatchQuestDefinition } from '../../../src/sim/guild/DispatchQuest';
import { startDispatch } from '../../../src/sim/guild/DispatchQuest';
import type { GuildMember, GuildState } from '../../../src/sim/guild/GuildState';
import { experienceForDefeatingEnemy } from '../../../src/sim/progression/ExperienceAndLevels';
import { EQUIPMENT } from '../../../src/content/equipment';

function createTestMember(identifier: string, overrides: Partial<GuildMember> = {}): GuildMember {
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
    ...overrides,
  };
}

function createTestGuild(members: GuildMember[]): GuildState {
  return {
    gold: 100,
    roster: members,
    consumableInventory: { potion: 3 },
    equipmentInventory: {},
    storeStock: {},
    questIdentifiersOnBoard: {},
    recruitsOnOffer: [],
    activeDispatches: [],
    completedQuestCount: 0,
  };
}

function createSpoilsInput(overrides: Partial<BattleSpoilsInput> = {}): BattleSpoilsInput {
  return {
    outcome: 'victory',
    goldRewardOnVictory: 70,
    bonusExperienceOnVictory: 50,
    defeatedEnemyLevels: [3, 3],
    deployedMemberIdentifiers: ['member_a'],
    skillUseCountsByMemberIdentifier: {},
    remainingItemPouch: { potion: 1 },
    ...overrides,
  };
}

const KILL_EXPERIENCE_FOR_TWO_LEVEL_THREES = experienceForDefeatingEnemy(3) * 2;

describe('applyBattleSpoils', () => {
  it('pays gold and bonus experience on victory, on top of kill experience', () => {
    const guild = createTestGuild([createTestMember('member_a')]);
    const report = applyBattleSpoils(guild, createSpoilsInput(), EQUIPMENT, {});
    expect(guild.gold).toBe(170);
    expect(report.goldAwarded).toBe(70);
    expect(report.experiencePerMember).toBe(KILL_EXPERIENCE_FOR_TWO_LEVEL_THREES + 50);
    expect(report.defeatedEnemyCount).toBe(2);
  });

  it('keeps kill experience but forfeits gold and bonus on defeat and flee alike', () => {
    for (const outcome of ['defeat', 'fled'] as const) {
      const guild = createTestGuild([createTestMember('member_a')]);
      const report = applyBattleSpoils(guild, createSpoilsInput({ outcome }), EQUIPMENT, {});
      expect(guild.gold, outcome).toBe(100);
      expect(report.goldAwarded, outcome).toBe(0);
      expect(report.experiencePerMember, outcome).toBe(KILL_EXPERIENCE_FOR_TWO_LEVEL_THREES);
    }
  });

  it('hands the remaining item pouch back to the guild inventory', () => {
    const guild = createTestGuild([createTestMember('member_a')]);
    applyBattleSpoils(guild, createSpoilsInput({ remainingItemPouch: { ether: 2 } }), EQUIPMENT, {});
    expect(guild.consumableInventory).toEqual({ ether: 2 });
  });

  it('reports level-ups from the earned experience', () => {
    const guild = createTestGuild([createTestMember('member_a')]);
    const report = applyBattleSpoils(
      guild,
      createSpoilsInput({ bonusExperienceOnVictory: 10000 }),
      EQUIPMENT,
      {},
    );
    expect(report.levelUps).toHaveLength(1);
    expect(report.levelUps[0]?.member.level).toBeGreaterThan(2);
  });

  it('credits equipment-skill mastery from the battle uses, whatever the outcome', () => {
    const guild = createTestGuild([
      createTestMember('member_a', {
        equippedItemIdentifiers: { weapon: 'greathorn_cleaver' },
        skillMasteryProgress: { cleaving_arc: 2 },
      }),
    ]);
    const report = applyBattleSpoils(
      guild,
      createSpoilsInput({
        outcome: 'defeat',
        skillUseCountsByMemberIdentifier: { member_a: { cleaving_arc: 1 } },
      }),
      EQUIPMENT,
      {},
    );
    expect(report.masteredSkills).toEqual([
      { member: guild.roster[0], skillIdentifier: 'cleaving_arc' },
    ]);
  });

  it('passes one battle of time for dispatched members and reports returns', () => {
    const errand: DispatchQuestDefinition = {
      identifier: 'test_errand',
      displayName: 'Test Errand',
      description: 'An errand used only in tests.',
      zoneIdentifier: 'north_road',
      durationInBattles: 1,
      rewardGold: 60,
      rewardExperience: 40,
    };
    const guild = createTestGuild([createTestMember('member_a'), createTestMember('member_b')]);
    startDispatch(guild, errand, 'member_b');
    const report = applyBattleSpoils(
      guild,
      createSpoilsInput({ outcome: 'fled', defeatedEnemyLevels: [] }),
      EQUIPMENT,
      { [errand.identifier]: errand },
    );
    expect(report.resolvedDispatches).toHaveLength(1);
    expect(report.resolvedDispatches[0]?.member.identifier).toBe('member_b');
    expect(guild.gold).toBe(160);
    expect(guild.activeDispatches).toEqual([]);
  });

  it('ignores deployed identifiers that are not in the roster', () => {
    const guild = createTestGuild([createTestMember('member_a')]);
    const report = applyBattleSpoils(
      guild,
      createSpoilsInput({ deployedMemberIdentifiers: ['member_a', 'member_ghost'] }),
      EQUIPMENT,
      {},
    );
    expect(report.levelUps.every((levelUp) => levelUp.member.identifier === 'member_a')).toBe(true);
  });
});
