'use client';

import { useMemo } from 'react';

interface FlowConnectorProps {
  fromStage: string;
  toStage: string;
  fromData?: { bottleneckIndex: number };
  toData?: { bottleneckIndex: number };
  animationPhase: number;
}

export default function FlowConnector({ fromStage, toStage, fromData, toData }: FlowConnectorProps) {
  const bottleneckIndex = Math.max(fromData?.bottleneckIndex ?? 0, toData?.bottleneckIndex ?? 0);

  const colors = useMemo(() => {
    if (bottleneckIndex < 0.33) return { stroke: '#22c55e', particles: '#16a34a', glow: 'rgba(34, 197, 94, 0.3)' };
    if (bottleneckIndex < 0.66) return { stroke: '#eab308', particles: '#ca8a04', glow: 'rgba(234, 179, 8, 0.3)' };
    return { stroke: '#ef4444', particles: '#dc2626', glow: 'rgba(239, 68, 68, 0.3)' };
  }, [bottleneckIndex]);

  const particles = [0, 1, 2];

  return (
    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
      {/* Glow Effect */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Main Path */}
      <line 
        x1="0" y1="20" x2="100" y2="20" 
        stroke={colors.stroke} 
        strokeWidth="3" 
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Animated Flow Line */}
      <line 
        x1="0" y1="20" x2="100" y2="20" 
        stroke="white" 
        strokeWidth="1" 
        strokeDasharray="4,8" 
        opacity="0.5"
      >
        <animate 
          attributeName="stroke-dashoffset" 
          from="12" to="0" 
          dur="1s" 
          repeatCount="indefinite" 
        />
      </line>

      {/* Arrow Head */}
      <path 
        d="M 92 14 L 100 20 L 92 26 Z" 
        fill={colors.stroke} 
      />

      {/* Floating Particles */}
      {particles.map((i) => (
        <circle key={i} r="2.5" fill={colors.particles}>
          <animate 
            attributeName="cx" 
            from="0" to="100" 
            dur={`${1.5 + i * 0.5}s`} 
            begin={`${i * 0.4}s`} 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="opacity" 
            values="0;1;1;0" 
            keyTimes="0;0.2;0.8;1" 
            dur={`${1.5 + i * 0.5}s`} 
            begin={`${i * 0.4}s`} 
            repeatCount="indefinite" 
          />
        </circle>
      ))}
    </svg>
  );
}