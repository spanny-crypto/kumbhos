import { NextResponse } from 'next/server';
import type { DataSource } from '@/lib/data/types';

export type ErrorCategory =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'FORBIDDEN'
  | 'DATABASE_ERROR'
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'AI_ERROR'
  | 'MAP_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'NOT_FOUND'
  | 'UNKNOWN_ERROR';

const statusForCategory: Record<ErrorCategory, number> = {
  NETWORK_ERROR: 502,
  AUTH_ERROR: 401,
  FORBIDDEN: 403,
  DATABASE_ERROR: 503,
  VALIDATION_ERROR: 400,
  API_ERROR: 502,
  TIMEOUT: 504,
  RATE_LIMIT: 429,
  AI_ERROR: 502,
  MAP_ERROR: 502,
  CONFIGURATION_ERROR: 500,
  NOT_FOUND: 404,
  UNKNOWN_ERROR: 500
};

export interface ApiMeta {
  source?: DataSource;
  requestId: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  data: T;
  error: null;
  meta: ApiMeta;
}

export interface ApiFailure {
  data: null;
  error: {
    category: ErrorCategory;
    message: string;
  };
  meta: ApiMeta;
}

function requestId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function apiSuccess<T>(data: T, meta?: Partial<ApiMeta>): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({
    data,
    error: null,
    meta: { requestId: requestId(), timestamp: new Date().toISOString(), ...meta }
  });
}

/**
 * User-friendly message shown in the UI never includes the raw technical
 * error — that gets logged server-side via console.error by the caller.
 */
export function apiError(category: ErrorCategory, userMessage: string): NextResponse<ApiFailure> {
  return NextResponse.json(
    {
      data: null,
      error: { category, message: userMessage },
      meta: { requestId: requestId(), timestamp: new Date().toISOString() }
    },
    { status: statusForCategory[category] }
  );
}
