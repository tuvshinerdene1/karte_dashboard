'use client';

import { useEffect, useState } from 'react';
import { useFlowStore } from '@/store/flowStore';
import FlowStage from './FlowStage';
import FlowConnector from './FlowConnector';

const STAGES = [
  { id: 'appointment', label: 'цаг захиалга', mongolian: 'Appointment Request' },
  { id: 'doctor', label: 'эмч', mongolian: 'Doctor' },
  { id: 'emd', label: 'ЭМД', mongolian: 'Medical Record' },
  { id: 'done', label: 'DONE', mongolian: 'Completed' },
];

export default function FlowVisualization() {
  const { stages } = useFlowStore();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 overflow-hidden">
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Flow container */}
      <div className="relative h-full flex items-center justify-center">
        <div className="flex items-center gap-8 w-full max-w-5xl mx-auto">
          {STAGES.map((stage, index) => (
            <div key={stage.id} className="flex-1 flex items-center">
              <div className="w-full">
                <FlowStage
                  stageId={stage.id}
                  label={stage.label}
                  mongolian={stage.mongolian}
                  stageData={stages[stage.id]}
                  animationPhase={animationPhase}
                />
              </div>

              {/* Connector to next stage */}
              {index < STAGES.length - 1 && (
                <div className="w-20 h-16 relative flex-shrink-0">
                  <FlowConnector
                    fromStage={stage.id}
                    toStage={STAGES[index + 1].id}
                    fromData={stages[stage.id]}
                    toData={stages[STAGES[index + 1].id]}
                    animationPhase={animationPhase}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-md">
        <div className="text-xs font-semibold text-gray-700 mb-2">Status Legend:</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Normal Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Bottleneck Forming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical Blockage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
