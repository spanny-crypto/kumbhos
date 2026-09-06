'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { CrowdMap } from '@/components/map/CrowdMap';
import { NashikInfraMap } from '@/components/map/NashikInfraMap';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { RISK_META } from '@/lib/utils/format';
import type { CrowdPressure, Facility, RiskLevel, Zone } from '@/lib/data/types';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

const LEVELS: RiskLevel[] = ['NORMAL', 'BUILDING', 'CRITICAL', 'INTERVENTION'];
const LEVEL_KEY: Record<RiskLevel, DictionaryKey> = {
  NORMAL: 'riskNormal',
  BUILDING: 'riskBuilding',
  CRITICAL: 'riskCritical',
  INTERVENTION: 'riskIntervention'
};

export default function LiveMapPage() {
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones', { pollMs: 20000 });
  const facilitiesApi = useApi<Facility[]>('/api/facilities');
  const { t } = useLanguage();
  const [view, setView] = useState<'crowd' | 'infrastructure'>('crowd');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-serif text-3xl text-paper-text">{t('pageLiveMapTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('pageLiveMapSubtitle')}</p>
        </div>
        <DemoDataBadge />
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView('crowd')}
          className={`fast-transition rounded-full border px-3.5 py-1.5 text-sm font-medium ${
            view === 'crowd' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'
          }`}
        >
          👥 {t('mapViewCrowd')}
        </button>
        <button
          onClick={() => setView('infrastructure')}
          className={`fast-transition rounded-full border px-3.5 py-1.5 text-sm font-medium ${
            view === 'infrastructure' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'
          }`}
        >
          🛕 {t('mapViewInfra')}
        </button>
      </div>

      <div className={`mb-4 flex-wrap gap-3 ${view === 'crowd' ? 'flex' : 'hidden'}`}>
        {LEVELS.map((level) => (
          <span key={level} className={`badge border ${RISK_META[level].bg} ${RISK_META[level].color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${RISK_META[level].dot}`} />
            {t(LEVEL_KEY[level])}
          </span>
        ))}
      </div>

      {view === 'infrastructure' ? (
        <NashikInfraMap />
      ) : (
        <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry} emptyMessage="No zones to display.">
          <div className="h-[70vh] overflow-hidden rounded-lg border border-paper-border">
            <CrowdMap zones={zonesApi.data ?? []} facilities={facilitiesApi.data ?? []} />
          </div>
        </AsyncState>
      )}
    </div>
  );
}
