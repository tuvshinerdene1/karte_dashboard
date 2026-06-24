'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Users, TrendingUp } from 'lucide-react';
import ProcessFlow from './ProcessFlow';
import AlertsSection from './AlertsSection';
import RequestsSection from './RequestsSection';
import EnhancedFlowVisualization from './EnhancedFlowVisualization';
import EnhancedAlerts from './EnhancedAlerts';
import PatientCaseManagement from './PatientCaseManagement';
import EnhancedMetrics from './EnhancedMetrics';
import { useHealthcareFlowStore } from '@/store/healthcareFlowStore';

type Tab = 'process' | 'alert' | 'requests' | 'patients' | 'flow';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('flow');
  const { initializeHealthcareFlow, appointmentMetrics, completionMetrics, insuranceMetrics, alerts } = useHealthcareFlowStore();

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
              Patient Cases
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
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Healthcare Process Flow</h2>
              <EnhancedFlowVisualization />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics</h2>
              <EnhancedMetrics />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Alerts</h2>
              <EnhancedAlerts />
            </div>
          </div>
        )}
        {activeTab === 'patients' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Case Management</h2>
              <PatientCaseManagement />
            </div>
          </div>
        )}
        {activeTab === 'process' && <ProcessFlow />}
        {activeTab === 'alert' && <AlertsSection />}
        {activeTab === 'requests' && <RequestsSection />}
      </main>
    </div>
  );
}
