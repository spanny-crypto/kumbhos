'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { WristbandCard } from '@/components/wristband/WristbandCard';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { WristbandProfile, Zone } from '@/lib/data/types';

export default function WristbandPage() {
  const zonesApi = useApi<{ zone: Zone }[]>('/api/zones');

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [meetingPointZoneId, setMeetingPointZoneId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<WristbandProfile | null>(null);
  const { t } = useLanguage();

  const zones = zonesApi.data ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitState('submitting');
    setSubmitError(null);
    try {
      const profile = await fetchJSON<WristbandProfile>('/api/wristbands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          age: age ? Number(age) : null,
          guardianName,
          guardianPhone,
          meetingPointZoneId: meetingPointZoneId || null,
          medicalNotes: medicalNotes || null
        })
      });
      setCreated(profile);
      setSubmitState('idle');
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof FetchClientError ? err.message : t('wbCreateError'));
    }
  }

  function reset() {
    setCreated(null);
    setFullName('');
    setAge('');
    setGuardianName('');
    setGuardianPhone('');
    setMeetingPointZoneId('');
    setMedicalNotes('');
  }

  if (created) {
    const zoneName = zones.find((z) => z.zone.id === created.meetingPointZoneId)?.zone.name ?? null;
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="heading-serif text-3xl text-paper-text">{t('wbReadyTitle')}</h1>
        <p className="mt-1 text-sm text-paper-muted">{t('wbReadySubtitle')}</p>
        <div className="paper-card mt-4 p-5">
          <WristbandCard profile={created} zoneName={zoneName} />
        </div>
        <button onClick={reset} className="fast-transition mt-4 rounded-md border border-paper-border px-4 py-2 text-sm font-medium text-paper-text hover:bg-paper-bg">
          {t('wbMakeAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">{t('pageWristbandTitle')}</h1>
      <p className="mt-1 text-sm text-paper-muted">{t('pageWristbandSubtitle')}</p>

      <div className="paper-card mt-4 flex items-start gap-2.5 p-4 text-sm">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-risk-normal" />
        <p className="text-paper-muted">{t('wbPrivacyNote')}</p>
      </div>

      <form onSubmit={handleSubmit} className="paper-card mt-4 space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-paper-muted">
            {t('formFullName')}
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              maxLength={100}
              placeholder={t('wbFullNamePlaceholder')}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
          <label className="text-sm text-paper-muted">
            {t('formAge')}
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t('formOptional')}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-paper-muted">
            {t('wbGuardianName')}
            <input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              required
              maxLength={100}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
          <label className="text-sm text-paper-muted">
            {t('wbGuardianPhone')}
            <input
              type="tel"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              required
              maxLength={20}
              placeholder={t('wbGuardianPhonePlaceholder')}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
        </div>
        <label className="block text-sm text-paper-muted">
          {t('wbMeetingPoint')}
          <select
            value={meetingPointZoneId}
            onChange={(e) => setMeetingPointZoneId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          >
            <option value="">{t('wbNoMeetingPoint')}</option>
            {zones.map((z) => (
              <option key={z.zone.id} value={z.zone.id}>
                {z.zone.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-paper-muted">
          {t('wbMedicalNotes')}
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder={t('wbMedicalNotesPlaceholder')}
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          />
        </label>
        {submitState === 'error' && <p className="text-sm text-risk-critical">{submitError}</p>}
        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="fast-transition rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitState === 'submitting' ? t('wbCreating') : t('wbCreateButton')}
        </button>
      </form>
    </div>
  );
}
