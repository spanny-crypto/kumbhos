import { getDataProvider } from '@/lib/data';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { predictCrowdPressure } from '@/lib/risk/prediction';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireWriteAccess } from '@/lib/auth/rbac';
import type { ScenarioType } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

const VALID_SCENARIOS: ScenarioType[] = [
  'CROWD_INFLUX', 'CROWD_DECREASE', 'BRIDGE_CLOSURE', 'ROAD_CLOSURE', 'GHAT_CLOSURE', 'TRAIN_ARRIVAL',
  'PARKING_OVERFLOW', 'TOILET_OVERLOAD', 'WATER_FAILURE', 'MEDICAL_EMERGENCY', 'FIRE_INCIDENT',
  'WEATHER_DISRUPTION', 'EVENT_COMPLETION'
];

// Command-centre only: the Crowd Flow Simulator control panel. Mutates the
// demo dataset (or, in live mode, would log a simulation_events row) so the
// primary/secondary features visibly react — this is the "before/after"
// demo feature.
export async function POST(req: Request) {
  return withApiErrors(async () => {
    requireWriteAccess();
    const body = (await req.json().catch(() => null)) as { type?: string; zoneId?: string } | null;
    if (!body?.type || !body.zoneId || !VALID_SCENARIOS.includes(body.type as ScenarioType)) {
      return apiError('VALIDATION_ERROR', 'A valid scenario type and zoneId are required.');
    }

    const data = getDataProvider();
    const before = await data.getZone(body.zoneId);
    if (!before) return apiError('VALIDATION_ERROR', 'Unknown zone.');
    const beforePressure = computeCrowdPressure(before);

    const event = await data.applyScenario(body.type as ScenarioType, body.zoneId);

    const after = await data.getZone(body.zoneId);
    if (!after) return apiError('DATABASE_ERROR', 'Zone state could not be reloaded after the scenario.');
    const afterPressure = computeCrowdPressure(after);
    const afterPrediction = predictCrowdPressure(after);

    return apiSuccess({
      event,
      before: { zone: before, pressure: beforePressure },
      after: { zone: after, pressure: afterPressure, prediction: afterPrediction }
    });
  });
}

export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    return apiSuccess(await data.getRecentSimulationEvents());
  });
}
