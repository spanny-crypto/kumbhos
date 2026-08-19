'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/layout/LanguageProvider';

export type CardStatus = 'SAFE' | 'MODERATE' | 'CRITICAL';

const STATUS_STYLE: Record<CardStatus, { border: string; iconBg: string; iconColor: string; pill: string }> = {
  SAFE: { border: 'border-l-risk-normal', iconBg: 'bg-risk-normal/10', iconColor: 'text-risk-normal', pill: 'bg-risk-normal/10 text-risk-normal' },
  MODERATE: { border: 'border-l-amber-400', iconBg: 'bg-amber-400/10', iconColor: 'text-amber-500', pill: 'bg-amber-400/10 text-amber-600' },
  CRITICAL: { border: 'border-l-risk-intervention', iconBg: 'bg-risk-intervention/10', iconColor: 'text-risk-intervention', pill: 'bg-risk-intervention/10 text-risk-intervention' }
};

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  status: CardStatus;
  value: string | number;
  caption: string;
  href?: string;
}

export function StatCard({ icon: Icon, title, status, value, caption, href }: StatCardProps) {
  const { t } = useLanguage();
  const style = STATUS_STYLE[status];
  const statusLabel = status === 'SAFE' ? t('statusSafe') : status === 'MODERATE' ? t('statusModerate') : t('statusCritical');

  const content = (
    <div className={`paper-card border-l-4 ${style.border} p-4 transition hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.iconBg} ${style.iconColor}`}>
          <Icon size={18} />
        </span>
        <span className={`pill ${style.pill}`}>{statusLabel}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-paper-text">{title}</p>
      <p className="mt-0.5 text-2xl font-bold text-paper-text">{value}</p>
      <p className="mt-0.5 text-xs text-paper-muted">{caption}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
