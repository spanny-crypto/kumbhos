'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { relativeTime, titleCase } from '@/lib/utils/format';
import type { LostFoundCase, LostFoundStatus } from '@/lib/data/types';

const NEXT_STATUS: Record<LostFoundStatus, LostFoundStatus | null> = {
  OPEN: 'POTENTIAL_MATCH',
  POTENTIAL_MATCH: 'VERIFIED',
  VERIFIED: 'REUNITED',
  REUNITED: 'CLOSED',
  CLOSED: null
};

export default function CommandLostFoundPage() {
  const api = useApi<LostFoundCase[]>('/api/lost-found', { pollMs: 20000 });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function advance(c: LostFoundCase) {
    const next = NEXT_STATUS[c.status];
    if (!next) return;
    setUpdatingId(c.id);
    setError(null);
    try {
      await fetchJSON(`/api/lost-found/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      api.retry();
    } catch (err) {
      setError(err instanceof FetchClientError ? err.message : 'Could not update this case.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-ink-50">Lost &amp; Found — Staff Review</h1>
      <p className="mt-1 text-sm text-ink-400">Every match requires manual human verification before reunification. No facial recognition is used.</p>
      {error && <p className="mt-2 text-sm text-risk-critical">{error}</p>}

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No cases reported." variant="dark">
        <div className="mt-4 space-y-2">
          {(api.data ?? []).map((c) => {
            const next = NEXT_STATUS[c.status];
            return (
              <div key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-50">{titleCase(c.type)}</span>
                    <span className="badge border border-ink-600 text-ink-300">{titleCase(c.status)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-300">{c.description}</p>
                  <p className="mt-1 text-xs text-ink-500">Reported {relativeTime(c.reportedAt)} · Contact: {c.contactInfo}</p>
                </div>
                {next && (
                  <button
                    onClick={() => advance(c)}
                    disabled={updatingId === c.id}
                    className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-ink-200 hover:bg-ink-800 disabled:opacity-50"
                  >
                    {updatingId === c.id ? 'Updating…' : `Mark as ${titleCase(next)}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </AsyncState>
    </div>
  );
}
