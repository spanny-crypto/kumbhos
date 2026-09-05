import type { DataProvider } from '@/lib/data/provider';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { nearest, formatDistance } from '@/lib/utils/geo';
import type { GeoPoint } from '@/lib/data/types';
import type { Lang } from '@/lib/i18n/dictionary';

export interface RetrievalResult {
  contextText: string;
  matchedTopics: string[];
}

// Keyword sets are per-language so the assistant recognizes intent whether
// the question is typed in English, Hindi, or Marathi — matches() below is
// a plain substring OR-check, so adding another language here is purely
// additive and never risks a false negative for existing languages.
const KEYWORDS = {
  toilet: {
    en: ['toilet', 'washroom', 'restroom', 'sanitation', 'bathroom'],
    hi: ['शौचालय', 'टॉयलेट', 'बाथरूम', 'स्वच्छता'],
    mr: ['शौचालय', 'टॉयलेट', 'स्वच्छतागृह', 'स्वच्छता']
  },
  medical: {
    en: ['medical', 'doctor', 'ambulance', 'hospital', 'injur', 'sick', 'health'],
    hi: ['चिकित्सा', 'डॉक्टर', 'एम्बुलेंस', 'अस्पताल', 'बीमार', 'घायल', 'स्वास्थ्य'],
    mr: ['वैद्यकीय', 'डॉक्टर', 'रुग्णवाहिका', 'रुग्णालय', 'आजारी', 'जखमी', 'आरोग्य']
  },
  crowd: {
    en: ['crowd', 'density', 'busy', 'congestion', 'risk', 'pressure'],
    hi: ['भीड़', 'घनत्व', 'व्यस्त', 'जोखिम', 'दबाव'],
    mr: ['गर्दी', 'घनता', 'व्यस्त', 'धोका', 'दाब']
  },
  route: {
    en: ['route', 'way', 'direction', 'walk', 'path', 'navigate', 'go to'],
    hi: ['रास्ता', 'मार्ग', 'दिशा', 'कैसे जाएं', 'पैदल'],
    mr: ['मार्ग', 'रस्ता', 'दिशा', 'कसे जायचे', 'चालत']
  },
  bridge: {
    en: ['bridge', 'closed', 'closure', 'avoid'],
    hi: ['पुल', 'बंद', 'बचें'],
    mr: ['पूल', 'बंद', 'टाळा']
  },
  missing: {
    en: ['missing', 'lost', 'child', 'grandmother', 'grandfather', 'separated'],
    hi: ['लापता', 'खो गया', 'बच्चा', 'दादी', 'दादा', 'बिछड़'],
    mr: ['हरवले', 'हरवला', 'मूल', 'आजी', 'आजोबा', 'ताटातूट']
  },
  emergency: {
    en: ['emergency', 'sos', 'help', 'danger', 'fire', 'police'],
    hi: ['आपातकाल', 'मदद', 'खतरा', 'आग', 'पुलिस'],
    mr: ['आणीबाणी', 'मदत', 'धोका', 'आग', 'पोलीस']
  },
  event: {
    en: ['event', 'schedule', 'aarti', 'procession', 'timing'],
    hi: ['कार्यक्रम', 'समय', 'आरती', 'जुलूस'],
    mr: ['कार्यक्रम', 'वेळ', 'आरती', 'मिरवणूक']
  }
} as const satisfies Record<string, Record<Lang, readonly string[]>>;

function matches(question: string, topic: keyof typeof KEYWORDS): boolean {
  const q = question.toLowerCase();
  return (Object.values(KEYWORDS[topic]) as readonly string[][]).some((words) => words.some((w) => q.includes(w.toLowerCase())));
}

const T = {
  nearestToilet: {
    en: (name: string, status: string, dist: string, accessible: boolean) => `Nearest toilet cluster: ${name}, status ${status}, ${dist} away, accessible: ${accessible ? 'yes' : 'no'}.`,
    hi: (name: string, status: string, dist: string, accessible: boolean) => `निकटतम शौचालय समूह: ${name}, स्थिति ${status}, ${dist} दूर, सुलभ: ${accessible ? 'हां' : 'नहीं'}.`,
    mr: (name: string, status: string, dist: string, accessible: boolean) => `जवळचा शौचालय समूह: ${name}, स्थिती ${status}, ${dist} दूर, सुलभ: ${accessible ? 'होय' : 'नाही'}.`
  },
  nearestMedical: {
    en: (name: string, status: string, dist: string) => `Nearest medical facility: ${name}, status ${status}, ${dist} away.`,
    hi: (name: string, status: string, dist: string) => `निकटतम चिकित्सा सुविधा: ${name}, स्थिति ${status}, ${dist} दूर.`,
    mr: (name: string, status: string, dist: string) => `जवळची वैद्यकीय सुविधा: ${name}, स्थिती ${status}, ${dist} दूर.`
  },
  availableTeam: {
    en: (name: string) => `Available medical response team: ${name}.`,
    hi: (name: string) => `उपलब्ध चिकित्सा प्रतिक्रिया टीम: ${name}.`,
    mr: (name: string) => `उपलब्ध वैद्यकीय प्रतिसाद पथक: ${name}.`
  },
  lowestPressure: {
    en: (name: string, score: number, level: string) => `Lowest crowd pressure right now: ${name} (score ${score}, ${level}).`,
    hi: (name: string, score: number, level: string) => `अभी सबसे कम भीड़ दबाव: ${name} (स्कोर ${score}, ${level}).`,
    mr: (name: string, score: number, level: string) => `सध्या सर्वात कमी गर्दी दाब: ${name} (गुण ${score}, ${level}).`
  },
  highestPressure: {
    en: (name: string, score: number, level: string, reason: string) => `Highest crowd pressure right now: ${name} (score ${score}, ${level}). ${reason}`,
    hi: (name: string, score: number, level: string, reason: string) => `अभी सबसे अधिक भीड़ दबाव: ${name} (स्कोर ${score}, ${level}). ${reason}`,
    mr: (name: string, score: number, level: string, reason: string) => `सध्या सर्वाधिक गर्दी दाब: ${name} (गुण ${score}, ${level}). ${reason}`
  },
  routeGuidance: {
    en: 'Route guidance: prefer zones with NORMAL or BUILDING crowd pressure over CRITICAL or INTERVENTION zones. Check the Live Map or Navigation page for current status.',
    hi: 'मार्ग मार्गदर्शन: CRITICAL या INTERVENTION क्षेत्रों की तुलना में NORMAL या BUILDING भीड़ दबाव वाले क्षेत्रों को प्राथमिकता दें. वर्तमान स्थिति के लिए लाइव मैप या नेविगेशन पेज देखें.',
    mr: 'मार्ग मार्गदर्शन: CRITICAL किंवा INTERVENTION विभागांपेक्षा NORMAL किंवा BUILDING गर्दी दाब असलेल्या विभागांना प्राधान्य द्या. सध्याच्या स्थितीसाठी लाइव्ह मॅप किंवा नेव्हिगेशन पान पहा.'
  },
  missingGuidance: {
    en: 'For a missing or separated person: go to the nearest Lost & Found / information centre, or submit a report on the Lost & Found page with a description and last known area. Do not wait — early reporting improves reunification chances.',
    hi: 'किसी लापता या बिछड़े व्यक्ति के लिए: निकटतम खोया-पाया / सूचना केंद्र पर जाएं, या खोया-पाया पेज पर विवरण और अंतिम ज्ञात क्षेत्र के साथ रिपोर्ट सबमिट करें. प्रतीक्षा न करें — जल्दी रिपोर्ट करने से पुनर्मिलन की संभावना बढ़ती है.',
    mr: 'हरवलेल्या किंवा ताटातूट झालेल्या व्यक्तीसाठी: जवळच्या हरवले-सापडले / माहिती केंद्रावर जा, किंवा हरवले-सापडले पानावर वर्णन आणि शेवटच्या माहित असलेल्या भागासह अहवाल सादर करा. वाट पाहू नका — लवकर नोंदवल्याने पुनर्मिलनाची शक्यता वाढते.'
  },
  eventLine: {
    en: (title: string, start: string, end: string) => `Event: ${title} — ${start} to ${end}.`,
    hi: (title: string, start: string, end: string) => `कार्यक्रम: ${title} — ${start} से ${end} तक.`,
    mr: (title: string, start: string, end: string) => `कार्यक्रम: ${title} — ${start} ते ${end}.`
  },
  announcementLine: {
    en: (severity: string, title: string, body: string) => `Announcement (${severity}): ${title} — ${body}`,
    hi: (severity: string, title: string, body: string) => `घोषणा (${severity}): ${title} — ${body}`,
    mr: (severity: string, title: string, body: string) => `घोषणा (${severity}): ${title} — ${body}`
  }
} as const;

/**
 * Very lightweight intent detection + retrieval over our own structured
 * data. This intentionally avoids embeddings/vector search (out of scope
 * for tonight, documented as a future module) but still guarantees the AI
 * (or the fallback provider) only ever sees real application data, never
 * open-ended free recall. `lang` controls the language of the generated
 * sentence templates — the underlying facts (names, statuses) are seed
 * data and are not machine-translated here, see docs/ARCHITECTURE.md.
 */
export async function retrieveContext(question: string, data: DataProvider, near?: GeoPoint, lang: Lang = 'en'): Promise<RetrievalResult> {
  const topics: string[] = [];
  const lines: string[] = [];
  const origin = near ?? { lat: 25.4305, lng: 81.8809 };

  if (matches(question, 'toilet')) {
    topics.push('toilet');
    const toilets = await data.getToilets();
    const available = toilets.filter((t) => t.status === 'AVAILABLE');
    const closest = nearest(origin, available.length > 0 ? available : toilets, (t) => t.location);
    if (closest) {
      lines.push(T.nearestToilet[lang](closest.item.clusterName, closest.item.status, formatDistance(closest.distanceMeters), closest.item.accessible));
    }
  }

  if (matches(question, 'medical') || matches(question, 'emergency')) {
    topics.push('medical');
    const infra = await data.getInfrastructure();
    const medical = infra.filter((a) => a.category === 'MEDICAL' && a.status !== 'OFFLINE');
    const closest = nearest(origin, medical, (a) => a.location);
    if (closest) {
      lines.push(T.nearestMedical[lang](closest.item.name, closest.item.status, formatDistance(closest.distanceMeters)));
    }
    const teams = await data.getResponseTeams();
    const medTeam = teams.find((t) => t.role === 'MEDICAL' && t.available);
    if (medTeam) lines.push(T.availableTeam[lang](medTeam.name));
  }

  if (matches(question, 'crowd') || matches(question, 'bridge')) {
    topics.push('crowd');
    const zones = await data.getZones();
    const scored = zones.map((z) => ({ z, p: computeCrowdPressure(z) })).sort((a, b) => a.p.score - b.p.score);
    const calmest = scored[0];
    const busiest = scored[scored.length - 1];
    if (calmest) lines.push(T.lowestPressure[lang](calmest.z.name, calmest.p.score, calmest.p.level));
    if (busiest) lines.push(T.highestPressure[lang](busiest.z.name, busiest.p.score, busiest.p.level, busiest.p.reason));
  }

  if (matches(question, 'route')) {
    topics.push('route');
    lines.push(T.routeGuidance[lang]);
  }

  if (matches(question, 'missing')) {
    topics.push('missing');
    lines.push(T.missingGuidance[lang]);
  }

  if (matches(question, 'event')) {
    topics.push('event');
    const events = await data.getEvents();
    for (const e of events.slice(0, 3)) {
      lines.push(T.eventLine[lang](e.title, new Date(e.startTime).toLocaleString(), new Date(e.endTime).toLocaleString()));
    }
  }

  if (lines.length === 0) {
    const announcements = await data.getAnnouncements();
    for (const a of announcements) lines.push(T.announcementLine[lang](a.severity, a.title, a.body));
  }

  return { contextText: lines.join('\n'), matchedTopics: topics };
}
