'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { relativeTime } from '@/lib/utils/format';
import { lostFoundCaseTypeLabels, lostFoundStatusLabels, tEnum } from '@/lib/i18n/enumLabels';
import type { LostFoundCase, LostFoundCaseType, Zone } from '@/lib/data/types';

const TYPES: LostFoundCaseType[] = ['LOST_PERSON', 'FOUND_PERSON', 'LOST_ITEM', 'FOUND_ITEM'];

export default function LostFoundPage() {
  const casesApi = useApi<LostFoundCase[]>('/api/lost-found');
  const zonesApi = useApi<{ zone: Zone }[]>('/api/zones');

  const [type, setType] = useState<LostFoundCaseType>('LOST_PERSON');
  const [zoneId, setZoneId] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t, lang } = useLanguage();

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
      setSubmitError(err instanceof FetchClientError ? err.message : t('lfSubmitError'));
    }
  }

  const zones = zonesApi.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">{t('pageLostFoundTitle')}</h1>
      <p className="mt-1 text-sm text-paper-muted">{t('pageLostFoundSubtitle')}</p>

      <form onSubmit={handleSubmit} className="paper-card mt-4 space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-paper-muted">
            {t('lfReportType')}
            <select value={type} onChange={(e) => setType(e.target.value as LostFoundCaseType)} className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text">
              {TYPES.map((value) => (
                <option key={value} value={value}>
                  {tEnum(lostFoundCaseTypeLabels, value, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-paper-muted">
            {t('lfApproximateArea')}
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} required className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text">
              <option value="">{t('lfSelectSector')}</option>
              {zones.map((z) => (
                <option key={z.zone.id} value={z.zone.id}>
                  {z.zone.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm text-paper-muted">
          {t('lfDescription')}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
            rows={3}
            placeholder={t('lfDescriptionPlaceholder')}
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          />
        </label>
        <label className="block text-sm text-paper-muted">
          {t('lfContactInfo')}
          <input
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            required
            maxLength={200}
            placeholder={t('lfContactPlaceholder')}
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          />
        </label>
        {submitState === 'error' && <p className="text-sm text-risk-critical">{submitError}</p>}
        {submitState === 'success' && <p className="text-sm text-risk-normal">{t('lfSubmitSuccess')}</p>}
        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {submitState === 'submitting' ? t('lfSubmitting') : t('lfSubmitReport')}
        </button>
      </form>

      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-paper-muted">{t('lfOpenCases')}</h2>
      <AsyncState status={casesApi.status} errorMessage={casesApi.errorMessage} onRetry={casesApi.retry} emptyMessage={t('lfNoOpenCases')}>
        <div className="space-y-2">
          {(casesApi.data ?? [])
            .filter((c) => c.status !== 'REUNITED' && c.status !== 'CLOSED')
            .map((c) => (
              <div key={c.id} className="paper-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-paper-text">{tEnum(lostFoundCaseTypeLabels, c.type, lang)}</p>
                  <span className="pill border border-paper-border text-paper-muted">{tEnum(lostFoundStatusLabels, c.status, lang)}</span>
                </div>
                <p className="mt-1 text-sm text-paper-muted">{c.description}</p>
                <p className="mt-1 text-xs text-paper-faint">{t('lfReported')} {relativeTime(c.reportedAt, lang)}</p>
              </div>
            ))}
        </div>
      </AsyncState>
    </div>
  );
}
