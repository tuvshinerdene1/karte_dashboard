'use client';

import { useState } from 'react';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import DailyTreatmentLoop from './DailyTreatmentLoop';
import InsuranceProcessing from './InsuranceProcessing';
import StatusTransitionIndicator from './StatusTransitionIndicator';


export default function PatientCaseManagement() {
  const { addPatient, patientsInTreatmentLoop } = useHealthcareFlowStore();
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());
  const [newPatientName, setNewPatientName] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const togglePatient = (patientId: string) => {
    const newSet = new Set(expandedPatients);
    if (newSet.has(patientId)) {
      newSet.delete(patientId);
    } else {
      newSet.add(patientId);
    }
    setExpandedPatients(newSet);
  };

  const handleAddPatient = () => {
    if (newPatientName.trim()) {
      addPatient({
        id: `patient-${Date.now()}`,
        name: newPatientName,
        appointmentTime: new Date(),
        currentStatus: 'Нээлттэй',
        lastUpdated: new Date(),
      });
      setNewPatientName('');
      setShowNewPatientForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Patient */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setShowNewPatientForm(!showNewPatientForm)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Patient Case
          </div>
          {showNewPatientForm ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {showNewPatientForm && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Patient name"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddPatient();
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddPatient}
                disabled={!newPatientName.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Cases */}
      {patientsInTreatmentLoop.length > 0 ? (
        <div className="space-y-3">
          {patientsInTreatmentLoop.map((treatment) => {
            const patient = { id: treatment.patientId, name: `Patient ${treatment.patientId.substring(0, 8)}` };
            const isExpanded = expandedPatients.has(patient.id);
            const treatmentCost = treatment.cost;

            return (
              <div
                key={patient.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => togglePatient(patient.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-600">
                      {treatment.treatmentType} • Day {treatment.currentDay + 1}/{treatment.dailyTasks.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₮{treatmentCost.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{treatment.currentStatus}</p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Details */}
                {isExpanded && (
                  <div className="px-4 py-4 space-y-6 border-t border-gray-100 bg-gray-50">
                    {/* Status Transition */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Process Status</h4>
                      <StatusTransitionIndicator currentStatus={treatment.currentStatus} />
                    </div>

                    {/* Daily Treatment Loop */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <DailyTreatmentLoop
                        patientId={patient.id}
                        patientName={patient.name}
                      />
                    </div>

                    {/* Insurance Processing */}
                    <div>
                      <InsuranceProcessing
                        patientId={patient.id}
                        patientName={patient.name}
                        claimAmount={treatmentCost}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-700 text-sm">No patient cases in treatment. Add a new patient to get started.</p>
        </div>
      )}
    </div>
  );
}
