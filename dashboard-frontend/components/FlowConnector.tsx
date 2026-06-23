'use client';

import { useMemo } from 'react';

interface FlowConnectorProps {
  fromStage: string;
  toStage: string;
  fromData?: { bottleneckIndex: number };
  toData?: { bottleneckIndex: number };
  animationPhase: number;
}

export default function FlowConnector({
  fromStage,
  toStage,
  fromData,
  toData,
  animationPhase,
}: FlowConnectorProps) {
  const bottleneckIndex = Math.max(
    fromData?.bottleneckIndex ?? 0,
    toData?.bottleneckIndex ?? 0
  );

  // Determine connector color
  const getConnectorColor = () => {
    if (bottleneckIndex < 0.33) {
      return {
        stroke: '#22c55e',
        glow: 'rgba(34, 197, 94, 0.5)',
        particles: '#16a34a',
      };
    } else if (bottleneckIndex < 0.66) {
      return {
        stroke: '#eab308',
        glow: 'rgba(234, 179, 8, 0.5)',
        particles: '#ca8a04',
      };
    } else {
      return {
        stroke: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.5)',
        particles: '#dc2626',
      };
    }
  };

  const colors = getConnectorColor();

  // Generate flowing particles
  const flowParticles = useMemo(() => {
    const count = 4;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      delay: (i * 100) / count,
    }));
  }, []);

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 80 64"
      preserveAspectRatio="none"
      style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
    >
      {/* Main connector line */}
      <defs>
        <linearGradient
          id={`gradient-${fromStage}-${toStage}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.6" />
          <stop offset="50%" stopColor={colors.stroke} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Connection line with glow */}
      <line
        x1="5"
        y1="32"
        x2="75"
        y2="32"
        stroke={colors.stroke}
        strokeWidth="3"
        opacity="0.8"
        strokeLinecap="round"
      />

      {/* Animated dashed line overlay */}
      <line
        x1="5"
        y1="32"
        x2="75"
        y2="32"
        stroke={colors.stroke}
        strokeWidth="2"
        strokeDasharray="8,4"
        opacity="0.4"
        strokeLinecap="round"
        style={{
          animation: `flow 2s linear infinite`,
          animationDirection: bottleneckIndex > 0.5 ? 'reverse' : 'normal',
        }}
      />

      {/* Arrow head */}
      <polygon
        points="75,32 68,28 70,32 68,36"
        fill={colors.stroke}
        opacity="0.8"
      />

      {/* Flowing particles */}
      {flowParticles.map((particle) => (
        <g key={particle.id}>
          <circle
            cx="5"
            cy="32"
            r="2"
            fill={colors.particles}
            opacity="0.7"
            style={{
              animation: `flowParticle 2s ease-in-out infinite`,
              animationDelay: `${particle.delay}ms`,
            }}
          />
        </g>
      ))}

      <style jsx>{`
        @keyframes flow {
          0% {
            strokeDashoffset: 0;
          }
          100% {
            strokeDashoffset: 12;
          }
        }
        @keyframes flowParticle {
          0% {
            cx: 5;
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            cx: 75;
            opacity: 0;
          }
        }
      `}</style>
    </svg>
  );
}
