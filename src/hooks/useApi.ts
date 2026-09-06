'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { IS_OFFLINE_APP, resolveOffline } from '@/lib/data/offlineStore';

export type AsyncStatus = 'loading' | 'success' | 'empty' | 'error';

export interface UseApiResult<T> {
  status: AsyncStatus;
  data: T | null;
  errorMessage: string | null;
  retry: () => void;
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/** Offline app: resolve synchronously so the very first render already has data. */
function initialOfflineState<T>(url: string | null): { status: AsyncStatus; data: T | null; errorMessage: string | null } | null {
  if (!IS_OFFLINE_APP || !url) return null;
  try {
    const value = resolveOffline(url);
    if (value === undefined) return null;
    return { status: isEmpty(value) ? 'empty' : 'success', data: value as T, errorMessage: null };
  } catch (err) {
    return { status: 'error', data: null, errorMessage: err instanceof Error ? err.message : 'Not available offline.' };
  }
}

/**
 * Drives loading/success/empty/error state for a GET request against one of
 * our own /api routes. Every data-fetching component in the app should use
 * this instead of calling fetch directly, so failures always render the
 * shared AsyncState UI (with retry) instead of a blank page or raw error.
 *
 * In the packaged Android app (NEXT_PUBLIC_OFFLINE_APP) there is no server:
 * data comes from the bundled snapshot, resolved synchronously in useState's
 * initializer. That means no spinner on first paint, and polling is disabled
 * entirely — a local snapshot has nothing to re-poll for.
 */
export function useApi<T>(url: string | null, options?: { pollMs?: number }): UseApiResult<T> {
  const offlineInitial = initialOfflineState<T>(url);

  const [status, setStatus] = useState<AsyncStatus>(offlineInitial?.status ?? 'loading');
  const [data, setData] = useState<T | null>(offlineInitial?.data ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(offlineInitial?.errorMessage ?? null);
  const attempt = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;

    if (IS_OFFLINE_APP) {
      try {
        const value = resolveOffline(url);
        if (value !== undefined) {
          setData(value as T);
          setStatus(isEmpty(value) ? 'empty' : 'success');
          setErrorMessage(null);
          return;
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Not available offline.');
        setStatus('error');
        return;
      }
    }

    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await fetchJSON<T>(url, { retries: 1 });
      setData(result);
      setStatus(isEmpty(result) ? 'empty' : 'success');
    } catch (err) {
      const message = err instanceof FetchClientError ? err.message : 'Something went wrong. Please try again.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [url]);

  useEffect(() => {
    // Offline data is already in state from the initializer — re-running load
    // here would be pure churn (and would flash a loading state).
    if (offlineInitial) return;
    attempt.current += 1;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  useEffect(() => {
    if (IS_OFFLINE_APP) return; // nothing to poll for against a local snapshot
    if (!options?.pollMs) return;
    const id = setInterval(load, options.pollMs);
    return () => clearInterval(id);
  }, [load, options?.pollMs]);

  return { status, data, errorMessage, retry: load };
}
