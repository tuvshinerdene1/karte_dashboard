'use client';

import { useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import {
  Notification,
  NotificationType,
  useNotificationStore,
} from '@/store/notificationStore';

const notificationStyles: Record<
  NotificationType,
  {
    container: string;
    icon: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    Icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    Icon: AlertCircle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    Icon: Info,
  },
};

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const style = notificationStyles[notification.type];
  const Icon = style.Icon;

  useEffect(() => {
    if (notification.timeout === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss(notification.id);
    }, notification.timeout);

    return () => window.clearTimeout(timeoutId);
  }, [notification.id, notification.timeout, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border-2 p-4 shadow-lg ${style.container}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
      <div className="min-w-0 flex-1">
        {notification.title && (
          <h3 className="text-sm font-semibold text-gray-900">
            {notification.title}
          </h3>
        )}
        <p className="text-sm text-gray-700">{notification.message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(notification.id)}
        className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white/70 hover:text-gray-900"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NotificationViewport() {
  const notifications = useNotificationStore((state) => state.notifications);
  const dismiss = useNotificationStore((state) => state.dismiss);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 flex w-[min(420px,calc(100vw-3rem))] flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
}
