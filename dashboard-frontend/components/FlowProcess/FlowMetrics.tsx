'use client';

import { useEffect, useState } from 'react';
import { useFlowStore } from '@/store/flowStore';
import MetricCard from '../Metric_Card_For_All/MetricCard';

export default function FlowMetrics() {
  const { stages } = useFlowStore();
  const [stats, setStats] = useState({
    totalItems: 0,
    avgProcessTime: 0,
    criticalBottleneck: 0,
    throughput: 0,
  });

  useEffect(() => {
    // Calculate aggregate statistics
    const stageIds = Object.keys(stages) as Array<keyof typeof stages>;
    const totalItems = stageIds.reduce((sum, id) => sum + stages[id].count, 0);
    const avgProcessTime =
      stageIds.reduce((sum, id) => sum + stages[id].avgProcessTime, 0) /
      Math.max(1, stageIds.length);
    const criticalBottleneck = Math.max(
      ...stageIds.map((id) => stages[id].bottleneckIndex)
    );

    setStats({
      totalItems,
      avgProcessTime,
      criticalBottleneck,
      throughput: Math.round(totalItems / Math.max(1, avgProcessTime)),
    });
  }, [stages]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Total Items"
        value={stats.totalItems}
        unit="requests"
        trend="up"
        trendValue="+2.5%"
      />
      <MetricCard
        label="Avg Process Time"
        value={stats.avgProcessTime.toFixed(1)}
        unit="seconds"
        trend="down"
        trendValue="-0.3s"
      />
      <MetricCard
        label="Bottleneck Level"
        value={(stats.criticalBottleneck * 100).toFixed(0)}
        unit="%"
        trend={stats.criticalBottleneck > 0.5 ? 'down' : 'up'}
        trendValue={
          stats.criticalBottleneck > 0.5 ? 'Critical' : 'Normal'
        }
      />
      <MetricCard
        label="Throughput"
        value={stats.throughput}
        unit="items/min"
        trend="down"
        trendValue="-0.45%"
      />
    </div>
  );
}
