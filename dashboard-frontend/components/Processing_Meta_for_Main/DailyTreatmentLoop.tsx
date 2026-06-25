'use client';

import { useState, useEffect } from 'react';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';
import { calculateRemainingTimeForDay, getStatusColor } from '@/lib/healthcareUtils';
import { CheckCircle2, Clock, AlertCircle, Pill, Stethoscope } from 'lucide-react';

interface DailyTreatmentLoopProps {
  patientId: string;
  patientName: string;
}

export default function DailyTreatmentLoop({
  patientId,
  patientName,
}: DailyTreatmentLoopProps) {
  const { patientsInTreatmentLoop, completeDailyTask, finalizeDayTreatment, addAlert } = useHealthcareFlowStore();
  const [timeRemaining, setTimeRemaining] = useState<Record<number, { hours: number; minutes: number; isExpired: boolean }>>({});

  const patientTreatment = patientsInTreatmentLoop.find((p) => p.patientId === patientId);

  useEffect(() => {
    // Update remaining time every minute
    const interval = setInterval(() => {
      if (!patientTreatment?.dailyTasks) return;

      const newTimeRemaining: Record<number, { hours: number; minutes: number; isExpired: boolean }> = {};

      patientTreatment.dailyTasks.forEach((task, index) => {
        newTimeRemaining[index] = calculateRemainingTimeForDay(task.date);
      });

      setTimeRemaining(newTimeRemaining);
    }, 60000);

    return () => clearInterval(interval);
  }, [patientTreatment?.dailyTasks]);

  if (!patientTreatment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-700">No treatment loop found for this patient.</p>
      </div>
    );
  }

  const statusColor = getStatusColor(patientTreatment.currentStatus);

  return (
    <div className="space-y-4">
      {/* Treatment Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Treatment Progress</h3>
            <p className="text-sm text-gray-600">{patientName}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
            {patientTreatment.currentStatus}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Type</div>
            <div className="font-semibold text-gray-900">{patientTreatment.treatmentType}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Current Day</div>
            <div className="font-semibold text-gray-900">{patientTreatment.currentDay + 1} / {patientTreatment.dailyTasks.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Completed</div>
            <div className="font-semibold text-gray-900">{patientTreatment.completedDays}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Cost</div>
            <div className="font-semibold text-gray-900">₮{patientTreatment.cost}</div>
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Daily Tasks</h4>

        {patientTreatment.dailyTasks.map((dailyTask, dayIndex) => {
          const taskDate = new Date(dailyTask.date);
          const remaining = timeRemaining[dayIndex];
          const allMedicationsComplete = dailyTask.medications.every((m) => m.completed);
          const allProceduresComplete = dailyTask.procedures.every((p) => p.completed);
          const isCurrentDay = dayIndex === patientTreatment.currentDay;

          return (
            <div
              key={dailyTask.id}
              className={`bg-white rounded-lg border p-4 transition-all ${
                isCurrentDay
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                  : dailyTask.status === 'completed'
                  ? 'border-green-300 opacity-70'
                  : 'border-gray-200'
              }`}
            >
              {/* Day header with time remaining */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Day {dayIndex + 1}
                  </span>
                  <span className="text-xs text-gray-600">
                    {taskDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {remaining && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    remaining.isExpired
                      ? 'text-red-600'
                      : isCurrentDay
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    {remaining.isExpired ? (
                      <span>EXPIRED</span>
                    ) : (
                      <span>{remaining.hours}h {remaining.minutes}m</span>
                    )}
                  </div>
                )}
              </div>

              {/* Medications */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Medications</span>
                </div>
                <div className="space-y-1 ml-6">
                  {dailyTask.medications.map((med, medIndex) => (
                    <button
                      key={medIndex}
                      onClick={() => {
                        if (isCurrentDay && dailyTask.status !== 'completed') {
                          completeDailyTask(patientId, dayIndex, 'medication', medIndex);
                        }
                      }}
                      className={`flex items-center gap-2 text-sm py-1 px-2 rounded transition-colors w-full text-left ${
                        med.completed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${!isCurrentDay || dailyTask.status === 'completed' ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                      disabled={!isCurrentDay || dailyTask.status === 'completed'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${med.completed ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>{med.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Procedures */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Procedures</span>
                </div>
                <div className="space-y-1 ml-6">
                  {dailyTask.procedures.map((proc, procIndex) => (
                    <button
                      key={procIndex}
                      onClick={() => {
                        if (isCurrentDay && dailyTask.status !== 'completed') {
                          completeDailyTask(patientId, dayIndex, 'procedure', procIndex);
                        }
                      }}
                      className={`flex items-center gap-2 text-sm py-1 px-2 rounded transition-colors w-full text-left ${
                        proc.completed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${!isCurrentDay || dailyTask.status === 'completed' ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                      disabled={!isCurrentDay || dailyTask.status === 'completed'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${proc.completed ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>{proc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Status and Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dailyTask.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : remaining?.isExpired ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs font-medium text-gray-600">
                    {dailyTask.status === 'completed'
                      ? 'Completed'
                      : allMedicationsComplete && allProceduresComplete
                      ? 'Ready to finalize'
                      : 'In progress'}
                  </span>
                </div>

                {isCurrentDay && allMedicationsComplete && allProceduresComplete && dailyTask.status !== 'completed' && (
                  <button
                    onClick={() => finalizeDayTreatment(patientId, dayIndex)}
                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    Finalize Day
                  </button>
                )}
              </div>

              {/* Error if exists */}
              {patientTreatment.error && dayIndex === patientTreatment.currentDay && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs text-red-700">
                    <span className="font-semibold">Error:</span> {patientTreatment.error.message}
                  </p>
                  {patientTreatment.error.recoverable && (
                    <p className="text-xs text-red-600 mt-1">This error can be recovered. Please retry the procedure.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
