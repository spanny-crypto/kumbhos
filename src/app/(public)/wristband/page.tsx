'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { WristbandCard } from '@/components/wristband/WristbandCard';
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
      setSubmitError(err instanceof FetchClientError ? err.message : 'Could not create the wristband. Please try again.');
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
        <h1 className="heading-serif text-3xl text-paper-text">Wristband ready</h1>
        <p className="mt-1 text-sm text-paper-muted">Print it now, or screenshot this screen if there's no printer nearby — either way, the QR still scans.</p>
        <div className="paper-card mt-4 p-5">
          <WristbandCard profile={created} zoneName={zoneName} />
        </div>
        <button onClick={reset} className="fast-transition mt-4 rounded-md border border-paper-border px-4 py-2 text-sm font-medium text-paper-text hover:bg-paper-bg">
          Make another wristband
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">ID Wristband</h1>
      <p className="mt-1 text-sm text-paper-muted">
        Make a printable QR wristband for a child or elderly relative in under a minute. Anyone who finds them can scan it and call you immediately — no app,
        no login.
      </p>

      <div className="paper-card mt-4 flex items-start gap-2.5 p-4 text-sm">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-risk-normal" />
        <p className="text-paper-muted">
          Only the name, age, guardian contact, and anything you write in medical notes are stored — no photo, no address, no facial data. This is
          intentionally visible to whoever scans the code, since that's the whole point: fast reunification, not a private record.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="paper-card mt-4 space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-paper-muted">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              maxLength={100}
              placeholder="Who is wearing this band"
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
          <label className="text-sm text-paper-muted">
            Age
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Optional"
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-paper-muted">
            Your name (guardian)
            <input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              required
              maxLength={100}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
          <label className="text-sm text-paper-muted">
            Your phone number
            <input
              type="tel"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              required
              maxLength={20}
              placeholder="Whoever finds them will call this"
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
        </div>
        <label className="block text-sm text-paper-muted">
          Meeting point (optional)
          <select
            value={meetingPointZoneId}
            onChange={(e) => setMeetingPointZoneId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          >
            <option value="">No fixed meeting point</option>
            {zones.map((z) => (
              <option key={z.zone.id} value={z.zone.id}>
                {z.zone.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-paper-muted">
          Medical notes (optional)
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Allergies, conditions, medication — anything a helper should know immediately"
            className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
          />
        </label>
        {submitState === 'error' && <p className="text-sm text-risk-critical">{submitError}</p>}
        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="fast-transition rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitState === 'submitting' ? 'Creating…' : 'Create wristband'}
        </button>
      </form>
    </div>
  );
}
