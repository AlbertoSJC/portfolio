import { z } from 'zod';
import { AchievementMetric, AchievementRarity, AchievementRequirementType, FinancialCategory, QuestPriority, QuestStatus } from '@/enums/finquestEnums';

const questSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  description: z.string().max(2000),
  category: z.enum(FinancialCategory),
  status: z.enum(QuestStatus),
  priority: z.enum(QuestPriority),
  targetAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  dueDate: z.string(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  rewards: z.object({
    experience: z.number().nonnegative(),
    coins: z.number().nonnegative(),
  }),
});

const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  rarity: z.enum(AchievementRarity),
  unlockedAt: z.string().optional(),
  requirements: z.object({
    type: z.enum(AchievementRequirementType),
    metric: z.enum(AchievementMetric),
    value: z.number(),
    category: z.enum(FinancialCategory).optional(),
  }),
});

export const playerDataSchema = z.object({
  id: z.string(),
  username: z.string().min(2).max(24),
  level: z.number().int().positive(),
  experience: z.number().nonnegative(),
  coins: z.number().nonnegative(),
  createdAt: z.string(),
  quests: z.array(questSchema).max(500),
  achievements: z.array(achievementSchema).max(100),
  streak: z.object({
    currentStreak: z.number().int().nonnegative(),
    longestStreak: z.number().int().nonnegative(),
    lastActivityDate: z.string().nullable(),
  }),
  dailyChallengeDate: z.string().nullable(),
});

export type PlayerData = z.infer<typeof playerDataSchema>;
