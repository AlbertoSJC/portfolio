import { AchievementRarity, AchievementRequirementType } from '@/enums/finquestEnums';

export class Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlockedAt?: Date;
  requirements: {
    type: AchievementRequirementType;
    value: number;
  };

  constructor(data: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity?: AchievementRarity;
    requirements: { type: AchievementRequirementType; value: number };
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
