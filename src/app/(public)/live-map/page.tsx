'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { CrowdMap } from '@/components/map/CrowdMap';
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-serif text-3xl text-paper-text">{t('pageLiveMapTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('pageLiveMapSubtitle')}</p>
        </div>
        <DemoDataBadge />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {LEVELS.map((level) => (
          <span key={level} className={`badge border ${RISK_META[level].bg} ${RISK_META[level].color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${RISK_META[level].dot}`} />
            {t(LEVEL_KEY[level])}
          </span>
        ))}
      </div>

      <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry} emptyMessage="No zones to display.">
        <div className="h-[70vh] overflow-hidden rounded-lg border border-paper-border">
          <CrowdMap zones={zonesApi.data ?? []} facilities={facilitiesApi.data ?? []} />
        </div>
      </AsyncState>
    </div>
  );
}
