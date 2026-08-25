'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { formatReading, titleCase } from '@/lib/utils/format';
import type { BathingStandardVerdict, DataSource, ReadingValue, WaterQualityRecord, WaterQualityRiskLevel } from '@/lib/data/types';
import type { WaterQualityInput } from '@/lib/data/provider';

const VERDICTS: BathingStandardVerdict[] = ['MEETS_STANDARD', 'EXCEEDS_STANDARD', 'PARTIAL', 'DISPUTED'];
const RISK_LEVELS: WaterQualityRiskLevel[] = ['LOW', 'MODERATE', 'HIGH', 'DISPUTED'];
const DATA_SOURCES: DataSource[] = ['GOVERNMENT_OPEN_DATA', 'DERIVED', 'LIVE', 'USER_REPORTED', 'SIMULATED'];

interface FormState {
  kumbhEvent: string;
  year: string;
  location: string;
  samplingPeriod: string;
  phMin: string;
  phMax: string;
  doMin: string;
  doMax: string;
  bodMin: string;
  bodMax: string;
  fcMin: string;
  fcMax: string;
  bathingStandardVerdict: BathingStandardVerdict;
  riskLevel: WaterQualityRiskLevel;
  summary: string;
  notes: string;
  sourcePublisher: string;
  sourceUrl: string;
  sourceDate: string;
  dataSource: DataSource;
}

const BLANK_FORM: FormState = {
  kumbhEvent: '',
  year: String(new Date().getFullYear()),
  location: '',
  samplingPeriod: '',
  phMin: '',
  phMax: '',
  doMin: '',
  doMax: '',
  bodMin: '',
  bodMax: '',
  fcMin: '',
  fcMax: '',
  bathingStandardVerdict: 'DISPUTED',
  riskLevel: 'MODERATE',
  summary: '',
  notes: '',
  sourcePublisher: '',
  sourceUrl: '',
  sourceDate: '',
  dataSource: 'GOVERNMENT_OPEN_DATA'
};

function readingToFields(value: ReadingValue): { min: string; max: string } {
  if (value === null || value === undefined) return { min: '', max: '' };
  if (typeof value === 'number') return { min: String(value), max: '' };
  return { min: String(value.min), max: String(value.max) };
}

function fieldsToReading(min: string, max: string): ReadingValue {
  const minNum = min.trim() === '' ? null : Number(min);
  const maxNum = max.trim() === '' ? null : Number(max);
  if (minNum === null) return null;
  if (maxNum === null || maxNum === minNum) return minNum;
  return { min: Math.min(minNum, maxNum), max: Math.max(minNum, maxNum) };
}

function recordToForm(r: WaterQualityRecord): FormState {
  const ph = readingToFields(r.ph);
  const doVal = readingToFields(r.dissolvedOxygenMgL);
  const bod = readingToFields(r.bodMgL);
  const fc = readingToFields(r.fecalColiformMpn100ml);
  return {
    kumbhEvent: r.kumbhEvent,
    year: String(r.year),
    location: r.location,
    samplingPeriod: r.samplingPeriod,
    phMin: ph.min,
    phMax: ph.max,
    doMin: doVal.min,
    doMax: doVal.max,
    bodMin: bod.min,
    bodMax: bod.max,
    fcMin: fc.min,
    fcMax: fc.max,
    bathingStandardVerdict: r.bathingStandardVerdict,
    riskLevel: r.riskLevel,
    summary: r.summary,
    notes: r.notes ?? '',
    sourcePublisher: r.sourcePublisher,
    sourceUrl: r.sourceUrl,
    sourceDate: r.sourceDate,
    dataSource: r.dataSource
  };
}

function formToInput(f: FormState): WaterQualityInput {
  return {
    kumbhEvent: f.kumbhEvent,
    year: Number(f.year),
    location: f.location,
    samplingPeriod: f.samplingPeriod,
    ph: fieldsToReading(f.phMin, f.phMax),
    dissolvedOxygenMgL: fieldsToReading(f.doMin, f.doMax),
    bodMgL: fieldsToReading(f.bodMin, f.bodMax),
    fecalColiformMpn100ml: fieldsToReading(f.fcMin, f.fcMax),
    bathingStandardVerdict: f.bathingStandardVerdict,
    riskLevel: f.riskLevel,
    summary: f.summary,
    notes: f.notes.trim() === '' ? null : f.notes,
    sourcePublisher: f.sourcePublisher,
    sourceUrl: f.sourceUrl,
    sourceDate: f.sourceDate,
    dataSource: f.dataSource
  };
}

function ReadingField({ label, min, max, onMin, onMax }: { label: string; min: string; max: string; onMin: (v: string) => void; onMax: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-ink-400">{label}</label>
      <div className="mt-1 flex gap-1.5">
        <input value={min} onChange={(e) => onMin(e.target.value)} placeholder="value / min" className="w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-xs text-ink-100" />
        <input value={max} onChange={(e) => onMax(e.target.value)} placeholder="max (optional)" className="w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-xs text-ink-100" />
      </div>
    </div>
  );
}

function RecordForm({ initial, recordId, onSaved, onCancel }: { initial: FormState; recordId?: string; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const input = formToInput(form);
      if (recordId) {
        await fetchJSON(`/api/water-quality/${recordId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      } else {
        await fetchJSON('/api/water-quality', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      }
      onSaved();
    } catch (err) {
      setStatus('error');
      setError(err instanceof FetchClientError ? err.message : 'Could not save this record.');
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-ink-400">
          Kumbh event
          <input required value={form.kumbhEvent} onChange={(e) => set('kumbhEvent', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
        </label>
        <label className="text-xs text-ink-400">
          Year
          <input required type="number" value={form.year} onChange={(e) => set('year', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
        </label>
        <label className="text-xs text-ink-400 sm:col-span-2">
          Location
          <input required value={form.location} onChange={(e) => set('location', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
        </label>
        <label className="text-xs text-ink-400 sm:col-span-2">
          Sampling period
          <input required value={form.samplingPeriod} onChange={(e) => set('samplingPeriod', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReadingField label="pH" min={form.phMin} max={form.phMax} onMin={(v) => set('phMin', v)} onMax={(v) => set('phMax', v)} />
        <ReadingField label="Dissolved O₂ (mg/L)" min={form.doMin} max={form.doMax} onMin={(v) => set('doMin', v)} onMax={(v) => set('doMax', v)} />
        <ReadingField label="BOD (mg/L)" min={form.bodMin} max={form.bodMax} onMin={(v) => set('bodMin', v)} onMax={(v) => set('bodMax', v)} />
        <ReadingField label="Fecal coliform (MPN/100mL)" min={form.fcMin} max={form.fcMax} onMin={(v) => set('fcMin', v)} onMax={(v) => set('fcMax', v)} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-xs text-ink-400">
          Bathing standard verdict
          <select value={form.bathingStandardVerdict} onChange={(e) => set('bathingStandardVerdict', e.target.value as BathingStandardVerdict)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100">
            {VERDICTS.map((v) => (
              <option key={v} value={v}>
                {titleCase(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink-400">
          Risk level
          <select value={form.riskLevel} onChange={(e) => set('riskLevel', e.target.value as WaterQualityRiskLevel)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100">
            {RISK_LEVELS.map((v) => (
              <option key={v} value={v}>
                {titleCase(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink-400">
          Data type
          <select value={form.dataSource} onChange={(e) => set('dataSource', e.target.value as DataSource)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100">
            {DATA_SOURCES.map((v) => (
              <option key={v} value={v}>
                {titleCase(v)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-xs text-ink-400">
        Summary
        <textarea required rows={3} maxLength={2000} value={form.summary} onChange={(e) => set('summary', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
      </label>
      <label className="block text-xs text-ink-400">
        Notes / caveats (optional)
        <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-xs text-ink-400">
          Source publisher
          <input required value={form.sourcePublisher} onChange={(e) => set('sourcePublisher', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
        </label>
        <label className="text-xs text-ink-400">
          Source URL
          <input required type="url" value={form.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
        </label>
        <label className="text-xs text-ink-400">
          Source date
          <input required type="date" value={form.sourceDate} onChange={(e) => set('sourceDate', e.target.value)} className="mt-1 block w-full rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-ink-100" />
        </label>
      </div>

      {status === 'error' && <p className="text-sm text-risk-critical">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === 'saving'} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-50">
          {status === 'saving' ? 'Saving…' : recordId ? 'Save changes' : 'Add record'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-ink-600 px-4 py-2 text-sm text-ink-300 hover:bg-ink-800">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CommandWaterQualityPage() {
  const api = useApi<WaterQualityRecord[]>('/api/water-quality');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm('Delete this water quality record? This cannot be undone.')) return;
    setDeletingId(id);
    setError(null);
    try {
      await fetchJSON(`/api/water-quality/${id}`, { method: 'DELETE' });
      api.retry();
    } catch (err) {
      setError(err instanceof FetchClientError ? err.message : 'Could not delete this record.');
    } finally {
      setDeletingId(null);
    }
  }

  const editingRecord = (api.data ?? []).find((r) => r.id === editingId);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-50">Water Quality — Editable Records</h1>
          <p className="mt-1 text-sm text-ink-400">Every field here is staff-editable and drives the public /water-quality page. Cite a real source for every change.</p>
        </div>
        {!creating && !editingId && (
          <button onClick={() => setCreating(true)} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light">
            + Add record
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-risk-critical">{error}</p>}

      {creating && (
        <div className="mt-4">
          <RecordForm initial={BLANK_FORM} onCancel={() => setCreating(false)} onSaved={() => { setCreating(false); api.retry(); }} />
        </div>
      )}

      {editingRecord && (
        <div className="mt-4">
          <RecordForm
            initial={recordToForm(editingRecord)}
            recordId={editingRecord.id}
            onCancel={() => setEditingId(null)}
            onSaved={() => { setEditingId(null); api.retry(); }}
          />
        </div>
      )}

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No records yet — add one above." variant="dark">
        <div className="mt-4 space-y-2">
          {(api.data ?? []).map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-50">
                    {r.kumbhEvent} <span className="text-ink-500">· {r.year}</span>
                  </p>
                  <p className="text-xs text-ink-400">{r.location}</p>
                  <p className="mt-1 text-xs text-ink-300">
                    pH {formatReading(r.ph, '')} · FC {formatReading(r.fecalColiformMpn100ml, 'MPN/100mL')} · {titleCase(r.riskLevel)} risk
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setEditingId(r.id)} className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-ink-200 hover:bg-ink-800">
                    Edit
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    disabled={deletingId === r.id}
                    className="rounded-md border border-risk-intervention/40 px-3 py-1.5 text-xs text-risk-intervention hover:bg-risk-intervention/10 disabled:opacity-50"
                  >
                    {deletingId === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
