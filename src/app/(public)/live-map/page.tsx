'use client';

import { NashikInfraMap } from '@/components/map/NashikInfraMap';
import { useLanguage } from '@/components/layout/LanguageProvider';

// No DemoDataBadge here on purpose: unlike the rest of the app, this map is
// real surveyed Nashik data, not synthetic — see nashikLayers.ts. Flagging it
// as demo/simulation data would be actively misleading.
export default function LiveMapPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4">
        <h1 className="heading-serif text-3xl text-paper-text">{t('pageLiveMapTitle')}</h1>
        <p className="text-sm text-paper-muted">{t('pageLiveMapSubtitle')}</p>
      </div>

      <NashikInfraMap />
    </div>
  );
}
