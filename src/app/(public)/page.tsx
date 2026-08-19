'use client';

import { Car, Droplets, HeartPulse, Milestone, Search, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { StatCard, type CardStatus } from '@/components/dashboard/StatCard';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { Announcement } from '@/lib/data/types';

interface DashboardSummary {
  crowd: { status: CardStatus; criticalZones: number; totalZones: number };
  parking: { status: CardStatus; operational: number; total: number };
  water: { status: CardStatus; operational: number; total: number };
  hospitals: { status: CardStatus; operational: number; total: number };
  roadsBridges: { status: CardStatus; operational: number; total: number };
  sanitation: { status: CardStatus; available: number; total: number };
  incidents: { status: CardStatus; active: number; total: number };
  volunteers: { status: CardStatus; available: number; total: number };
  lostFound: { status: CardStatus; open: number; total: number };
}

export default function DashboardPage() {
  const summaryApi = useApi<DashboardSummary>('/api/dashboard-summary', { pollMs: 20000 });
  const announcementsApi = useApi<Announcement[]>('/api/announcements');
  const { t } = useLanguage();
  const s = summaryApi.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold text-paper-text">{t('dashboardTitle')}</h1>
      <p className="mt-1 text-sm text-paper-muted">{t('dashboardSubtitle')}</p>

      <AsyncState status={summaryApi.status} errorMessage={summaryApi.errorMessage} onRetry={summaryApi.retry} loadingLabel="Loading dashboard…">
        {s && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              title={t('cardCrowdDensity')}
              status={s.crowd.status}
              value={s.crowd.criticalZones > 0 ? `${s.crowd.criticalZones} ${t('captionCritical')}` : t('captionNormal')}
              caption={`${s.crowd.totalZones} ${t('captionSectorsMonitored')}`}
              href="/crowd"
            />
            <StatCard icon={Car} title={t('cardParking')} status={s.parking.status} value={`${s.parking.operational}/${s.parking.total}`} caption={t('captionLotsOperational')} href="/facilities" />
            <StatCard icon={Droplets} title={t('cardWaterPoints')} status={s.water.status} value={`${s.water.operational}/${s.water.total}`} caption={t('captionPointsOperational')} href="/facilities" />
            <StatCard icon={HeartPulse} title={t('cardHospitals')} status={s.hospitals.status} value={`${s.hospitals.operational}/${s.hospitals.total}`} caption={t('captionFacilitiesOperational')} href="/facilities" />
            <StatCard icon={Milestone} title={t('cardRoadsBridges')} status={s.roadsBridges.status} value={`${s.roadsBridges.operational}/${s.roadsBridges.total}`} caption={t('captionAssetsOperational')} href="/facilities" />
            <StatCard icon={Sparkles} title={t('cardSanitation')} status={s.sanitation.status} value={`${s.sanitation.available}/${s.sanitation.total}`} caption={t('captionToiletsAvailable')} href="/facilities" />
            <StatCard icon={ShieldAlert} title={t('cardActiveAlerts')} status={s.incidents.status} value={s.incidents.active} caption={t('captionIncidentsInProgress')} href="/billboard" />
            <StatCard icon={Search} title={t('cardLostFound')} status={s.lostFound.status} value={s.lostFound.open} caption={t('captionOpenCases')} href="/lost-found" />
          </div>
        )}
      </AsyncState>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-paper-muted">{t('announcementsHeading')}</h2>
        <AsyncState status={announcementsApi.status} errorMessage={announcementsApi.errorMessage} onRetry={announcementsApi.retry} emptyMessage="No announcements right now.">
          <div className="space-y-2">
            {(announcementsApi.data ?? []).map((a) => (
              <div key={a.id} className="paper-card p-4">
                <p className="text-sm font-semibold text-paper-text">{a.title}</p>
                <p className="mt-1 text-sm text-paper-muted">{a.body}</p>
              </div>
            ))}
          </div>
        </AsyncState>
      </div>
    </div>
  );
}
