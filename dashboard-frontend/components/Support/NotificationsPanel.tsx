'use client';

import { Bell, CheckCircle2, MessageSquare, UserPlus, ShieldAlert } from 'lucide-react';

interface SupportNotification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  hospital_step_id: string;
  step_name: string;
  service_name: string;
  service_id?: string;
  staff_name?: string;
}

interface NotificationsPanelProps {
  notifications: SupportNotification[];
  loading: boolean;
  onSelect: (notification: SupportNotification) => void;
}

const iconForType = (type: string) => {
  switch (type) {
    case 'critical':
      return <ShieldAlert className="w-4 h-4 text-red-600" />;
    case 'warning':
      return <Bell className="w-4 h-4 text-orange-600" />;
    case 'info':
      return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
    default:
      return <MessageSquare className="w-4 h-4 text-slate-600" />;
  }
};

export default function NotificationsPanel({
  notifications,
  loading,
  onSelect,
}: NotificationsPanelProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Bell className="w-4 h-4" />
          Loading notifications...
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Bell className="w-4 h-4" />
          No live notifications currently available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Bell className="w-5 h-5 text-blue-600" />
          Live Notifications
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
          {notifications.filter((notification) => !notification.is_read).length} unread
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => onSelect(notification)}
            className={`group w-full text-left rounded-2xl border p-4 transition shadow-sm hover:border-blue-300 hover:bg-blue-50 ${notification.is_read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100'}`}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{iconForType(notification.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{notification.step_name}</p>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{notification.message}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{notification.service_name}</span>
                  {notification.staff_name ? <span className="rounded-full bg-slate-100 px-2 py-1">{notification.staff_name}</span> : null}
                  <span className="rounded-full bg-slate-100 px-2 py-1">{new Date(notification.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${notification.is_read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                {notification.is_read ? 'Read' : 'New'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
