import type { ApiFailure, ApiSuccess } from './apiResponse';

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
 */
export async function fetchJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
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
