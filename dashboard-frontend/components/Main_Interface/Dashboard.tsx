// app/dashboard/page.tsx or components/Dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Users, TrendingUp } from 'lucide-react';
import ProcessFlow from '../Animation/ProcessFlow';
import RequestsSection from '../Request/RequestsSection';
import EnhancedFlowVisualization from '../FlowMainPage/EnhancedFlowVisualization';
import EnhancedAlerts from '../Alert/EnhancedAlerts';
import PatientCaseManagement from '../Processing_Meta_for_Main/PatientCaseManagement';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';
import BottleneckAlertWatcher from '../Alert/BottleneckAlertWatcher';
import AlertNotificationCenter from '../Alert/AlertNotificationCenter';
import Appointment from '../FlowMainPage/Widgets/Appointment';
import Doctor from '../FlowMainPage/Widgets/Doctor';
import Insurance from '../FlowMainPage/Widgets/Insurance';
import Completion from '../FlowMainPage/Widgets/Completion';
import TreatmentLoop from '../FlowMainPage/Widgets/TreatmentLoop';

type Tab = 'process' | 'alert' | 'requests' | 'patients' | 'flow';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('flow');
  const { 
    initializeHealthcareFlow, 
    appointmentMetrics, 
    completionMetrics, 
    insuranceMetrics, 
    alerts,
    patientsInTreatmentLoop 
  } = useHealthcareFlowStore();

  useEffect(() => {
    initializeHealthcareFlow();
  }, [initializeHealthcareFlow]);

  const tabClasses = (tab: Tab) =>
    `px-6 py-3 font-medium transition-all ${
      activeTab === tab
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
    }`;

  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="flex flex-col h-full">
      <BottleneckAlertWatcher />
      <AlertNotificationCenter />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Process Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive Flow & Process Monitoring</p>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Waiting</p>
              <p className="font-semibold text-gray-900">{appointmentMetrics.totalWaiting}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="font-semibold text-gray-900">{completionMetrics.completedProcesses}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Approved Claims</p>
              <p className="font-semibold text-gray-900">{insuranceMetrics.approvedClaims}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Active Alerts</p>
              <p className="font-semibold text-gray-900">{unresolvedAlerts}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-600">Revenue</p>
              <p className="font-semibold text-gray-900">₮{Math.round(completionMetrics.totalRevenue / 1000000)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-8 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('flow')}
            className={tabClasses('flow')}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Process Flow
            </div>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={tabClasses('patients')}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Simulation
            </div>
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={tabClasses('process')}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pipeline
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alert')}
            className={tabClasses('alert')}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Alerts ({unresolvedAlerts})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={tabClasses('requests')}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Requests
            </div>
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        {activeTab === 'flow' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Healthcare Process Flow</h2>
              <EnhancedFlowVisualization />
            </div>

            <div className="bg-blue-50 rounded-lg shadow-lg p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Цаг Захиалга (Appointment)</h2>
              <Appointment />
            </div>

            <div className="bg-green-50 rounded-lg shadow-lg p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-green-900 mb-6">Эмч (Doctor)</h2>
              <Doctor />
            </div>

            <div className="bg-amber-50 rounded-lg shadow-lg p-8 border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">ЭМД (Insurance)</h2>
              <Insurance />
            </div>

            <div className="bg-emerald-50 rounded-lg shadow-lg p-8 border border-emerald-200">
              <h2 className="text-2xl font-bold text-emerald-900 mb-6">DONE (Completion)</h2>
              <Completion />
            </div>

            {patientsInTreatmentLoop.length > 0 && (
              <div className="bg-orange-50 rounded-lg shadow-lg p-8 border border-orange-200">
                <h2 className="text-2xl font-bold text-orange-900 mb-6">Active Treatment Loops</h2>
                <TreatmentLoop />
              </div>
            )}
          </div>
        )}
        {activeTab === 'patients' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Case Management</h2>
              <PatientCaseManagement />
            </div>
          </div>
        )}
        {activeTab === 'process' && <ProcessFlow />}
        {activeTab === 'alert' && (
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Alerts</h2>
            <EnhancedAlerts />
          </div>
        )}
        {activeTab === 'requests' && <RequestsSection />}
      </main>
    </div>
  );
}