import type {
  Announcement,
  DataSourceRecord,
  EventItem,
  Facility,
  Incident,
  IncidentStatus,
  InfrastructureAsset,
  LostFoundCase,
  ResponseTeam,
  ScenarioType,
  SimulationEvent,
  Toilet,
  Volunteer,
  Zone
} from './types';
import type { CreateIncidentInput, CreateLostFoundInput, DataProvider } from './provider';
import { lostFoundBackup } from './lostFoundBackup';
import {
  generateAnnouncements,
  generateDataSources,
  generateEvents,
  generateFacilities,
  generateIncidents,
  generateInfrastructure,
  generateLostFoundCases,
  generateResponseTeams,
  generateToilets,
  generateVolunteers,
  generateZones
} from './seed/generate';

interface DemoState {
  zones: Zone[];
  infrastructure: InfrastructureAsset[];
  toilets: Toilet[];
  incidents: Incident[];
  teams: ResponseTeam[];
  volunteers: Volunteer[];
  lostFound: LostFoundCase[];
  facilities: Facility[];
  events: EventItem[];
  announcements: Announcement[];
  dataSources: DataSourceRecord[];
  simulationEvents: SimulationEvent[];
}

// Module-level singleton so state persists across requests within one server
// process (Next.js dev/production server), giving the simulator something
// stateful to mutate. Resets on server restart, which is fine for a demo.
function buildInitialState(): DemoState {
  const zones = generateZones();
  const infrastructure = generateInfrastructure(zones);
  return {
    zones,
    infrastructure,
    toilets: generateToilets(zones),
    incidents: generateIncidents(zones),
    teams: generateResponseTeams(zones),
    volunteers: generateVolunteers(zones),
    lostFound: generateLostFoundCases(zones),
    facilities: generateFacilities(infrastructure),
    events: generateEvents(zones),
    announcements: generateAnnouncements(),
    dataSources: generateDataSources(),
    simulationEvents: []
  };
}

const globalForDemo = globalThis as unknown as { __kumbhosDemoState?: DemoState };
const state: DemoState = globalForDemo.__kumbhosDemoState ?? buildInitialState();
globalForDemo.__kumbhosDemoState = state;

function delay<T>(value: T, ms = 0): Promise<T> {
  return ms > 0 ? new Promise((resolve) => setTimeout(() => resolve(value), ms)) : Promise.resolve(value);
}

function recomputeGrowthRate(zone: Zone): Zone {
  return { ...zone, growthRatePerMin: Number((((zone.inflowPerMin - zone.outflowPerMin) / Math.max(zone.capacity, 1)) * 100).toFixed(3)) };
}

function scenarioSummary(type: ScenarioType, zone: Zone): string {
  const labels: Record<ScenarioType, string> = {
    CROWD_INFLUX: `Sudden crowd influx simulated in ${zone.name}: inflow sharply increased.`,
    CROWD_DECREASE: `Crowd dispersal simulated in ${zone.name}: outflow increased.`,
    BRIDGE_CLOSURE: `Bridge closure simulated near ${zone.name}: exit capacity reduced.`,
    ROAD_CLOSURE: `Road closure simulated near ${zone.name}: exit capacity reduced, movement conflict increased.`,
    GHAT_CLOSURE: `Ghat closure simulated in ${zone.name}: inflow redirected, exit capacity reduced.`,
    TRAIN_ARRIVAL: `Train arrival simulated: crowd influx toward ${zone.name} increased.`,
    PARKING_OVERFLOW: `Parking overflow simulated near ${zone.name}: movement conflict increased.`,
    TOILET_OVERLOAD: `Toilet cluster overload simulated in ${zone.name}.`,
    WATER_FAILURE: `Water point failure simulated in ${zone.name}.`,
    MEDICAL_EMERGENCY: `Medical emergency simulated in ${zone.name}.`,
    FIRE_INCIDENT: `Fire incident simulated in ${zone.name}.`,
    WEATHER_DISRUPTION: `Weather disruption simulated: movement speed reduced in ${zone.name}.`,
    EVENT_COMPLETION: `Event completion simulated near ${zone.name}: large outflow surge expected.`
  };
  return labels[type];
}

function applyScenarioToZone(zone: Zone, type: ScenarioType): Zone {
  const z = { ...zone };
  switch (type) {
    case 'CROWD_INFLUX':
    case 'TRAIN_ARRIVAL':
      z.inflowPerMin = Math.round(z.inflowPerMin * 2.2);
      break;
    case 'CROWD_DECREASE':
    case 'EVENT_COMPLETION':
      z.outflowPerMin = Math.round(z.outflowPerMin * 2.5);
      break;
    case 'BRIDGE_CLOSURE':
    case 'ROAD_CLOSURE':
    case 'GHAT_CLOSURE':
      z.exitCapacityFactor = Math.max(0.1, z.exitCapacityFactor * 0.35);
      z.directionConflict = Math.min(1, z.directionConflict + 0.25);
      break;
    case 'PARKING_OVERFLOW':
      z.directionConflict = Math.min(1, z.directionConflict + 0.3);
      break;
    case 'WEATHER_DISRUPTION':
      z.movementSpeedMps = Math.max(0.1, z.movementSpeedMps * 0.5);
      z.directionConflict = Math.min(1, z.directionConflict + 0.15);
      break;
    default:
      break;
  }
  z.currentPopulation = Math.max(0, Math.min(z.capacity, z.currentPopulation + (z.inflowPerMin - z.outflowPerMin) * 5));
  z.updatedAt = new Date().toISOString();
  return recomputeGrowthRate(z);
}

export class DemoDataProvider implements DataProvider {
  readonly source = 'SIMULATED' as const;

  async getZones() {
    return delay(state.zones);
  }
  async getZone(id: string) {
    return delay(state.zones.find((z) => z.id === id) ?? null);
  }

  async getInfrastructure() {
    return delay(state.infrastructure);
  }
  async getToilets() {
    return delay(state.toilets);
  }

  async getIncidents() {
    return delay(state.incidents);
  }
  async getIncident(id: string) {
    return delay(state.incidents.find((i) => i.id === id) ?? null);
  }
  async createIncident(input: CreateIncidentInput) {
    const zone = state.zones.find((z) => z.id === input.zoneId);
    const now = new Date().toISOString();
    const incident: Incident = {
      id: `incident-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      type: input.type,
      severity: input.severity,
      status: 'NEW',
      zoneId: input.zoneId,
      location: zone?.center ?? { lat: 25.4305, lng: 81.8809 },
      description: input.description,
      reportedAt: now,
      updatedAt: now,
      assignedTeamId: null,
      assignedVolunteerId: null,
      dataSource: 'SIMULATED'
    };
    state.incidents = [incident, ...state.incidents];
    return delay(incident);
  }
  async updateIncidentStatus(id: string, status: IncidentStatus) {
    const idx = state.incidents.findIndex((i) => i.id === id);
    if (idx === -1) return delay(null);
    const current = state.incidents[idx]!;
    const updated: Incident = { ...current, status, updatedAt: new Date().toISOString() };
    state.incidents = [...state.incidents.slice(0, idx), updated, ...state.incidents.slice(idx + 1)];
    return delay(updated);
  }
  async assignIncident(id: string, teamId: string | null, volunteerId: string | null) {
    const idx = state.incidents.findIndex((i) => i.id === id);
    if (idx === -1) return delay(null);
    const current = state.incidents[idx]!;
    const updated: Incident = {
      ...current,
      assignedTeamId: teamId ?? current.assignedTeamId,
      assignedVolunteerId: volunteerId ?? current.assignedVolunteerId,
      status: current.status === 'NEW' || current.status === 'ACKNOWLEDGED' ? 'DISPATCHED' : current.status,
      updatedAt: new Date().toISOString()
    };
    state.incidents = [...state.incidents.slice(0, idx), updated, ...state.incidents.slice(idx + 1)];
    return delay(updated);
  }

  async getResponseTeams() {
    return delay(state.teams);
  }
  async getVolunteers() {
    return delay(state.volunteers);
  }

  // Lost & Found is the one feature backed by real Supabase storage when
  // configured (src/lib/data/lostFoundBackup.ts) — every write and read
  // tries Supabase first and only falls back to the in-memory demo array
  // if Supabase isn't configured or a call fails, so a network hiccup
  // during a demo degrades gracefully instead of crashing the page.
  async getLostFoundCases() {
    const remote = await lostFoundBackup.list();
    if (remote) return remote;
    return delay(state.lostFound);
  }
  async createLostFoundCase(input: CreateLostFoundInput) {
    const remote = await lostFoundBackup.create(input);
    if (remote) return remote;
    const item: LostFoundCase = {
      id: `case-${Date.now()}`,
      type: input.type,
      status: 'OPEN',
      approximateZoneId: input.approximateZoneId,
      description: input.description,
      reportedAt: new Date().toISOString(),
      contactInfo: input.contactInfo,
      dataSource: 'USER_REPORTED'
    };
    state.lostFound = [item, ...state.lostFound];
    return delay(item);
  }
  async updateLostFoundStatus(id: string, status: LostFoundCase['status']) {
    if (lostFoundBackup.isConfigured()) {
      return lostFoundBackup.updateStatus(id, status);
    }
    const idx = state.lostFound.findIndex((c) => c.id === id);
    if (idx === -1) return delay(null);
    const updated: LostFoundCase = { ...state.lostFound[idx]!, status };
    state.lostFound = [...state.lostFound.slice(0, idx), updated, ...state.lostFound.slice(idx + 1)];
    return delay(updated);
  }

  async getFacilities() {
    return delay(state.facilities);
  }
  async getEvents() {
    return delay(state.events);
  }
  async getAnnouncements() {
    return delay(state.announcements);
  }

  async getDataSources() {
    return delay(state.dataSources);
  }

  async applyScenario(type: ScenarioType, zoneId: string) {
    const idx = state.zones.findIndex((z) => z.id === zoneId);
    if (idx === -1) throw new Error('Unknown zone');
    const zone = state.zones[idx]!;
    const updatedZone = applyScenarioToZone(zone, type);
    state.zones = [...state.zones.slice(0, idx), updatedZone, ...state.zones.slice(idx + 1)];

    if (type === 'MEDICAL_EMERGENCY' || type === 'FIRE_INCIDENT') {
      await this.createIncident({
        type: type === 'MEDICAL_EMERGENCY' ? 'MEDICAL' : 'FIRE',
        severity: 'HIGH',
        zoneId,
        description: `${type === 'MEDICAL_EMERGENCY' ? 'Medical emergency' : 'Fire incident'} triggered via Crowd Flow Simulator.`
      });
    }

    const event: SimulationEvent = {
      id: `sim-${Date.now()}`,
      type,
      zoneId,
      triggeredAt: new Date().toISOString(),
      summary: scenarioSummary(type, updatedZone)
    };
    state.simulationEvents = [event, ...state.simulationEvents].slice(0, 30);
    return delay(event);
  }

  async getRecentSimulationEvents() {
    return delay(state.simulationEvents);
  }
}
