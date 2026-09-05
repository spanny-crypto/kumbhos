'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { WristbandCard } from '@/components/wristband/WristbandCard';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { relativeTime, titleCase } from '@/lib/utils/format';
import type { WristbandProfile, WristbandStatus, Zone } from '@/lib/data/types';

const NEXT_STATUS: Record<WristbandStatus, WristbandStatus | null> = {
  ACTIVE: 'REUNITED',
  REUNITED: 'EXPIRED',
  EXPIRED: null
};

export default function CommandWristbandsPage() {
  const api = useApi<WristbandProfile[]>('/api/wristbands', { pollMs: 20000 });
  const zonesApi = useApi<{ zone: Zone }[]>('/api/zones');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function advance(profile: WristbandProfile) {
    const next = NEXT_STATUS[profile.status];
    if (!next) return;
    setUpdatingId(profile.id);
    setError(null);
    try {
      await fetchJSON(`/api/wristbands/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      api.retry();
    } catch (err) {
      setError(err instanceof FetchClientError ? err.message : 'Could not update this wristband.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-ink-50">ID Wristbands</h1>
      <p className="mt-1 text-sm text-ink-400">Every band created by a guardian at /wristband. Mark reunited once a case is resolved, or expired if it's stale.</p>
      {error && <p className="mt-2 text-sm text-risk-critical">{error}</p>}

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No wristbands created yet." variant="dark">
        <div className="mt-4 space-y-2">
          {(api.data ?? []).map((profile) => {
            const next = NEXT_STATUS[profile.status];
            const zoneName = zonesApi.data?.find((z) => z.zone.id === profile.meetingPointZoneId)?.zone.name ?? null;
            const expanded = expandedId === profile.id;
            return (
              <div key={profile.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-ink-50">{profile.id}</span>
                      <span className="text-sm font-semibold text-ink-50">{profile.fullName}</span>
                      {profile.age !== null && <span className="text-xs text-ink-400">age {profile.age}</span>}
                      <span className="badge border border-ink-600 text-ink-300">{titleCase(profile.status)}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-300">
                      Guardian: {profile.guardianName} · {profile.guardianPhone}
                    </p>
                    {profile.medicalNotes && <p className="mt-1 text-xs text-risk-building">⚠ {profile.medicalNotes}</p>}
                    <p className="mt-1 text-xs text-ink-500">Created {relativeTime(profile.createdAt)}{zoneName ? ` · Meeting point: ${zoneName}` : ''}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setExpandedId(expanded ? null : profile.id)}
                      className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-ink-200 hover:bg-ink-800"
                    >
                      {expanded ? 'Hide card' : 'View / reprint'}
                    </button>
                    {next && (
                      <button
                        onClick={() => advance(profile)}
                        disabled={updatingId === profile.id}
                        className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-ink-200 hover:bg-ink-800 disabled:opacity-50"
                      >
                        {updatingId === profile.id ? 'Updating…' : `Mark as ${titleCase(next)}`}
                      </button>
                    )}
                  </div>
                </div>
                {expanded && (
                  <div className="mt-4 border-t border-ink-700 pt-4">
                    <WristbandCard profile={profile} zoneName={zoneName} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AsyncState>
    </div>
  );
}
