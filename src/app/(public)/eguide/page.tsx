'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { GUIDE_CATEGORY_LABELS, NASHIK_GUIDE, type GuideCategory } from '@/lib/data/nashikGuide';

export default function EGuidePage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<GuideCategory | 'ALL'>('ALL');

  const categories = useMemo(() => {
    const set = new Set(NASHIK_GUIDE.map((g) => g.category));
    return Array.from(set);
  }, []);

  const filtered = filter === 'ALL' ? NASHIK_GUIDE : NASHIK_GUIDE.filter((g) => g.category === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="heading-serif text-3xl text-paper-text">{t('pageEGuideTitle')}</h1>
        <p className="text-sm text-paper-muted">{t('pageEGuideSubtitle')}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${filter === 'ALL' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'}`}
        >
          {t('filterAll')}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${filter === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'}`}
          >
            {GUIDE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <div key={entry.id} className="paper-card flex flex-col p-4">
            <div className="flex items-center justify-center rounded-lg bg-brand-50 py-8 text-5xl">{entry.emoji}</div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <p className="text-base font-bold text-paper-text">{entry.name}</p>
              <span className="pill shrink-0 border border-paper-border text-[10px] text-paper-muted">{GUIDE_CATEGORY_LABELS[entry.category]}</span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-paper-faint">📍 {entry.location}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper-muted">{entry.history}</p>
            <p className="mt-2 rounded-md bg-paper-bg p-2 text-xs font-medium text-paper-text">✨ {entry.whyVisit}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-paper-faint">{t('eGuideDisclaimer')}</p>
    </div>
  );
}
