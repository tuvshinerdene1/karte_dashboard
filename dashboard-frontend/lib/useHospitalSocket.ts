'use client';

import { useEffect } from 'react';
import { getDashboardSocket } from '@/lib/socket';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';

interface UseHospitalSocketOptions {
  hospitalId?: string | number | null;
  isAdmin?: boolean;
  onNotification?: (notification: Record<string, unknown>) => void;
}

export function useHospitalSocket({
  hospitalId,
  isAdmin = false,
  onNotification,
}: UseHospitalSocketOptions) {
  const { setLiveSnapshot, applyHospitalUpdate, addAlert, setLiveConnected } =
    useHealthcareFlowStore();

  useEffect(() => {
    const socket = getDashboardSocket();
    if (!socket) return undefined;

    let mounted = true;

    const handleConnect = () => {
      if (mounted) setLiveConnected(true);
    };

    const handleDisconnect = () => {
      if (mounted) setLiveConnected(false);
    };

    const handleHospitalUpdate = (update: any) => {
      if (!mounted) return;
      if (isAdmin || !hospitalId || String(update.hospital_id) === String(hospitalId)) {
        applyHospitalUpdate(update);
      }
    };

    const handleSnapshotUpdate = (payload: {
      hospital_id: string;
      snapshot: Parameters<typeof setLiveSnapshot>[0];
    }) => {
      if (!mounted) return;
      if (isAdmin || !hospitalId || String(payload.hospital_id) === String(hospitalId)) {
        setLiveSnapshot(payload.snapshot);
      }
    };

    const handleBottleneckAlert = (payload: {
      title: string;
      message: string;
      alertType: string;
      hospital_id?: string;
      hospital_step_id?: string;
    }) => {
      if (!mounted) return;
      if (isAdmin || !hospitalId || String(payload.hospital_id) === String(hospitalId)) {
        addAlert({
          type: payload.alertType === 'critical' ? 'escalation' : 'overdue',
          title: payload.title,
          description: payload.message,
          hospitalStepId: payload.hospital_step_id,
        });
      }
    };

    const handleNotificationCreated = (payload: {
      notification: Record<string, unknown>;
    }) => {
      onNotification?.(payload.notification);
    };

    socket.connect();
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('HOSPITAL_UPDATE', handleHospitalUpdate);
    socket.on('SNAPSHOT_UPDATE', handleSnapshotUpdate);
    socket.on('BOTTLENECK_ALERT', handleBottleneckAlert);
    socket.on('NOTIFICATION_CREATED', handleNotificationCreated);

    if (isAdmin) {
      socket.emit('join_admin');
    }
    if (hospitalId) {
      socket.emit('join_hospital', String(hospitalId));
    }

    return () => {
      mounted = false;
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('HOSPITAL_UPDATE', handleHospitalUpdate);
      socket.off('SNAPSHOT_UPDATE', handleSnapshotUpdate);
      socket.off('BOTTLENECK_ALERT', handleBottleneckAlert);
      socket.off('NOTIFICATION_CREATED', handleNotificationCreated);
      setLiveConnected(false);
    };
  }, [
    addAlert,
    applyHospitalUpdate,
    hospitalId,
    isAdmin,
    onNotification,
    setLiveConnected,
    setLiveSnapshot,
  ]);
}
