'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { CrowdMap } from '@/components/map/CrowdMap';
import type { CrowdPressure, Facility, Incident, Zone } from '@/lib/data/types';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

export default function CommandMapPage() {
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones', { pollMs: 15000 });
  const facilitiesApi = useApi<Facility[]>('/api/facilities');
  const incidentsApi = useApi<Incident[]>('/api/incidents', { pollMs: 15000 });

  return (
    <div className="flex h-screen flex-col p-6">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-ink-50">Operations Map</h1>
        <p className="text-sm text-ink-400">All layers: crowd zones, facilities, and active incidents.</p>
      </div>
      <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry} variant="dark">
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-ink-700">
          <CrowdMap zones={zonesApi.data ?? []} facilities={facilitiesApi.data ?? []} incidents={incidentsApi.data ?? []} />
        </div>
      </AsyncState>
    </div>
  );
}
