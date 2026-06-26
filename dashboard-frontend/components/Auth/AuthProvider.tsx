'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearStoredSession,
  getDashboardPath,
  normalizeRole,
  readStoredSession,
  storeSession,
  type AuthSession,
  type AuthUser,
} from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(readStoredSession());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || 'Invalid username or password.');
    }

    const role = normalizeRole(payload?.user?.role || '');

    if (!payload?.token || !payload?.user || !role) {
      throw new Error('Unable to sign in with this account role.');
    }

    const nextSession: AuthSession = {
      token: payload.token,
      user: {
        id: payload.user.id,
        username: payload.user.username,
        role,
        hospitalId: payload.user.hospitalId,
      },
    };

    storeSession(nextSession);
    setSession(nextSession);

    return getDashboardPath(role);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

