import { Player } from '@/domain/Player';
import { FinancialCategory, QuestStatus } from '@/enums/finquestEnums';

export interface HealthScoreBreakdown {
  completionRate: number;
  savingsProgress: number;
  categoryDiversity: number;
  timeliness: number;
}

export interface FinancialHealthScore {
  total: number;
  breakdown: HealthScoreBreakdown;
}

const MAX_PER_COMPONENT = 25;
const TOTAL_CATEGORIES = Object.values(FinancialCategory).length;

export function calculateFinancialHealthScore(player: Player): FinancialHealthScore {
  const quests = player.quests;
  const completed = quests.filter((q) => q.status === QuestStatus.Completed);
  const active = quests.filter((q) => q.status === QuestStatus.Active);

  const completionRate = quests.length > 0 ? (completed.length / quests.length) * MAX_PER_COMPONENT : 0;

  const wealthQuests = quests.filter(
    (q) => q.category === FinancialCategory.Savings || q.category === FinancialCategory.DebtPayoff
  );
  const savingsProgress =
    wealthQuests.length > 0
      ? (wealthQuests.reduce((sum, q) => sum + Math.min(q.currentAmount / q.targetAmount, 1), 0) /
          wealthQuests.length) *
        MAX_PER_COMPONENT
      : 0;

  const activeCategories = new Set(
    quests
      .filter((q) => q.status === QuestStatus.Active || q.status === QuestStatus.Completed)
      .map((q) => q.category)
  );
  const categoryDiversity = (activeCategories.size / TOTAL_CATEGORIES) * MAX_PER_COMPONENT;

  const overdue = active.filter((q) => q.isOverdue());
  const timeliness =
    active.length > 0
      ? ((active.length - overdue.length) / active.length) * MAX_PER_COMPONENT
      : quests.length > 0
        ? MAX_PER_COMPONENT
        : 0;

  const breakdown: HealthScoreBreakdown = {
    completionRate: Math.round(completionRate),
    savingsProgress: Math.round(savingsProgress),
    categoryDiversity: Math.round(categoryDiversity),
    timeliness: Math.round(timeliness),
  };

  return {
    total: breakdown.completionRate + breakdown.savingsProgress + breakdown.categoryDiversity + breakdown.timeliness,
    breakdown,
  };
}

export interface ScoreTier {
  label: string;
  color: string;
}

export function getScoreTier(total: number): ScoreTier {
  if (total >= 90) return { label: 'Excellent', color: '#14b8a6' };
  if (total >= 70) return { label: 'Healthy', color: '#10b981' };
  if (total >= 40) return { label: 'Building', color: '#f59e0b' };
  return { label: 'Needs Attention', color: '#ef4444' };
}
