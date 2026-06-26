'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/Auth/AuthProvider';
import NotificationsPanel from '@/components/Support/NotificationsPanel';
import LiveStepPipeline from '@/components/FlowMainPage/LiveStepPipeline';
import LiveActivityFeed from '@/components/FlowMainPage/LiveActivityFeed';
import { useHospitalSocket } from '@/lib/useHospitalSocket';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';

interface HospitalOption {
  id: string;
  name: string;
}

interface ServiceOption {
  id: string;
  service_name: string;
}

interface NotificationItem {
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

interface SupportRequestItem {
  id: string;
  hospital_id: string | null;
  requester_staff_id: string | null;
  assigned_operator_id: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  assigned_operator_username?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequestItem[]>([]);
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [newRequestPriority, setNewRequestPriority] = useState('medium');
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editingRequestStatus, setEditingRequestStatus] = useState('');
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [hospitalMetrics, setHospitalMetrics] = useState<{
    totalWaiting: number;
    totalInProgress: number;
    avgWaitTime: number;
    totalCases: number;
  }>({ totalWaiting: 0, totalInProgress: 0, avgWaitTime: 0, totalCases: 0 });
  const { setLiveSnapshot, isLiveConnected } = useHealthcareFlowStore();

  const handleNotificationCreated = useCallback((notification: Record<string, unknown>) => {
    setNotifications((current) => [
      {
        id: String(notification.id),
        type: String(notification.type ?? 'info'),
        message: String(notification.message ?? ''),
        is_read: Boolean(notification.is_read),
        created_at: String(notification.created_at ?? new Date().toISOString()),
        hospital_step_id: String(notification.hospital_step_id ?? ''),
        step_name: String(notification.step_name ?? ''),
        service_name: String(notification.service_name ?? ''),
        service_id: String(notification.service_id ?? ''),
        staff_name: notification.staff_name ? String(notification.staff_name) : undefined,
      },
      ...current,
    ]);
  }, []);

  useHospitalSocket({
    hospitalId: selectedHospitalId,
    isAdmin: true,
    onNotification: handleNotificationCreated,
  });

  useEffect(() => {
    if (!selectedHospitalId) return;

    async function loadSnapshot() {
      try {
        const response = await apiFetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/hospital/${selectedHospitalId}/snapshot`
        );
        if (!response.ok) return;
        const snapshot = await response.json();
        setLiveSnapshot(snapshot);

        // Compute aggregate metrics
        const totalWaiting = snapshot.reduce((sum: number, step: any) => sum + (step.waiting_count ?? 0), 0);
        const totalInProgress = snapshot.reduce((sum: number, step: any) => sum + (step.in_progress_count ?? 0), 0);
        const avgWaitTime = snapshot.length > 0 ? Math.round(totalWaiting / snapshot.length) : 0;

        setHospitalMetrics({
          totalWaiting,
          totalInProgress,
          avgWaitTime,
          totalCases: totalWaiting + totalInProgress,
        });
      } catch (error) {
        console.error('Error loading admin snapshot', error);
      }
    }

    loadSnapshot();
  }, [selectedHospitalId, setLiveSnapshot]);

  useEffect(() => {
    async function loadHospitals() {
      setLoadingHospitals(true);
      try {
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/hospital`);
        if (!response.ok) throw new Error('Failed to load hospitals');
        const hospitalsData = await response.json();
        setHospitals(hospitalsData);
        if (hospitalsData.length > 0) {
          setSelectedHospitalId(hospitalsData[0].id);
        }
      } catch (error) {
        console.error('Error loading hospitals', error);
      } finally {
        setLoadingHospitals(false);
      }
    }

    loadHospitals();
  }, []);

  useEffect(() => {
    if (!selectedHospitalId) return;

    async function loadServices() {
      setLoadingServices(true);
      try {
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/hospital/${selectedHospitalId}/service`);
        if (!response.ok) throw new Error('Failed to load services');
        const servicesData = await response.json();
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading services', error);
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [selectedHospitalId]);

  useEffect(() => {
    async function loadNotifications() {
      setLoadingNotifications(true);
      try {
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/support/notifications`);
        if (!response.ok) throw new Error('Failed to load notifications');
        const notificationsData = await response.json();
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading notifications', error);
      } finally {
        setLoadingNotifications(false);
      }
    }

    async function loadRequests() {
      setLoadingRequests(true);
      try {
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/support/requests`);
        if (!response.ok) throw new Error('Failed to load support requests');
        const requestsData = await response.json();
        setSupportRequests(requestsData);
      } catch (error) {
        console.error('Error loading support requests', error);
      } finally {
        setLoadingRequests(false);
      }
    }

    loadNotifications();
    loadRequests();
  }, []);

  const currentHospital = useMemo(
    () => hospitals.find((hospital) => hospital.id === selectedHospitalId),
    [hospitals, selectedHospitalId]
  );

  const currentService = useMemo(
    () => services.find((service) => service.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const handleNotificationSelect = async (notification: NotificationItem) => {
    try {
      const payload = {
        patient_identifier: notification.message.match(/Patient\s+([A-Za-z0-9-_]+)/)?.[1] ?? 'unknown',
        hospital_step_id: notification.hospital_step_id,
        action: 'START',
      };
      await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/hospital/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error selecting notification', error);
    }
  };

  const handleUpdateRequest = async (requestId: string, newStatus: string) => {
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/support/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error('Failed to update request');
      const updatedRequest = await response.json();
      setSupportRequests((current) =>
        current.map((req) => (req.id === requestId ? updatedRequest : req))
      );
      setEditingRequestId(null);
    } catch (error) {
      console.error('Error updating request', error);
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedHospitalId || !newRequestTitle.trim()) {
      return;
    }

    try {
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/api/support/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospital_id: selectedHospitalId,
          title: newRequestTitle.trim(),
          description: newRequestDescription.trim(),
          priority: newRequestPriority,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to create request');
      }

      setNewRequestTitle('');
      setNewRequestDescription('');
      setNewRequestPriority('medium');
      const createdRequest = await response.json();
      setSupportRequests((current) => [createdRequest, ...current]);
    } catch (error) {
      console.error('Error creating support request', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">System Admin Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                Select a hospital and service to inspect live snapshot and notifications.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Logged in as <span className="font-semibold">{user?.username}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-600">
              Hospital
              <select
                value={selectedHospitalId ?? ''}
                onChange={(event) => setSelectedHospitalId(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              Service
              <select
                value={selectedServiceId ?? ''}
                onChange={(event) => setSelectedServiceId(event.target.value || null)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Show All Services (Overall Metrics)</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">Current selection</p>
              <p>{currentHospital?.name ?? 'No hospital selected'}</p>
              <p>{currentService?.service_name ?? 'No service selected'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Live hospital flow</h2>
                <span className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`inline-flex h-2 w-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  {isLiveConnected ? 'Connected' : 'Connecting…'}
                </span>
              </div>
              <LiveStepPipeline serviceId={selectedServiceId} />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent simulation activity</h2>
              <LiveActivityFeed />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Notifications and operator actions</h3>
              <NotificationsPanel
                notifications={notifications}
                loading={loadingNotifications}
                onSelect={handleNotificationSelect}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-blue-50 to-blue-100 p-4 shadow-sm">
                <dt className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Waiting</dt>
                <dd className="mt-3 text-3xl font-bold text-blue-900">{hospitalMetrics.totalWaiting}</dd>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-orange-50 to-orange-100 p-4 shadow-sm">
                <dt className="text-xs uppercase tracking-wide text-orange-700 font-semibold">In Progress</dt>
                <dd className="mt-3 text-3xl font-bold text-orange-900">{hospitalMetrics.totalInProgress}</dd>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-purple-50 to-purple-100 p-4 shadow-sm">
                <dt className="text-xs uppercase tracking-wide text-purple-700 font-semibold">Avg Wait (min)</dt>
                <dd className="mt-3 text-3xl font-bold text-purple-900">{hospitalMetrics.avgWaitTime}</dd>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-emerald-50 to-emerald-100 p-4 shadow-sm">
                <dt className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Total Cases</dt>
                <dd className="mt-3 text-3xl font-bold text-emerald-900">{hospitalMetrics.totalCases}</dd>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Support Requests</h3>
                  <p className="mt-1 text-sm text-slate-600">Admin can respond to and track staff requests.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 font-semibold">
                  {supportRequests.length} total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {supportRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium">{request.title}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            request.priority === 'high' ? 'bg-red-100 text-red-700' :
                            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {editingRequestId === request.id ? (
                            <select
                              value={editingRequestStatus}
                              onChange={(e) => setEditingRequestStatus(e.target.value)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="closed">Closed</option>
                            </select>
                          ) : (
                            <span className="capitalize">{request.status}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{request.assigned_operator_username ?? 'Unassigned'}</td>
                        <td className="px-4 py-3">
                          {editingRequestId === request.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateRequest(request.id, editingRequestStatus)}
                                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRequestId(null)}
                                className="text-xs px-2 py-1 bg-slate-300 text-slate-900 rounded hover:bg-slate-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingRequestId(request.id);
                                setEditingRequestStatus(request.status);
                              }}
                              className="text-xs px-2 py-1 bg-slate-200 text-slate-900 rounded hover:bg-slate-300"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
