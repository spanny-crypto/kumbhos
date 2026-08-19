import type { SanitationPressure, Toilet } from '@/lib/data/types';

// PROTOTYPE PREDICTION for a toilet cluster's service pressure, based on
// estimated usage rate, capacity, and time since last cleaning.

const SERVICE_CAPACITY_USES = 40; // estimated uses before a cluster needs servicing

export function computeSanitationPressure(cluster: { clusterId: string; toilets: Toilet[] }): SanitationPressure {
  const { clusterId, toilets } = cluster;
  const clusterName = toilets[0]?.clusterName ?? clusterId;
  const totalUsagePerHour = toilets.reduce((sum, t) => sum + t.estimatedUsagePerHour, 0);
  const complaints = toilets.reduce((sum, t) => sum + t.complaints, 0);

  const oldestCleanMinutesAgo = Math.max(
    ...toilets.map((t) => (Date.now() - new Date(t.lastCleanedAt).getTime()) / 60000),
    0
  );

  const usesSoFar = (totalUsagePerHour / 60) * oldestCleanMinutesAgo;
  const capacityWithComplaintPenalty = SERVICE_CAPACITY_USES * toilets.length - complaints * 3;
  const remainingUses = Math.max(0, capacityWithComplaintPenalty - usesSoFar);
  const usesPerMinute = totalUsagePerHour / 60;

  const minutesToServiceThreshold = usesPerMinute > 0 ? Math.round(remainingUses / usesPerMinute) : null;

  let pressure: SanitationPressure['pressure'];
  if (minutesToServiceThreshold === null) pressure = 'NORMAL';
  else if (minutesToServiceThreshold <= 15) pressure = 'CRITICAL';
  else if (minutesToServiceThreshold <= 40) pressure = 'HIGH';
  else if (minutesToServiceThreshold <= 90) pressure = 'WATCH';
  else pressure = 'NORMAL';

  const recommendation =
    pressure === 'CRITICAL' || pressure === 'HIGH'
      ? `Dispatch a sanitation team to ${clusterName} now — projected to exceed service threshold in ${minutesToServiceThreshold} minutes.`
      : `${clusterName} is within normal service capacity.`;

  return {
    clusterId,
    clusterName,
    pressure,
    minutesToServiceThreshold,
    recommendation,
    computedAt: new Date().toISOString()
  };
}
