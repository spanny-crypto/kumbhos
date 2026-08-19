'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import type { Volunteer } from '@/lib/data/types';

export default function VolunteersPage() {
  const api = useApi<Volunteer[]>('/api/volunteers', { pollMs: 30000 });
  const volunteers = [...(api.data ?? [])].sort((a, b) => Number(b.available) - Number(a.available));

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-ink-50">Volunteer Coordination</h1>
      <p className="mt-1 text-sm text-ink-400">{(api.data ?? []).filter((v) => v.available).length} available of {(api.data ?? []).length} total.</p>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No volunteers registered." variant="dark">
        <div className="mt-4 overflow-x-auto rounded-lg border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-900 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Zone</th>
                <th className="px-3 py-2">Skills</th>
                <th className="px-3 py-2">Languages</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {volunteers.map((v) => (
                <tr key={v.id} className="hover:bg-ink-900/50">
                  <td className="px-3 py-2 text-ink-100">{v.name}</td>
                  <td className="px-3 py-2 text-ink-400">{v.zoneId}</td>
                  <td className="px-3 py-2 text-ink-400">{v.skills.join(', ')}</td>
                  <td className="px-3 py-2 text-ink-400">{v.languages.join(', ')}</td>
                  <td className="px-3 py-2">
                    <span className={`badge border ${v.available ? 'border-risk-normal/40 bg-risk-normal/10 text-risk-normal' : 'border-ink-600 text-ink-400'}`}>
                      {v.available ? 'Available' : 'Assigned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncState>
    </div>
  );
}
