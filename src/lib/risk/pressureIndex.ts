import type { CrowdPressure, RiskLevel, Zone } from '@/lib/data/types';

// PROTOTYPE RISK MODEL — a transparent, deterministic scoring function, not
// a calibrated or ML-trained model. Every factor is documented below so the
// score is explainable rather than a black box. Swap this module out for a
// real calibrated model once sensor/historical ground-truth data exists.

const WEIGHTS = {
  capacityUtilization: 0.35,
  density: 0.25,
  movementConflict: 0.2,
  growth: 0.15,
  exitAvailability: 0.05
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function levelFor(score: number): RiskLevel {
  if (score >= 76) return 'INTERVENTION';
  if (score >= 56) return 'CRITICAL';
  if (score >= 31) return 'BUILDING';
  return 'NORMAL';
}

export function computeCrowdPressure(zone: Zone): CrowdPressure {
  const capacityUtilization = clamp01(zone.currentPopulation / Math.max(zone.capacity, 1));
  // Density score treats the same utilization non-linearly — pressure ramps
  // faster as a zone approaches capacity rather than growing linearly.
  const densityScore = clamp01(capacityUtilization ** 1.6);
  const movementConflict = clamp01(zone.directionConflict);
  const netGrowth = zone.inflowPerMin - zone.outflowPerMin;
  const growthScore = clamp01(0.5 + netGrowth / Math.max(zone.capacity * 0.05, 1) / 2);
  const exitAvailability = clamp01(1 - zone.exitCapacityFactor);

  const raw =
    capacityUtilization * WEIGHTS.capacityUtilization +
    densityScore * WEIGHTS.density +
    movementConflict * WEIGHTS.movementConflict +
    growthScore * WEIGHTS.growth +
    exitAvailability * WEIGHTS.exitAvailability;

  const score = Math.round(clamp01(raw) * 100);
  const level = levelFor(score);

  const reasons: string[] = [];
  if (capacityUtilization > 0.7) {
    reasons.push(`capacity utilization is at ${Math.round(capacityUtilization * 100)}%`);
  }
  if (netGrowth > 0) {
    reasons.push(`inflow exceeds outflow by ${Math.round(netGrowth)}/min`);
  } else if (netGrowth < 0) {
    reasons.push(`outflow exceeds inflow by ${Math.round(-netGrowth)}/min`);
  }
  if (movementConflict > 0.5) {
    reasons.push('crossing pedestrian flows are elevated');
  }
  if (exitAvailability > 0.4) {
    reasons.push('available exit capacity is reduced');
  }
  const reason = reasons.length > 0 ? `Risk is ${level.toLowerCase()} because ${reasons.join(', and ')}.` : `Conditions in ${zone.name} are within normal range.`;

  return {
    zoneId: zone.id,
    score,
    level,
    reason,
    factors: { capacityUtilization, densityScore, movementConflict, growthScore, exitAvailability },
    computedAt: new Date().toISOString()
  };
}
