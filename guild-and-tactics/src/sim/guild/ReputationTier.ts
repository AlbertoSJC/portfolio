export type ReputationTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const REPUTATION_TIER_LABELS: Record<ReputationTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

/** Minimum completed-quest count required to reach each tier. */
export const REPUTATION_TIER_THRESHOLDS: Record<ReputationTier, number> = {
  bronze: 0,
  silver: 5,
  gold: 15,
  platinum: 30,
};

const REPUTATION_TIER_RANKS: Record<ReputationTier, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

export function reputationTierForQuestCount(completedQuestCount: number): ReputationTier {
  if (completedQuestCount >= REPUTATION_TIER_THRESHOLDS.platinum) return 'platinum';
  if (completedQuestCount >= REPUTATION_TIER_THRESHOLDS.gold) return 'gold';
  if (completedQuestCount >= REPUTATION_TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

export function meetsReputationRequirement(
  currentTier: ReputationTier,
  requiredTier: ReputationTier,
): boolean {
  return REPUTATION_TIER_RANKS[currentTier] >= REPUTATION_TIER_RANKS[requiredTier];
}
