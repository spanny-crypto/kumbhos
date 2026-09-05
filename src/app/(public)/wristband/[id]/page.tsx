'use client';

import Link from 'next/link';
import { Phone, MapPin, AlertTriangle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useParams } from 'next/navigation';
import { AsyncState } from '@/components/common/AsyncState';
import type { WristbandProfile, Zone } from '@/lib/data/types';

// This is the page the QR code actually points to. Whoever found the person
// wearing the band lands here — no login, no app, big tap-to-call button.
export default function WristbandScanPage() {
  const params = useParams<{ id: string }>();
  const profileApi = useApi<WristbandProfile>(`/api/wristbands/${params.id}`);
  const zonesApi = useApi<{ zone: Zone }[]>('/api/zones');

  const zoneName = zonesApi.data?.find((z) => z.zone.id === profileApi.data?.meetingPointZoneId)?.zone.name ?? null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <AsyncState
        status={profileApi.status}
        errorMessage={profileApi.errorMessage ?? 'No wristband found with that code — it may have expired or been mistyped.'}
        onRetry={profileApi.retry}
      >
        {profileApi.data && (
          <div className="paper-card p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-risk-intervention">Found this person?</p>
            <p className="heading-serif mt-2 text-3xl text-paper-text">{profileApi.data.fullName}</p>
            {profileApi.data.age !== null && <p className="text-sm text-paper-muted">Age {profileApi.data.age}</p>}

            {profileApi.data.status !== 'ACTIVE' && (
              <p className="mt-3 rounded-lg bg-risk-building/10 p-2 text-xs font-semibold text-risk-building">
                This wristband is marked {profileApi.data.status.toLowerCase()} — the guardian below may no longer be nearby, but the number still works.
              </p>
            )}

            <a
              href={`tel:${profileApi.data.guardianPhone.replace(/\s/g, '')}`}
              className="fast-transition mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-risk-intervention py-4 text-lg font-bold text-white hover:opacity-90"
            >
              <Phone size={20} /> Call {profileApi.data.guardianName}
            </a>
            <p className="mt-2 text-xl font-black tracking-wide text-paper-text">{profileApi.data.guardianPhone}</p>

            {zoneName && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-paper-muted">
                <MapPin size={14} /> Meeting point: {zoneName}
              </p>
            )}
            {profileApi.data.medicalNotes && (
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-risk-intervention/10 p-2.5 text-sm font-semibold text-risk-intervention">
                <AlertTriangle size={15} className="shrink-0" /> {profileApi.data.medicalNotes}
              </p>
            )}
          </div>
        )}
      </AsyncState>

      <p className="mt-4 text-center text-xs text-paper-faint">
        Can&apos;t reach the guardian? Take them to the nearest volunteer or Command Centre post, or{' '}
        <Link href="/lost-found" className="underline hover:text-paper-muted">
          file a Lost &amp; Found report
        </Link>
        .
      </p>
    </div>
  );
}
