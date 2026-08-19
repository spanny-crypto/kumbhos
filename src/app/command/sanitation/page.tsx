'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { relativeTime, titleCase } from '@/lib/utils/format';
import type { SanitationPressure, Toilet } from '@/lib/data/types';

const PRESSURE_STYLE: Record<SanitationPressure['pressure'], string> = {
  NORMAL: 'text-risk-normal border-risk-normal/40 bg-risk-normal/10',
  WATCH: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  HIGH: 'text-risk-critical border-risk-critical/40 bg-risk-critical/10',
  CRITICAL: 'text-risk-intervention border-risk-intervention/40 bg-risk-intervention/10'
};

export default function SanitationPage() {
  const api = useApi<{ toilets: Toilet[]; pressure: SanitationPressure[] }>('/api/toilets', { pollMs: 20000 });

  const pressures = [...(api.data?.pressure ?? [])].sort((a, b) => {
    const order: SanitationPressure['pressure'][] = ['CRITICAL', 'HIGH', 'WATCH', 'NORMAL'];
    return order.indexOf(a.pressure) - order.indexOf(b.pressure);
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-ink-50">Predictive Sanitation</h1>
      <p className="mt-1 text-sm text-ink-400">Service-pressure projection per toilet cluster.</p>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No sanitation data available." variant="dark">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pressures.map((p) => (
            <div key={p.clusterId} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-50">{p.clusterName}</p>
                <span className={`badge border ${PRESSURE_STYLE[p.pressure]}`}>{titleCase(p.pressure)}</span>
              </div>
              <p className="mt-2 text-xs text-ink-400">
                {p.minutesToServiceThreshold !== null ? `Service threshold in ~${p.minutesToServiceThreshold} min` : 'Within normal capacity'}
              </p>
              <p className="mt-1 text-xs text-ink-300">{p.recommendation}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-ink-300">Individual units</h2>
        <div className="overflow-x-auto rounded-lg border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-900 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Cluster</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Last Cleaned</th>
                <th className="px-3 py-2">Complaints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {(api.data?.toilets ?? []).map((t) => (
                <tr key={t.id} className="hover:bg-ink-900/50">
                  <td className="px-3 py-2 text-ink-100">{t.id}</td>
                  <td className="px-3 py-2 text-ink-400">{t.clusterName}</td>
                  <td className="px-3 py-2 text-ink-400">{titleCase(t.status)}</td>
                  <td className="px-3 py-2 text-ink-400">{relativeTime(t.lastCleanedAt)}</td>
                  <td className="px-3 py-2 text-ink-400">{t.complaints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncState>
    </div>
  );
}
