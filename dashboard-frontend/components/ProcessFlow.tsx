'use client';

import { useEffect, useState } from 'react';
import FlowVisualization from './FlowVisualization';
import FlowMetrics from './FlowMetrics';
import { useFlowStore } from '@/store/flowStore';

export default function ProcessFlow() {
  const [isLoading, setIsLoading] = useState(true);
  const initializeFlow = useFlowStore((state) => state.initializeFlow);

  useEffect(() => {
    initializeFlow();
    setIsLoading(false);
  }, [initializeFlow]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flow visualization...</p>
        </div>
      </div>
    );
  }

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
