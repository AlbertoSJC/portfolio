import { Achievement } from '@/domain/Achievement';
import { Quest } from '@/domain/Quest';
import { AchievementMetric, AchievementRarity, AchievementRequirementType, DailyChallengeKind, FinancialCategory, QuestPriority } from '@/enums/finquestEnums';
import { dayOfYear } from '@/utils/date';

export const CATEGORY_META: Record<FinancialCategory, { icon: string; color: string; label: string }> = {
  [FinancialCategory.Savings]: { icon: '💰', color: '#10b981', label: 'Savings' },
  [FinancialCategory.Investing]: { icon: '📈', color: '#6366f1', label: 'Investing' },
  [FinancialCategory.DebtPayoff]: { icon: '💳', color: '#ef4444', label: 'Debt Payoff' },
  [FinancialCategory.Budgeting]: { icon: '📊', color: '#f59e0b', label: 'Budgeting' },
  [FinancialCategory.Learning]: { icon: '📚', color: '#8b5cf6', label: 'Learning' },
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  new Achievement({
    id: 'first-quest',
    title: 'Quest Starter',
    description: 'Complete your first financial quest',
    icon: '🎯',
    rarity: AchievementRarity.Common,
    requirements: { type: AchievementRequirementType.Milestone, metric: AchievementMetric.QuestsCompleted, value: 1 },
  }),
  new Achievement({
    id: 'quest-veteran',
    title: 'Quest Veteran',
    description: 'Complete 10 quests',
    icon: '⚔️',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Milestone, metric: AchievementMetric.QuestsCompleted, value: 10 },
  }),
  new Achievement({
    id: 'level-3',
    title: 'Rising Adventurer',
    description: 'Reach level 3',
    icon: '🌟',
    rarity: AchievementRarity.Common,
    requirements: { type: AchievementRequirementType.Milestone, metric: AchievementMetric.LevelReached, value: 3 },
  }),
  new Achievement({
    id: 'level-5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Milestone, metric: AchievementMetric.LevelReached, value: 5 },
  }),
  new Achievement({
    id: 'level-10',
    title: 'Financial Hero',
    description: 'Reach level 10',
    icon: '👑',
    rarity: AchievementRarity.Legendary,
    requirements: { type: AchievementRequirementType.Milestone, metric: AchievementMetric.LevelReached, value: 10 },
  }),
  new Achievement({
    id: 'saving-hero',
    title: 'Saving Hero',
    description: 'Complete 5 savings quests',
    icon: '💰',
    rarity: AchievementRarity.Epic,
    requirements: { type: AchievementRequirementType.Challenge, metric: AchievementMetric.CategoryQuestsCompleted, category: FinancialCategory.Savings, value: 5 },
  }),
  new Achievement({
    id: 'investor',
    title: 'The Investor',
    description: 'Complete 3 investing quests',
    icon: '📈',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Challenge, metric: AchievementMetric.CategoryQuestsCompleted, category: FinancialCategory.Investing, value: 3 },
  }),
  new Achievement({
    id: 'debt-slayer',
    title: 'Debt Slayer',
    description: 'Complete 3 debt payoff quests',
    icon: '⚡',
    rarity: AchievementRarity.Epic,
    requirements: { type: AchievementRequirementType.Challenge, metric: AchievementMetric.CategoryQuestsCompleted, category: FinancialCategory.DebtPayoff, value: 3 },
  }),
  new Achievement({
    id: 'budget-master',
    title: 'Budget Master',
    description: 'Complete 3 budgeting quests',
    icon: '📊',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Challenge, metric: AchievementMetric.CategoryQuestsCompleted, category: FinancialCategory.Budgeting, value: 3 },
  }),
  new Achievement({
    id: 'scholar',
    title: 'Financial Scholar',
    description: 'Complete 3 learning quests',
    icon: '📚',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Learning, metric: AchievementMetric.CategoryQuestsCompleted, category: FinancialCategory.Learning, value: 3 },
  }),
  new Achievement({
    id: 'coin-collector',
    title: 'Coin Collector',
    description: 'Accumulate 1,000 coins',
    icon: '🪙',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Milestone, metric: AchievementMetric.CoinsHeld, value: 1000 },
  }),
  new Achievement({
    id: 'high-roller',
    title: 'High Roller',
    description: 'Accumulate 5,000 coins',
    icon: '💎',
    rarity: AchievementRarity.Legendary,
    requirements: { type: AchievementRequirementType.Milestone, metric: AchievementMetric.CoinsHeld, value: 5000 },
  }),
  new Achievement({
    id: 'streak-3',
    title: 'Getting Warm',
    description: 'Stay active 3 days in a row',
    icon: '🔥',
    rarity: AchievementRarity.Common,
    requirements: { type: AchievementRequirementType.Streak, metric: AchievementMetric.StreakDays, value: 3 },
  }),
  new Achievement({
    id: 'streak-7',
    title: 'On Fire',
    description: 'Stay active 7 days in a row',
    icon: '🔥',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Streak, metric: AchievementMetric.StreakDays, value: 7 },
  }),
  new Achievement({
    id: 'streak-30',
    title: 'Unstoppable',
    description: 'Stay active 30 days in a row',
    icon: '🌋',
    rarity: AchievementRarity.Legendary,
    requirements: { type: AchievementRequirementType.Streak, metric: AchievementMetric.StreakDays, value: 30 },
  }),
];

export interface DailyChallenge {
  id: string;
  kind: DailyChallengeKind;
  title: string;
  description: string;
  icon: string;
}

export const DAILY_CHALLENGE_REWARD = { experience: 75, coins: 25 };

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'dc-update', kind: DailyChallengeKind.UpdateProgress, title: 'Make a Move', description: 'Update progress on any quest', icon: '📈' },
  { id: 'dc-create', kind: DailyChallengeKind.CreateQuest, title: 'New Horizons', description: 'Create a new quest', icon: '🗺️' },
  { id: 'dc-complete', kind: DailyChallengeKind.CompleteQuest, title: 'Finish the Job', description: 'Complete any quest', icon: '🏁' },
  { id: 'dc-savings', kind: DailyChallengeKind.CreateSavingsQuest, title: 'Pay Yourself First', description: 'Create a new savings quest', icon: '💰' },
  { id: 'dc-half', kind: DailyChallengeKind.ReachHalf, title: 'Halfway Hero', description: 'Reach 50% on any active quest', icon: '⛰️' },
  { id: 'dc-update-2', kind: DailyChallengeKind.UpdateProgress, title: 'Daily Deposit', description: 'Log progress on a quest today', icon: '🏦' },
  { id: 'dc-create-2', kind: DailyChallengeKind.CreateQuest, title: 'Dream Bigger', description: 'Add another goal to your quest log', icon: '✨' },
  { id: 'dc-half-2', kind: DailyChallengeKind.ReachHalf, title: 'Over the Hump', description: 'Push any quest past the 50% mark', icon: '🚀' },
  { id: 'dc-complete-2', kind: DailyChallengeKind.CompleteQuest, title: 'Close the Loop', description: 'Bring a quest across the finish line', icon: '🎖️' },
  { id: 'dc-update-3', kind: DailyChallengeKind.UpdateProgress, title: 'Keep the Flame', description: 'Make any progress update to keep your streak', icon: '🔥' },
];

export function getTodaysChallenge(date: Date = new Date()): DailyChallenge {
  return DAILY_CHALLENGES[dayOfYear(date) % DAILY_CHALLENGES.length];
}

export function getDefaultAchievements(): Achievement[] {
  return DEFAULT_ACHIEVEMENTS.map(
    (a) =>
      new Achievement({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        rarity: a.rarity,
        requirements: { ...a.requirements },
      })
  );
}

export function createDemoQuests(): Quest[] {
  return [
    new Quest({
      id: 'q1',
      title: 'Build Emergency Fund',
      description: 'Save $1,000 for unexpected expenses — your financial safety net.',
      category: FinancialCategory.Savings,
      targetAmount: 1000,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.High,
      rewards: { experience: 500, coins: 250 },
    }),
    new Quest({
      id: 'q2',
      title: 'Monthly Budget Plan',
      description: 'Create and follow a monthly budget to track every dollar.',
      category: FinancialCategory.Budgeting,
      targetAmount: 100,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.Medium,
      rewards: { experience: 200, coins: 100 },
    }),
    new Quest({
      id: 'q3',
      title: 'First ETF Investment',
      description: 'Open a brokerage account and invest in a low-cost index fund.',
      category: FinancialCategory.Investing,
      targetAmount: 500,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.Medium,
      rewards: { experience: 350, coins: 175 },
    }),
    new Quest({
      id: 'q4',
      title: 'Pay Off Credit Card',
      description: 'Eliminate your highest-interest credit card balance.',
      category: FinancialCategory.DebtPayoff,
      targetAmount: 800,
      dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.High,
      rewards: { experience: 600, coins: 300 },
    }),
    new Quest({
      id: 'q5',
      title: 'Read "The Millionaire Next Door"',
      description: 'Complete this personal finance classic to level up your money mindset.',
      category: FinancialCategory.Learning,
      targetAmount: 1,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.Low,
      rewards: { experience: 150, coins: 75 },
    }),
    new Quest({
      id: 'q6',
      title: 'Vacation Fund',
      description: 'Save $2,000 for a well-deserved vacation next year.',
      category: FinancialCategory.Savings,
      targetAmount: 2000,
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.Low,
      rewards: { experience: 800, coins: 400 },
    }),
  ];
}
