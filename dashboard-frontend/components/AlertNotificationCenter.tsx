'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, X } from 'lucide-react';
import { Alert, useHealthcareFlowStore } from '@/store/healthcareFlowStore';

const DEFAULT_AUTO_DISMISS_MS = 7000;
const MAX_COLLAPSED_VISIBLE = 1;

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'reminder':
      return <Clock className="h-5 w-5 text-blue-600" />;
    case 'overdue':
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case 'escalation':
      return <TrendingUp className="h-5 w-5 text-red-600" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-700" />;
    case 'info':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
};

const getAlertStyles = (type: Alert['type']) => {
  const styles: Record<Alert['type'], string> = {
    reminder: 'bg-blue-50 border-blue-200',
    overdue: 'bg-orange-50 border-orange-200',
    escalation: 'bg-red-50 border-red-200',
    error: 'bg-red-100 border-red-300',
    info: 'bg-green-50 border-green-200',
  };

  return styles[type];
};

const getTextStyles = (type: Alert['type']) => {
  const styles: Record<Alert['type'], string> = {
    reminder: 'text-blue-800',
    overdue: 'text-orange-800',
    escalation: 'text-red-800',
    error: 'text-red-900',
    info: 'text-green-800',
  };

  return styles[type];
};

const shouldAutoDismiss = (alert: Alert) =>
  alert.type !== 'error' && alert.type !== 'escalation';

function NotificationCard({
  alert,
  onDismiss,
  compact = false,
}: {
  alert: Alert;
  onDismiss: (alertId: string) => void;
  compact?: boolean;
}) {
  const textStyles = getTextStyles(alert.type);

  return (
    <div
      className={`pointer-events-auto border p-4 shadow-lg transition-all duration-300 ${getAlertStyles(
        alert.type
      )} ${compact ? 'rounded-lg' : 'rounded-lg'}`}
    >
      <div className="flex items-start gap-3">
        {getAlertIcon(alert.type)}

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${textStyles}`}>{alert.title}</p>
          <p
            className={`mt-1 text-xs ${textStyles
              .replace('800', '700')
              .replace('900', '800')}`}
          >
            {alert.description}
          </p>
          <p className="mt-2 text-xs text-gray-600">
            {alert.timestamp.toLocaleTimeString()}
          </p>
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(alert.id)}
          className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-white/70 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AlertNotificationCenter() {
  const alerts = useHealthcareFlowStore((state) => state.alerts);
  const resolveAlert = useHealthcareFlowStore((state) => state.resolveAlert);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => !alert.resolved)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [alerts]
  );
  const latestAlerts = activeAlerts.slice(-MAX_COLLAPSED_VISIBLE);
  const hiddenCount = Math.max(0, activeAlerts.length - latestAlerts.length);
  const isStackExpanded = isExpanded && activeAlerts.length > 1;

  useEffect(() => {
    const timeoutIds = activeAlerts
      .filter(shouldAutoDismiss)
      .map((alert) => {
        const elapsedMs = Date.now() - alert.timestamp.getTime();
        const remainingMs = Math.max(0, DEFAULT_AUTO_DISMISS_MS - elapsedMs);

        return window.setTimeout(() => {
          resolveAlert(alert.id);
        }, remainingMs);
      });

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [activeAlerts, resolveAlert]);

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 w-[min(420px,calc(100vw-3rem))]">
      <div
        className={`flex flex-col gap-3 overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          isStackExpanded ? 'max-h-[70vh] opacity-100' : 'max-h-44 opacity-100'
        }`}
      >
        {(isStackExpanded ? activeAlerts : latestAlerts).map((alert) => (
          <NotificationCard
            key={alert.id}
            alert={alert}
            onDismiss={resolveAlert}
            compact={!isStackExpanded}
          />
        ))}
      </div>

      {activeAlerts.length > MAX_COLLAPSED_VISIBLE && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="pointer-events-auto mt-2 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 shadow-lg backdrop-blur transition-colors hover:bg-gray-50"
        >
          <span>
            {isStackExpanded
              ? 'Collapse notifications'
              : `${hiddenCount} more notification${hiddenCount === 1 ? '' : 's'}`}
          </span>
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-white">
            {activeAlerts.length}
          </span>
        </button>
      )}
    </div>
  );
}
