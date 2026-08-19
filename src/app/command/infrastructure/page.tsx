'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { relativeTime, titleCase } from '@/lib/utils/format';
import type { AssetStatus, InfrastructureAsset } from '@/lib/data/types';

const STATUS_STYLE: Record<AssetStatus, string> = {
  OPERATIONAL: 'text-risk-normal border-risk-normal/40 bg-risk-normal/10',
  DEGRADED: 'text-risk-building border-risk-building/40 bg-risk-building/10',
  CRITICAL: 'text-risk-critical border-risk-critical/40 bg-risk-critical/10',
  OFFLINE: 'text-risk-intervention border-risk-intervention/40 bg-risk-intervention/10'
};

export default function InfrastructurePage() {
  const api = useApi<InfrastructureAsset[]>('/api/infrastructure', { pollMs: 30000 });
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'ALL'>('ALL');

  const filtered = (api.data ?? []).filter((a) => statusFilter === 'ALL' || a.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => {
    const order: AssetStatus[] = ['OFFLINE', 'CRITICAL', 'DEGRADED', 'OPERATIONAL'];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-ink-50">Infrastructure Monitoring</h1>
      <p className="mt-1 text-sm text-ink-400">Digital-twin style status across all monitored assets.</p>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} variant="dark">
        <div className="my-3 flex flex-wrap gap-2">
          {(['ALL', 'OFFLINE', 'CRITICAL', 'DEGRADED', 'OPERATIONAL'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full border px-3 py-1 text-xs ${statusFilter === s ? 'border-accent bg-accent/20 text-accent-light' : 'border-ink-600 text-ink-300'}`}>
              {s === 'ALL' ? 'All' : titleCase(s)}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-900 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-3 py-2">Asset</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assigned Team</th>
                <th className="px-3 py-2">Last Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {sorted.map((a) => (
                <tr key={a.id} className="hover:bg-ink-900/50">
                  <td className="px-3 py-2 text-ink-100">{a.name}</td>
                  <td className="px-3 py-2 text-ink-400">{titleCase(a.category)}</td>
                  <td className="px-3 py-2">
                    <span className={`badge border ${STATUS_STYLE[a.status]}`}>{titleCase(a.status)}</span>
                  </td>
                  <td className="px-3 py-2 text-ink-400">{a.assignedTeam ?? '—'}</td>
                  <td className="px-3 py-2 text-ink-400">{relativeTime(a.lastInspection)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncState>
    </div>
  );
}
