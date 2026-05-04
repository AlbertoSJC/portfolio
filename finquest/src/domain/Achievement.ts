import { AchievementRarity } from '@/types/finquest';

export class Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlockedAt?: Date;
  requirements: {
    type: 'milestone' | 'streak' | 'challenge' | 'learning';
    value: number;
  };

  constructor(data: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity?: AchievementRarity;
    requirements: { type: 'milestone' | 'streak' | 'challenge' | 'learning'; value: number };
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.icon = data.icon;
    this.rarity = data.rarity || 'common';
    this.requirements = data.requirements;
  }

  unlock(): void {
    this.unlockedAt = new Date();
  }

  isUnlocked(): boolean {
    return this.unlockedAt !== undefined;
  }
}
