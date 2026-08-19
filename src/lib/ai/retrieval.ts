import type { DataProvider } from '@/lib/data/provider';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { nearest, formatDistance } from '@/lib/utils/geo';
import type { GeoPoint } from '@/lib/data/types';

export interface RetrievalResult {
  contextText: string;
  matchedTopics: string[];
}

const KEYWORDS = {
  toilet: ['toilet', 'washroom', 'restroom', 'sanitation', 'bathroom'],
  medical: ['medical', 'doctor', 'ambulance', 'hospital', 'injur', 'sick', 'health'],
  crowd: ['crowd', 'density', 'busy', 'congestion', 'risk', 'pressure'],
  route: ['route', 'way', 'direction', 'walk', 'path', 'navigate', 'go to'],
  bridge: ['bridge', 'closed', 'closure', 'avoid'],
  missing: ['missing', 'lost', 'child', 'grandmother', 'grandfather', 'separated'],
  emergency: ['emergency', 'sos', 'help', 'danger', 'fire', 'police'],
  event: ['event', 'schedule', 'aarti', 'procession', 'timing']
} as const;

function matches(question: string, words: readonly string[]): boolean {
  const q = question.toLowerCase();
  return words.some((w) => q.includes(w));
}

/**
 * Very lightweight intent detection + retrieval over our own structured
 * data. This intentionally avoids embeddings/vector search (out of scope
 * for tonight, documented as a future module) but still guarantees the AI
 * (or the fallback provider) only ever sees real application data, never
 * open-ended free recall.
 */
export async function retrieveContext(question: string, data: DataProvider, near?: GeoPoint): Promise<RetrievalResult> {
  const topics: string[] = [];
  const lines: string[] = [];
  const origin = near ?? { lat: 25.4305, lng: 81.8809 };

  if (matches(question, KEYWORDS.toilet)) {
    topics.push('toilet');
    const toilets = await data.getToilets();
    const available = toilets.filter((t) => t.status === 'AVAILABLE');
    const closest = nearest(origin, available.length > 0 ? available : toilets, (t) => t.location);
    if (closest) {
      lines.push(
        `Nearest toilet cluster: ${closest.item.clusterName}, status ${closest.item.status}, ${formatDistance(closest.distanceMeters)} away, accessible: ${closest.item.accessible ? 'yes' : 'no'}.`
      );
    }
  }

  if (matches(question, KEYWORDS.medical) || matches(question, KEYWORDS.emergency)) {
    topics.push('medical');
    const infra = await data.getInfrastructure();
    const medical = infra.filter((a) => a.category === 'MEDICAL' && a.status !== 'OFFLINE');
    const closest = nearest(origin, medical, (a) => a.location);
    if (closest) {
      lines.push(`Nearest medical facility: ${closest.item.name}, status ${closest.item.status}, ${formatDistance(closest.distanceMeters)} away.`);
    }
    const teams = await data.getResponseTeams();
    const medTeam = teams.find((t) => t.role === 'MEDICAL' && t.available);
    if (medTeam) lines.push(`Available medical response team: ${medTeam.name}.`);
  }

  if (matches(question, KEYWORDS.crowd) || matches(question, KEYWORDS.bridge)) {
    topics.push('crowd');
    const zones = await data.getZones();
    const scored = zones.map((z) => ({ z, p: computeCrowdPressure(z) })).sort((a, b) => a.p.score - b.p.score);
    const calmest = scored[0];
    const busiest = scored[scored.length - 1];
    if (calmest) lines.push(`Lowest crowd pressure right now: ${calmest.z.name} (score ${calmest.p.score}, ${calmest.p.level}).`);
    if (busiest) lines.push(`Highest crowd pressure right now: ${busiest.z.name} (score ${busiest.p.score}, ${busiest.p.level}). ${busiest.p.reason}`);
  }

  if (matches(question, KEYWORDS.route)) {
    topics.push('route');
    lines.push('Route guidance: prefer zones with NORMAL or BUILDING crowd pressure over CRITICAL or INTERVENTION zones. Check the Live Map or Navigation page for current status.');
  }

  if (matches(question, KEYWORDS.missing)) {
    topics.push('missing');
    lines.push('For a missing or separated person: go to the nearest Lost & Found / information centre, or submit a report on the Lost & Found page with a description and last known area. Do not wait — early reporting improves reunification chances.');
  }

  if (matches(question, KEYWORDS.event)) {
    topics.push('event');
    const events = await data.getEvents();
    for (const e of events.slice(0, 3)) {
      lines.push(`Event: ${e.title} — ${new Date(e.startTime).toLocaleString()} to ${new Date(e.endTime).toLocaleString()}.`);
    }
  }

  if (lines.length === 0) {
    const announcements = await data.getAnnouncements();
    for (const a of announcements) lines.push(`Announcement (${a.severity}): ${a.title} — ${a.body}`);
  }

  return { contextText: lines.join('\n'), matchedTopics: topics };
}
