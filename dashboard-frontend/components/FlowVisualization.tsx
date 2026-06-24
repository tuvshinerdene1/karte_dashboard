'use client';

import { useEffect, useState, useRef } from 'react';
import { useFlowStore } from '@/store/flowStore';
import FlowStage from './FlowStage';
import FlowConnector from './FlowConnector';

const STAGES = [
  { id: 'appointment' as const, label: 'цаг захиалга', mongolian: 'Appointment Request' },
  { id: 'doctor' as const, label: 'эмч', mongolian: 'Doctor' },
  { id: 'emd' as const, label: 'ЭМД', mongolian: 'Medical Record' },
  { id: 'done' as const, label: 'DONE', mongolian: 'Completed' },
];

export default function FlowVisualization() {
  const { stages } = useFlowStore();
  const [animationPhase, setAnimationPhase] = useState(0);
  
  // Dragging state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      className={`relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Background grid - fixed position */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Draggable Area */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="relative h-full overflow-x-auto no-scrollbar flex items-center select-none"
      >
        <div className="flex items-center px-20 min-w-max">
          {STAGES.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              {/* Stage Circle */}
              <div className="w-32 flex-shrink-0">
                <FlowStage
                  stageId={stage.id}
                  label={stage.label}
                  mongolian={stage.mongolian}
                  stageData={stages[stage.id as keyof typeof stages]}
                  animationPhase={animationPhase}
                />
              </div>

              {/* Connector */}
              {index < STAGES.length - 1 && (
                <div className="w-32 h-16 flex-shrink-0">
                  <FlowConnector
                    fromStage={stage.id}
                    toStage={STAGES[index + 1].id}
                    fromData={stages[stage.id as keyof typeof stages]}
                    toData={stages[STAGES[index + 1].id as keyof typeof stages]}
                    animationPhase={animationPhase}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend - fixed overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-md pointer-events-none">
        <div className="text-xs font-semibold text-gray-700 mb-2">Status Legend:</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Normal Flow</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Bottleneck</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Critical</span></div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}