import { describe, expect, it } from 'vitest';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { getDefaultAchievements } from '@/utils/fixtures';
import { getAchievementMetricValue, getAchievementProgress, isAchievementEarned } from '@/utils/achievements';
import { FinancialCategory } from '@/enums/finquestEnums';

function findAchievement(id: string) {
  const achievement = getDefaultAchievements().find((a) => a.id === id);
  if (!achievement) throw new Error(`missing fixture achievement: ${id}`);
  return achievement;
}

function completedQuest(id: string, category: FinancialCategory): Quest {
  const quest = new Quest({
    id,
    title: `Quest ${id}`,
    description: 'test quest',
    category,
    targetAmount: 100,
    dueDate: new Date(Date.now() + 86400000),
  });
  quest.completeQuest();
  return quest;
}

describe('achievement metrics', () => {
  it('measures completed quest count', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.addQuest(completedQuest('q1', FinancialCategory.Savings));

    const firstQuest = findAchievement('first-quest');
    expect(getAchievementMetricValue(firstQuest, player)).toBe(1);
    expect(isAchievementEarned(firstQuest, player)).toBe(true);
  });

  it('measures level for level achievements', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.addExperience(2500);

    const level3 = findAchievement('level-3');
    expect(isAchievementEarned(level3, player)).toBe(true);
    const level5 = findAchievement('level-5');
    expect(isAchievementEarned(level5, player)).toBe(false);
  });

  it('measures coins for coin achievements', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.coins = 1200;

    expect(isAchievementEarned(findAchievement('coin-collector'), player)).toBe(true);
    expect(isAchievementEarned(findAchievement('high-roller'), player)).toBe(false);
  });

  it('measures category-scoped completions', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    for (let i = 0; i < 3; i++) {
      player.addQuest(completedQuest(`inv-${i}`, FinancialCategory.Investing));
    }
    player.addQuest(completedQuest('sav-1', FinancialCategory.Savings));

    expect(isAchievementEarned(findAchievement('investor'), player)).toBe(true);
    expect(isAchievementEarned(findAchievement('saving-hero'), player)).toBe(false);
  });

  it('reports capped progress with a metric label', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.coins = 9999;

    const progress = getAchievementProgress(findAchievement('coin-collector'), player);
    expect(progress).toEqual({ current: 1000, total: 1000, label: 'coins earned' });
  });
});
