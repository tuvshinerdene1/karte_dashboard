'use client';

import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

export default function MetricCard({
  label,
  value,
  unit,
  trend = 'neutral',
  trendValue,
  icon,
  color = 'blue', // Default value here is fine
}: MetricCardProps) {
  const colorMap: Record<NonNullable<MetricCardProps['color']>, { bg: string; border: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
  };

  // Since color has a default value, this is safe
  const colors = colorMap[color];
  
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}> 
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {unit && <span className="text-sm text-gray-600">{unit}</span>}
          </div>
          {trendValue && (
            <div className={`mt-3 flex items-center gap-1 ${trendColor} text-xs font-medium`}>
              {trend !== 'neutral' && <TrendIcon className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && <div className={`${colors.icon} shrink-0`}>{icon}</div>}
      </div>
    </div>
  );
}