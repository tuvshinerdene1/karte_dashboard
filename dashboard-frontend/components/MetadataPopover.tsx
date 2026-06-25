'use client';

import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';

interface MetadataPopoverProps {
  nodeType: 'appointment' | 'doctor' | 'emd' | 'done';
  isHovered: boolean;
}

export default function MetadataPopover({ nodeType, isHovered }: MetadataPopoverProps) {
  const { appointmentMetrics, doctorMetrics, insuranceMetrics, completionMetrics } = useHealthcareFlowStore();

  if (!isHovered) return null;

  const getMetadata = () => {
    switch (nodeType) {
      case 'appointment':
        return (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Цаг захиалга (Appointment)</h4>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">Waiting Patients:</span> {appointmentMetrics.totalWaiting}</p>
              <p><span className="font-medium">Avg Wait Time:</span> {Math.round(appointmentMetrics.averageWaitTime)} min</p>
              <p><span className="font-medium">Urgent Cases:</span> {appointmentMetrics.urgentCases}</p>
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Эмч (Doctor)</h4>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">Total Doctors:</span> {doctorMetrics.totalDoctors}</p>
              <p><span className="font-medium">Available:</span> {doctorMetrics.availableDoctors}</p>
              <p><span className="font-medium">Busy:</span> {doctorMetrics.busyDoctors}</p>
              <p><span className="font-medium">Queue:</span> {doctorMetrics.patientsInQueue} patients</p>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Workload:</span>
                  <span>{Math.round(doctorMetrics.workload)}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all" 
                    style={{ width: `${doctorMetrics.workload}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'emd':
        return (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">ЭМД (Insurance)</h4>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">Total Sent:</span> {insuranceMetrics.totalClaimsSent}</p>
              <p><span className="font-medium">Approved:</span> {insuranceMetrics.approvedClaims}</p>
              <p><span className="font-medium">Pending:</span> {insuranceMetrics.pendingClaims}</p>
              <p><span className="font-medium">Errors:</span> {insuranceMetrics.errorCount}</p>
              <p><span className="font-medium">Server Issues:</span> {insuranceMetrics.serverIssues}</p>
              <p><span className="font-medium">Limit Exceeded:</span> {insuranceMetrics.paymentLimitExceeded}</p>
              <p><span className="font-medium">Not Found:</span> {insuranceMetrics.notFoundCases}</p>
            </div>
          </div>
        );

      case 'done':
        return (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">DONE (Completed)</h4>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">Completed:</span> {completionMetrics.completedProcesses}</p>
              <p><span className="font-medium">Stopped (Errors):</span> {completionMetrics.stoppedProcessesDueToErrors}</p>
              <p><span className="font-medium">Total Revenue:</span> ₮{Math.round(completionMetrics.totalRevenue / 1000)}K</p>
              <p><span className="font-medium">Cost/Appointment:</span> ₮{Math.round(completionMetrics.costPerAppointment)}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-max max-w-xs">
      {getMetadata()}
      {/* Arrow pointing down */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45"></div>
    </div>
  );
}
