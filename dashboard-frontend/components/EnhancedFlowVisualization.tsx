'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';
import MetadataPopover from './MetadataPopover';
import {
  Clock,
  Stethoscope,
  FileText,
  CheckCircle2,
  ArrowRight,
  Repeat2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';

// --- Internal FlowNode Component ---
interface FlowNodeProps {
  nodeType: 'appointment' | 'decision' | 'doctor' | 'loop' | 'emd' | 'emd-review' | 'done' | 'error';
  label: string;
  mongolian?: string;
  isHovered?: boolean;
  onHover?: (isHovered: boolean) => void;
  description?: string;
  icon?: React.ReactNode;
}

function FlowNode({ nodeType, label, mongolian, isHovered, onHover, description, icon }: FlowNodeProps) {
  const getNodeStyles = () => {
    const baseStyles = 'relative w-36 h-20 bg-white border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]';
    const styles: Record<string, string> = {
      appointment: 'border-blue-500 text-blue-700',
      decision: 'border-purple-500 text-purple-700',
      doctor: 'border-green-500 text-green-700',
      loop: 'border-orange-500 text-orange-700',
      emd: 'border-cyan-500 text-cyan-700',
      'emd-review': 'border-indigo-500 text-indigo-700',
      done: 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold',
      error: 'border-red-500 text-red-700',
    };
    return `${baseStyles} ${styles[nodeType] || styles['appointment']} ${isHovered ? 'translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] border-current' : ''}`;
  };

  return (
    <div className="relative">
      <div
        className={getNodeStyles()}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
        <div className="flex items-center gap-2">
          {icon || <Clock className="w-4 h-4" />}
          <p className="text-[10px] uppercase font-black tracking-widest">{label}</p>
        </div>
        <p className="text-[9px] opacity-70 mt-1 font-mono">{mongolian}</p>
        {nodeType === 'loop' && <Repeat2 className="absolute top-1 right-1 w-3 h-3 animate-spin-slow opacity-40" />}
      </div>

      {['appointment', 'doctor', 'emd', 'done'].includes(nodeType) && (
        <MetadataPopover nodeType={nodeType as any} isHovered={isHovered || false} />
      )}

      {description && isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-[9px] p-2 pointer-events-none uppercase tracking-tighter leading-tight text-center">
          {description}
        </div>
      )}
    </div>
  );
}

// --- Industrial Orthogonal Connector ---
function IndustrialConnector({ variant = 'down', isActive = true }: { variant?: 'down' | 'split-left' | 'split-right' | 'merge-left' | 'merge-right'; isActive?: boolean; }) {
  const paths: Record<string, string> = {
    'down': 'M 50 0 L 50 100',
    'split-left': 'M 100 0 L 100 50 L 0 50 L 0 100',
    'split-right': 'M 0 0 L 0 50 L 100 50 L 100 100',
    'merge-left': 'M 0 0 L 0 50 L 100 50 L 100 100',
    'merge-right': 'M 100 0 L 100 50 L 0 50 L 0 100',
  };

  return (
    <svg className="overflow-visible w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={paths[variant]} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      {isActive && (
        <path d={paths[variant]} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6,6">
          <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
        </path>
      )}
      <circle cx={variant.includes('left') ? (variant.includes('split') ? 0 : 100) : variant.includes('right') ? (variant.includes('split') ? 100 : 0) : 50} cy="100" r="3" fill="#64748b" />
    </svg>
  );
}

// --- Main Component ---
export default function EnhancedFlowVisualization() {
  const { appointmentMetrics } = useHealthcareFlowStore();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState({ isDragging: false, x: 0, y: 0, left: 0, top: 0 });

  // Center the view on initial load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 1500 - scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollTop = 100;
    }
  }, []);

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') setZoom(prev => Math.min(prev + 0.2, 2));
    else if (type === 'out') setZoom(prev => Math.max(prev - 0.2, 0.4));
    else setZoom(1);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setDrag({
      isDragging: true,
      x: e.clientX,
      y: e.clientY,
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.isDragging || !scrollRef.current) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    scrollRef.current.scrollLeft = drag.left - dx;
    scrollRef.current.scrollTop = drag.top - dy;
  };

  return (
    <div className="relative w-full h-[750px] bg-[#f8fafc] rounded-lg border-2 border-slate-300 overflow-hidden shadow-2xl">
      
      {/* HUD - Toolbar */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <div className="flex bg-white border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button onClick={() => handleZoom('in')} className="p-2 border-r-2 border-slate-800 hover:bg-slate-100"><ZoomIn size={18} /></button>
          <button onClick={() => handleZoom('out')} className="p-2 border-r-2 border-slate-800 hover:bg-slate-100"><ZoomOut size={18} /></button>
          <button onClick={() => handleZoom('reset')} className="p-2 hover:bg-slate-100"><Maximize size={18} /></button>
        </div>
        <div className="bg-slate-800 text-white px-3 py-1 font-mono text-xs tracking-tighter">
          SCALE: {Math.round(zoom * 100)}%
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={() => setDrag(d => ({ ...d, isDragging: false }))}
        onMouseLeave={() => setDrag(d => ({ ...d, isDragging: false }))}
        className={`w-full h-full overflow-auto no-scrollbar ${drag.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div 
          className="relative transition-transform duration-75 origin-top flex flex-col items-center"
          style={{ transform: `scale(${zoom})`, width: '3000px', height: '2000px', paddingTop: '100px' }}
        >
          {/* Engineering Blueprint Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
            style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />

          {/* 1. START */}
          <FlowNode nodeType="appointment" label="1. Registration" mongolian="Цаг захиалга" isHovered={hoveredNode === 'apt'} onHover={(h) => setHoveredNode(h ? 'apt' : null)} />
          <div className="h-8 w-12"><IndustrialConnector variant="down" /></div>

          {/* 2. TRIAGE */}
          <FlowNode nodeType="decision" label="2. System Triage" mongolian="Оношилгоо" icon={<ArrowRight className="w-4 h-4" />} isHovered={hoveredNode === 'dec'} onHover={(h) => setHoveredNode(h ? 'dec' : null)} />

          {/* 3. ORTHOGONAL SPLIT */}
          <div className="grid grid-cols-3 w-full max-w-4xl h-10">
             <div className="h-full"><IndustrialConnector variant="split-left" /></div>
             <div className="h-full"><IndustrialConnector variant="down" /></div>
             <div className="h-full"><IndustrialConnector variant="split-right" /></div>
          </div>

          {/* 4. LANES */}
          <div className="grid grid-cols-3 gap-32 w-full max-w-6xl">
            {/* Lane A */}
            <div className="flex flex-col items-center">
              <FlowNode nodeType="doctor" label="3A. OPD Visit" mongolian="Үзлэг" isHovered={hoveredNode === 'doc'} onHover={(h) => setHoveredNode(h ? 'doc' : null)} />
              <div className="h-8 w-12"><IndustrialConnector variant="down" /></div>
              <FlowNode nodeType="emd" label="4A. EMD Logs" mongolian="ЭМД Бүртгэл" isHovered={hoveredNode === 'emd'} onHover={(h) => setHoveredNode(h ? 'emd' : null)} />
            </div>

            {/* Lane B */}
            <div className="flex flex-col items-center">
              <FlowNode nodeType="loop" label="3B. IPD Ward" mongolian="Хэвтэн" isHovered={hoveredNode === 'loop1'} onHover={(h) => setHoveredNode(h ? 'loop1' : null)} />
              <div className="mt-2 p-2 bg-slate-100 border border-slate-300 font-mono text-[8px] w-40 text-slate-500 uppercase tracking-tighter">
                Status: In-Treatment<br/>Cycle: Daily Protocol
              </div>
            </div>

            {/* Lane C */}
            <div className="flex flex-col items-center">
              <FlowNode nodeType="loop" label="3C. Rehab" mongolian="Сэргээн" isHovered={hoveredNode === 'loop2'} onHover={(h) => setHoveredNode(h ? 'loop2' : null)} />
              <div className="mt-2 p-2 bg-slate-100 border border-slate-300 font-mono text-[8px] w-40 text-slate-500 uppercase tracking-tighter">
                Status: Recovering<br/>Physiotherapy Active
              </div>
            </div>
          </div>

          {/* 5. ORTHOGONAL MERGE */}
          <div className="grid grid-cols-3 w-full max-w-6xl h-10 mt-8">
             <div className="h-full"><IndustrialConnector variant="merge-left" /></div>
             <div className="h-full"><IndustrialConnector variant="down" /></div>
             <div className="h-full"><IndustrialConnector variant="merge-right" /></div>
          </div>

          {/* 6. FINAL */}
          <div className="flex flex-col items-center">
            <FlowNode nodeType="emd-review" label="5. Validation" mongolian="ЭМД Хяналт" isHovered={hoveredNode === 'rev'} onHover={(h) => setHoveredNode(h ? 'rev' : null)} />
            <div className="h-8 w-12"><IndustrialConnector variant="down" /></div>
            <FlowNode nodeType="done" label="6. Exit System" mongolian="Дууссан" icon={<CheckCircle2 className="w-4 h-4" />} isHovered={hoveredNode === 'done'} onHover={(h) => setHoveredNode(h ? 'done' : null)} />
          </div>

          {/* Floated Metrics Warning */}
          {appointmentMetrics.totalWaiting > 5 && (
            <div className="absolute top-40 left-[1600px] bg-red-100 border-2 border-red-600 p-4 font-mono shadow-[8px_8px_0px_0px_#dc2626]">
              <div className="flex items-center gap-2 text-red-600 font-black text-xs">
                <AlertCircle size={16} /> SYSTEM OVERLOAD
              </div>
              <p className="text-[10px] text-red-500 mt-1">QUEUE_THRESHOLD_EXCEEDED</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend Hud */}
      <div className="absolute bottom-6 left-6 bg-slate-900 text-white p-4 font-mono text-[10px] border border-white/20 shadow-2xl">
        <p className="border-b border-white/20 mb-2 pb-1 opacity-50 uppercase tracking-widest">Pipeline Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500" /> REGISTRATION</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500" /> TRIAGE POINT</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500" /> RECURSIVE CARE</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500" /> SYSTEM EXIT</div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
}