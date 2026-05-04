import { create } from 'zustand';
import { Achievement } from '@/domain/Achievement';

interface AchievementState {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  addAchievement: (achievement: Achievement) => void;
  unlockAchievement: (achievement: Achievement) => void;
  getUnlockedCount: () => number;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  unlockedAchievements: [],

  addAchievement: (achievement: Achievement) =>
    set((state) => ({
      achievements: [...state.achievements, achievement],
    })),

  unlockAchievement: (achievement: Achievement) =>
    set((state) => ({
      unlockedAchievements: [...state.unlockedAchievements, achievement],
    })),

  getUnlockedCount: () => get().unlockedAchievements.length,
}));
