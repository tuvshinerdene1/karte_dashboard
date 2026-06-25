'use client';

import { useMemo } from 'react';

interface FlowStageProps {
  stageId: string;
  label: string;
  mongolian: string;
  stageData?: {
    count: number;
    avgProcessTime: number;
    bottleneckIndex: number;
  };
  animationPhase: number;
}

export default function FlowStage({
  label,
  mongolian,
  stageData,
}: FlowStageProps) {
  const bottleneckIndex = stageData?.bottleneckIndex ?? 0;

  // Determine color based on bottleneck index
  const getStageColor = () => {
    if (bottleneckIndex < 0.33) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        dot: 'bg-green-500',
        text: 'text-green-700',
        accent: 'from-green-400 to-green-500',
      };
    } else if (bottleneckIndex < 0.66) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        dot: 'bg-yellow-500',
        text: 'text-yellow-700',
        accent: 'from-yellow-400 to-yellow-500',
      };
    } else {
      return {
        bg: 'bg-red-50',
        border: 'border-purple-300',
        dot: 'bg-red-500',
        text: 'text-red-700',
        accent: 'from-red-400 to-red-500',
      };
    }
  };

  const colors = getStageColor();

  // Generate particle positions for flow animation
  const particles = useMemo(() => {
    const count = Math.max(1, Math.floor(stageData?.count ?? 0) / 5);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      delay: (i * 100) / count,
    }));
  }, [stageData?.count]);

  return (
    <div className="flex flex-col items-center relative w-32 shrink-0">
      {/* Main stage circle */}
      <div
        className={`relative w-24 h-24 rounded-full border-2 ${colors.border} ${colors.bg} shadow-lg overflow-hidden flex items-center justify-center`}
      >
        {/* Animated background pulse */}
        <div
          className={`absolute inset-0 opacity-30 rounded-full animate-pulse bg-linear-to-br ${colors.accent}`}
          style={{
            animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
          }}
        ></div>

        {/* Status indicator particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full ${colors.dot}`}
            style={{
              animation: `orbital 3s linear infinite`,
              animationDelay: `${particle.delay}ms`,
              transformOrigin: 'center',
            }}
          ></div>
        ))}

        {/* Center label */}
        <div className="relative z-10 text-center">
          <div className={`text-lg font-bold ${colors.text}`}>{label}</div>
          <div className="text-xs text-gray-600">{stageData?.count ?? 0} items</div>
        </div>
      </div>

      {/* Info text */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-gray-900">{mongolian}</p>
        {stageData && (
          <p className="text-xs text-gray-500">
            Avg: {stageData.avgProcessTime.toFixed(1)}s
          </p>
        )}
      </div>

      {/* Bottleneck percentage bar */}
      {stageData && (
        <div className="mt-3 w-full max-w-xs">
          <div className="text-xs text-gray-600 text-center mb-1">
            Bottleneck: {(bottleneckIndex * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-linear-to-r ${colors.accent} transition-all duration-300`}
              style={{ width: `${bottleneckIndex * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes orbital {
          0% {
            transform: rotate(0deg) translateY(-8px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateY(-8px) rotate(-360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
