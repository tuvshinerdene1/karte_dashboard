'use client';

import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const SAMPLE_ALERTS = [
  {
    id: 1,
    severity: 'critical',
    title: 'Critical Bottleneck at Doctor Stage',
    description: 'Processing time exceeded 45 seconds. 12 items waiting.',
    timestamp: '2 minutes ago',
    stage: 'эмч',
  },
  {
    id: 2,
    severity: 'warning',
    title: 'Moderate Queue Building at EMD',
    description: '8 items pending medical record processing.',
    timestamp: '5 minutes ago',
    stage: 'ЭМД',
  },
  {
    id: 3,
    severity: 'info',
    title: 'Appointment Request Processing Normal',
    description: 'Average processing time: 2.3 seconds',
    timestamp: '15 minutes ago',
    stage: 'цаг захиалга',
  },
];

export default function AlertsSection() {
  return (
    <div className="space-y-4">
      {SAMPLE_ALERTS.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg p-4 border-2 ${
            alert.severity === 'critical'
              ? 'bg-red-50 border-red-200'
              : alert.severity === 'warning'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-1">
              {alert.severity === 'critical' && (
                <AlertCircle className="w-6 h-6 text-purple-600" />
              )}
              {alert.severity === 'warning' && (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
              {alert.severity === 'info' && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{alert.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs bg-white/60 px-2 py-1 rounded font-medium">
                  {alert.stage}
                </span>
                <span className="text-xs text-gray-500">{alert.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
