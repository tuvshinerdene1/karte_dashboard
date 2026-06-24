'use client';

import { useHealthcareFlowStore, Alert } from '@/store/healthcareFlowStore';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function EnhancedAlerts() {
  const { alerts, resolveAlert } = useHealthcareFlowStore();
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Filter unresolved alerts
    setDisplayAlerts(alerts.filter((a) => !a.resolved).slice(-5)); // Show last 5
  }, [alerts]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'escalation':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-700" />;
      case 'info':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    const styles: Record<Alert['type'], string> = {
      'reminder': 'bg-blue-50 border-blue-200',
      'overdue': 'bg-orange-50 border-orange-200',
      'escalation': 'bg-red-50 border-red-200',
      'error': 'bg-red-100 border-red-300',
      'info': 'bg-green-50 border-green-200',
    };
    return styles[type];
  };

  const getTextStyles = (type: Alert['type']) => {
    const styles: Record<Alert['type'], string> = {
      'reminder': 'text-blue-800',
      'overdue': 'text-orange-800',
      'escalation': 'text-red-800',
      'error': 'text-red-900',
      'info': 'text-green-800',
    };
    return styles[type];
  };

  if (displayAlerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
        <p className="text-gray-600">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.type)}

            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${getTextStyles(alert.type)}`}>
                {alert.title}
              </p>
              <p className={`text-xs mt-1 ${getTextStyles(alert.type).replace('800', '700').replace('900', '800')}`}>
                {alert.description}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                {alert.timestamp.toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={() => resolveAlert(alert.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
