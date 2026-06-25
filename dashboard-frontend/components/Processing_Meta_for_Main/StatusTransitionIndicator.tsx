'use client';

import { ProcessStatus } from '@/store/healthcareFlowStore';
import { getStatusColor, getStatusLabel } from '@/lib/healthcareUtils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface StatusTransitionIndicatorProps {
  currentStatus: ProcessStatus;
  showPath?: boolean;
}

export default function StatusTransitionIndicator({
  currentStatus,
  showPath = true,
}: StatusTransitionIndicatorProps) {
  const statusSequence: ProcessStatus[] = [
    'Нээлттэй',
    'Эмчээс хаасан',
    'Бүрэн хаагдсан',
  ];

  const currentIndex = statusSequence.indexOf(currentStatus);
  const isError = currentStatus === 'Зогссон';

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">Status Transition</p>

      <div className="flex items-center gap-2">
        {statusSequence.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const color = getStatusColor(status);

          return (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : isCurrent
                    ? `${color} border-2`
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                } ${isCurrent ? 'ring-2 ring-offset-2' : ''}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>

              {index < statusSequence.length - 1 && (
                <ArrowRight
                  className={`w-5 h-5 ${
                    isCompleted ? 'text-green-500' : 'text-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex text-xs text-gray-600 gap-2">
        <div className="flex-1">
          <p className="font-medium">Нээлттэй</p>
          <p className="text-gray-500">Open</p>
        </div>
        <div className="flex-1">
          <p className="font-medium">Эмчээс хаасан</p>
          <p className="text-gray-500">Doctor Closed</p>
        </div>
        <div className="flex-1">
          <p className="font-medium">Бүрэн хаагдсан</p>
          <p className="text-gray-500">Fully Closed</p>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs font-semibold text-red-700 mb-1">Status: Stopped</p>
          <p className="text-xs text-red-600">
            Process has encountered an error and been stopped. Review the error details and retry.
          </p>
        </div>
      )}

      {/* EМД Review Note */}
      {currentStatus === 'Эмчээс хаасан' && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Awaiting EМД Review</p>
          <p className="text-xs text-blue-600">
            Must be completed by ЭМД doctor within 24 hours. Reminder alerts will be sent if exceeding timeline.
          </p>
        </div>
      )}
    </div>
  );
}
