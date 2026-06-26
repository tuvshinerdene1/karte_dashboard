"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Activity, Users, Clock, AlertTriangle, CheckCircle2, 
  Search, ChevronDown, ChevronRight,
  LayoutDashboard, AlertCircle, Zap, RefreshCw
} from 'lucide-react';

// --- CONFIGURATION ---
const BACKEND_URL = "http://localhost:8080";

interface HospitalStep {
  hospital_step_id: string;
  step_name: string;
  service_name: string;
  waiting_count: number | string; // Handle potential string from DB
  in_progress_count: number | string;
  mid_threshold_minutes: number;
  high_threshold_minutes: number;
}

interface SocketUpdate {
  action: 'START' | 'END';
  patient_identifier: string;
  hospital_step_id: string;
  status: 'waiting' | 'in_progress' | 'completed';
  timestamp: string;
}

export default function ProfessionalHospitalMonitor() {
  const [hospitalId, setHospitalId] = useState("");
  const [steps, setSteps] = useState<HospitalStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);

  // --- 1. COMPUTED DATA (Fixed Logic) ---
  
  const groupedData = useMemo(() => {
    return steps.reduce((acc, step) => {
      if (!acc[step.service_name]) acc[step.service_name] = [];
      acc[step.service_name].push(step);
      return acc;
    }, {} as Record<string, HospitalStep[]>);
  }, [steps]);

  const stats = useMemo(() => {
    if (steps.length === 0) return { totalWaiting: 0, totalActive: 0, highRiskSteps: 0, activeServices: 0 };
    
    return {
      totalWaiting: steps.reduce((sum, s) => sum + Number(s.waiting_count || 0), 0),
      totalActive: steps.reduce((sum, s) => sum + Number(s.in_progress_count || 0), 0),
      highRiskSteps: steps.filter(s => Number(s.waiting_count) > 3).length,
      activeServices: Object.keys(groupedData).length
    };
  }, [steps, groupedData]);

  // --- 2. CORE LOGIC ---

  useEffect(() => {
    const socket = io(BACKEND_URL);
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('HOSPITAL_UPDATE', (update: SocketUpdate) => handleRealTimeUpdate(update));
    socket.on('BOTTLENECK_ALERT', (data: any) => addLog(`🚨 ALERT: ${data.message}`));
    socket.on('disconnect', () => setConnected(false));
    return () => { socket.disconnect(); };
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
  };

  const loadHospitalData = async () => {
    if (!hospitalId) return;
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/hospital/${hospitalId}/snapshot`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSteps(data);
        socketRef.current?.emit('join_hospital', hospitalId);
        const initialExpand: Record<string, boolean> = {};
        data.forEach(s => initialExpand[s.service_name] = true);
        setExpandedServices(initialExpand);
        addLog(`Successfully synced hospital: ${hospitalId.slice(0,8)}...`);
      } else {
        setSteps([]);
        setError(data.error || "Hospital not found");
      }
    } catch (err) {
      setError("Backend Connection Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRealTimeUpdate = (update: SocketUpdate) => {
    setSteps(current => current.map(step => {
      if (step.hospital_step_id !== update.hospital_step_id) return step;
      const ns = { ...step };
      if (update.action === 'START') {
        if (update.status === 'waiting') ns.waiting_count = Number(ns.waiting_count) + 1;
        else {
          ns.in_progress_count = Number(ns.in_progress_count) + 1;
          if (Number(ns.waiting_count) > 0) ns.waiting_count = Number(ns.waiting_count) - 1;
        }
      } else if (update.action === 'END') {
        if (Number(ns.in_progress_count) > 0) ns.in_progress_count = Number(ns.in_progress_count) - 1;
      }
      return ns;
    }));
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-indigo-200 shadow-lg">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">KARTE MONITOR</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {connected ? 'System Live' : 'Link Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
            <Search className="ml-3 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Paste Hospital UUID..." 
              className="bg-transparent text-sm w-full md:w-80 outline-none font-bold text-slate-700 placeholder:text-slate-400"
              value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}
            />
            <button 
              onClick={loadHospitalData}
              disabled={isSyncing}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSyncing ? <RefreshCw size={16} className="animate-spin"/> : 'SYNC'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 mt-8">
        
        {/* --- GLOBAL STATISTICS BAR --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users size={20}/>} label="Queue" value={stats.totalWaiting} sub="Total Patients Waiting" color="orange" />
          <StatCard icon={<Zap size={20}/>} label="Active" value={stats.totalActive} sub="Patients in treatment" color="indigo" />
          <StatCard icon={<AlertCircle size={20}/>} label="Alerts" value={stats.highRiskSteps} sub="Bottlenecks detected" color={stats.highRiskSteps > 0 ? "red" : "slate"} />
          <StatCard icon={<Activity size={20}/>} label="Services" value={stats.activeServices} sub="Monitored departments" color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-3 space-y-6">
            {error && <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl font-bold mb-4 flex items-center gap-3">
              <AlertCircle /> {error}
            </div>}

            {steps.length === 0 && !error && (
              <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-slate-200 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <LayoutDashboard size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-400 italic">Awaiting Hospital Synchronization...</h2>
              </div>
            )}
            
            {Object.entries(groupedData).map(([serviceName, serviceSteps]) => (
              <div key={serviceName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                <button 
                  onClick={() => setExpandedServices(prev => ({...prev, [serviceName]: !prev[serviceName]}))}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-2xl ${expandedServices[serviceName] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {expandedServices[serviceName] ? <ChevronDown size={24}/> : <ChevronRight size={24}/>}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">{serviceName}</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{serviceSteps.length} Treatment Steps</p>
                    </div>
                  </div>
                  <div className="flex gap-8 mr-4">
                    <div className="text-center">
                      <span className="block text-[10px] font-black text-slate-300 uppercase mb-1">Queued</span>
                      <span className="text-xl font-black text-orange-500">{serviceSteps.reduce((a,b)=> a+Number(b.waiting_count), 0)}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] font-black text-slate-300 uppercase mb-1">Active</span>
                      <span className="text-xl font-black text-indigo-600">{serviceSteps.reduce((a,b)=> a+Number(b.in_progress_count), 0)}</span>
                    </div>
                  </div>
                </button>

                {expandedServices[serviceName] && (
                  <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 border-t border-slate-100">
                    {serviceSteps.map(step => (
                      <StepCard key={step.hospital_step_id} step={step} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#0F172A] rounded-[2rem] p-7 shadow-2xl sticky top-28 border border-slate-800">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                Live Telemetry
              </h3>
              <div className="space-y-4 h-[550px] overflow-y-auto pr-3 custom-scrollbar">
                {logs.length === 0 && <p className="text-slate-600 text-xs font-bold uppercase text-center mt-20 italic">No incoming traffic</p>}
                {logs.map((log, i) => (
                  <div key={i} className="text-[11px] font-mono text-slate-400 border-l-2 border-indigo-900/50 pl-4 py-1 animate-in fade-in slide-in-from-right-5">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- REFINED SUB-COMPONENTS ---

function StatCard({ icon, label, value, sub, color }: any) {
  const colors: any = {
    indigo: "text-indigo-600 bg-indigo-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
    slate: "text-slate-400 bg-slate-50"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${colors[color] || colors.indigo}`}>{icon}</div>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-5xl font-black text-slate-800 mb-2 tracking-tighter">
        {value}
      </div>
      <p className="text-[11px] text-slate-400 font-bold uppercase">{sub}</p>
    </div>
  );
}

function StepCard({ step }: { step: HospitalStep }) {
  const wait = Number(step.waiting_count);
  const active = Number(step.in_progress_count);
  const isHighRisk = wait > 3;
  
  return (
    <div className={`bg-white p-5 rounded-2xl border-2 transition-all duration-500 ${isHighRisk ? 'border-red-500 shadow-lg shadow-red-100 animate-pulse' : 'border-white shadow-sm'}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-sm font-black text-slate-700 leading-tight pr-4 uppercase tracking-tight">{step.step_name}</h4>
        <div className={`p-1.5 rounded-lg ${active > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-300'}`}>
          <Zap size={14} fill={active > 0 ? "currentColor" : "none"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Queue</span>
          <span className={`text-2xl font-black ${wait > 0 ? 'text-orange-500' : 'text-slate-300'}`}>{wait}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Active</span>
          <span className={`text-2xl font-black ${active > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>{active}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9px] font-black text-slate-400">
        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500"/> {step.mid_threshold_minutes}M</span>
        <span className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-red-500"/> {step.high_threshold_minutes}M</span>
      </div>
    </div>
  );
}