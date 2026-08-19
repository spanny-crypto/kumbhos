'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { PressureBadge } from '@/components/crowd/PressureBadge';
import { PredictionCard } from '@/components/crowd/PredictionCard';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { CrowdPrediction, CrowdPressure, Zone } from '@/lib/data/types';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

function ZonePredictionPanel({ zoneId }: { zoneId: string }) {
  const api = useApi<{ zone: Zone; pressure: CrowdPressure; prediction: CrowdPrediction }>(`/api/zones/${zoneId}/predict`);
  return (
    <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} loadingLabel="Computing prediction…">
      {api.data && <PredictionCard prediction={api.data.prediction} />}
    </AsyncState>
  );
}

export default function CrowdPage() {
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones', { pollMs: 20000 });
  const [expanded, setExpanded] = useState<string | null>(null);
  const { t } = useLanguage();

  const sorted = [...(zonesApi.data ?? [])].sort((a, b) => b.pressure.score - a.pressure.score);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-paper-text">{t('pageCrowdTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('pageCrowdSubtitle')}</p>
        </div>
        <DemoDataBadge />
      </div>

      <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry} emptyMessage="No zones to display.">
        <div className="space-y-2">
          {sorted.map(({ zone, pressure }) => (
            <div key={zone.id} className="paper-card p-4">
              <button className="flex w-full items-center justify-between text-left" onClick={() => setExpanded(expanded === zone.id ? null : zone.id)}>
                <div>
                  <p className="text-sm font-semibold text-paper-text">{zone.name}</p>
                  <p className="mt-0.5 text-xs text-paper-muted">{pressure.reason}</p>
                </div>
                <PressureBadge pressure={pressure} />
              </button>
              {expanded === zone.id && (
                <div className="mt-3 border-t border-paper-border pt-3">
                  <ZonePredictionPanel zoneId={zone.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
