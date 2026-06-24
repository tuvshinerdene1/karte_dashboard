'use client';

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const SAMPLE_REQUESTS = [
  {
    id: 'REQ-001',
    patient: 'Баттар Нарамбэрэл',
    appointment: '2024-06-23 10:00',
    status: 'completed',
    stage: 'DONE',
    processTime: 24,
  },
  {
    id: 'REQ-002',
    patient: 'Сумьяа Дөлгөөн',
    appointment: '2024-06-23 10:30',
    status: 'processing',
    stage: 'ЭМД',
    processTime: 18,
  },
  {
    id: 'REQ-003',
    patient: 'Энхцэцэг Болор',
    appointment: '2024-06-23 11:00',
    status: 'processing',
    stage: 'эмч',
    processTime: 35,
  },
  {
    id: 'REQ-004',
    patient: 'Цогтаа Батар',
    appointment: '2024-06-23 11:30',
    status: 'pending',
    stage: 'цаг захиалга',
    processTime: 5,
  },
];

export default function RequestsSection() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Appointment
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Current Stage
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Process Time
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_REQUESTS.map((req) => (
              <tr
                key={req.id}
                className={`border-b border-gray-200 ${getStatusColor(
                  req.status
                )} transition-colors hover:opacity-80`}
              >
                <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                  {req.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{req.patient}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{req.appointment}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{req.stage}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {req.processTime}s
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                    <span className="text-sm capitalize font-medium text-gray-900">
                      {req.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
