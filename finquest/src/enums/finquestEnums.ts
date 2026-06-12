// Quest status enum
export enum QuestStatus {
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed',
  Locked = 'locked',
}

// Quest priority levels
export enum QuestPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// Financial goal categories
export enum FinancialCategory {
  Savings = 'savings',
  Investing = 'investing',
  DebtPayoff = 'debt-payoff',
  Budgeting = 'budgeting',
  Learning = 'learning',
}

// Achievement rarity levels
export enum AchievementRarity {
  Common = 'common',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
}

// Achievement requirement types
export enum AchievementRequirementType {
  Milestone = 'milestone',
  Streak = 'streak',
  Challenge = 'challenge',
  Learning = 'learning',
}

// Metric an achievement requirement is measured against
export enum AchievementMetric {
  QuestsCompleted = 'quests-completed',
  LevelReached = 'level-reached',
  CoinsHeld = 'coins-held',
  CategoryQuestsCompleted = 'category-quests-completed',
  StreakDays = 'streak-days',
}

// Player action a daily challenge is completed by
export enum DailyChallengeKind {
  UpdateProgress = 'update-progress',
  CreateQuest = 'create-quest',
  CompleteQuest = 'complete-quest',
  CreateSavingsQuest = 'create-savings-quest',
  ReachHalf = 'reach-half',
}