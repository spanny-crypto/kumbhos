'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { dataSourceStatusLabels, dataSourceTypeLabels, tEnum } from '@/lib/i18n/enumLabels';
import type { DataSourceRecord } from '@/lib/data/types';

const TYPE_STYLE: Record<DataSourceRecord['dataType'], string> = {
  SIMULATED: 'text-amber-700 border-amber-300 bg-amber-50',
  LIVE: 'text-risk-normal border-risk-normal/40 bg-risk-normal/10',
  GOVERNMENT_OPEN_DATA: 'text-brand-700 border-brand-200 bg-brand-50',
  DERIVED: 'text-paper-muted border-paper-border bg-paper-bg',
  USER_REPORTED: 'text-paper-muted border-paper-border bg-paper-bg'
};

export default function DataSourcesPage() {
  const api = useApi<DataSourceRecord[]>('/api/data-sources');
  const { t, lang } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">{t('pageDataSourcesTitle')}</h1>
      <p className="mt-1 text-sm text-paper-muted">{t('pageDataSourcesSubtitle')}</p>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry}>
        <div className="mt-4 space-y-3">
          {(api.data ?? []).map((ds) => (
            <div key={ds.id} className="paper-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-paper-text">{ds.dataset}</p>
                <span className={`pill border ${TYPE_STYLE[ds.dataType]}`}>{tEnum(dataSourceTypeLabels, ds.dataType, lang)}</span>
              </div>
              <p className="mt-1 text-xs text-paper-muted">{t('labelPublisher')}: {ds.publisher}</p>
              <p className="text-xs text-paper-muted">
                {t('labelSource')}:{' '}
                {ds.sourceUrl.startsWith('http') ? (
                  <a href={ds.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    {ds.sourceUrl}
                  </a>
                ) : (
                  ds.sourceUrl
                )}
              </p>
              <p className="text-xs text-paper-muted">{t('labelLicense')}: {ds.license}</p>
              <p className="text-xs text-paper-muted">
                {t('labelStatus')}: {tEnum(dataSourceStatusLabels, ds.status, lang)} · {t('labelRefresh')}: {ds.refreshFrequency}
              </p>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
