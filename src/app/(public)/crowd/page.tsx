'use client';

import { Navigation } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { PressureBadge } from '@/components/crowd/PressureBadge';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { CrowdPressure, Zone } from '@/lib/data/types';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default function CrowdPage() {
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones', { pollMs: 20000 });
  const { t } = useLanguage();

  const sorted = [...(zonesApi.data ?? [])].sort((a, b) => b.pressure.score - a.pressure.score);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-serif text-3xl text-paper-text">{t('pageCrowdTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('pageCrowdSubtitle')}</p>
        </div>
        <DemoDataBadge />
      </div>

      <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry} emptyMessage="No zones to display.">
        <div className="space-y-2">
          {sorted.map(({ zone, pressure }) => (
            <a
              key={zone.id}
              href={directionsUrl(zone.center.lat, zone.center.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="paper-card fast-transition flex items-center justify-between gap-3 p-4 hover:bg-paper-bg"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-paper-text">{zone.name}</p>
                <p className="mt-0.5 text-xs text-paper-muted">{pressure.reason}</p>
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand-600">
                  <Navigation size={12} /> {t('crowdGetDirections')}
                </p>
              </div>
              <PressureBadge pressure={pressure} />
            </a>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
