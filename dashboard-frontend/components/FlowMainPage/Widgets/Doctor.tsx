// components/widgets/DoctorMetricsWidget.tsx
'use client';

import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

function MetricCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = 'blue',
}: MetricCardProps) {
  const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    'blue': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
    },
    'green': {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
    },
    'purple': {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
    },
    'orange': {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
    },
    'red': {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
    },
    'indigo': {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
    },
  };

  const colors = colorMap[color] || colorMap['blue'];
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {unit && <p className="text-sm text-gray-600">{unit}</p>}
          </div>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend && trend !== 'neutral' && <TrendIcon className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && <div className={`${colors.icon} shrink-0`}>{icon}</div>}
      </div>
    </div>
  );
}

export default function DoctorMetricsWidget() {
  const { doctorMetrics } = useHealthcareFlowStore();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">эмч (Doctor)</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Doctors"
          value={doctorMetrics.totalDoctors}
          unit="doctors"
          icon={<Users className="w-8 h-8" />}
          color="green"
        />
        <MetricCard
          label="Available"
          value={doctorMetrics.availableDoctors}
          unit="doctors"
          trend="up"
          trendValue={`${Math.round((doctorMetrics.availableDoctors / doctorMetrics.totalDoctors) * 100)}%`}
          icon={<CheckCircle2 className="w-8 h-8" />}
          color="green"
        />
        <MetricCard
          label="Busy"
          value={doctorMetrics.busyDoctors}
          unit="doctors"
          trend={doctorMetrics.workload > 70 ? 'up' : 'down'}
          trendValue={`${Math.round(doctorMetrics.workload)}%`}
          icon={<Users className="w-8 h-8" />}
          color="orange"
        />
        <MetricCard
          label="Queue"
          value={doctorMetrics.patientsInQueue}
          unit="patients"
          trend={doctorMetrics.patientsInQueue > 10 ? 'up' : 'down'}
          trendValue={doctorMetrics.patientsInQueue > 10 ? 'High' : 'Normal'}
          icon={<TrendingUp className="w-8 h-8" />}
          color="blue"
        />
      </div>
    </div>
  );
}