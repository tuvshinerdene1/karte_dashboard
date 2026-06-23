'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import ProcessFlow from './ProcessFlow';
import AlertsSection from './AlertsSection';
import RequestsSection from './RequestsSection';

type Tab = 'process' | 'alert' | 'requests';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('process');

  const tabClasses = (tab: Tab) =>
    `px-6 py-3 font-medium transition-all ${
      activeTab === tab
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
    }`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Karte Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time Process Flow Monitoring</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('process')}
            className={tabClasses('process')}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Process Flow
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alert')}
            className={tabClasses('alert')}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Alerts
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
        {activeTab === 'process' && <ProcessFlow />}
        {activeTab === 'alert' && <AlertsSection />}
        {activeTab === 'requests' && <RequestsSection />}
      </main>
    </div>
  );
}
