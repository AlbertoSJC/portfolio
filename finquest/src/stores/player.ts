import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, StreakState } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { Achievement, AchievementRequirements } from '@/domain/Achievement';
import { DAILY_CHALLENGE_REWARD, getDefaultAchievements, getTodaysChallenge } from '@/utils/fixtures';
import { isAchievementEarned } from '@/utils/achievements';
import { toDateKey } from '@/utils/date';
import { AchievementRarity, DailyChallengeKind, FinancialCategory, QuestPriority, QuestStatus } from '@/enums/finquestEnums';
import { useNotificationStore } from '@/stores/notification';

function clonePlayer(player: Player): Player {
  return Object.assign(Object.create(Object.getPrototypeOf(player)), player);
}

function pushNotification(title: string, message: string): void {
  useNotificationStore.getState().pushNotification({ title, message, variant: 'success' });
}

function notifyQuestCompleted(quest: Quest): void {
  pushNotification('Quest complete!', `You completed "${quest.title}" and earned ${quest.rewards.experience} XP.`);
}

function notifyAchievementUnlocked(achievement: { title: string; description: string; icon: string }): void {
  pushNotification('Achievement unlocked!', `${achievement.icon} ${achievement.title}: ${achievement.description}`);
}

function checkAchievements(player: Player): Achievement[] {
  const unlocked: Achievement[] = [];

  getDefaultAchievements().forEach((achievement) => {
    if (player.achievements.find((a) => a.id === achievement.id)) return;

    if (isAchievementEarned(achievement, player)) {
      player.unlockAchievement(achievement);
      notifyAchievementUnlocked(achievement);
      unlocked.push(achievement);
    }
  });

  return unlocked;
}

function grantQuestRewards(player: Player, quest: Quest): void {
  const previousLevel = player.level;
  player.addExperience(quest.rewards.experience);
  player.coins += quest.rewards.coins;
  notifyQuestCompleted(quest);
  const unlocked = checkAchievements(player);

  const { pushCelebration } = useNotificationStore.getState();
  pushCelebration({
    kind: 'quest-complete',
    questTitle: quest.title,
    xpGained: quest.rewards.experience,
    coinsGained: quest.rewards.coins,
    achievementTitles: unlocked.map((a) => `${a.icon} ${a.title}`),
  });
  if (player.level > previousLevel) {
    pushCelebration({ kind: 'level-up', newLevel: player.level });
  }
}

function handleDailyChallenge(player: Player, performedKinds: DailyChallengeKind[]): void {
  const today = toDateKey(new Date());
  if (player.dailyChallengeDate === today) return;

  const challenge = getTodaysChallenge();
  if (!performedKinds.includes(challenge.kind)) return;

  player.dailyChallengeDate = today;
  const previousLevel = player.level;
  player.addExperience(DAILY_CHALLENGE_REWARD.experience);
  player.coins += DAILY_CHALLENGE_REWARD.coins;
  pushNotification(
    'Daily challenge complete!',
    `${challenge.icon} ${challenge.title}: +${DAILY_CHALLENGE_REWARD.experience} XP, +${DAILY_CHALLENGE_REWARD.coins} coins.`
  );
  checkAchievements(player);
  if (player.level > previousLevel) {
    useNotificationStore.getState().pushCelebration({ kind: 'level-up', newLevel: player.level });
  }
}

function reconstructQuest(q: Record<string, unknown>): Quest {
  const quest = new Quest({
    id: q.id as string,
    title: q.title as string,
    description: q.description as string,
    category: q.category as FinancialCategory,
    targetAmount: q.targetAmount as number,
    dueDate: new Date(q.dueDate as string),
    priority: q.priority as QuestPriority,
    rewards: q.rewards as { experience: number; coins: number },
  });
  quest.status = q.status as QuestStatus;
  quest.currentAmount = q.currentAmount as number;
  if (q.completedAt) quest.completedAt = new Date(q.completedAt as string);
  quest.createdAt = new Date(q.createdAt as string);
  return quest;
}

function reconstructAchievement(a: Record<string, unknown>): Achievement {
  const ach = new Achievement({
    id: a.id as string,
    title: a.title as string,
    description: a.description as string,
    icon: a.icon as string,
    rarity: a.rarity as AchievementRarity,
    requirements: a.requirements as AchievementRequirements,
  });
  if (a.unlockedAt) ach.unlockedAt = new Date(a.unlockedAt as string);
  return ach;
}

function markOverdueQuests(player: Player): void {
  player.quests.forEach((quest) => {
    if (quest.isOverdue()) quest.failQuest();
  });
}

export function reconstructPlayer(raw: Record<string, unknown>): Player {
  const player = new Player({ id: raw.id as string, username: raw.username as string });
  player.level = raw.level as number;
  player.experience = raw.experience as number;
  player.coins = raw.coins as number;
  player.createdAt = new Date(raw.createdAt as string);
  player.quests = ((raw.quests as unknown[]) || []).map((q) =>
    reconstructQuest(q as Record<string, unknown>)
  );
  player.achievements = ((raw.achievements as unknown[]) || []).map((a) =>
    reconstructAchievement(a as Record<string, unknown>)
  );
  const rawStreak = raw.streak as Partial<StreakState> | undefined;
  player.streak = {
    currentStreak: rawStreak?.currentStreak ?? 0,
    longestStreak: rawStreak?.longestStreak ?? 0,
    lastActivityDate: rawStreak?.lastActivityDate ?? null,
  };
  player.dailyChallengeDate = (raw.dailyChallengeDate as string | null) ?? null;
  return player;
}

interface QuestUpdates {
  title: string;
  description: string;
  category: FinancialCategory;
  targetAmount: number;
  dueDate: Date;
  priority: QuestPriority;
}

interface PlayerState {
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  initializePlayer: (player: Player) => void;
  addQuest: (quest: Quest) => void;
  editQuest: (questId: string, updates: QuestUpdates) => void;
  deleteQuest: (questId: string) => void;
  updateQuestProgress: (questId: string, amount: number) => void;
  completeQuest: (questId: string) => void;
  setError: (error: string | null) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      player: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      initializePlayer: (player: Player) => set({ player, error: null }),

      addQuest: (quest: Quest) =>
        set((state) => {
          if (!state.player) return state;
          state.player.addQuest(quest);
          const kinds = [DailyChallengeKind.CreateQuest];
          if (quest.category === FinancialCategory.Savings) kinds.push(DailyChallengeKind.CreateSavingsQuest);
          handleDailyChallenge(state.player, kinds);
          return { player: clonePlayer(state.player) };
        }),

      editQuest: (questId, updates) =>
        set((state) => {
          if (!state.player) return state;
          const quest = state.player.quests.find((q) => q.id === questId);
          if (quest) {
            quest.title = updates.title;
            quest.description = updates.description;
            quest.category = updates.category;
            quest.targetAmount = updates.targetAmount;
            quest.dueDate = updates.dueDate;
            quest.priority = updates.priority;
          }
          return { player: clonePlayer(state.player) };
        }),

      deleteQuest: (questId) =>
        set((state) => {
          if (!state.player) return state;
          state.player.quests = state.player.quests.filter((q) => q.id !== questId);
          return { player: clonePlayer(state.player) };
        }),

      updateQuestProgress: (questId: string, amount: number) =>
        set((state) => {
          if (!state.player) return state;
          const quest = state.player.quests.find((q) => q.id === questId);
          if (quest) {
            const wasCompleted = quest.status === QuestStatus.Completed;
            quest.updateProgress(amount);
            const justCompleted = quest.status === QuestStatus.Completed && !wasCompleted;
            state.player.recordActivity();
            if (justCompleted) {
              grantQuestRewards(state.player, quest);
            } else {
              checkAchievements(state.player);
            }
            const kinds = [DailyChallengeKind.UpdateProgress];
            if (quest.getProgressPercentage() >= 50) kinds.push(DailyChallengeKind.ReachHalf);
            if (justCompleted) kinds.push(DailyChallengeKind.CompleteQuest);
            handleDailyChallenge(state.player, kinds);
          }
          return { player: clonePlayer(state.player) };
        }),

      completeQuest: (questId: string) =>
        set((state) => {
          if (!state.player) return state;
          const quest = state.player.quests.find((q) => q.id === questId);
          if (quest && quest.status !== QuestStatus.Completed) {
            quest.completeQuest();
            state.player.recordActivity();
            grantQuestRewards(state.player, quest);
            handleDailyChallenge(state.player, [
              DailyChallengeKind.UpdateProgress,
              DailyChallengeKind.ReachHalf,
              DailyChallengeKind.CompleteQuest,
            ]);
          }
          return { player: clonePlayer(state.player) };
        }),

      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'finquest-player',
      partialize: (state) => ({ player: state.player }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      merge: (persisted: unknown, current: PlayerState): PlayerState => {
        try {
          const stored = persisted as Partial<{ player: Record<string, unknown> | null }>;
          if (!stored?.player) return { ...current, _hasHydrated: true };
          const player = reconstructPlayer(stored.player);
          markOverdueQuests(player);
          player.syncStreak();
          return { ...current, player, _hasHydrated: true };
        } catch {
          return { ...current, _hasHydrated: true };
        }
      },
    }
  )
);
