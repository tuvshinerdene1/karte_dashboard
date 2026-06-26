'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDashboardPath } from '@/lib/auth';
import { useAuth } from './AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [isLoading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Username or email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const dashboardPath = await login(username.trim(), password);
      const requestedPath = searchParams.get('next');
      router.replace(requestedPath || dashboardPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Karte Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to monitor hospital flow, alerts, and patient processing.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="username">
              Username or Email
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                aria-invalid={Boolean(error && !username.trim())}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                aria-invalid={Boolean(error && !password)}
              />
            </div>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button className="h-11 w-full gap-2" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </div>
    </main>
  );
}

