'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { formatDistance, nearest } from '@/lib/utils/geo';
import type { Facility, Zone } from '@/lib/data/types';

const CENTER = { lat: 25.4305, lng: 81.8809 };
const CATEGORIES: { category: Facility['category']; label: string }[] = [
  { category: 'MEDICAL', label: 'Nearest medical facility' },
  { category: 'POLICE', label: 'Nearest police post' },
  { category: 'FIRE', label: 'Nearest fire post' }
];

export default function EmergencyPage() {
  const facilitiesApi = useApi<Facility[]>('/api/facilities');
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">{t('pageEmergencyTitle')}</h1>
      <div className="mt-3 rounded-lg border border-risk-critical/30 bg-risk-critical/5 p-4 text-sm text-paper-text">
        <strong>This is a prototype.</strong> KumbhOS is not connected to real emergency services (police, ambulance, fire, 112).
        In a genuine emergency, contact local authorities directly. This page demonstrates how an operational
        emergency-response layer would surface information to the public.
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-paper-muted">Nearest facilities (from Sangam Nose)</h2>
      <AsyncState status={facilitiesApi.status} errorMessage={facilitiesApi.errorMessage} onRetry={facilitiesApi.retry}>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CATEGORIES.map(({ category, label }) => {
            const candidates = (facilitiesApi.data ?? []).filter((f) => f.category === category);
            const closest = nearest(CENTER, candidates, (f) => f.location);
            return (
              <div key={category} className="paper-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{label}</p>
                {closest ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-paper-text">{closest.item.name}</p>
                    <p className="mt-1 text-sm text-paper-muted">{formatDistance(closest.distanceMeters)} away</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-paper-muted">No facility data available.</p>
                )}
              </div>
            );
          })}
        </div>
      </AsyncState>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-paper-muted">How KumbhOS handles incidents</h2>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-paper-muted">
        <li>An incident is reported (by staff, volunteers, or sensors) with type, severity and location.</li>
        <li>The command centre reviews the automatically-generated dispatch recommendation.</li>
        <li>A human operator confirms dispatch — KumbhOS never auto-dispatches real responders.</li>
        <li>Status is tracked through Acknowledged → Dispatched → Responding → Resolved.</li>
      </ol>
    </div>
  );
}
