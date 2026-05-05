import { Achievement } from '@/domain/Achievement';
import { Quest } from '@/domain/Quest';
import { AchievementRarity, AchievementRequirementType, FinancialCategory, QuestPriority } from '@/enums/finquestEnums';

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  new Achievement({
    id: 'first-quest',
    title: 'Quest Starter',
    description: 'Complete your first quest',
    icon: '🎯',
    rarity: AchievementRarity.Common,
    requirements: { type: AchievementRequirementType.Milestone, value: 1 },
  }),
  new Achievement({
    id: 'level-5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    rarity: AchievementRarity.Rare,
    requirements: { type: AchievementRequirementType.Milestone, value: 5 },
  }),
  new Achievement({
    id: 'saving-hero',
    title: 'Saving Hero',
    description: 'Complete 5 savings quests',
    icon: '💰',
    rarity: AchievementRarity.Epic,
    requirements: { type: AchievementRequirementType.Challenge, value: 5 },
  }),
];

export function getDefaultAchievements(): Achievement[] {
  return DEFAULT_ACHIEVEMENTS.map((achievement) =>
    new Achievement({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      requirements: { ...achievement.requirements },
    })
  );
}

export function createDemoQuests(): Quest[] {
  return [
    new Quest({
      id: 'q1',
      title: 'Build Emergency Fund',
      description: 'Save $1000 for unexpected expenses',
      category: FinancialCategory.Savings,
      targetAmount: 1000,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.High,
      rewards: { experience: 500, coins: 250 },
    }),
    new Quest({
      id: 'q2',
      title: 'Create a Budget',
      description: 'Track your spending for this month',
      category: FinancialCategory.Budgeting,
      targetAmount: 100,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.Medium,
      rewards: { experience: 200, coins: 100 },
    }),
  ];
}
