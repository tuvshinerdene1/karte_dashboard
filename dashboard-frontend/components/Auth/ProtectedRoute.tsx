'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getDashboardPath, type UserRole } from '@/lib/auth';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: UserRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace(`/?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace(getDashboardPath(user.role));
    }
  }, [isLoading, pathname, requiredRole, router, user]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

