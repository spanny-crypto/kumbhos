'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import type { CrowdPressure, Incident, InfrastructureAsset, Toilet, Volunteer, Zone } from '@/lib/data/types';
import { computeSanitationPressure } from '@/lib/risk/sanitationPressure';

interface ZoneWithPressure {
  zone: Zone;
  pressure: CrowdPressure;
}

interface HealthResponse {
  mode: 'DEMO' | 'LIVE';
  dependencies: Record<string, string>;
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone?: 'normal' | 'warning' | 'critical' }) {
  const toneClass = tone === 'critical' ? 'text-risk-critical' : tone === 'warning' ? 'text-risk-building' : 'text-ink-50';
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function CommandDashboard() {
  const zonesApi = useApi<ZoneWithPressure[]>('/api/zones', { pollMs: 15000 });
  const incidentsApi = useApi<Incident[]>('/api/incidents', { pollMs: 15000 });
  const infraApi = useApi<InfrastructureAsset[]>('/api/infrastructure');
  const toiletsApi = useApi<{ toilets: Toilet[] }>('/api/toilets');
  const volunteersApi = useApi<Volunteer[]>('/api/volunteers');
  const healthApi = useApi<HealthResponse>('/api/health');

  const zones = zonesApi.data ?? [];
  const criticalZones = zones.filter((z) => z.pressure.level === 'CRITICAL' || z.pressure.level === 'INTERVENTION').length;
  const avgScore = zones.length > 0 ? Math.round(zones.reduce((s, z) => s + z.pressure.score, 0) / zones.length) : 0;

  const activeIncidents = (incidentsApi.data ?? []).filter((i) => i.status !== 'RESOLVED').length;
  const infraFailures = (infraApi.data ?? []).filter((a) => a.status === 'CRITICAL' || a.status === 'OFFLINE').length;
  const availableVolunteers = (volunteersApi.data ?? []).filter((v) => v.available).length;

  const toiletsByCluster = new Map<string, Toilet[]>();
  for (const t of toiletsApi.data?.toilets ?? []) {
    const list = toiletsByCluster.get(t.clusterId) ?? [];
    list.push(t);
    toiletsByCluster.set(t.clusterId, list);
  }
  const sanitationAlerts = Array.from(toiletsByCluster.entries())
    .map(([clusterId, list]) => computeSanitationPressure({ clusterId, toilets: list }))
    .filter((p) => p.pressure === 'HIGH' || p.pressure === 'CRITICAL').length;

  const parkingIssues = (infraApi.data ?? []).filter((a) => a.category === 'PARKING' && (a.status === 'CRITICAL' || a.status === 'OFFLINE')).length;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-ink-50">Command Centre Dashboard</h1>
      <p className="mt-1 text-sm text-ink-400">Operational overview across all sectors.</p>

      <AsyncState status={zonesApi.status} errorMessage={zonesApi.errorMessage} onRetry={zonesApi.retry} variant="dark">
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Avg. Crowd Pressure" value={avgScore} tone={avgScore >= 56 ? 'critical' : avgScore >= 31 ? 'warning' : 'normal'} />
          <MetricCard label="Critical Zones" value={criticalZones} tone={criticalZones > 0 ? 'critical' : 'normal'} />
          <MetricCard label="Active Incidents" value={activeIncidents} tone={activeIncidents > 0 ? 'warning' : 'normal'} />
          <MetricCard label="Infrastructure Failures" value={infraFailures} tone={infraFailures > 0 ? 'critical' : 'normal'} />
          <MetricCard label="Sanitation Alerts" value={sanitationAlerts} tone={sanitationAlerts > 0 ? 'warning' : 'normal'} />
          <MetricCard label="Available Volunteers" value={availableVolunteers} />
          <MetricCard label="Parking Pressure Points" value={parkingIssues} tone={parkingIssues > 0 ? 'warning' : 'normal'} />
          <MetricCard
            label="System Health"
            value={healthApi.data ? healthApi.data.mode : '—'}
            tone={healthApi.data?.mode === 'DEMO' ? 'warning' : 'normal'}
          />
        </div>
      </AsyncState>
    </div>
  );
}
