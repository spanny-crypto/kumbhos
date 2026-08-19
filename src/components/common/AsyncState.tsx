'use client';

import type { ReactNode } from 'react';
import type { AsyncStatus } from '@/hooks/useApi';

interface AsyncStateProps {
  status: AsyncStatus;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  loadingLabel?: string;
  /** 'light' (default) for the public paper-themed portal, 'dark' for the Command Centre / terminal surfaces. */
  variant?: 'light' | 'dark';
  children: ReactNode;
}

/**
 * Shared loading/empty/error/retry chrome used by every data-driven view in
 * the app. Never render raw fetch errors — this is the only place that
 * should render an error state.
 */
export function AsyncState({ status, errorMessage, onRetry, emptyMessage = 'No data to show yet.', loadingLabel = 'Loading…', variant = 'light', children }: AsyncStateProps) {
  const muted = variant === 'dark' ? 'text-ink-300' : 'text-paper-muted';
  const spinnerTrack = variant === 'dark' ? 'border-ink-600' : 'border-paper-border';
  const bodyText = variant === 'dark' ? 'text-ink-100' : 'text-paper-text';
  const retryBtn = variant === 'dark' ? 'border-ink-500 bg-ink-800 text-ink-50 hover:bg-ink-700' : 'border-paper-border bg-paper-surface text-paper-text hover:bg-paper-bg';

  if (status === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-16 ${muted}`}>
        <div className={`h-8 w-8 animate-spin rounded-full border-2 ${spinnerTrack} border-t-brand-500`} />
        <p className="text-sm">{loadingLabel}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-risk-critical/40 bg-risk-critical/10 py-12 text-center">
        <p className={`max-w-sm text-sm ${bodyText}`}>{errorMessage ?? 'Something went wrong. Please try again.'}</p>
        {onRetry && (
          <button onClick={onRetry} className={`rounded-md border px-4 py-1.5 text-sm font-medium transition ${retryBtn}`}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 py-12 text-center ${muted}`}>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
