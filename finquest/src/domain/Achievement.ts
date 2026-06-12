import { AchievementMetric, AchievementRarity, AchievementRequirementType, FinancialCategory } from '@/enums/finquestEnums';

export interface AchievementRequirements {
  type: AchievementRequirementType;
  metric: AchievementMetric;
  value: number;
  category?: FinancialCategory;
}

export class Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlockedAt?: Date;
  requirements: AchievementRequirements;

  constructor(data: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity?: AchievementRarity;
    requirements: AchievementRequirements;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.icon = data.icon;
    this.rarity = data.rarity ?? AchievementRarity.Common;
    this.requirements = data.requirements;
  }

  unlock(): void {
    this.unlockedAt = new Date();
  }

  isUnlocked(): boolean {
    return this.unlockedAt !== undefined;
  }
}
