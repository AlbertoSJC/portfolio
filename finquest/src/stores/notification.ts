import { create } from 'zustand';

export type NotificationVariant = 'success' | 'info' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  variant: NotificationVariant;
  timestamp: Date;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type CelebrationEvent =
  | {
      id: string;
      kind: 'quest-complete';
      questTitle: string;
      xpGained: number;
      coinsGained: number;
      achievementTitles: string[];
    }
  | {
      id: string;
      kind: 'level-up';
      newLevel: number;
    };

interface NotificationState {
  notifications: NotificationItem[];
  history: NotificationItem[];
  celebrations: CelebrationEvent[];
  pushNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearHistory: () => void;
  pushCelebration: (event: DistributiveOmit<CelebrationEvent, 'id'>) => void;
  dismissCelebration: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  history: [],
  celebrations: [],

  pushNotification: (notification) => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const item: NotificationItem = { ...notification, id, timestamp: new Date() };

    set((state) => ({
      notifications: [...state.notifications, item],
      history: [item, ...state.history].slice(0, 50),
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4000);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((toast) => toast.id !== id),
    })),

  clearHistory: () => set({ history: [] }),

  pushCelebration: (event) =>
    set((state) => ({
      celebrations: [
        ...state.celebrations,
        { ...event, id: `celebration-${Date.now()}-${Math.random().toString(16).slice(2)}` } as CelebrationEvent,
      ],
    })),

  dismissCelebration: () =>
    set((state) => ({
      celebrations: state.celebrations.slice(1),
    })),
}));