import { Quest } from '@/domain/Quest';
import { Achievement } from '@/domain/Achievement';
import { QuestStatus } from '@/enums/finquestEnums';

/**
 * Represents a player's profile and progression
 */
export class Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  coins: number;
  quests: Quest[];
  achievements: Achievement[];
  createdAt: Date;

  constructor(data: {
    id: string;
    username: string;
  }) {
    this.id = data.id;
    this.username = data.username;
    this.level = 1;
    this.experience = 0;
    this.coins = 0;
    this.quests = [];
    this.achievements = [];
    this.createdAt = new Date();
  }

  /**
   * Add experience points and check for level up
   */
  addExperience(amount: number): void {
    this.experience += amount;
    const experiencePerLevel = 1000;
    const newLevel = Math.floor(this.experience / experiencePerLevel) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.coins += 100; // Bonus coins on level up
    }
  }

  /**
   * Get total completed quests
   */
  getCompletedQuestsCount(): number {
    return this.quests.filter((q) => q.status === QuestStatus.Completed).length;
  }

  /**
   * Get total active quests
   */
  getActiveQuestsCount(): number {
    return this.quests.filter((q) => q.status === QuestStatus.Active).length;
  }

  /**
   * Get completed quests by category
   */
  getCompletedQuestsByCategory(category: string): number {
    return this.quests.filter((q) => q.status === QuestStatus.Completed && q.category === category).length;
  }

  /**
   * Add a quest to player's quests
   */
  addQuest(quest: Quest): void {
    this.quests.push(quest);
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievement: Achievement): void {
    achievement.unlock();
    if (!this.achievements.find((a) => a.id === achievement.id)) {
      this.achievements.push(achievement);
    }
  }
}
