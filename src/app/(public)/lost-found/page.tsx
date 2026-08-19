'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { relativeTime, titleCase } from '@/lib/utils/format';
import type { LostFoundCase, LostFoundCaseType, Zone } from '@/lib/data/types';

const TYPES: { value: LostFoundCaseType; label: string }[] = [
  { value: 'LOST_PERSON', label: 'Lost person' },
  { value: 'FOUND_PERSON', label: 'Found person' },
  { value: 'LOST_ITEM', label: 'Lost item' },
  { value: 'FOUND_ITEM', label: 'Found item' }
];

export default function LostFoundPage() {
  const casesApi = useApi<LostFoundCase[]>('/api/lost-found');
  const zonesApi = useApi<{ zone: Zone }[]>('/api/zones');

  const [type, setType] = useState<LostFoundCaseType>('LOST_PERSON');
  const [zoneId, setZoneId] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitState('submitting');
    setSubmitError(null);
    try {
      await fetchJSON('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, approximateZoneId: zoneId, description, contactInfo })
      });
      setSubmitState('success');
      setDescription('');
      setContactInfo('');
      casesApi.retry();
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof FetchClientError ? err.message : 'Could not submit your report. Please try again.');
    }
  }

  const zones = zonesApi.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-bold text-paper-text">{t('pageLostFoundTitle')}</h1>
      <p className="mt-1 text-sm text-paper-muted">{t('pageLostFoundSubtitle')}</p>

      <form onSubmit={handleSubmit} className="paper-card mt-4 space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-paper-muted">
            Report type
            <select value={type} onChange={(e) => setType(e.target.value as LostFoundCaseType)} className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text">
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-paper-muted">
            Approximate area
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} required className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text">
              <option value="">Select a sector…</option>
              {zones.map((z) => (
                <option key={z.zone.id} value={z.zone.id}>
                  {z.zone.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm text-paper-muted">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
            rows={3}
            placeholder="Clothing, approximate age, distinguishing details, time last seen…"
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          />
        </label>
        <label className="block text-sm text-paper-muted">
          Your contact information
          <input
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            required
            maxLength={200}
            placeholder="Phone number or where staff can find you"
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          />
        </label>
        {submitState === 'error' && <p className="text-sm text-risk-critical">{submitError}</p>}
        {submitState === 'success' && <p className="text-sm text-risk-normal">Report submitted. Staff will review it shortly.</p>}
        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {submitState === 'submitting' ? 'Submitting…' : 'Submit report'}
        </button>
      </form>

      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-paper-muted">Open cases</h2>
      <AsyncState status={casesApi.status} errorMessage={casesApi.errorMessage} onRetry={casesApi.retry} emptyMessage="No open cases right now.">
        <div className="space-y-2">
          {(casesApi.data ?? [])
            .filter((c) => c.status !== 'REUNITED' && c.status !== 'CLOSED')
            .map((c) => (
              <div key={c.id} className="paper-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-paper-text">{titleCase(c.type)}</p>
                  <span className="pill border border-paper-border text-paper-muted">{titleCase(c.status)}</span>
                </div>
                <p className="mt-1 text-sm text-paper-muted">{c.description}</p>
                <p className="mt-1 text-xs text-paper-faint">Reported {relativeTime(c.reportedAt)}</p>
              </div>
            ))}
        </div>
      </AsyncState>
    </div>
  );
}
