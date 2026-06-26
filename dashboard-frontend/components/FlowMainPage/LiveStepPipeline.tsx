'use client';

import { useMemo } from 'react';
import { AlertTriangle, ArrowRight, Clock, Users } from 'lucide-react';
import { useHealthcareFlowStore, type HospitalSnapshotStep, type Alert } from '@/store/healthcareFlowStore';

function getBottleneckLevel(step: HospitalSnapshotStep, alerts: Alert[]) {
  const activeAlerts = alerts.filter((a) => !a.resolved && a.hospitalStepId === step.hospital_step_id);

  const hasCritical = activeAlerts.some((a) => a.type === 'escalation' || a.type === 'error');
  if (hasCritical) return 'critical';

  const hasWarning = activeAlerts.some((a) => a.type === 'overdue');
  if (hasWarning) return 'warning';

  const total = Number(step.waiting_count) + Number(step.in_progress_count);
  if (total === 0) return 'normal';

  const waitRatio = Number(step.waiting_count) / Math.max(1, total);
  if (waitRatio >= 0.7 && Number(step.waiting_count) >= 3) return 'critical';
  if (waitRatio >= 0.4 || Number(step.waiting_count) >= 2) return 'warning';
  return 'normal';
}

const levelStyles = {
  normal: {
    ring: 'border-emerald-400 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800',
    connector: 'bg-emerald-300',
  },
  warning: {
    ring: 'border-amber-400 bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    connector: 'bg-amber-400',
  },
  critical: {
    ring: 'border-red-500 bg-red-50 animate-pulse',
    badge: 'bg-red-100 text-red-800',
    connector: 'bg-red-500',
  },
};

interface LiveStepPipelineProps {
  serviceId?: string | null;
  compact?: boolean;
}

export default function LiveStepPipeline({ serviceId, compact = false }: LiveStepPipelineProps) {
  const { hospitalSnapshot, isLiveConnected, activePatientEvents, alerts } = useHealthcareFlowStore();

  const steps = useMemo(() => {
    if (!hospitalSnapshot || !Array.isArray(hospitalSnapshot)) return [];
    if (!serviceId) return hospitalSnapshot;
    return hospitalSnapshot.filter((step) => step.service_id === serviceId);
  }, [hospitalSnapshot, serviceId]);

  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">
          {isLiveConnected
            ? 'No active steps for this service. Run the simulator to generate live flow.'
            : 'Connecting to live hospital feed…'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}
          />
          <span className="font-medium text-slate-700">
            {isLiveConnected ? 'Live feed connected' : 'Waiting for connection'}
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {activePatientEvents.length} recent events
        </span>
      </div>

      <div className={`flex ${compact ? 'gap-3 overflow-x-auto pb-2' : 'flex-wrap gap-4'} items-stretch`}>
        {steps.map((step, index) => {
          const level = getBottleneckLevel(step, alerts);
          const styles = levelStyles[level];
          const waiting = Number(step.waiting_count);
          const inProgress = Number(step.in_progress_count);

          return (
            <div key={step.hospital_step_id} className="flex items-center gap-2 shrink-0">
              <div
                className={`relative min-w-[140px] rounded-2xl border-2 p-4 shadow-sm ${styles.ring}`}
              >
                {level !== 'normal' && (
                  <AlertTriangle className="absolute -top-2 -right-2 h-5 w-5 text-amber-600" />
                )}
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 text-sm font-bold text-slate-900">{step.step_name}</h3>
                {!compact && (
                  <p className="mt-0.5 text-xs text-slate-500">{step.service_name}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
                    <Clock className="h-3 w-3" />
                    {waiting} waiting
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    <Users className="h-3 w-3" />
                    {inProgress} active
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  Threshold: {step.mid_threshold_minutes}m / {step.high_threshold_minutes}m
                </p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className={`h-5 w-5 shrink-0 ${styles.connector.replace('bg-', 'text-')}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
