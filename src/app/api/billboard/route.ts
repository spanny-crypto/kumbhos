import { getDataProvider } from '@/lib/data';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { predictCrowdPressure } from '@/lib/risk/prediction';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import type { IncidentSeverity, RiskLevel } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

export type BillboardSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface BillboardEntry {
  id: string;
  severity: BillboardSeverity;
  category: 'CROWD' | 'INCIDENT' | 'SIMULATION';
  zoneName: string;
  headline: string;
  detail: string;
  timestamp: string;
}

const ZONE_LEVEL_SEVERITY: Record<RiskLevel, BillboardSeverity | null> = {
  NORMAL: null,
  BUILDING: 'WATCH',
  CRITICAL: 'WARNING',
  INTERVENTION: 'CRITICAL'
};

const INCIDENT_SEVERITY: Record<IncidentSeverity, BillboardSeverity | null> = {
  LOW: null,
  MODERATE: 'WATCH',
  HIGH: 'WARNING',
  CRITICAL: 'CRITICAL'
};

const SEVERITY_RANK: Record<BillboardSeverity, number> = { CRITICAL: 3, WARNING: 2, WATCH: 1, INFO: 0 };

// Public, read-only aggregation feed for the Live Billboard: every zone
// currently under elevated crowd pressure (with its prediction-derived
// recommended action), every active high-severity incident, and recent
// Crowd Flow Simulator events — merged into one time-ordered list of
// "situations requiring attention" for the Bloomberg-terminal-style ticker.
export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const [zones, incidents, simEvents] = await Promise.all([data.getZones(), data.getIncidents(), data.getRecentSimulationEvents()]);

    const zoneNameById = new Map(zones.map((z) => [z.id, z.name]));
    const entries: BillboardEntry[] = [];

    for (const zone of zones) {
      const pressure = computeCrowdPressure(zone);
      const severity = ZONE_LEVEL_SEVERITY[pressure.level];
      if (!severity) continue;
      const prediction = predictCrowdPressure(zone);
      entries.push({
        id: `zone-${zone.id}`,
        severity,
        category: 'CROWD',
        zoneName: zone.name,
        headline: `${zone.name.toUpperCase()} — ${pressure.level} — SCORE ${pressure.score}`,
        detail: prediction.recommendation,
        timestamp: pressure.computedAt
      });
    }

    for (const incident of incidents) {
      if (incident.status === 'RESOLVED') continue;
      const severity = INCIDENT_SEVERITY[incident.severity];
      if (!severity) continue;
      const zoneName = zoneNameById.get(incident.zoneId) ?? incident.zoneId;
      entries.push({
        id: `incident-${incident.id}`,
        severity,
        category: 'INCIDENT',
        zoneName,
        headline: `${zoneName.toUpperCase()} — ${incident.type.replace('_', ' ')} — ${incident.severity}`,
        detail: incident.description,
        timestamp: incident.updatedAt
      });
    }

    for (const event of simEvents.slice(0, 10)) {
      const zoneName = zoneNameById.get(event.zoneId) ?? event.zoneId;
      entries.push({
        id: `sim-${event.id}`,
        severity: 'INFO',
        category: 'SIMULATION',
        zoneName,
        headline: `${zoneName.toUpperCase()} — SCENARIO: ${event.type.replace('_', ' ')}`,
        detail: event.summary,
        timestamp: event.triggeredAt
      });
    }

    entries.sort((a, b) => {
      const rankDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return apiSuccess(entries.slice(0, 40));
  });
}
