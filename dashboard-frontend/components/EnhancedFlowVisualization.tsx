'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface FlowNodeProps {
  nodeType: 'appointment' | 'decision' | 'doctor' | 'loop' | 'emd' | 'emd-review' | 'done' | 'error';
  label: string;
  mongolian?: string;
  isHovered?: boolean;
  onHover?: (isHovered: boolean) => void;
  description?: string;
  icon?: React.ReactNode;
}

function FlowNode({
  nodeType,
  label,
  mongolian,
  isHovered,
  onHover,
  description,
  icon,
}: FlowNodeProps) {
  const getNodeStyles = () => {
    const baseStyles = 'relative w-28 h-28 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg';

    const styles: Record<string, string> = {
      'appointment': 'bg-blue-50 border-2 border-blue-300 hover:border-blue-500',
      'decision': 'bg-purple-50 border-2 border-purple-300 hover:border-purple-500',
      'doctor': 'bg-green-50 border-2 border-green-300 hover:border-green-500',
      'loop': 'bg-orange-50 border-2 border-orange-300 hover:border-orange-500',
      'emd': 'bg-cyan-50 border-2 border-cyan-300 hover:border-cyan-500',
      'emd-review': 'bg-indigo-50 border-2 border-indigo-300 hover:border-indigo-500',
      'done': 'bg-green-50 border-2 border-green-400 hover:border-green-600',
      'error': 'bg-red-50 border-2 border-red-300 hover:border-red-500',
    };

    return `${baseStyles} ${styles[nodeType] || styles['appointment']}`;
  };

  const getTextColor = () => {
    const colors: Record<string, string> = {
      'appointment': 'text-blue-700',
      'decision': 'text-purple-700',
      'doctor': 'text-green-700',
      'loop': 'text-orange-700',
      'emd': 'text-cyan-700',
      'emd-review': 'text-indigo-700',
      'done': 'text-green-700',
      'error': 'text-red-700',
    };

    return colors[nodeType] || colors['appointment'];
  };

  return (
    <div className="relative">
      <div
        className={getNodeStyles()}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
        {icon || <Clock className={`w-8 h-8 mb-1 ${getTextColor()}`} />}
        <p className={`text-xs font-semibold text-center ${getTextColor()}`}>{label}</p>
        {nodeType === 'loop' && <Repeat2 className="absolute top-2 right-2 w-4 h-4 text-orange-600 animate-spin opacity-60" />}
        {nodeType === 'error' && <AlertCircle className="absolute top-2 right-2 w-4 h-4 text-red-600" />}
      </div>

      {nodeType === 'appointment' && <MetadataPopover nodeType="appointment" isHovered={isHovered || false} />}
      {nodeType === 'doctor' && <MetadataPopover nodeType="doctor" isHovered={isHovered || false} />}
      {nodeType === 'emd' && <MetadataPopover nodeType="emd" isHovered={isHovered || false} />}
      {nodeType === 'done' && <MetadataPopover nodeType="done" isHovered={isHovered || false} />}

      {description && isHovered && (
        <div className="absolute z-40 bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-900"></div>
        </div>
      )}
    </div>
  );
}

function FlowConnector({
  direction = 'right',
  isActive = true,
  label,
}: {
  direction?: 'right' | 'down' | 'down-left' | 'down-right';
  isActive?: boolean;
  label?: string;
}) {
  const color = isActive ? 'stroke-gray-400' : 'stroke-gray-300';
  const strokeWidth = isActive ? 2 : 1.5;

  const paths: Record<string, string> = {
    'right': 'M 0 50 L 100 50',
    'down': 'M 50 0 L 50 100',
    'down-left': 'M 50 0 Q 0 50 -40 100',
    'down-right': 'M 50 0 Q 100 50 140 100',
  };

  return (
    <svg
      className="absolute"
      width={direction === 'right' ? '100' : '140'}
      height={direction === 'right' ? '100' : '100'}
      viewBox={direction === 'right' ? '0 0 100 100' : '0 0 140 100'}
    >
      <path d={paths[direction]} fill="none" stroke="currentColor" className={`${color} transition-colors`} strokeWidth={strokeWidth} strokeLinecap="round" />
      {isActive && <path d={paths[direction]} fill="none" stroke="url(#gradient)" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray="5,5" />}

      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {label && direction === 'right' && (
        <text x="50" y="35" textAnchor="middle" fontSize="10" fill="#666" className="pointer-events-none">
          {label}
        </text>
      )}

      <polygon points="95,50 90,45 90,55" fill="currentColor" className={color} />
    </svg>
  );
}

export default function EnhancedFlowVisualization() {
  const { appointmentMetrics, doctorMetrics } = useHealthcareFlowStore();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const hasBottleneck = appointmentMetrics.totalWaiting > 8;

  return (
    <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 overflow-auto">
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-5" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Main flow container */}
      <div className="relative mx-auto" style={{ minHeight: '500px', maxWidth: '1400px' }}>
        {/* Row 1: Appointment -> Decision */}
        <div className="flex items-center justify-between mb-16 pl-0">
          {/* Appointment */}
          <FlowNode
            nodeType="appointment"
            label="цаг захиалга"
            mongolian="Appointment"
            icon={<Clock className="w-8 h-8 text-blue-600" />}
            isHovered={hoveredNode === 'appointment'}
            onHover={(hovered) => setHoveredNode(hovered ? 'appointment' : null)}
          />

          {/* Connector */}
          <div className="relative w-32 flex items-center justify-center">
            <FlowConnector direction="right" isActive={true} />
          </div>

          {/* Decision Node */}
          <FlowNode
            nodeType="decision"
            label="Treatment Type"
            mongolian="Эмчилгээний төрөл"
            icon={<ArrowRight className="w-8 h-8 text-purple-600" />}
            isHovered={hoveredNode === 'decision'}
            onHover={(hovered) => setHoveredNode(hovered ? 'decision' : null)}
            description="Select treatment type after examination"
          />
        </div>

        {/* Row 2: Three treatment paths */}
        <div className="flex justify-between mb-16 px-12">
          {/* Normal Treatment Path */}
          <div className="flex flex-col items-center gap-8 flex-1">
            <div className="relative h-20">
              <FlowConnector direction="down" isActive={true} />
            </div>

            <div className="flex flex-col items-center gap-6">
              {/* Doctor Node */}
              <FlowNode
                nodeType="doctor"
                label="эмч"
                mongolian="Doctor"
                icon={<Stethoscope className="w-8 h-8 text-green-600" />}
                isHovered={hoveredNode === 'doctor'}
                onHover={(hovered) => setHoveredNode(hovered ? 'doctor' : null)}
              />

              <div className="relative h-16">
                <FlowConnector direction="down" isActive={true} />
              </div>

              {/* EМD Node */}
              <FlowNode
                nodeType="emd"
                label="ЭМД"
                mongolian="Insurance"
                icon={<FileText className="w-8 h-8 text-cyan-600" />}
                isHovered={hoveredNode === 'emd'}
                onHover={(hovered) => setHoveredNode(hovered ? 'emd' : null)}
              />
            </div>
          </div>

          {/* Inpatient (Хэвтэн) Loop Path */}
          <div className="flex flex-col items-center gap-8 flex-1">
            <div className="relative h-20">
              <FlowConnector direction="down" isActive={true} />
            </div>

            <FlowNode
              nodeType="loop"
              label="Хэвтэн"
              mongolian="Daily Loop"
              icon={<Repeat2 className="w-8 h-8 text-orange-600" />}
              isHovered={hoveredNode === 'loop'}
              onHover={(hovered) => setHoveredNode(hovered ? 'loop' : null)}
              description="Daily treatment loop: 1-30 days"
            />

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 max-w-xs">
              <p className="text-xs font-semibold text-orange-700 mb-2">Daily Loop Process</p>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>✓ Status: Нээлттэй</li>
                <li>✓ Complete daily meds/procedures</li>
                <li>✓ Check daily completion</li>
                <li>✓ Send reminders if incomplete</li>
              </ul>
            </div>
          </div>

          {/* Rehabilitation (Сэргээн Засах) Loop Path */}
          <div className="flex flex-col items-center gap-8 flex-1">
            <div className="relative h-20">
              <FlowConnector direction="down" isActive={true} />
            </div>

            <FlowNode
              nodeType="loop"
              label="Сэргээн Засах"
              mongolian="Rehab Loop"
              icon={<Repeat2 className="w-8 h-8 text-orange-600" />}
              isHovered={hoveredNode === 'rehab'}
              onHover={(hovered) => setHoveredNode(hovered ? 'rehab' : null)}
              description="Rehabilitation loop: 1-30 days"
            />

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 max-w-xs">
              <p className="text-xs font-semibold text-orange-700 mb-2">Daily Loop Process</p>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>✓ Status: Нээлттэй</li>
                <li>✓ Complete daily meds/procedures</li>
                <li>✓ Check daily completion</li>
                <li>✓ Send reminders if incomplete</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Row 3: Convergence to EМD Review */}
        <div className="flex items-center justify-center gap-4 mb-16 px-12">
          <div className="flex-1 flex justify-center">
            <div className="relative w-32 h-16">
              <FlowConnector direction="down-right" isActive={true} />
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative w-32 h-16">
              <FlowConnector direction="down" isActive={true} />
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative w-32 h-16">
              <FlowConnector direction="down-left" isActive={true} />
            </div>
          </div>
        </div>

        {/* Row 4: EМD Review and completion */}
        <div className="flex items-center justify-center gap-12 mb-16">
          {/* EМD Review */}
          <FlowNode
            nodeType="emd-review"
            label="ЭМД Review"
            mongolian="ЭМД Validation"
            icon={<CheckCircle2 className="w-8 h-8 text-indigo-600" />}
            isHovered={hoveredNode === 'emd-review'}
            onHover={(hovered) => setHoveredNode(hovered ? 'emd-review' : null)}
            description="24-hour EМD review deadline"
          />

          <div className="relative w-32 flex items-center justify-center">
            <FlowConnector direction="right" isActive={true} label="Approved" />
          </div>

          {/* Done */}
          <FlowNode
            nodeType="done"
            label="DONE"
            mongolian="Completed"
            icon={<CheckCircle2 className="w-8 h-8 text-green-600" />}
            isHovered={hoveredNode === 'done'}
            onHover={(hovered) => setHoveredNode(hovered ? 'done' : null)}
          />
        </div>

        {/* Error Path */}
        {hasBottleneck && (
          <div className="flex items-center justify-center gap-12 mt-12 px-12">
            <p className="text-sm text-red-600 font-semibold">⚠ Error Path</p>
            <div className="relative w-32 flex items-center justify-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="absolute">
                <path
                  d="M 50 0 Q 100 50 50 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="stroke-red-400"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowRed)"
                />
              </svg>
            </div>

            <FlowNode
              nodeType="error"
              label="Error"
              mongolian="Stopped"
              icon={<AlertCircle className="w-8 h-8 text-red-600" />}
              description="Process stopped due to error"
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-4 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>Appointment Queue</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-purple-400 rounded"></div>
            <span>Decision Branch</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-spin"></div>
            <span>Treatment Loop</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Error Handler</span>
          </div>
        </div>
      </div>
    </div>
  );
}
