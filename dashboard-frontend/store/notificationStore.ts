import { create } from 'zustand';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  timeout?: number;
}

interface NotificationInput {
  title?: string;
  message: string;
  timeout?: number;
}

interface NotificationState {
  notifications: Notification[];
  notify: (notification: NotificationInput & { type: NotificationType }) => string;
  success: (notification: NotificationInput) => string;
  warning: (notification: NotificationInput) => string;
  error: (notification: NotificationInput) => string;
  info: (notification: NotificationInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const DEFAULT_TIMEOUT = 5000;

const createNotification = (
  notification: NotificationInput & { type: NotificationType }
): Notification => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  timeout: DEFAULT_TIMEOUT,
  ...notification,
});

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  notify: (notification) => {
    const nextNotification = createNotification(notification);

    set((state) => ({
      notifications: [...state.notifications, nextNotification],
    }));

    return nextNotification.id;
  },
  success: (notification) =>
    get().notify({
      ...notification,
      type: 'success',
    }),
  warning: (notification) =>
    get().notify({
      ...notification,
      type: 'warning',
    }),
  error: (notification) =>
    get().notify({
      ...notification,
      type: 'error',
    }),
  info: (notification) =>
    get().notify({
      ...notification,
      type: 'info',
    }),
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id
      ),
    })),
  clear: () => set({ notifications: [] }),
}));
