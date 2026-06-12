import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toDateKey } from '@/utils/date';

export interface ScoreSnapshot {
  date: string;
  score: number;
}

const MAX_SNAPSHOTS = 7;

interface ScoreHistoryState {
  snapshots: ScoreSnapshot[];
  recordDailyScore: (score: number) => void;
}

export const useScoreHistoryStore = create<ScoreHistoryState>()(
  persist(
    (set) => ({
      snapshots: [],

      recordDailyScore: (score) =>
        set((state) => {
          const today = toDateKey(new Date());
          const existing = state.snapshots.find((s) => s.date === today);
          const snapshots = existing
            ? state.snapshots.map((s) => (s.date === today ? { ...s, score } : s))
            : [...state.snapshots, { date: today, score }].slice(-MAX_SNAPSHOTS);
          return { snapshots };
        }),
    }),
    { name: 'finquest-score-history' }
  )
);
