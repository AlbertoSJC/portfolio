import { create } from 'zustand';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { getDefaultAchievements } from '@/utils/fixtures';
import { AchievementRequirementType, FinancialCategory, QuestStatus } from '@/enums/finquestEnums';
import { useNotificationStore } from '@/stores/notification';

function clonePlayer(player: Player): Player {
  return Object.assign(Object.create(Object.getPrototypeOf(player)), player);
}

function pushNotification(title: string, message: string): void {
  useNotificationStore.getState().pushNotification({
    title,
    message,
    variant: 'success',
  });
}

function notifyQuestCompleted(quest: Quest): void {
  pushNotification('Quest complete!', `You completed “${quest.title}” and earned ${quest.rewards.experience} XP.`);
}

function notifyAchievementUnlocked(achievement: { title: string; description: string; icon: string }): void {
  pushNotification('Achievement unlocked!', `${achievement.icon} ${achievement.title}: ${achievement.description}`);
}

function checkAchievements(player: Player): void {
  const availableAchievements = getDefaultAchievements();

  availableAchievements.forEach((achievement) => {
    if (player.achievements.find((a) => a.id === achievement.id)) return; // Already unlocked

    let shouldUnlock = false;

    switch (achievement.requirements.type) {
      case AchievementRequirementType.Milestone:
        if (achievement.id === 'first-quest' && player.getCompletedQuestsCount() >= achievement.requirements.value) {
          shouldUnlock = true;
        } else if (achievement.id === 'level-5' && player.level >= achievement.requirements.value) {
          shouldUnlock = true;
        }
        break;
      case AchievementRequirementType.Challenge:
        if (
          achievement.id === 'saving-hero' &&
          player.getCompletedQuestsByCategory(FinancialCategory.Savings) >= achievement.requirements.value
        ) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      player.unlockAchievement(achievement);
      notifyAchievementUnlocked(achievement);
    }
  });
}

interface PlayerState {
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  initializePlayer: (player: Player) => void;
  addQuest: (quest: Quest) => void;
  updateQuestProgress: (questId: string, amount: number) => void;
  completeQuest: (questId: string) => void;
  setError: (error: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  isLoading: false,
  error: null,

  initializePlayer: (player: Player) =>
    set({
      player,
      error: null,
    }),

  addQuest: (quest: Quest) =>
    set((state) => {
      if (!state.player) return state;
      state.player.addQuest(quest);
      return { player: clonePlayer(state.player) };
    }),

  updateQuestProgress: (questId: string, amount: number) =>
    set((state) => {
      if (!state.player) return state;
      const quest = state.player.quests.find((q) => q.id === questId);
      if (quest) {
        const wasCompleted = quest.status === QuestStatus.Completed;
        quest.updateProgress(amount);
        if (quest.status === QuestStatus.Completed && !wasCompleted) {
          state.player.addExperience(quest.rewards.experience);
          state.player.coins += quest.rewards.coins;
          notifyQuestCompleted(quest);
          checkAchievements(state.player);
        }
      }
      return { player: clonePlayer(state.player) };
    }),

  completeQuest: (questId: string) =>
    set((state) => {
      if (!state.player) return state;
      const quest = state.player.quests.find((q) => q.id === questId);
      if (quest && quest.status !== QuestStatus.Completed) {
        quest.completeQuest();
        state.player.addExperience(quest.rewards.experience);
        state.player.coins += quest.rewards.coins;
        notifyQuestCompleted(quest);
        checkAchievements(state.player);
      }
      return { player: clonePlayer(state.player) };
    }),

  setError: (error: string | null) => set({ error }),
}));
