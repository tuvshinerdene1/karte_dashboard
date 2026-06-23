'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down';
  trendValue: string;
}

export default function MetricCard({
  label,
  value,
  unit,
  trend,
  trendValue,
}: MetricCardProps) {
  const isPositive = trend === 'up';
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      <div className={`mt-3 flex items-center gap-1 ${trendColor} text-sm`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{trendValue}</span>
      </div>
    </div>
  );
}
