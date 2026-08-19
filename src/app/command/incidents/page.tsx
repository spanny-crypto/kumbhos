'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { IncidentList } from '@/components/emergency/IncidentList';
import { IncidentDetail } from '@/components/emergency/IncidentDetail';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import type { CrowdPressure, Incident, IncidentSeverity, IncidentType, Zone } from '@/lib/data/types';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

const TYPES: IncidentType[] = ['MEDICAL', 'FIRE', 'MISSING_PERSON', 'CROWD_SURGE', 'ACCIDENT', 'INFRASTRUCTURE_FAILURE', 'WATER_FLOOD', 'SECURITY', 'OTHER'];
const SEVERITIES: IncidentSeverity[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

function NewIncidentForm({ zones, onCreated }: { zones: Zone[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<IncidentType>('MEDICAL');
  const [severity, setSeverity] = useState<IncidentSeverity>('MODERATE');
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-3 w-full rounded-md border border-dashed border-ink-600 py-2 text-sm text-ink-300 hover:bg-ink-800">
        + Report new incident
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    try {
      await fetchJSON('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, severity, zoneId, description })
      });
      setDescription('');
      setOpen(false);
      setStatus('idle');
      onCreated();
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof FetchClientError ? err.message : 'Could not create incident.');
    }
  }

  return (
    <form onSubmit={submit} className="card mb-3 space-y-2 p-3">
      <div className="grid grid-cols-2 gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as IncidentType)} className="rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-xs text-ink-100">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value as IncidentSeverity)} className="rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-xs text-ink-100">
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-xs text-ink-100">
        {zones.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        maxLength={500}
        rows={2}
        placeholder="Description"
        className="w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
      />
      {status === 'error' && <p className="text-xs text-risk-critical">{errorMessage}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === 'submitting'} className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          {status === 'submitting' ? 'Submitting…' : 'Create'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-ink-300">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function IncidentsPage() {
  const incidentsApi = useApi<Incident[]>('/api/incidents', { pollMs: 15000 });
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const incidents = [...(incidentsApi.data ?? [])].sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  const activeId = selectedId ?? incidents[0]?.id ?? null;

  return (
    <div className="grid h-screen grid-cols-1 gap-4 p-6 lg:grid-cols-[380px_1fr]">
      <div className="flex min-h-0 flex-col">
        <h1 className="mb-3 text-xl font-bold text-ink-50">Incidents</h1>
        <NewIncidentForm zones={(zonesApi.data ?? []).map((z) => z.zone)} onCreated={incidentsApi.retry} />
        <AsyncState status={incidentsApi.status} errorMessage={incidentsApi.errorMessage} onRetry={incidentsApi.retry} emptyMessage="No incidents reported." variant="dark">
          <IncidentList incidents={incidents} selectedId={activeId} onSelect={setSelectedId} />
        </AsyncState>
      </div>
      <div className="min-h-0 overflow-y-auto">{activeId ? <IncidentDetail incidentId={activeId} onChanged={incidentsApi.retry} /> : <p className="text-sm text-ink-400">Select an incident to view details.</p>}</div>
    </div>
  );
}
