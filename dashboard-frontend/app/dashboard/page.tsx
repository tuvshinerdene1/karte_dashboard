'use client';

import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Dashboard from '@/components/Main_Interface/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="hospital_director">
      <div className="h-screen w-full bg-white">
        <Dashboard />
      </div>
    </ProtectedRoute>
  );
}

