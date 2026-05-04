import { Achievement } from '@/domain/Achievement';
import { Quest } from '@/domain/Quest';
import { Player } from '@/domain/Player';

/**
 * Initialize default achievements that can be earned
 */
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  new Achievement({
    id: 'first-quest',
    title: 'Quest Starter',
    description: 'Complete your first quest',
    icon: '🎯',
    rarity: 'common',
    requirements: { type: 'milestone', value: 1 },
  }),
  new Achievement({
    id: 'level-5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    rarity: 'rare',
    requirements: { type: 'milestone', value: 5 },
  }),
  new Achievement({
    id: 'saving-hero',
    title: 'Saving Hero',
    description: 'Complete 5 savings quests',
    icon: '💰',
    rarity: 'epic',
    requirements: { type: 'challenge', value: 5 },
  }),
];

/**
 * Initialize demo quests for new players
 */
export function createDemoQuests(): Quest[] {
  return [
    new Quest({
      id: 'q1',
      title: 'Build Emergency Fund',
      description: 'Save $1000 for unexpected expenses',
      category: 'savings',
      targetAmount: 1000,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      priority: 'high',
      rewards: { experience: 500, coins: 250 },
    }),
    new Quest({
      id: 'q2',
      title: 'Create a Budget',
      description: 'Track your spending for this month',
      category: 'budgeting',
      targetAmount: 100,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      rewards: { experience: 200, coins: 100 },
    }),
  ];
}
