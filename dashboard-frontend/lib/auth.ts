export type UserRole = 'admin' | 'hospital_director';

export interface AuthUser {
  id: number | string;
  username: string;
  role: UserRole;
  hospitalId?: number | string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const SESSION_KEY = 'karte_auth_session';
const COOKIE_MAX_AGE = 60 * 60 * 8;

export function normalizeRole(role: string): UserRole | null {
  const normalized = role.trim().toLowerCase().replace(/[-\s]/g, '_');

  if (normalized === 'admin' || normalized === 'administrator') {
    return 'admin';
  }

  if (
    normalized === 'hospital_director' ||
    normalized === 'director' ||
    normalized === 'hospitaldirector'
  ) {
    return 'hospital_director';
  }

  return null;
}

export function getDashboardPath(role: UserRole) {
  return role === 'admin' ? '/admin' : '/dashboard';
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? (JSON.parse(stored) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  document.cookie = `auth_token=${encodeURIComponent(session.token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `auth_role=${encodeURIComponent(session.user.role)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY);
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Lax';
}

