'use client';

import { useMemo, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { titleCase } from '@/lib/utils/format';
import type { AssetCategory, AssetStatus, InfrastructureAsset } from '@/lib/data/types';

const STATUS_STYLE: Record<AssetStatus, string> = {
  OPERATIONAL: 'text-risk-normal border-risk-normal/40 bg-risk-normal/10',
  DEGRADED: 'text-risk-building border-risk-building/40 bg-risk-building/10',
  CRITICAL: 'text-risk-critical border-risk-critical/40 bg-risk-critical/10',
  OFFLINE: 'text-risk-intervention border-risk-intervention/40 bg-risk-intervention/10'
};

export default function FacilitiesPage() {
  const api = useApi<InfrastructureAsset[]>('/api/infrastructure');
  const [filter, setFilter] = useState<AssetCategory | 'ALL'>('ALL');
  const { t } = useLanguage();

  const categories = useMemo(() => {
    const set = new Set((api.data ?? []).map((a) => a.category));
    return Array.from(set).sort();
  }, [api.data]);

  const filtered = (api.data ?? []).filter((a) => filter === 'ALL' || a.category === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-paper-text">{t('pageFacilitiesTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('pageFacilitiesSubtitle')}</p>
        </div>
        <DemoDataBadge />
      </div>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No facility data available.">
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => setFilter('ALL')} className={`rounded-full border px-3 py-1 text-xs ${filter === 'ALL' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'}`}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`rounded-full border px-3 py-1 text-xs ${filter === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'}`}>
              {titleCase(c)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <div key={asset.id} className="paper-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-paper-text">{asset.name}</p>
                <span className={`pill border ${STATUS_STYLE[asset.status]}`}>{titleCase(asset.status)}</span>
              </div>
              <p className="mt-1 text-xs text-paper-muted">{titleCase(asset.category)}{asset.capacity ? ` · capacity ${asset.capacity}` : ''}</p>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
