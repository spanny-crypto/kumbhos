'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { formatDistance, nearest } from '@/lib/utils/geo';
import type { Facility, Zone } from '@/lib/data/types';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

const CENTER = { lat: 25.4305, lng: 81.8809 };
const CATEGORIES: { category: Facility['category']; labelKey: DictionaryKey }[] = [
  { category: 'MEDICAL', labelKey: 'emgNearestMedical' },
  { category: 'POLICE', labelKey: 'emgNearestPolice' },
  { category: 'FIRE', labelKey: 'emgNearestFire' }
];

export default function EmergencyPage() {
  const facilitiesApi = useApi<Facility[]>('/api/facilities');
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">{t('pageEmergencyTitle')}</h1>
      <div className="mt-3 rounded-lg border border-risk-critical/30 bg-risk-critical/5 p-4 text-sm text-paper-text">
        <strong>{t('emgPrototypeStrong')}</strong> {t('emgPrototypeBody')}
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-paper-muted">{t('emgNearestFacilities')}</h2>
      <AsyncState status={facilitiesApi.status} errorMessage={facilitiesApi.errorMessage} onRetry={facilitiesApi.retry}>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CATEGORIES.map(({ category, labelKey }) => {
            const candidates = (facilitiesApi.data ?? []).filter((f) => f.category === category);
            const closest = nearest(CENTER, candidates, (f) => f.location);
            return (
              <div key={category} className="paper-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{t(labelKey)}</p>
                {closest ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-paper-text">{closest.item.name}</p>
                    <p className="mt-1 text-sm text-paper-muted">
                      {formatDistance(closest.distanceMeters)} {t('emgAway')}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-paper-muted">{t('emgNoFacilityData')}</p>
                )}
              </div>
            );
          })}
        </div>
      </AsyncState>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-paper-muted">{t('emgHowHandled')}</h2>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-paper-muted">
        <li>{t('emgStep1')}</li>
        <li>{t('emgStep2')}</li>
        <li>{t('emgStep3')}</li>
        <li>{t('emgStep4')}</li>
      </ol>
    </div>
  );
}
