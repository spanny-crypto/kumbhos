'use client';

import { useState } from 'react';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { PressureBadge } from '@/components/crowd/PressureBadge';
import { titleCase } from '@/lib/utils/format';
import type { CrowdPrediction, CrowdPressure, ScenarioType, SimulationEvent, Zone } from '@/lib/data/types';

const SCENARIOS: { value: ScenarioType; label: string }[] = [
  { value: 'CROWD_INFLUX', label: 'Sudden crowd influx' },
  { value: 'CROWD_DECREASE', label: 'Crowd dispersal' },
  { value: 'BRIDGE_CLOSURE', label: 'Bridge closure' },
  { value: 'ROAD_CLOSURE', label: 'Road closure' },
  { value: 'GHAT_CLOSURE', label: 'Ghat closure' },
  { value: 'TRAIN_ARRIVAL', label: 'Train arrival' },
  { value: 'PARKING_OVERFLOW', label: 'Parking overflow' },
  { value: 'TOILET_OVERLOAD', label: 'Toilet cluster overload' },
  { value: 'WATER_FAILURE', label: 'Water point failure' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical emergency' },
  { value: 'FIRE_INCIDENT', label: 'Fire incident' },
  { value: 'WEATHER_DISRUPTION', label: 'Weather disruption' },
  { value: 'EVENT_COMPLETION', label: 'Event completion' }
];

interface SimulateResult {
  event: SimulationEvent;
  before: { zone: Zone; pressure: CrowdPressure };
  after: { zone: Zone; pressure: CrowdPressure; prediction: CrowdPrediction };
}

export function ScenarioPanel({ zones }: { zones: Zone[] }) {
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? '');
  const [scenario, setScenario] = useState<ScenarioType>('CROWD_INFLUX');
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SimulateResult | null>(null);

  async function run() {
    if (!zoneId) return;
    setStatus('running');
    setErrorMessage(null);
    try {
      const data = await fetchJSON<SimulateResult>('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: scenario, zoneId })
      });
      setResult(data);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof FetchClientError ? err.message : 'Could not run the scenario. Please try again.');
    }
  }

  return (
    <div>
      <div className="card flex flex-wrap items-end gap-4 p-4">
        <label className="text-sm text-ink-300">
          Zone
          <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="mt-1 block rounded-md border border-ink-600 bg-ink-900 px-3 py-1.5 text-sm text-ink-100">
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ink-300">
          Scenario
          <select value={scenario} onChange={(e) => setScenario(e.target.value as ScenarioType)} className="mt-1 block rounded-md border border-ink-600 bg-ink-900 px-3 py-1.5 text-sm text-ink-100">
            {SCENARIOS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={run} disabled={status === 'running'} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-50">
          {status === 'running' ? 'Running…' : 'Run scenario'}
        </button>
      </div>

      {status === 'error' && (
        <div className="mt-3 rounded-lg border border-risk-critical/40 bg-risk-critical/10 p-3 text-sm text-ink-100">
          {errorMessage}{' '}
          <button className="underline" onClick={run}>
            Retry
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="card p-4">
            <p className="text-sm text-ink-100">{result.event.summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Before</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-200">{result.before.zone.name}</span>
                <PressureBadge pressure={result.before.pressure} />
              </div>
              <p className="mt-2 text-xs text-ink-400">
                Population: {result.before.zone.currentPopulation.toLocaleString()} / {result.before.zone.capacity.toLocaleString()}
              </p>
            </div>
            <div className="card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">After</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-200">{result.after.zone.name}</span>
                <PressureBadge pressure={result.after.pressure} />
              </div>
              <p className="mt-2 text-xs text-ink-400">
                Population: {result.after.zone.currentPopulation.toLocaleString()} / {result.after.zone.capacity.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="card p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Predicted impact &amp; recommended action</p>
            <p className="text-sm text-ink-100">{result.after.pressure.reason}</p>
            <p className="mt-2 text-sm text-accent-light">{result.after.prediction.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
