import { describe, expect, it } from 'vitest';
import {
  MAXIMUM_CHARACTER_LEVEL,
  applyExperienceGain,
  experienceForDefeatingEnemy,
  experienceRequiredToLevelUpFrom,
} from '../../../src/sim/progression/ExperienceAndLevels';
import type { GuildMember } from '../../../src/sim/guild/GuildState';

function createTestMember(level: number, experiencePoints = 0): GuildMember {
  return {
    identifier: 'member_test',
    displayName: 'Test Member',
    raceIdentifier: 'human',
    baseClassIdentifier: 'warrior',
    level,
    experiencePoints,
  };
}

describe('experienceRequiredToLevelUpFrom', () => {
  it('grows with each level', () => {
    expect(experienceRequiredToLevelUpFrom(2)).toBeGreaterThan(experienceRequiredToLevelUpFrom(1));
  });
});

describe('applyExperienceGain', () => {
  it('levels up once when the requirement is met and keeps the overflow', () => {
    const member = createTestMember(1);
    const requirement = experienceRequiredToLevelUpFrom(1);
    const levelsGained = applyExperienceGain(member, requirement + 10);
    expect(levelsGained).toBe(1);
    expect(member.level).toBe(2);
    expect(member.experiencePoints).toBe(10);
  });

  it('can gain several levels from one large award', () => {
    const member = createTestMember(1);
    const towardLevelTwo = experienceRequiredToLevelUpFrom(1);
    const towardLevelThree = experienceRequiredToLevelUpFrom(2);
    const levelsGained = applyExperienceGain(member, towardLevelTwo + towardLevelThree);
    expect(levelsGained).toBe(2);
    expect(member.level).toBe(3);
    expect(member.experiencePoints).toBe(0);
  });

  it('stops at the level cap', () => {
    const member = createTestMember(MAXIMUM_CHARACTER_LEVEL);
    const levelsGained = applyExperienceGain(member, 999999);
    expect(levelsGained).toBe(0);
    expect(member.level).toBe(MAXIMUM_CHARACTER_LEVEL);
    expect(member.experiencePoints).toBe(0);
  });
});

describe('experienceForDefeatingEnemy', () => {
  it('rewards higher-level enemies with more experience', () => {
    expect(experienceForDefeatingEnemy(5)).toBeGreaterThan(experienceForDefeatingEnemy(3));
  });
});
