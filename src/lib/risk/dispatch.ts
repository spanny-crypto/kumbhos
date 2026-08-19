import type { DispatchRecommendation, Incident, InfrastructureAsset, ResponderRole, ResponseTeam, Volunteer } from '@/lib/data/types';
import { formatDistance, haversineMeters, nearest } from '@/lib/utils/geo';

const INCIDENT_TO_TEAM_ROLE: Record<Incident['type'], ResponderRole | null> = {
  MEDICAL: 'MEDICAL',
  FIRE: 'FIRE',
  MISSING_PERSON: 'POLICE',
  CROWD_SURGE: 'POLICE',
  ACCIDENT: 'MEDICAL',
  INFRASTRUCTURE_FAILURE: null,
  WATER_FLOOD: null,
  SECURITY: 'POLICE',
  OTHER: null
};

const INCIDENT_TO_FACILITY_CATEGORY: Record<Incident['type'], InfrastructureAsset['category'] | null> = {
  MEDICAL: 'MEDICAL',
  FIRE: 'FIRE',
  MISSING_PERSON: 'POLICE',
  CROWD_SURGE: 'POLICE',
  ACCIDENT: 'MEDICAL',
  INFRASTRUCTURE_FAILURE: null,
  WATER_FLOOD: 'WATER_POINT',
  SECURITY: 'POLICE',
  OTHER: null
};

export function recommendDispatch(
  incident: Incident,
  teams: ResponseTeam[],
  facilities: InfrastructureAsset[],
  volunteers: Volunteer[]
): DispatchRecommendation {
  const wantedRole = INCIDENT_TO_TEAM_ROLE[incident.type];
  const wantedFacilityCategory = INCIDENT_TO_FACILITY_CATEGORY[incident.type];

  const eligibleTeams = teams.filter((t) => t.available && (wantedRole === null || t.role === wantedRole));
  const nearestTeam = nearest(incident.location, eligibleTeams, (t) => t.location);

  const eligibleFacilities = wantedFacilityCategory ? facilities.filter((f) => f.category === wantedFacilityCategory) : [];
  const nearestFacility = nearest(incident.location, eligibleFacilities, (f) => f.location);

  const eligibleVolunteers = volunteers.filter((v) => v.available);
  const nearestVolunteer = nearest(incident.location, eligibleVolunteers, (v) => v.location);

  const parts: string[] = [];
  if (nearestTeam) {
    parts.push(`Dispatch ${nearestTeam.item.name} (${formatDistance(nearestTeam.distanceMeters)} away)`);
  }
  if (nearestVolunteer) {
    parts.push(`assign volunteer ${nearestVolunteer.item.name} for on-ground support`);
  }
  if (nearestFacility) {
    parts.push(`route to ${nearestFacility.item.name} (${formatDistance(nearestFacility.distanceMeters)})`);
  }
  const recommendationText =
    parts.length > 0
      ? `${parts.join(', ')}.`
      : 'No available responders match this incident type nearby — escalate to command centre for manual assignment.';

  return {
    incidentId: incident.id,
    team: nearestTeam
      ? { id: nearestTeam.item.id, name: nearestTeam.item.name, role: nearestTeam.item.role, distanceMeters: Math.round(nearestTeam.distanceMeters) }
      : null,
    facility: nearestFacility
      ? { id: nearestFacility.item.id, name: nearestFacility.item.name, category: nearestFacility.item.category, distanceMeters: Math.round(nearestFacility.distanceMeters) }
      : null,
    volunteer: nearestVolunteer
      ? { id: nearestVolunteer.item.id, name: nearestVolunteer.item.name, distanceMeters: Math.round(nearestVolunteer.distanceMeters) }
      : null,
    suggestedRouteNote:
      incident.severity === 'CRITICAL' || incident.severity === 'HIGH'
        ? 'Request pedestrian corridor clearance for responder access.'
        : 'Standard access route should be sufficient.',
    recommendationText,
    requiresHumanConfirmation: true
  };
}

export { haversineMeters };
