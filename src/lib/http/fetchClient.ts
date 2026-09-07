import type { ApiFailure, ApiSuccess } from './apiResponse';
import { IS_OFFLINE_APP, resolveOffline, resolveOfflineMutation } from '@/lib/data/offlineStore';

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export class FetchClientError extends Error {
  category: string;
  constructor(category: string, message: string) {
    super(message);
    this.category = category;
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Client-side fetch wrapper used by everything under src/hooks and any
 * client component that talks to our own /api routes. Centralizes timeout
 * + retry + envelope-unwrapping so components never see a raw
 * `TypeError: Failed to fetch`.
 *
 * In the packaged Android app (NEXT_PUBLIC_OFFLINE_APP) there is no server
 * to call at all — every /api/* URL is resolved locally against the bundled
 * snapshot (GET) or a local mutation handler (POST/PATCH), so this never
 * touches the network. Without this branch, every write (asking the AI
 * Assistant, creating a wristband, filing a Lost & Found report) would fail
 * with "the server returned an unreadable response", since there's no server
 * there to answer a real fetch() at all.
 */
export async function fetchJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
  if (IS_OFFLINE_APP && url.startsWith('/api/')) {
    const method = (options.method ?? 'GET').toUpperCase();
    try {
      const data = method === 'GET' ? resolveOffline(url) : await resolveOfflineMutation(url, method, typeof options.body === 'string' ? options.body : undefined);
      if (data === undefined) throw new FetchClientError('NOT_FOUND', 'Not available in the app.');
      return data as T;
    } catch (err) {
      if (err instanceof FetchClientError) throw err;
      throw new FetchClientError('VALIDATION_ERROR', err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  const { timeoutMs = 10000, retries = 1, ...init } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      let body: ApiEnvelope<T>;
      try {
        body = await res.json();
      } catch {
        throw new FetchClientError('API_ERROR', 'The server returned an unreadable response.');
      }
      if (!res.ok || body.error) {
        const message = body.error?.message ?? 'Something went wrong. Please try again.';
        const category = body.error?.category ?? 'UNKNOWN_ERROR';
        throw new FetchClientError(category, message);
      }
      return body.data;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const isNetwork = err instanceof TypeError;
      const retryable = isAbort || isNetwork;
      if (attempt < retries && retryable) continue;
      if (err instanceof FetchClientError) throw err;
      if (isAbort) throw new FetchClientError('TIMEOUT', 'The request took too long. Please try again.');
      if (isNetwork) throw new FetchClientError('NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.');
      throw new FetchClientError('UNKNOWN_ERROR', 'An unexpected error occurred.');
    }
  }
  throw lastError;
}
