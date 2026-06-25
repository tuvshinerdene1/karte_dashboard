'use client';

import { useEffect, useRef } from 'react';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';

const BOTTLENECK_THRESHOLD = 60;
const ESSENTIAL_THRESHOLD = 0.75;

type AlertLevel = 'warning' | 'essential';

interface BottleneckSignal {
  id: string;
  label: string;
  level: number;
  context: string;
}

const getLevelFromRatio = (value: number, maximum: number) =>
  Math.min(100, Math.round((value / maximum) * 100));

const getAlertLevel = (level: number): AlertLevel =>
  level > ESSENTIAL_THRESHOLD * 100 ? 'essential' : 'warning';

const buildDescription = (signal: BottleneckSignal) =>
  `Bottleneck detected at ${signal.label}: ${signal.context}. Bottleneck level ${signal.level}%.`;

const buildSignals = ({
  appointmentMetrics,
  doctorMetrics,
}: Pick<
  ReturnType<typeof useHealthcareFlowStore.getState>,
  'appointmentMetrics' | 'doctorMetrics'
>): BottleneckSignal[] => {
  const signals: BottleneckSignal[] = [];

  if (appointmentMetrics.totalWaiting > 8) {
    signals.push({
      id: 'appointment-queue',
      label: 'Appointment Queue',
      level: getLevelFromRatio(appointmentMetrics.totalWaiting, 12),
      context: `${appointmentMetrics.totalWaiting} patients waiting`,
    });
  }

  if (appointmentMetrics.averageWaitTime > 20) {
    signals.push({
      id: 'appointment-wait-time',
      label: 'Appointment Wait Time',
      level: getLevelFromRatio(appointmentMetrics.averageWaitTime, 30),
      context: `${Math.round(appointmentMetrics.averageWaitTime)} minute average wait`,
    });
  }

  if (doctorMetrics.workload > BOTTLENECK_THRESHOLD) {
    signals.push({
      id: 'doctor-workload',
      label: 'Doctor Workload',
      level: Math.round(doctorMetrics.workload),
      context: `${doctorMetrics.busyDoctors} of ${doctorMetrics.totalDoctors} doctors busy`,
    });
  }

  if (doctorMetrics.patientsInQueue > 10) {
    signals.push({
      id: 'doctor-queue',
      label: 'Doctor Queue',
      level: getLevelFromRatio(doctorMetrics.patientsInQueue, 14),
      context: `${doctorMetrics.patientsInQueue} patients waiting for a doctor`,
    });
  }

  return signals;
};

export default function BottleneckAlertWatcher() {
  const appointmentMetrics = useHealthcareFlowStore(
    (state) => state.appointmentMetrics
  );
  const doctorMetrics = useHealthcareFlowStore((state) => state.doctorMetrics);
  const addAlert = useHealthcareFlowStore((state) => state.addAlert);
  const alertedStages = useRef<Map<string, AlertLevel>>(new Map());

  useEffect(() => {
    const activeSignals = buildSignals({ appointmentMetrics, doctorMetrics });
    const activeSignalIds = new Set(activeSignals.map((signal) => signal.id));

    activeSignals.forEach((signal) => {
      const nextAlertLevel = getAlertLevel(signal.level);
      const previousAlertLevel = alertedStages.current.get(signal.id);

      if (previousAlertLevel === nextAlertLevel) {
        return;
      }

      alertedStages.current.set(signal.id, nextAlertLevel);

      addAlert({
        type: nextAlertLevel === 'essential' ? 'escalation' : 'overdue',
        title:
          nextAlertLevel === 'essential'
            ? 'Essential bottleneck warning'
            : 'Bottleneck warning',
        description: buildDescription(signal),
      });
    });

    Array.from(alertedStages.current.keys()).forEach((signalId) => {
      if (!activeSignalIds.has(signalId)) {
        alertedStages.current.delete(signalId);
      }
    });
  }, [addAlert, appointmentMetrics, doctorMetrics]);

  return null;
}
