'use client';

import { useEffect, useMemo, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { useLocation } from '@/components/layout/LocationProvider';
import { formatDistance, nearest } from '@/lib/utils/geo';
import { NASHIK_LANDMARKS } from '@/lib/data/nashikLandmarks';
import { extractPoints, loadNashikLayer, type NashikPoint } from '@/components/map/nashikLayers';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

interface CategoryOption {
  id: string;
  file: string;
  labelKey: DictionaryKey;
  emoji: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'ghats', file: 'ghats.geojson', labelKey: 'catGhat', emoji: '🛕' },
  { id: 'hospitals', file: 'hospitals.geojson', labelKey: 'catMedicalFacility', emoji: '🏥' },
  { id: 'police-stations', file: 'police-stations.geojson', labelKey: 'catPolicePost', emoji: '🚓' },
  { id: 'fire-stations', file: 'fire-stations.geojson', labelKey: 'catFirePost', emoji: '🚒' },
  { id: 'public-toilets', file: 'public-toilets.geojson', labelKey: 'catToilet', emoji: '🚻' },
  { id: 'parking-zones', file: 'parking-zones.geojson', labelKey: 'catParking', emoji: '🅿️' },
  { id: 'vegetable-markets', file: 'vegetable-markets.geojson', labelKey: 'catMarket', emoji: '🥬' }
];

const WALK_SPEED_MPS = 1.1;
// Non-null: both arrays are non-empty literals declared above, but
// noUncheckedIndexedAccess can't see that across the module.
const DEFAULT_LANDMARK = NASHIK_LANDMARKS[0]!;
const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0]!;

export default function NavigationPage() {
  const { t } = useLanguage();
  const location = useLocation();

  const [landmarkId, setLandmarkId] = useState<string>(DEFAULT_LANDMARK.id);
  const [usingRealLocation, setUsingRealLocation] = useState(false);
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY.id);
  const [points, setPoints] = useState<NashikPoint[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');

  const category = CATEGORY_OPTIONS.find((c) => c.id === categoryId) ?? DEFAULT_CATEGORY;

  useEffect(() => {
    if (location.status === 'granted' && location.coords) {
      setUsingRealLocation(true);
    }
  }, [location.status, location.coords]);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    const layer = { id: category.id, file: category.file, label: category.id, emoji: category.emoji, color: '#000' };
    loadNashikLayer(layer)
      .then((geojson) => {
        if (cancelled) return;
        setPoints(extractPoints(geojson, category.id));
        setLoadState('idle');
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const fromPoint = useMemo(() => {
    if (usingRealLocation && location.coords) return { name: t('navYourLocation'), lat: location.coords.lat, lng: location.coords.lng };
    const landmark = NASHIK_LANDMARKS.find((l) => l.id === landmarkId) ?? DEFAULT_LANDMARK;
    return { name: landmark.name, lat: landmark.lat, lng: landmark.lng };
  }, [usingRealLocation, location.coords, landmarkId, t]);

  const nearestThree = useMemo(() => {
    if (points.length === 0) return [];
    const withDistance = points
      .map((p) => ({ point: p, distanceMeters: nearest(fromPoint, [p], (x) => x)!.distanceMeters }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 3);
    return withDistance.map((d) => ({ ...d, minutes: Math.max(1, Math.round(d.distanceMeters / WALK_SPEED_MPS / 60)) }));
  }, [points, fromPoint]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4">
        <h1 className="heading-serif text-3xl text-paper-text">{t('pageNavigationTitle')}</h1>
        <p className="text-sm text-paper-muted">{t('pageNavigationSubtitle')}</p>
      </div>

      <div className="paper-card mb-4 flex flex-wrap items-end gap-4 p-4">
        <label className="text-sm text-paper-muted">
          {t('navFromSector')}
          <select
            value={landmarkId}
            disabled={usingRealLocation}
            onChange={(e) => setLandmarkId(e.target.value)}
            className="mt-1 block rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text disabled:opacity-50"
          >
            {NASHIK_LANDMARKS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-paper-muted">
          {t('navLookingFor')}
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 block rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text">
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {t(c.labelKey)}
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
        {usingRealLocation && (
          <button onClick={() => setUsingRealLocation(false)} className="text-xs text-paper-faint underline">
            {t('navPickLandmarkInstead')}
          </button>
        )}
      </div>

      {(location.status === 'denied' || location.status === 'unavailable' || location.status === 'timeout' || location.status === 'insecure') && (
        <p className="-mt-2 mb-4 text-xs text-risk-critical">
          {location.status === 'denied' && t('navDeniedMsg')}
          {location.status === 'unavailable' && t('navUnavailableMsg')}
          {location.status === 'timeout' && t('navTimeoutMsg')}
          {location.status === 'insecure' && t('navInsecureMsg')}
        </p>
      )}

      <p className="mb-3 text-xs text-paper-faint">
        {t('navRealDataNote')} {t('navFromLabel')}: <strong>{fromPoint.name}</strong>
      </p>

      {loadState === 'loading' && <div className="paper-card p-5 text-sm text-paper-muted">{t('navLoadingData')}</div>}
      {loadState === 'error' && <div className="paper-card p-5 text-sm text-risk-critical">{t('navLoadError')}</div>}

      {loadState === 'idle' && nearestThree.length === 0 && <div className="paper-card p-5 text-sm text-paper-muted">{t('navNoFacilities')}</div>}

      {loadState === 'idle' && nearestThree.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {nearestThree.map((r, i) => (
            <div key={r.point.id} className="paper-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {i === 0 ? t('navNearest') : `#${i + 1}`}
              </p>
              <p className="mt-2 text-sm font-semibold text-paper-text">{r.point.name}</p>
              <p className="mt-1 text-sm text-paper-muted">
                {formatDistance(r.distanceMeters)} · ~{r.minutes} {t('navMinWalk')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
