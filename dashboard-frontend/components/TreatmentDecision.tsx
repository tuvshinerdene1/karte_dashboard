'use client';

import { useState } from 'react';
import { useHealthcareFlowStore, TreatmentType } from '@/store/healthcareFlowStore';
import { ChevronRight, Stethoscope, Home, Heart } from 'lucide-react';

interface TreatmentDecisionProps {
  patientId: string;
  patientName: string;
  onTreatmentSelected?: (treatmentType: TreatmentType) => void;
}

export default function TreatmentDecision({
  patientId,
  patientName,
  onTreatmentSelected,
}: TreatmentDecisionProps) {
  const { selectTreatmentType, startTreatmentLoop } = useHealthcareFlowStore();
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null);
  const [daysPlanned, setDaysPlanned] = useState(3);
  const [showDaysInput, setShowDaysInput] = useState(false);

  const treatments = [
    {
      id: 'normal' as TreatmentType,
      label: 'Normal Treatment',
      mongolian: 'Ердийн Эмчилгээ',
      description: 'Standard outpatient treatment',
      icon: Stethoscope,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      id: 'хэвтэн' as TreatmentType,
      label: 'Хэвтэн (Inpatient)',
      mongolian: 'Хэвтэн Эмчилгээ',
      description: 'Extended hospital stay treatment',
      icon: Home,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      textColor: 'text-purple-700',
    },
    {
      id: 'сэргээн-засах' as TreatmentType,
      label: 'Сэргээн Засах (Rehabilitation)',
      mongolian: 'Сэргээн Засах',
      description: 'Rehabilitation and recovery program',
      icon: Heart,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      textColor: 'text-green-700',
    },
  ];

  const handleTreatmentSelect = (treatment: TreatmentType) => {
    setSelectedTreatment(treatment);
    
    if (treatment === 'normal') {
      selectTreatmentType(patientId, treatment);
      onTreatmentSelected?.(treatment);
    } else {
      setShowDaysInput(true);
    }
  };

  const handleConfirmTreatment = () => {
    if (selectedTreatment && selectedTreatment !== 'normal') {
      selectTreatmentType(patientId, selectedTreatment);
      startTreatmentLoop(patientId, selectedTreatment as Exclude<TreatmentType, 'normal'>, daysPlanned);
      onTreatmentSelected?.(selectedTreatment);
      setShowDaysInput(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Select Treatment Type</h3>
        <p className="text-sm text-gray-600 mt-1">for {patientName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {treatments.map((treatment) => {
          const Icon = treatment.icon;
          const isSelected = selectedTreatment === treatment.id;
          
          return (
            <button
              key={treatment.id}
              onClick={() => handleTreatmentSelect(treatment.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? `${treatment.color} border-opacity-100 ring-2 ring-offset-2`
                  : `${treatment.color} border-opacity-50`
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-6 h-6 shrink-0 ${treatment.textColor} mt-1`} />
                <div className="min-w-0">
                  <h4 className={`font-semibold ${treatment.textColor}`}>{treatment.label}</h4>
                  <p className="text-xs text-gray-600 mt-1">{treatment.mongolian}</p>
                  <p className="text-xs text-gray-500 mt-2">{treatment.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showDaysInput && selectedTreatment && selectedTreatment !== 'normal' && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Planned Duration (Days)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="30"
              value={daysPlanned}
              onChange={(e) => setDaysPlanned(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-semibold text-gray-900 w-12">{daysPlanned} days</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Minimum: 1 day, Maximum: 30 days
          </p>
        </div>
      )}

      {selectedTreatment && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedTreatment(null);
              setShowDaysInput(false);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {selectedTreatment === 'normal' ? (
            <button
              onClick={() => onTreatmentSelected?.(selectedTreatment)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Proceed
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmTreatment}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              disabled={daysPlanned < 1}
            >
              Start {daysPlanned}-Day Treatment
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
