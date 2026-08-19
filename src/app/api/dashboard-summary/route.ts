import { getDataProvider } from '@/lib/data';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { computeSanitationPressure } from '@/lib/risk/sanitationPressure';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import type { AssetStatus, InfrastructureAsset, Toilet } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

type Status = 'SAFE' | 'MODERATE' | 'CRITICAL';

function assetGroupStatus(assets: InfrastructureAsset[]): Status {
  if (assets.some((a) => a.status === 'OFFLINE' || a.status === 'CRITICAL')) return 'CRITICAL';
  if (assets.some((a) => a.status === 'DEGRADED')) return 'MODERATE';
  return 'SAFE';
}

function operationalCount(assets: InfrastructureAsset[]): number {
  return assets.filter((a) => a.status === 'OPERATIONAL').length;
}

// This is intentionally a separate, public, aggregates-only endpoint rather
// than reusing /api/incidents or /api/volunteers directly (those stay
// staff-only for the full record detail). Only counts and a coarse status
// are safe to show on the public dashboard — see docs/SECURITY.md.
export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const [zones, infrastructure, toiletsResult, incidents, volunteers, lostFound] = await Promise.all([
      data.getZones(),
      data.getInfrastructure(),
      data.getToilets(),
      data.getIncidents(),
      data.getVolunteers(),
      data.getLostFoundCases()
    ]);

    const pressures = zones.map((z) => computeCrowdPressure(z));
    const criticalZones = pressures.filter((p) => p.level === 'CRITICAL' || p.level === 'INTERVENTION').length;
    const buildingZones = pressures.filter((p) => p.level === 'BUILDING').length;
    const crowdStatus: Status = criticalZones > 0 ? 'CRITICAL' : buildingZones > 0 ? 'MODERATE' : 'SAFE';

    const byCategory = (cat: string | string[]) => {
      const cats = Array.isArray(cat) ? cat : [cat];
      return infrastructure.filter((a) => cats.includes(a.category));
    };
    const parking = byCategory('PARKING');
    const water = byCategory('WATER_POINT');
    const hospitals = byCategory('MEDICAL');
    const roadsBridges = byCategory(['ROAD', 'BRIDGE']);

    const byCluster = new Map<string, Toilet[]>();
    for (const t of toiletsResult) {
      const list = byCluster.get(t.clusterId) ?? [];
      list.push(t);
      byCluster.set(t.clusterId, list);
    }
    const sanitationPressures = Array.from(byCluster.entries()).map(([clusterId, list]) => computeSanitationPressure({ clusterId, toilets: list }));
    const sanitationStatus: Status = sanitationPressures.some((p) => p.pressure === 'CRITICAL')
      ? 'CRITICAL'
      : sanitationPressures.some((p) => p.pressure === 'HIGH' || p.pressure === 'WATCH')
        ? 'MODERATE'
        : 'SAFE';
    const availableToilets = toiletsResult.filter((t) => t.status === 'AVAILABLE').length;

    const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
    const criticalIncidents = activeIncidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
    const incidentStatus: Status = criticalIncidents > 0 ? 'CRITICAL' : activeIncidents.length > 0 ? 'MODERATE' : 'SAFE';

    const availableVolunteers = volunteers.filter((v) => v.available).length;
    const openLostFound = lostFound.filter((c) => c.status !== 'REUNITED' && c.status !== 'CLOSED').length;

    return apiSuccess({
      crowd: { status: crowdStatus, criticalZones, totalZones: zones.length },
      parking: { status: assetGroupStatus(parking), operational: operationalCount(parking), total: parking.length },
      water: { status: assetGroupStatus(water), operational: operationalCount(water), total: water.length },
      hospitals: { status: assetGroupStatus(hospitals), operational: operationalCount(hospitals), total: hospitals.length },
      roadsBridges: { status: assetGroupStatus(roadsBridges), operational: operationalCount(roadsBridges), total: roadsBridges.length },
      sanitation: { status: sanitationStatus, available: availableToilets, total: toiletsResult.length },
      incidents: { status: incidentStatus, active: activeIncidents.length, total: incidents.length },
      volunteers: { status: availableVolunteers > 0 ? 'SAFE' : 'MODERATE', available: availableVolunteers, total: volunteers.length },
      lostFound: { status: openLostFound > 3 ? 'MODERATE' : 'SAFE', open: openLostFound, total: lostFound.length }
    });
  });
}
