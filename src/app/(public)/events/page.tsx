'use client';

import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { EventItem } from '@/lib/data/types';

export default function EventsPage() {
  const api = useApi<EventItem[]>('/api/events');
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">{t('pageEventsTitle')}</h1>
      <p className="mt-1 text-sm text-paper-muted">{t('pageEventsSubtitle')}</p>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No events scheduled.">
        <div className="mt-4 space-y-3">
          {(api.data ?? []).map((event) => (
            <div key={event.id} className="paper-card p-4">
              <p className="text-sm font-semibold text-paper-text">{event.title}</p>
              <p className="mt-1 text-xs text-paper-muted">
                {new Date(event.startTime).toLocaleString()} – {new Date(event.endTime).toLocaleTimeString()}
              </p>
              <p className="mt-2 text-sm text-paper-muted">{event.description}</p>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
