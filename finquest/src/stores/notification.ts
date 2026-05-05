import { create } from 'zustand';

export type NotificationVariant = 'success' | 'info' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  variant: NotificationVariant;
  timestamp: Date;
}

interface NotificationState {
  notifications: NotificationItem[];
  history: NotificationItem[];
  pushNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearHistory: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  history: [],

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
}));