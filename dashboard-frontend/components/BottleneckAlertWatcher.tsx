'use client';

import { useEffect, useRef } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { useNotificationStore } from '@/store/notificationStore';

const BOTTLENECK_THRESHOLD = 0.33;
const ESSENTIAL_THRESHOLD = 0.75;

type AlertLevel = 'warning' | 'essential';

const STAGE_LABELS: Record<string, string> = {
  appointment: 'Appointment Request',
  doctor: 'Doctor',
  emd: 'Medical Record',
  done: 'Completed',
};

export default function BottleneckAlertWatcher() {
  const stages = useFlowStore((state) => state.stages);
  const warning = useNotificationStore((state) => state.warning);
  const error = useNotificationStore((state) => state.error);
  const alertedStages = useRef<Map<string, AlertLevel>>(new Map());

  useEffect(() => {
    Object.entries(stages).forEach(([stageId, stageData]) => {
      const isBottleneck = stageData.bottleneckIndex >= BOTTLENECK_THRESHOLD;
      const isEssential = stageData.bottleneckIndex > ESSENTIAL_THRESHOLD;
      const previousAlertLevel = alertedStages.current.get(stageId);
      const nextAlertLevel: AlertLevel = isEssential ? 'essential' : 'warning';
      const stageLabel = STAGE_LABELS[stageId] ?? stageId;
      const message = `Bottleneck detected at ${stageLabel}: ${stageData.count.toFixed(
        0
      )} items waiting, average process time ${stageData.avgProcessTime.toFixed(
        1
      )}s, bottleneck level ${(stageData.bottleneckIndex * 100).toFixed(0)}%.`;

      if (isBottleneck && previousAlertLevel !== nextAlertLevel) {
        alertedStages.current.set(stageId, nextAlertLevel);

        if (isEssential) {
          error({
            title: 'Essential bottleneck warning',
            message,
          });
        } else {
          warning({
            title: 'Bottleneck warning',
            message,
          });
        }
      }

      if (!isBottleneck && previousAlertLevel) {
        alertedStages.current.delete(stageId);
      }
    });
  }, [error, stages, warning]);

  return null;
}
