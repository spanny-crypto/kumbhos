'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { DispatchRecommendation } from './DispatchRecommendation';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { titleCase, relativeTime } from '@/lib/utils/format';
import type { DispatchRecommendation as DispatchRec, Incident, IncidentStatus } from '@/lib/data/types';

const STATUS_FLOW: IncidentStatus[] = ['NEW', 'ACKNOWLEDGED', 'DISPATCHED', 'RESPONDING', 'RESOLVED'];

export function IncidentDetail({ incidentId, onChanged }: { incidentId: string; onChanged: () => void }) {
  const incidentApi = useApi<Incident>(`/api/incidents/${incidentId}`);
  const recommendationApi = useApi<DispatchRec>(`/api/incidents/${incidentId}/dispatch`);
  const [confirming, setConfirming] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function updateStatus(status: IncidentStatus) {
    setStatusUpdating(true);
    setActionError(null);
    try {
      await fetchJSON(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      incidentApi.retry();
      onChanged();
    } catch (err) {
      setActionError(err instanceof FetchClientError ? err.message : 'Could not update status.');
    } finally {
      setStatusUpdating(false);
    }
  }

  async function confirmDispatch() {
    setConfirming(true);
    setActionError(null);
    try {
      await fetchJSON(`/api/incidents/${incidentId}/dispatch`, { method: 'POST' });
      incidentApi.retry();
      recommendationApi.retry();
      onChanged();
    } catch (err) {
      setActionError(err instanceof FetchClientError ? err.message : 'Could not dispatch.');
    } finally {
      setConfirming(false);
    }
  }

  return (
    <AsyncState status={incidentApi.status} errorMessage={incidentApi.errorMessage} onRetry={incidentApi.retry} variant="dark">
      {incidentApi.data && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-50">{titleCase(incidentApi.data.type)}</h2>
              <span className="text-xs text-ink-400">{relativeTime(incidentApi.data.reportedAt)}</span>
            </div>
            <p className="mt-1 text-sm text-ink-300">{incidentApi.data.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  disabled={statusUpdating}
                  onClick={() => updateStatus(s)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition ${
                    incidentApi.data!.status === s ? 'border-accent bg-accent/20 text-accent-light' : 'border-ink-600 text-ink-300 hover:bg-ink-800'
                  }`}
                >
                  {titleCase(s)}
                </button>
              ))}
            </div>
            {actionError && <p className="mt-2 text-sm text-risk-critical">{actionError}</p>}
          </div>

          <AsyncState status={recommendationApi.status} errorMessage={recommendationApi.errorMessage} onRetry={recommendationApi.retry} loadingLabel="Calculating dispatch recommendation…" variant="dark">
            {recommendationApi.data && <DispatchRecommendation recommendation={recommendationApi.data} onConfirm={confirmDispatch} confirming={confirming} />}
          </AsyncState>
        </div>
      )}
    </AsyncState>
  );
}
