'use client';

import { ExternalLink } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { SourcedDataBadge } from '@/components/common/SourcedDataBadge';
import { formatReading } from '@/lib/utils/format';
import { WATER_QUALITY_STANDARD } from '@/lib/data/seed/waterQuality';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { bathingStandardVerdictLabels, waterQualityRiskLabels, tEnum } from '@/lib/i18n/enumLabels';
import type { WaterQualityRecord, WaterQualityRiskLevel } from '@/lib/data/types';

const RISK_STYLE: Record<WaterQualityRiskLevel, string> = {
  LOW: 'text-risk-normal border-risk-normal/40 bg-risk-normal/10',
  MODERATE: 'text-risk-building border-risk-building/40 bg-risk-building/10',
  HIGH: 'text-risk-intervention border-risk-intervention/40 bg-risk-intervention/10',
  DISPUTED: 'text-paper-muted border-paper-border bg-paper-bg'
};

export default function WaterQualityPage() {
  const api = useApi<WaterQualityRecord[]>('/api/water-quality');
  const { lang, t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-serif text-3xl text-paper-text">{t('wqPageTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('wqPageSubtitle')}</p>
        </div>
        <SourcedDataBadge />
      </div>

      <div className="paper-card mb-6 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-paper-muted">{t('wqOfficialStandard')}</p>
        <p className="mt-1 text-sm font-semibold text-paper-text">{WATER_QUALITY_STANDARD.name}</p>
        <p className="text-xs text-paper-muted">{WATER_QUALITY_STANDARD.publisher}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-paper-muted">pH</p>
            <p className="font-semibold text-paper-text">{WATER_QUALITY_STANDARD.ph}</p>
          </div>
          <div>
            <p className="text-paper-muted">{t('wqDissolvedOxygen')}</p>
            <p className="font-semibold text-paper-text">{WATER_QUALITY_STANDARD.dissolvedOxygenMgL}</p>
          </div>
          <div>
            <p className="text-paper-muted">BOD</p>
            <p className="font-semibold text-paper-text">{WATER_QUALITY_STANDARD.bodMgL}</p>
          </div>
          <div>
            <p className="text-paper-muted">{t('wqFecalColiform')}</p>
            <p className="font-semibold text-paper-text">
              {WATER_QUALITY_STANDARD.fecalColiformDesirableMpn100ml}{' '}
              {t('wqDesirableMax').replace('{max}', String(WATER_QUALITY_STANDARD.fecalColiformMaxPermissibleMpn100ml))}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-risk-building/30 bg-risk-building/5 p-4 text-sm text-paper-text">
        <p className="font-semibold text-risk-building">{t('wqPrecautionTitle')}</p>
        <p className="mt-1 text-paper-muted">{t('wqPrecautionBody')}</p>
      </div>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage={t('wqNoRecords')}>
        <div className="space-y-3">
          {(api.data ?? []).map((r) => (
            <div key={r.id} className="paper-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-paper-text">{r.kumbhEvent}</p>
                  <p className="text-xs text-paper-muted">
                    {r.location} · {r.samplingPeriod}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`pill border ${RISK_STYLE[r.riskLevel]}`}>
                    {tEnum(waterQualityRiskLabels, r.riskLevel, lang)} {t('wordRisk')}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-xs font-semibold text-paper-text">{tEnum(bathingStandardVerdictLabels, r.bathingStandardVerdict, lang)}</p>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-paper-faint">pH</p>
                  <p className="text-paper-text">{formatReading(r.ph, '', lang)}</p>
                </div>
                <div>
                  <p className="text-paper-faint">Dissolved O₂</p>
                  <p className="text-paper-text">{formatReading(r.dissolvedOxygenMgL, 'mg/L', lang)}</p>
                </div>
                <div>
                  <p className="text-paper-faint">BOD</p>
                  <p className="text-paper-text">{formatReading(r.bodMgL, 'mg/L', lang)}</p>
                </div>
                <div>
                  <p className="text-paper-faint">Fecal coliform</p>
                  <p className="text-paper-text">{formatReading(r.fecalColiformMpn100ml, 'MPN/100mL', lang)}</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-paper-text">{r.summary}</p>
              {r.notes && <p className="mt-1.5 text-xs italic text-paper-muted">{r.notes}</p>}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-paper-border pt-2 text-xs text-paper-muted">
                <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-600 hover:underline">
                  <ExternalLink size={11} />
                  {r.sourcePublisher} — {r.sourceDate}
                </a>
                <span>
                  {t('wqLastUpdated')} {new Date(r.updatedAt).toLocaleDateString()}
                  {r.updatedBy ? ` — ${r.updatedBy}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
