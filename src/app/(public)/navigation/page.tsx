'use client';

import { useEffect, useMemo, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { useLocation } from '@/components/layout/LocationProvider';
import { PressureBadge } from '@/components/crowd/PressureBadge';
import { formatDistance, nearest } from '@/lib/utils/geo';
import type { AssetCategory, CrowdPressure, Facility, Zone } from '@/lib/data/types';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

const CATEGORY_OPTIONS: { value: AssetCategory; labelKey: DictionaryKey }[] = [
  { value: 'MEDICAL', labelKey: 'catMedicalFacility' },
  { value: 'TOILET', labelKey: 'catToilet' },
  { value: 'WATER_POINT', labelKey: 'catWaterPoint' },
  { value: 'PARKING', labelKey: 'catParking' },
  { value: 'POLICE', labelKey: 'catPolicePost' },
  { value: 'FIRE', labelKey: 'catFirePost' },
  { value: 'GHAT', labelKey: 'catGhat' },
  { value: 'BRIDGE', labelKey: 'catBridge' }
];

const ROUTE_LABEL_KEYS: Record<'Fastest' | 'Safest' | 'Lowest Crowd', DictionaryKey> = {
  Fastest: 'routeFastest',
  Safest: 'routeSafest',
  'Lowest Crowd': 'routeLowestCrowd'
};

const WALK_SPEED_MPS = 1.1;

export default function NavigationPage() {
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones');
  const facilitiesApi = useApi<Facility[]>('/api/facilities');
  const [fromZoneId, setFromZoneId] = useState<string>('');
  const [category, setCategory] = useState<AssetCategory>('MEDICAL');
  const [usingRealLocation, setUsingRealLocation] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  const zones = zonesApi.data ?? [];
  const facilities = facilitiesApi.data ?? [];

  // Once the user grants real location access, snap "From" to whichever
  // zone is actually nearest to their real coordinates — ties the "Enable
  // live tracking" permission to something genuinely useful here, instead
  // of being a standalone toggle with no effect on the rest of the app.
  useEffect(() => {
    if (location.status === 'granted' && location.coords && zones.length > 0) {
      const closest = nearest(location.coords, zones, (z) => z.zone.center);
      if (closest) {
        setFromZoneId(closest.item.zone.id);
        setUsingRealLocation(true);
      }
    }
  }, [location.status, location.coords, zones]);

  const fromZone = zones.find((z) => z.zone.id === fromZoneId)?.zone ?? zones[0]?.zone;

  const options = useMemo(() => {
    if (!fromZone) return null;
    const candidates = facilities.filter((f) => f.category === category);
    if (candidates.length === 0) return null;

    const zoneById = new Map(zones.map((z) => [z.zone.id, z]));
    const withPressure = candidates.map((f) => ({ facility: f, pressure: zoneById.get(f.zoneId)?.pressure ?? null }));

    const withDistance = withPressure.map((c) => ({ ...c, distanceMeters: nearest(fromZone.center, [c], (x) => x.facility.location)!.distanceMeters }));

    const fastest = [...withDistance].sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
    const safeCandidates = withDistance.filter((c) => !c.pressure || (c.pressure.level !== 'CRITICAL' && c.pressure.level !== 'INTERVENTION'));
    const safest = [...(safeCandidates.length > 0 ? safeCandidates : withDistance)].sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
    const lowestCrowd = [...withDistance].sort((a, b) => (a.pressure?.score ?? 0) - (b.pressure?.score ?? 0))[0];

    const toRoute = (label: string, pick: typeof fastest) => {
      if (!pick) return null;
      const minutes = Math.max(1, Math.round(pick.distanceMeters / WALK_SPEED_MPS / 60));
      return { label, facility: pick.facility, pressure: pick.pressure, distanceMeters: pick.distanceMeters, minutes };
    };

    return [toRoute('Fastest', fastest), toRoute('Safest', safest), toRoute('Lowest Crowd', lowestCrowd)].filter(
      (r): r is NonNullable<typeof r> => r !== null
    );
  }, [fromZone, facilities, category, zones]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-serif text-3xl text-paper-text">{t('pageNavigationTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('pageNavigationSubtitle')}</p>
        </div>
        <DemoDataBadge />
      </div>

      <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry}>
        <div className="paper-card mb-4 flex flex-wrap items-end gap-4 p-4">
          <label className="text-sm text-paper-muted">
            {t('navFromSector')}
            <select
              value={fromZoneId || fromZone?.id || ''}
              onChange={(e) => {
                setFromZoneId(e.target.value);
                setUsingRealLocation(false);
              }}
              className="mt-1 block rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            >
              {zones.map((z) => (
                <option key={z.zone.id} value={z.zone.id}>
                  {z.zone.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-paper-muted">
            {t('navLookingFor')}
            <select value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)} className="mt-1 block rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text">
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {t(c.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={location.request}
            title={t('navUseLocationTitle')}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              usingRealLocation ? 'border-risk-normal/40 bg-risk-normal/10 text-risk-normal' : 'border-paper-border text-paper-muted hover:bg-paper-bg'
            }`}
          >
            <LocateFixed size={13} />
            {location.status === 'requesting' ? t('navLocating') : usingRealLocation ? t('navUsingLocation') : t('navUseMyLocation')}
          </button>
        </div>
        {(location.status === 'denied' || location.status === 'unavailable' || location.status === 'timeout' || location.status === 'insecure') && (
          <p className="-mt-2 mb-4 text-xs text-risk-critical">
            {location.status === 'denied' && t('navDeniedMsg')}
            {location.status === 'unavailable' && t('navUnavailableMsg')}
            {location.status === 'timeout' && t('navTimeoutMsg')}
            {location.status === 'insecure' && t('navInsecureMsg')}
            {location.errorDetail && (
              <span className="block text-paper-faint">
                {t('sosBrowserSaid')}: "{location.errorDetail}"
              </span>
            )}
          </p>
        )}

        {!options ? (
          <div className="paper-card p-5 text-sm text-paper-muted">{t('navNoFacilities')}</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {options.map((route) => (
              <div key={route.label} className="paper-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {t(ROUTE_LABEL_KEYS[route.label as keyof typeof ROUTE_LABEL_KEYS])}
                </p>
                <p className="mt-2 text-sm font-semibold text-paper-text">{route.facility.name}</p>
                <p className="mt-1 text-sm text-paper-muted">
                  {formatDistance(route.distanceMeters)} · ~{route.minutes} {t('navMinWalk')}
                </p>
                {route.pressure && (
                  <div className="mt-2">
                    <PressureBadge pressure={route.pressure} showScore={false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AsyncState>
    </div>
  );
}
