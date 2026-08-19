'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';

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

/**
 * Drives loading/success/empty/error state for a GET request against one of
 * our own /api routes. Every data-fetching component in the app should use
 * this instead of calling fetch directly, so failures always render the
 * shared AsyncState UI (with retry) instead of a blank page or raw error.
 */
export function useApi<T>(url: string | null, options?: { pollMs?: number }): UseApiResult<T> {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [data, setData] = useState<T | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const attempt = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
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
    attempt.current += 1;
    load();
  }, [load]);

  useEffect(() => {
    if (!options?.pollMs) return;
    const id = setInterval(load, options.pollMs);
    return () => clearInterval(id);
  }, [load, options?.pollMs]);

  return { status, data, errorMessage, retry: load };
}
