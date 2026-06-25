import { create } from 'zustand';

// Types for treatment types
export type TreatmentType = 'normal' | 'хэвтэн' | 'сэргээн-засах';

// Types for status
export type ProcessStatus = 'Нээлттэй' | 'Эмчээс хаасан' | 'Бүрэн хаагдсан' | 'Зогссон';

// Types for insurance processing
export type InsuranceStatus = 'processing' | 'approved' | 'not-found' | 'limit-exceeded' | 'server-unavailable' | 'timeout' | 'validation-error' | 'error';

// Patient data
interface Patient {
  id: string;
  name: string;
  appointmentTime: Date;
  treatmentType?: TreatmentType;
  currentStatus: ProcessStatus;
  daysInTreatment?: number;
  totalDaysPlanned?: number;
  lastUpdated: Date;
}

// Appointment metrics
interface AppointmentMetrics {
  totalWaiting: number;
  averageWaitTime: number;
  urgentCases: number;
}

// Doctor metrics
interface DoctorMetrics {
  totalDoctors: number;
  availableDoctors: number;
  busyDoctors: number;
  patientsInQueue: number;
  workload: number; // 0-100
}

// Insurance metrics
interface InsuranceMetrics {
  totalClaimsSent: number;
  approvedClaims: number;
  pendingClaims: number;
  errorCount: number;
  serverIssues: number;
  paymentLimitExceeded: number;
  notFoundCases: number;
}

// Completion metrics
interface CompletionMetrics {
  completedProcesses: number;
  stoppedProcessesDueToErrors: number;
  totalRevenue: number;
  costPerAppointment: number;
}

// Pricing
interface Pricing {
  normalDiagnosis: number;
  хэвтэнPerDay: number;
  сэргээн_засахPerDay: number;
  procedures: { [key: string]: number };
  medications: { [key: string]: number };
}

// Alert
export interface Alert {
  id: string;
  type: 'reminder' | 'overdue' | 'escalation' | 'error' | 'info';
  title: string;
  description: string;
  patientId?: string;
  timestamp: Date;
  resolved: boolean;
}

// Daily treatment task
interface DailyTask {
  id: string;
  date: Date;
  medications: { name: string; completed: boolean }[];
  procedures: { name: string; completed: boolean }[];
  status: 'pending' | 'in-progress' | 'completed';
  remindersSent: number;
  overdueAlertSent: boolean;
}

// Patient in loop
interface PatientInTreatmentLoop {
  patientId: string;
  treatmentType: Exclude<TreatmentType, 'normal'>;
  currentStatus: ProcessStatus;
  startDate: Date;
  endDate: Date;
  dailyTasks: DailyTask[];
  currentDay: number;
  completedDays: number;
  cost: number;
  error?: {
    message: string;
    code: string;
    recoverable: boolean;
  };
}

// Insurance claim
interface InsuranceClaim {
  id: string;
  patientId: string;
  claimAmount: number;
  status: InsuranceStatus;
  sentAt: Date;
  respondedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: Date;
}

// Store state
interface HealthcareFlowState {
  // Patients
  patients: Patient[];
  patientsInTreatmentLoop: PatientInTreatmentLoop[];
  
  // Metrics
  appointmentMetrics: AppointmentMetrics;
  doctorMetrics: DoctorMetrics;
  insuranceMetrics: InsuranceMetrics;
  completionMetrics: CompletionMetrics;
  
  // Alerts and errors
  alerts: Alert[];
  insuranceClaims: InsuranceClaim[];
  
  // Pricing
  pricing: Pricing;

  // Actions
  initializeHealthcareFlow: () => void;
  addPatient: (patient: Patient) => void;
  selectTreatmentType: (patientId: string, treatmentType: TreatmentType) => void;
  updatePatientStatus: (patientId: string, status: ProcessStatus) => void;
  startTreatmentLoop: (patientId: string, treatmentType: Exclude<TreatmentType, 'normal'>, daysPlanned: number) => void;
  completeDailyTask: (patientId: string, dayIndex: number, taskType: 'medication' | 'procedure', taskIndex: number) => void;
  finalizeDayTreatment: (patientId: string, dayIndex: number) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveAlert: (alertId: string) => void;
  submitInsuranceClaim: (patientId: string, claimAmount: number) => void;
  updateInsuranceStatus: (claimId: string, status: InsuranceStatus) => void;
  retryInsuranceClaim: (claimId: string) => void;
  handleProcessError: (patientId: string, errorMessage: string, recoverable: boolean) => void;
  updateMetrics: () => void;
  calculateTreatmentCost: (treatmentType: TreatmentType, daysOrType: number) => number;
}

export const useHealthcareFlowStore = create<HealthcareFlowState>((set, get) => {
  // Simulate real-time metric updates
  const startMetricsSimulation = () => {
    setInterval(() => {
      set((state) => {
        // Simulate queue fluctuations
        const appointmentMetrics = {
          totalWaiting: Math.max(0, state.appointmentMetrics.totalWaiting + Math.floor((Math.random() - 0.4) * 3)),
          averageWaitTime: Math.max(2, state.appointmentMetrics.averageWaitTime + (Math.random() - 0.5) * 5),
          urgentCases: Math.max(0, state.appointmentMetrics.urgentCases + Math.floor((Math.random() - 0.6) * 2)),
        };

        // Simulate doctor availability changes
        const busyDoctors = Math.floor(Math.random() * 10) + 3;
        const doctorMetrics = {
          ...state.doctorMetrics,
          busyDoctors,
          availableDoctors: state.doctorMetrics.totalDoctors - busyDoctors,
          patientsInQueue: Math.max(0, state.doctorMetrics.patientsInQueue + Math.floor((Math.random() - 0.5) * 4)),
          workload: Math.min(100, Math.max(0, (busyDoctors / state.doctorMetrics.totalDoctors) * 100)),
        };

        // Simulate insurance processing
        const insuranceMetrics = {
          ...state.insuranceMetrics,
          totalClaimsSent: state.insuranceMetrics.totalClaimsSent + Math.floor(Math.random() * 4),
          approvedClaims: state.insuranceMetrics.approvedClaims + Math.floor(Math.random()),
          errorCount: Math.max(0, state.insuranceMetrics.errorCount + Math.floor((Math.random() - 0.5) * 2)),
        };

        return {
          appointmentMetrics,
          doctorMetrics,
          insuranceMetrics,
        };
      });
    }, 3000);
  };

  return {
    patients: [],
    patientsInTreatmentLoop: [],

    appointmentMetrics: {
      totalWaiting: 5,
      averageWaitTime: 18,
      urgentCases: 2,
    },

    doctorMetrics: {
      totalDoctors: 12,
      availableDoctors: 9,
      busyDoctors: 3,
      patientsInQueue: 8,
      workload: 25,
    },

    insuranceMetrics: {
      totalClaimsSent: 124,
      approvedClaims: 118,
      pendingClaims: 4,
      errorCount: 2,
      serverIssues: 0,
      paymentLimitExceeded: 1,
      notFoundCases: 0,
    },

    completionMetrics: {
      completedProcesses: 245,
      stoppedProcessesDueToErrors: 3,
      totalRevenue: 1250000,
      costPerAppointment: 5102,
    },

    alerts: [],

    insuranceClaims: [],

   pricing: {
    normalDiagnosis: 5000,        
    хэвтэнPerDay: 25000, 
    сэргээн_засахPerDay: 18000,  
    procedures: {
    'Blood Test': 3000,
    'MRI': 50000,
    'CT Scan': 40000,
    'ECG': 2000,
  },
    medications: {
      'Antibiotics': 5000,
      'Painkillers': 2000,
      'Antipyretics': 1500,      
      'Vitamins': 1000,
  },
},

    initializeHealthcareFlow: () => {
      startMetricsSimulation();
    },

    addPatient: (patient: Patient) => {
      set((state) => ({
        patients: [...state.patients, patient],
      }));
    },

    selectTreatmentType: (patientId: string, treatmentType: TreatmentType) => {
      set((state) => ({
        patients: state.patients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                treatmentType,
                currentStatus: 'Нээлттэй' as ProcessStatus,
                lastUpdated: new Date(),
              }
            : p
        ),
      }));
    },

    updatePatientStatus: (patientId: string, status: ProcessStatus) => {
      set((state) => ({
        patients: state.patients.map((p) =>
          p.id === patientId
            ? { ...p, currentStatus: status, lastUpdated: new Date() }
            : p
        ),
      }));
    },

    startTreatmentLoop: (patientId: string, treatmentType: Exclude<TreatmentType, 'normal'>, daysPlanned: number) => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + daysPlanned);

      const dailyTasks: DailyTask[] = Array.from({ length: daysPlanned }, (_, i) => ({
        id: `task-${patientId}-${i}`,
        date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000),
        medications: [
          { name: 'Sample Med 1', completed: false },
          { name: 'Sample Med 2', completed: false },
        ],
        procedures: [
          { name: 'Sample Procedure 1', completed: false },
        ],
        status: 'pending' as const,
        remindersSent: 0,
        overdueAlertSent: false,
      }));

      set((state) => ({
        patientsInTreatmentLoop: [
          ...state.patientsInTreatmentLoop,
          {
            patientId,
            treatmentType,
            currentStatus: 'Нээлттэй',
            startDate: now,
            endDate,
            dailyTasks,
            currentDay: 0,
            completedDays: 0,
            cost: get().calculateTreatmentCost(treatmentType, daysPlanned),
          },
        ],
        patients: state.patients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                treatmentType,
                currentStatus: 'Нээлттэй',
                daysInTreatment: 0,
                totalDaysPlanned: daysPlanned,
                lastUpdated: new Date(),
              }
            : p
        ),
      }));
    },

    completeDailyTask: (patientId: string, dayIndex: number, taskType: 'medication' | 'procedure', taskIndex: number) => {
      set((state) => ({
        patientsInTreatmentLoop: state.patientsInTreatmentLoop.map((p) => {
          if (p.patientId === patientId && p.dailyTasks[dayIndex]) {
            const updatedTasks = [...p.dailyTasks];
            const dailyTask = { ...updatedTasks[dayIndex] };

            if (taskType === 'medication') {
              dailyTask.medications[taskIndex].completed = true;
            } else {
              dailyTask.procedures[taskIndex].completed = true;
            }

            // Check if all tasks are completed
            const allCompleted =
              dailyTask.medications.every((m) => m.completed) &&
              dailyTask.procedures.every((pr) => pr.completed);

            if (allCompleted) {
              dailyTask.status = 'completed';
            } else if (
              dailyTask.medications.some((m) => m.completed) ||
              dailyTask.procedures.some((pr) => pr.completed)
            ) {
              dailyTask.status = 'in-progress';
            }

            updatedTasks[dayIndex] = dailyTask;
            return { ...p, dailyTasks: updatedTasks };
          }
          return p;
        }),
      }));
    },

    finalizeDayTreatment: (patientId: string, dayIndex: number) => {
      set((state) => {
        const updatedLoops = state.patientsInTreatmentLoop.map((p) => {
          if (p.patientId === patientId) {
            const dailyTasks = [...p.dailyTasks];
            dailyTasks[dayIndex] = { ...dailyTasks[dayIndex], status: 'completed' };

            const isLastDay = dayIndex === dailyTasks.length - 1;
            const newCurrentDay = isLastDay ? dayIndex : dayIndex + 1;
            const newCompletedDays = dayIndex + 1;

            return {
              ...p,
              dailyTasks,
              currentDay: newCurrentDay,
              completedDays: newCompletedDays,
              currentStatus: isLastDay ? 'Эмчээс хаасан' : p.currentStatus,
            };
          }
          return p;
        });

        return { patientsInTreatmentLoop: updatedLoops };
      });
    },

    addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => {
      set((state) => ({
        alerts: [
          ...state.alerts,
          {
            ...alert,
            id: `alert-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            resolved: false,
          },
        ],
      }));
    },

    resolveAlert: (alertId: string) => {
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, resolved: true } : a
        ),
      }));
    },

    submitInsuranceClaim: (patientId: string, claimAmount: number) => {
      const claim: InsuranceClaim = {
        id: `claim-${Date.now()}`,
        patientId,
        claimAmount,
        status: 'processing',
        sentAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
      };

      set((state) => ({
        insuranceClaims: [...state.insuranceClaims, claim],
        insuranceMetrics: {
          ...state.insuranceMetrics,
          totalClaimsSent: state.insuranceMetrics.totalClaimsSent + 1,
          pendingClaims: state.insuranceMetrics.pendingClaims + 1,
        },
      }));
    },

    updateInsuranceStatus: (claimId: string, status: InsuranceStatus) => {
      set((state) => {
        const claim = state.insuranceClaims.find((c) => c.id === claimId);
        if (!claim) return state;

        let updatedMetrics = { ...state.insuranceMetrics };
        if (claim.status === 'processing') {
          updatedMetrics.pendingClaims = Math.max(0, updatedMetrics.pendingClaims - 1);
        }

        if (status === 'approved') {
          updatedMetrics.approvedClaims += 1;
        } else if (
          status === 'not-found' ||
          status === 'limit-exceeded' ||
          status === 'server-unavailable' ||
          status === 'timeout' ||
          status === 'validation-error' ||
          status === 'error'
        ) {
          updatedMetrics.errorCount += 1;
        }

        return {
          insuranceClaims: state.insuranceClaims.map((c) =>
            c.id === claimId
              ? { ...c, status, respondedAt: new Date() }
              : c
          ),
          insuranceMetrics: updatedMetrics,
        };
      });
    },

    retryInsuranceClaim: (claimId: string) => {
      set((state) => ({
        insuranceClaims: state.insuranceClaims.map((c) =>
          c.id === claimId && c.retryCount < c.maxRetries
            ? {
                ...c,
                status: 'processing' as InsuranceStatus,
                retryCount: c.retryCount + 1,
                lastRetryAt: new Date(),
              }
            : c
        ),
      }));
    },

    handleProcessError: (patientId: string, errorMessage: string, recoverable: boolean) => {
      set((state) => {
        const patientInLoop = state.patientsInTreatmentLoop.find((p) => p.patientId === patientId);

        // Add error alert
        const newAlerts = [
          ...state.alerts,
          {
            id: `error-alert-${Date.now()}`,
            type: 'error' as const,
            title: 'Process Error',
            description: errorMessage,
            patientId,
            timestamp: new Date(),
            resolved: false,
          },
        ];

        // Update patient status
        const updatedLoops = patientInLoop
          ? state.patientsInTreatmentLoop.map((p) => {
              if (p.patientId === patientId) {
                return {
                  ...p,
                  currentStatus: recoverable ? 'Нээлттэй' : ('Зогссон' as ProcessStatus),
                  error: {
                    message: errorMessage,
                    code: `ERR-${Date.now()}`,
                    recoverable,
                  },
                };
              }
              return p;
            })
          : state.patientsInTreatmentLoop;

        return {
          alerts: newAlerts,
          patientsInTreatmentLoop: updatedLoops,
          completionMetrics: {
            ...state.completionMetrics,
            stoppedProcessesDueToErrors: recoverable
              ? state.completionMetrics.stoppedProcessesDueToErrors
              : state.completionMetrics.stoppedProcessesDueToErrors + 1,
          },
        };
      });
    },

    updateMetrics: () => {
      set((state) => {
        const completedProcesses = state.patients.filter((p) => p.currentStatus === 'Бүрэн хаагдсан').length;

        return {
          completionMetrics: {
            ...state.completionMetrics,
            completedProcesses,
          },
        };
      });
    },

    calculateTreatmentCost: (treatmentType: TreatmentType, daysOrCount: number): number => {
      const pricing = get().pricing;

      if (treatmentType === 'normal') {
        return pricing.normalDiagnosis;
      } else if (treatmentType === 'хэвтэн') {
        return pricing.хэвтэнPerDay * daysOrCount;
      } else if (treatmentType === 'сэргээн-засах') {
        return pricing.сэргээн_засахPerDay * daysOrCount;
      }

      return 0;
    },
  };
});
