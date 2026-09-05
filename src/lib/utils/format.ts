import type { ReadingValue, RiskLevel } from '@/lib/data/types';
import type { Lang } from '@/lib/i18n/dictionary';

export const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string; dot: string }> = {
  NORMAL: { label: 'Normal', color: 'text-risk-normal', bg: 'bg-risk-normal/10 border-risk-normal/40', dot: 'bg-risk-normal' },
  BUILDING: { label: 'Building', color: 'text-risk-building', bg: 'bg-risk-building/10 border-risk-building/40', dot: 'bg-risk-building' },
  CRITICAL: { label: 'Critical', color: 'text-risk-critical', bg: 'bg-risk-critical/10 border-risk-critical/40', dot: 'bg-risk-critical' },
  INTERVENTION: { label: 'Intervention Required', color: 'text-risk-intervention', bg: 'bg-risk-intervention/10 border-risk-intervention/40', dot: 'bg-risk-intervention' }
};

const RELATIVE_TIME_STRINGS: Record<Lang, { justNow: string; minAgo: (n: number) => string; hrAgo: (n: number) => string }> = {
  en: { justNow: 'just now', minAgo: (n) => `${n}m ago`, hrAgo: (n) => `${n}h ago` },
  hi: { justNow: 'अभी', minAgo: (n) => `${n} मिनट पहले`, hrAgo: (n) => `${n} घंटे पहले` },
  mr: { justNow: 'आत्ताच', minAgo: (n) => `${n} मि. आधी`, hrAgo: (n) => `${n} तासांपूर्वी` }
};

export function relativeTime(iso: string, lang: Lang = 'en'): string {
  const strings = RELATIVE_TIME_STRINGS[lang];
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return strings.justNow;
  if (diffMin < 60) return strings.minAgo(diffMin);
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return strings.hrAgo(diffHr);
  return new Date(iso).toLocaleDateString();
}

const NOT_REPORTED: Record<Lang, string> = { en: 'Not reported', hi: 'रिपोर्ट नहीं किया गया', mr: 'नोंद नाही' };

export function formatReading(value: ReadingValue, unit: string, lang: Lang = 'en'): string {
  if (value === null || value === undefined) return NOT_REPORTED[lang];
  if (typeof value === 'number') return `${value.toLocaleString()} ${unit}`;
  return `${value.min.toLocaleString()}–${value.max.toLocaleString()} ${unit}`;
}

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
