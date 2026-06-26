'use client';

import { Activity, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';

const statusIcon = {
  waiting: Clock,
  in_progress: PlayCircle,
  completed: CheckCircle2,
};

const statusColor = {
  waiting: 'text-amber-600 bg-amber-50 border-amber-200',
  in_progress: 'text-blue-600 bg-blue-50 border-blue-200',
  completed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

export default function LiveActivityFeed() {
  const { activePatientEvents, isLiveConnected } = useHealthcareFlowStore();

  if (activePatientEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Activity className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm text-slate-600">
          {isLiveConnected
            ? 'No patient activity yet. Start the Python simulator to see real-time events.'
            : 'Waiting for live connection…'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {activePatientEvents.map((event) => {
        const Icon = statusIcon[event.status as keyof typeof statusIcon] ?? Activity;
        const colorClass = statusColor[event.status as keyof typeof statusColor] ?? 'text-slate-600 bg-slate-50 border-slate-200';
        const uniqueKey = `${event.patient_identifier}-${event.hospital_step_id}-${event.timestamp.getTime()}`;

        return (
          <div
            key={uniqueKey}
            className={`flex items-start gap-3 rounded-xl border p-3 ${colorClass}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm">{event.patient_identifier}</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] uppercase font-bold">
                  {event.action} → {event.status}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-80">
                {event.step_name ?? 'Unknown step'}
                {event.service_name ? ` · ${event.service_name}` : ''}
              </p>
              {event.message && (
                <p className="mt-1 text-xs opacity-70">{event.message}</p>
              )}
              <p className="mt-1 text-[10px] opacity-60">
                {event.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
