import { Alert, InsuranceStatus } from '@/store/healthcareFlowStore';

// Alert generation utilities
export const generateTodayIncompleteReminder = (patientName: string, patientId: string): Omit<Alert, 'id' | 'timestamp' | 'resolved'> => ({
  type: 'reminder',
  title: "Today's Treatment Incomplete",
  description: `Patient ${patientName} has incomplete medications or procedures for today. Please complete them.`,
  patientId,
});

export const generateOverdueAlert = (patientName: string, patientId: string, dayNumber: number): Omit<Alert, 'id' | 'timestamp' | 'resolved'> => ({
  type: 'overdue',
  title: 'Treatment Overdue',
  description: `Day ${dayNumber} treatment for patient ${patientName} is overdue. Immediate action required.`,
  patientId,
});

export const generateEMDEscalationAlert = (patientName: string, patientId: string, hoursOverdue: number): Omit<Alert, 'id' | 'timestamp' | 'resolved'> => ({
  type: 'escalation',
  title: 'ЭМД Review Escalation',
  description: `Patient ${patientName} case has been awaiting ЭМД review for ${hoursOverdue} hours. Escalating to senior reviewer.`,
  patientId,
});

export const generateInsuranceErrorAlert = (patientName: string, patientId: string, errorType: InsuranceStatus): Omit<Alert, 'id' | 'timestamp' | 'resolved'> => {
  const errorMessages: Record<InsuranceStatus, string> = {
    'not-found': `Insurance claim for patient ${patientName} not found in system.`,
    'limit-exceeded': `Patient ${patientName} has exceeded insurance payment limit.`,
    'server-unavailable': `Insurance server is unavailable. Claim for patient ${patientName} pending retry.`,
    'timeout': `Insurance claim for patient ${patientName} timed out. Please retry.`,
    'validation-error': `Validation error in insurance claim for patient ${patientName}. Review claim details.`,
    'error': `Insurance processing failed for patient ${patientName}. Please review.`,
    'processing': 'Processing',
    'approved': 'Approved',
  };

  return {
    type: 'error',
    title: 'Insurance Processing Error',
    description: errorMessages[errorType] || 'Unknown insurance error occurred.',
    patientId,
  };
};

// Insurance status utilities
export const getInsuranceStatusColor = (status: InsuranceStatus): string => {
  const colors: Record<InsuranceStatus, string> = {
    'processing': 'bg-blue-100 text-blue-700 border-blue-300',
    'approved': 'bg-green-100 text-green-700 border-green-300',
    'not-found': 'bg-red-100 text-red-700 border-red-300',
    'limit-exceeded': 'bg-orange-100 text-orange-700 border-orange-300',
    'server-unavailable': 'bg-red-100 text-red-700 border-red-300',
    'timeout': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'validation-error': 'bg-red-100 text-red-700 border-red-300',
    'error': 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};

export const getInsuranceStatusLabel = (status: InsuranceStatus): string => {
  const labels: Record<InsuranceStatus, string> = {
    'processing': 'Processing Normally',
    'approved': 'Approved',
    'not-found': 'Not Found',
    'limit-exceeded': 'Payment Limit Exceeded',
    'server-unavailable': 'Server Unavailable',
    'timeout': 'Timeout',
    'validation-error': 'Validation Error',
    'error': 'Error',
  };
  return labels[status] || 'Unknown';
};

export const isInsuranceErrorStatus = (status: InsuranceStatus): boolean => {
  return ['not-found', 'limit-exceeded', 'server-unavailable', 'timeout', 'validation-error', 'error'].includes(status);
};

export const getInsuranceRetryRecommendation = (status: InsuranceStatus): string => {
  const recommendations: Record<InsuranceStatus, string> = {
    'processing': 'Please wait for processing to complete.',
    'approved': 'Claim has been approved successfully.',
    'not-found': 'Please verify patient insurance information and resubmit.',
    'limit-exceeded': 'Patient has reached their insurance limit. Please contact insurance provider.',
    'server-unavailable': 'Retry after 30 minutes to 1 hour when server becomes available.',
    'timeout': 'Retry immediately. If issue persists, contact support.',
    'validation-error': 'Review claim details for errors. Correct and resubmit.',
    'error': 'Unknown error occurred. Please contact technical support.',
  };
  return recommendations[status] || 'Unable to determine recommendation.';
};

// Treatment loop utilities
export const calculateRemainingTimeForDay = (dayStartTime: Date): { hours: number; minutes: number; isExpired: boolean } => {
  const now = new Date();
  const dayEnd = new Date(dayStartTime);
  dayEnd.setHours(23, 59, 59, 999);

  const remainingMs = dayEnd.getTime() - now.getTime();
  
  if (remainingMs <= 0) {
    return { hours: 0, minutes: 0, isExpired: true };
  }

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, isExpired: false };
};

// Status color utilities
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Нээлттэй': 'bg-blue-100 text-blue-700 border-blue-300',
    'Эмчээс хаасан': 'bg-purple-100 text-purple-700 border-purple-300',
    'Бүрэн хаагдсан': 'bg-green-100 text-green-700 border-green-300',
    'Зогссон': 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'Нээлттэй': 'Open',
    'Эмчээс хаасан': 'Doctor Closed',
    'Бүрэн хаагдсан': 'Fully Closed',
    'Зогссон': 'Stopped',
  };
  return labels[status] || status;
};
