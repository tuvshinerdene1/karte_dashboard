import { readStoredSession } from './auth';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const session = readStoredSession();
  const headers = new Headers(init.headers);

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

