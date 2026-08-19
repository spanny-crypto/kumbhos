import type { RiskLevel } from '@/lib/data/types';

export const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string; dot: string }> = {
  NORMAL: { label: 'Normal', color: 'text-risk-normal', bg: 'bg-risk-normal/10 border-risk-normal/40', dot: 'bg-risk-normal' },
  BUILDING: { label: 'Building', color: 'text-risk-building', bg: 'bg-risk-building/10 border-risk-building/40', dot: 'bg-risk-building' },
  CRITICAL: { label: 'Critical', color: 'text-risk-critical', bg: 'bg-risk-critical/10 border-risk-critical/40', dot: 'bg-risk-critical' },
  INTERVENTION: { label: 'Intervention Required', color: 'text-risk-intervention', bg: 'bg-risk-intervention/10 border-risk-intervention/40', dot: 'bg-risk-intervention' }
};

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
