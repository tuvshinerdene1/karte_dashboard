import { useState, useCallback } from 'react';
import { apiClient } from './apiClient';

/**
 * Response state for API calls
 */
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for making API calls
 * @template T - Type of the response data
 *
 * @example
 * const { data, loading, error, execute } = useApi<User>();
 *
 * const handleLogin = async () => {
 *   await execute(() => apiClient.login(username, password));
 * };
 */
export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Execute an API call
   */
  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
        return null;
      }
    },
    []
  );

  return {
    ...state,
    execute,
  };
}

/**
 * Hook for GET requests
 */
export function useGetApi<T = any>(url: string, autoFetch = true) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const result = await apiClient.get<T>(url);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      return null;
    }
  }, [url]);

  // Auto-fetch on mount if enabled
  React.useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [url, autoFetch, fetch]);

  return {
    ...state,
    refetch: fetch,
  };
}

/**
 * Hook for POST/PUT/PATCH/DELETE requests
 */
export function useMutationApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
        return null;
      }
    },
    []
  );

  return {
    ...state,
    mutate,
  };
}

// Import React for useEffect
import React;
