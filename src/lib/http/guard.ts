import { NextResponse } from 'next/server';
import { AuthorizationError } from '@/lib/auth/rbac';
import { apiError } from './apiResponse';

/**
 * Wraps a route handler body so unexpected errors never leak a stack trace
 * to the client and AuthorizationError maps to the correct 401/403 shape.
 * Every route in app/api uses this instead of ad-hoc try/catch.
 */
export async function withApiErrors(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return apiError(err.status === 401 ? 'AUTH_ERROR' : 'FORBIDDEN', err.message);
    }
    console.error('[KumbhOS API]', err instanceof Error ? err.stack ?? err.message : err);
    return apiError('UNKNOWN_ERROR', 'Something went wrong on our end. Please try again.');
  }
}
