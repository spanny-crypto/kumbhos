'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { ScenarioPanel } from '@/components/simulator/ScenarioPanel';
import type { CrowdPressure, Zone } from '@/lib/data/types';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

export default function SimulatorPage() {
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones');

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-ink-50">Crowd Flow Simulator</h1>
      <p className="mt-1 text-sm text-ink-400">
        Simulate an operational event and see the before/after crowd pressure change and recommended response.
      </p>
      <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry} variant="dark">
        <div className="mt-4">
          <ScenarioPanel zones={(zonesApi.data ?? []).map((z) => z.zone)} />
        </div>
      </AsyncState>
    </div>
  );
}
