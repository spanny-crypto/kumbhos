import type { CrowdPrediction, Zone } from '@/lib/data/types';
import { computeCrowdPressure } from './pressureIndex';

// PROTOTYPE PREDICTION — a deterministic short-horizon trend projection,
// not a trained forecasting model. It linearly extrapolates the zone's
// current net growth rate to estimate when capacity utilization will cross
// the CRITICAL threshold (score 56) and the INTERVENTION threshold (76).
// Documented as a placeholder that a real ML model can later replace,
// per the architecture spec's "no fake machine learning" rule.

const CRITICAL_THRESHOLD = 56;
const INTERVENTION_THRESHOLD = 76;

export function predictCrowdPressure(zone: Zone): CrowdPrediction {
  const current = computeCrowdPressure(zone);
  const netGrowthPerMin = zone.inflowPerMin - zone.outflowPerMin;

  // Approximate how many pressure-score points accrue per minute of net
  // growth by comparing the current score against a hypothetically-emptier
  // zone. This keeps the projection tied to the same transparent formula
  // used for the live score rather than a separate unexplained curve.
  const populationIn15 = Math.max(0, zone.currentPopulation + netGrowthPerMin * 15);
  const projectedZone: Zone = { ...zone, currentPopulation: populationIn15 };
  const projected = computeCrowdPressure(projectedZone);

  const scorePerMin = netGrowthPerMin === 0 ? 0 : (projected.score - current.score) / 15;

  let minutesToCriticalThreshold: number | null = null;
  if (scorePerMin > 0.05) {
    const targetThreshold = current.score >= CRITICAL_THRESHOLD ? INTERVENTION_THRESHOLD : CRITICAL_THRESHOLD;
    if (current.score < targetThreshold) {
      minutesToCriticalThreshold = Math.max(1, Math.round((targetThreshold - current.score) / scorePerMin));
    }
  }

  const probabilityOfCritical = Math.max(0, Math.min(1, current.score / 100 + (scorePerMin > 0 ? 0.15 : -0.05)));

  let recommendation: string;
  if (minutesToCriticalThreshold !== null && minutesToCriticalThreshold <= 15) {
    recommendation = `Redirect incoming pedestrian flow away from ${zone.name}, open an alternate route, and pre-position volunteers before the ${minutesToCriticalThreshold}-minute window closes.`;
  } else if (current.level === 'CRITICAL' || current.level === 'INTERVENTION') {
    recommendation = `Maintain active crowd control in ${zone.name} and monitor for further growth.`;
  } else if (scorePerMin < -0.05) {
    recommendation = `Pressure in ${zone.name} is easing; no intervention needed.`;
  } else {
    recommendation = `No intervention needed in ${zone.name} at this time.`;
  }

  return {
    zoneId: zone.id,
    projectedScoreIn15Min: projected.score,
    probabilityOfCritical,
    minutesToCriticalThreshold,
    recommendation,
    computedAt: new Date().toISOString()
  };
}
