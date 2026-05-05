import { Achievement } from '@/domain/Achievement';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { AchievementRequirementType, FinancialCategory } from '@/enums/finquestEnums';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player({
      id: '1',
      username: 'TestPlayer',
    });
  });

  it('should create a player with correct initial values', () => {
    expect(player.username).toBe('TestPlayer');
    expect(player.level).toBe(1);
    expect(player.experience).toBe(0);
    expect(player.coins).toBe(0);
  });

  it('should add experience and level up', () => {
    player.addExperience(1000);
    expect(player.level).toBe(2);
    expect(player.experience).toBe(1000);
  });

  it('should award coins on level up', () => {
    player.addExperience(1000);
    expect(player.coins).toBe(100);
  });

  it('should add and track quests', () => {
    const quest = new Quest({
      id: '1',
      title: 'Test Quest',
      description: 'Test',
      category: FinancialCategory.Savings,
      targetAmount: 100,
      dueDate: new Date(),
    });
    player.addQuest(quest);
    expect(player.quests.length).toBe(1);
    expect(player.getActiveQuestsCount()).toBe(1);
  });

  it('should unlock achievements', () => {
    const achievement = new Achievement({
      id: '1',
      title: 'First Quest',
      description: 'Complete your first quest',
      icon: '🎯',
      requirements: { type: AchievementRequirementType.Milestone, value: 1 },
    });
    player.unlockAchievement(achievement);
    expect(player.achievements.length).toBe(1);
    expect(achievement.isUnlocked()).toBe(true);
  });
});
