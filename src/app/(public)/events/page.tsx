'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useLanguage } from '@/components/layout/LanguageProvider';
import {
  CALENDAR_CATEGORY_COLOR,
  CALENDAR_CATEGORY_LABELS,
  DAILY_EVENTS,
  KUMBH_CALENDAR,
  eventsOnDate,
  type CalendarEvent
} from '@/lib/data/kumbhCalendar';

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MELA_START = new Date(2026, 9, 31); // Dhwajarohan, Oct 2026 (month is 0-indexed)

function nearestEventMonth(): { year: number; month: number } {
  const today = new Date();
  const upcoming = KUMBH_CALENDAR.map((e) => new Date(e.date)).filter((d) => d >= today).sort((a, b) => a.getTime() - b.getTime())[0];
  const anchor = upcoming ?? MELA_START;
  return { year: anchor.getFullYear(), month: anchor.getMonth() };
}

export default function EventsPage() {
  const { t } = useLanguage();
  const initial = useMemo(nearestEventMonth, []);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of KUMBH_CALENDAR) {
      const start = new Date(e.date);
      const end = new Date(e.endDate ?? e.date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = toIso(d);
        map.set(iso, [...(map.get(iso) ?? []), e]);
      }
    }
    return map;
  }, []);

  function changeMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDate(null);
  }

  const cells: (string | null)[] = [...Array(startWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => toIso(new Date(year, month, i + 1)))];

  const selectedEvents = selectedDate ? eventsOnDate(selectedDate) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">{t('pageEventsTitle')}</h1>
      <p className="mt-1 text-sm text-paper-muted">{t('pageEventsSubtitle')}</p>
      <p className="mt-2 rounded-md bg-paper-bg p-2.5 text-xs text-paper-faint">{t('eventsCalendarDisclaimer')}</p>

      <div className="paper-card mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} className="rounded-full p-1.5 text-paper-muted hover:bg-paper-bg" aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-semibold text-paper-text">{monthLabel}</p>
          <button onClick={() => changeMonth(1)} className="rounded-full p-1.5 text-paper-muted hover:bg-paper-bg" aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-paper-faint">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const dayEvents = eventsByDate.get(iso) ?? [];
            const isSelected = selectedDate === iso;
            const topCategory = dayEvents[0]?.category;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition ${
                  isSelected ? 'bg-brand-500 font-bold text-white' : dayEvents.length > 0 ? 'bg-brand-50 font-semibold text-brand-700 hover:bg-brand-100' : 'text-paper-muted hover:bg-paper-bg'
                }`}
              >
                {Number(iso.slice(-2))}
                {dayEvents.length > 0 && !isSelected && (
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full" style={{ background: CALENDAR_CATEGORY_COLOR[topCategory!] }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-paper-faint">
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {selectedEvents.length === 0 ? (
            <div className="paper-card p-4 text-sm text-paper-muted">{t('eventsNoneOnDate')}</div>
          ) : (
            selectedEvents.map((e) => (
              <div key={e.id} className="paper-card p-4">
                <span className="pill border" style={{ borderColor: CALENDAR_CATEGORY_COLOR[e.category], color: CALENDAR_CATEGORY_COLOR[e.category] }}>
                  {CALENDAR_CATEGORY_LABELS[e.category]}
                </span>
                <p className="mt-2 text-sm font-bold text-paper-text">{e.title}</p>
                {e.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-paper-muted">
                    <MapPin size={12} /> {e.location}
                  </p>
                )}
                <p className="mt-2 text-sm text-paper-muted">{e.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper-faint">{t('eventsDailyHeading')}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DAILY_EVENTS.map((e) => (
            <div key={e.id} className="paper-card p-3">
              <p className="text-sm font-semibold text-paper-text">{e.title}</p>
              {e.location && <p className="mt-0.5 text-xs text-paper-muted">📍 {e.location}</p>}
              <p className="mt-1 text-xs text-paper-muted">{e.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
