'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { NASHIK_PRICE_GUIDE, PRICE_CATEGORY_LABELS, type PriceCategory } from '@/lib/data/marketPrices';

export default function MarketPricesPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<PriceCategory | 'ALL'>('ALL');

  const categories = useMemo(() => {
    const set = new Set(NASHIK_PRICE_GUIDE.map((p) => p.category));
    return Array.from(set);
  }, []);

  const filtered = filter === 'ALL' ? NASHIK_PRICE_GUIDE : NASHIK_PRICE_GUIDE.filter((p) => p.category === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4">
        <h1 className="heading-serif text-3xl text-paper-text">{t('pageMarketPricesTitle')}</h1>
        <p className="text-sm text-paper-muted">{t('pageMarketPricesSubtitle')}</p>
      </div>

      <div className="paper-card mb-4 p-3 text-xs text-paper-muted">⚠️ {t('marketPricesDisclaimer')}</div>

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
            {PRICE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="paper-card divide-y divide-paper-border overflow-hidden">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-paper-text">{p.item}</p>
              <p className="text-xs text-paper-muted">{p.unit}{p.note ? ` · ${p.note}` : ''}</p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-sm font-bold text-brand-700">
              ₹{p.typicalMin}–{p.typicalMax}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
