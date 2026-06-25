'use client';

import { useEffect } from 'react';
import FlowVisualization from './FlowVisualization';
import FlowMetrics from './FlowMetrics';
import { useFlowStore } from '@/store/flowStore';

export default function ProcessFlow() {
  const initializeFlow = useFlowStore((state) => state.initializeFlow);

  useEffect(() => {
    initializeFlow();
  }, [initializeFlow]);

//let child components handle their own loading
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Process Pipeline</h2>
        <FlowVisualization />
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-time Metrics</h2>
        <FlowMetrics />
      </div>
    </div>
  );
}