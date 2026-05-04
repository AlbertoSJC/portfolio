import { create } from 'zustand';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';

function clonePlayer(player: Player): Player {
  return Object.assign(Object.create(Object.getPrototypeOf(player)), player);
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
        quest.updateProgress(amount);
        if (quest.status === 'completed') {
          state.player.addExperience(quest.rewards.experience);
          state.player.coins += quest.rewards.coins;
        }
      }
      return { player: clonePlayer(state.player) };
    }),

  completeQuest: (questId: string) =>
    set((state) => {
      if (!state.player) return state;
      const quest = state.player.quests.find((q) => q.id === questId);
      if (quest && quest.status !== 'completed') {
        quest.completeQuest();
        state.player.addExperience(quest.rewards.experience);
        state.player.coins += quest.rewards.coins;
      }
      return { player: clonePlayer(state.player) };
    }),

  setError: (error: string | null) => set({ error }),
}));
