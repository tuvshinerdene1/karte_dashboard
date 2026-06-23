import { create } from 'zustand';

interface StageData {
  count: number;
  avgProcessTime: number;
  bottleneckIndex: number;
}

interface FlowState {
  stages: {
    appointment: StageData;
    doctor: StageData;
    emd: StageData;
    done: StageData;
  };
  initializeFlow: () => void;
  updateStageMetrics: (
    stageId: string,
    updates: Partial<StageData>
  ) => void;
}

export const useFlowStore = create<FlowState>((set) => {
  // Initialize with some data and start simulation
  const startSimulation = () => {
    setInterval(() => {
      set((state) => {
        const newState = { ...state.stages };

        // Simulate varying queue levels with bottleneck at doctor stage
        Object.keys(newState).forEach((key) => {
          const stageId = key as keyof typeof newState;
          const current = newState[stageId];

          // Random fluctuations in queue
          current.count = Math.max(
            0,
            current.count + (Math.random() - 0.4) * 2
          );

          // Process time increases with queue
          current.avgProcessTime = 5 + current.count * 0.8 + Math.random() * 2;

          // Calculate bottleneck index (0-1)
          // Bottleneck forms when processing time exceeds threshold
          const threshold = stageId === 'doctor' ? 15 : 10;
          current.bottleneckIndex = Math.min(
            1,
            Math.max(0, (current.avgProcessTime - threshold) / 30)
          );
        });

        return { stages: newState };
      });
    }, 2000);
  };

  return {
    stages: {
      appointment: {
        count: 3,
        avgProcessTime: 2.3,
        bottleneckIndex: 0.1,
      },
      doctor: {
        count: 8,
        avgProcessTime: 28,
        bottleneckIndex: 0.6,
      },
      emd: {
        count: 5,
        avgProcessTime: 12,
        bottleneckIndex: 0.3,
      },
      done: {
        count: 145,
        avgProcessTime: 0,
        bottleneckIndex: 0,
      },
    },
    initializeFlow: () => {
      startSimulation();
    },
    updateStageMetrics: (stageId, updates) =>
      set((state) => ({
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId as keyof typeof state.stages],
            ...updates,
          },
        },
      })),
  };
});
