import { Achievement } from '@/domain/Achievement';
import { Player } from '@/domain/Player';
import { AchievementMetric } from '@/enums/finquestEnums';
import { CATEGORY_META } from '@/utils/fixtures';

export interface AchievementProgress {
  current: number;
  total: number;
  label: string;
}

export function getAchievementMetricValue(achievement: Achievement, player: Player): number {
  const { metric, category } = achievement.requirements;

  switch (metric) {
    case AchievementMetric.QuestsCompleted:
      return player.getCompletedQuestsCount();
    case AchievementMetric.LevelReached:
      return player.level;
    case AchievementMetric.CoinsHeld:
      return player.coins;
    case AchievementMetric.CategoryQuestsCompleted:
      return category ? player.getCompletedQuestsByCategory(category) : 0;
    case AchievementMetric.StreakDays:
      return player.streak.longestStreak;
  }
}

function getMetricLabel(achievement: Achievement): string {
  const { metric, category } = achievement.requirements;

  switch (metric) {
    case AchievementMetric.QuestsCompleted:
      return 'quests completed';
    case AchievementMetric.LevelReached:
      return 'level reached';
    case AchievementMetric.CoinsHeld:
      return 'coins earned';
    case AchievementMetric.CategoryQuestsCompleted:
      return category ? `${CATEGORY_META[category].label.toLowerCase()} quests done` : 'quests done';
    case AchievementMetric.StreakDays:
      return 'day streak';
  }
}

export function isAchievementEarned(achievement: Achievement, player: Player): boolean {
  return getAchievementMetricValue(achievement, player) >= achievement.requirements.value;
}

export function getAchievementProgress(achievement: Achievement, player: Player): AchievementProgress {
  const total = achievement.requirements.value;
  return {
    current: Math.min(getAchievementMetricValue(achievement, player), total),
    total,
    label: getMetricLabel(achievement),
  };
}
