import { describe, expect, it } from 'vitest';
import {
  meetsReputationRequirement,
  reputationTierForQuestCount,
  REPUTATION_TIER_THRESHOLDS,
} from '@/sim/guild/ReputationTier';

describe('reputationTierForQuestCount', () => {
  it('returns bronze at 0 quests', () => {
    expect(reputationTierForQuestCount(0)).toBe('bronze');
  });

  it('returns bronze just below silver threshold', () => {
    expect(reputationTierForQuestCount(REPUTATION_TIER_THRESHOLDS.silver - 1)).toBe('bronze');
  });

  it('returns silver at the silver threshold', () => {
    expect(reputationTierForQuestCount(REPUTATION_TIER_THRESHOLDS.silver)).toBe('silver');
  });

  it('returns silver just below gold threshold', () => {
    expect(reputationTierForQuestCount(REPUTATION_TIER_THRESHOLDS.gold - 1)).toBe('silver');
  });

  it('returns gold at the gold threshold', () => {
    expect(reputationTierForQuestCount(REPUTATION_TIER_THRESHOLDS.gold)).toBe('gold');
  });

  it('returns gold just below platinum threshold', () => {
    expect(reputationTierForQuestCount(REPUTATION_TIER_THRESHOLDS.platinum - 1)).toBe('gold');
  });

  it('returns platinum at the platinum threshold', () => {
    expect(reputationTierForQuestCount(REPUTATION_TIER_THRESHOLDS.platinum)).toBe('platinum');
  });

  it('returns platinum well above the platinum threshold', () => {
    expect(reputationTierForQuestCount(999)).toBe('platinum');
  });
});

describe('meetsReputationRequirement', () => {
  it('bronze meets bronze', () => {
    expect(meetsReputationRequirement('bronze', 'bronze')).toBe(true);
  });

  it('silver meets bronze and silver', () => {
    expect(meetsReputationRequirement('silver', 'bronze')).toBe(true);
    expect(meetsReputationRequirement('silver', 'silver')).toBe(true);
  });

  it('bronze does not meet silver', () => {
    expect(meetsReputationRequirement('bronze', 'silver')).toBe(false);
  });

  it('gold meets all tiers up to gold', () => {
    expect(meetsReputationRequirement('gold', 'bronze')).toBe(true);
    expect(meetsReputationRequirement('gold', 'silver')).toBe(true);
    expect(meetsReputationRequirement('gold', 'gold')).toBe(true);
  });

  it('gold does not meet platinum', () => {
    expect(meetsReputationRequirement('gold', 'platinum')).toBe(false);
  });

  it('platinum meets all tiers', () => {
    expect(meetsReputationRequirement('platinum', 'bronze')).toBe(true);
    expect(meetsReputationRequirement('platinum', 'silver')).toBe(true);
    expect(meetsReputationRequirement('platinum', 'gold')).toBe(true);
    expect(meetsReputationRequirement('platinum', 'platinum')).toBe(true);
  });
});
