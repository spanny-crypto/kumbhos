'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Map as MapIcon,
  Users,
  Route,
  Building2,
  Siren,
  Search,
  CalendarDays,
  Bot,
  Database,
  Droplets,
  Globe,
  Navigation as NavigationIcon,
  ShieldAlert,
  Waves,
  QrCode,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { useLocation } from './LocationProvider';
import { SosModal } from '@/components/emergency/SosModal';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

const NAV_ITEMS: { href: string; labelKey: DictionaryKey; icon: typeof LayoutDashboard }[] = [
  { href: '/', labelKey: 'navHome', icon: LayoutDashboard },
  { href: '/billboard', labelKey: 'navBillboard', icon: Radio },
  { href: '/live-map', labelKey: 'navLiveMap', icon: MapIcon },
  { href: '/crowd', labelKey: 'navCrowd', icon: Users },
  { href: '/navigation', labelKey: 'navNavigation', icon: Route },
  { href: '/facilities', labelKey: 'navFacilities', icon: Building2 },
  { href: '/water-quality', labelKey: 'navWaterQuality', icon: Droplets },
  { href: '/wristband', labelKey: 'navWristband', icon: QrCode },
  { href: '/emergency', labelKey: 'navEmergency', icon: Siren },
  { href: '/lost-found', labelKey: 'navLostFound', icon: Search },
  { href: '/events', labelKey: 'navEvents', icon: CalendarDays },
  { href: '/assistant', labelKey: 'navAssistant', icon: Bot },
  { href: '/data-sources', labelKey: 'navDataSources', icon: Database }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, toggle, t } = useLanguage();
  const location = useLocation();
  const [sosOpen, setSosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  // A persisted browser-level "Block" is detectable via the Permissions API
  // even before the user clicks anything — surface it proactively instead
  // of waiting for a click that we already know will fail silently.
  const persistedlyBlocked = location.status === 'idle' && location.permissionState === 'denied';
  const locationHasProblem = ['denied', 'unavailable', 'timeout', 'unsupported', 'insecure'].includes(location.status) || persistedlyBlocked;

  function requestLocation() {
    setLocationBannerDismissed(false);
    location.request();
  }

  return (
    <div className="flex min-h-screen bg-paper-bg">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-paper-border bg-paper-surface md:flex">
        <div className="flex items-center gap-2 border-b border-paper-border px-4 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Waves size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-paper-text">{t('appName')}</p>
            <p className="truncate text-[11px] text-paper-muted">{t('appTagline')}</p>
          </div>
        </div>
        <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-paper-muted hover:bg-paper-bg hover:text-paper-text'
                }`}
              >
                <Icon size={17} />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-paper-border p-3">
          <Link href="/login" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-paper-muted transition hover:bg-paper-bg hover:text-paper-text">
            <ShieldAlert size={17} />
            {t('navCommand')}
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-paper-border bg-paper-surface/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" className="rounded-lg p-1.5 text-paper-muted hover:bg-paper-bg">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Waves size={16} />
              </span>
              <span className="text-sm font-bold text-paper-text">{t('appName')}</span>
            </Link>
          </div>
          <span className="hidden text-sm text-paper-muted md:block" />
          <div className="flex items-center gap-2">
            <button
              onClick={requestLocation}
              title={location.errorDetail ?? 'Uses your real device location — your browser will ask to confirm.'}
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition sm:flex ${
                location.status === 'granted'
                  ? 'border-risk-normal/40 bg-risk-normal/10 text-risk-normal'
                  : locationHasProblem
                    ? 'border-risk-critical/40 bg-risk-critical/5 text-risk-critical'
                    : 'border-paper-border text-paper-muted hover:bg-paper-bg'
              }`}
            >
              <NavigationIcon size={13} />
              {location.status === 'granted'
                ? t('trackingOn')
                : location.status === 'requesting'
                  ? 'Requesting…'
                  : persistedlyBlocked
                    ? 'Blocked — tap for fix'
                    : location.status === 'denied'
                      ? 'Permission denied'
                      : location.status === 'unavailable'
                        ? 'Location unavailable'
                        : location.status === 'timeout'
                          ? 'Timed out — retry'
                          : location.status === 'insecure'
                            ? 'Needs HTTPS'
                            : t('enableTracking')}
            </button>
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 rounded-full border border-paper-border px-3 py-1.5 text-xs font-medium text-paper-muted transition hover:bg-paper-bg"
            >
              <Globe size={13} />
              {lang === 'en' ? 'मराठी' : 'English'}
            </button>
            <button
              onClick={() => setSosOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-risk-intervention px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              <ShieldAlert size={14} />
              {t('sos')}
            </button>
          </div>
        </header>

        {locationHasProblem && !locationBannerDismissed && (
          <div className="flex flex-wrap items-start gap-2 border-b border-risk-critical/30 bg-risk-critical/5 px-4 py-2.5 text-xs text-paper-text">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-risk-critical" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="font-semibold text-risk-critical">
                {persistedlyBlocked && 'Location is blocked for this site — your browser remembers a past "Block" and will not ask again.'}
                {!persistedlyBlocked && location.status === 'denied' && 'Location permission was denied.'}
                {!persistedlyBlocked && location.status === 'unavailable' && "Your device/browser couldn't determine a location."}
                {!persistedlyBlocked && location.status === 'timeout' && 'Location request timed out.'}
                {!persistedlyBlocked && location.status === 'unsupported' && 'Geolocation is not supported here.'}
                {!persistedlyBlocked && location.status === 'insecure' && 'This page needs HTTPS for location to work.'}
              </p>
              {location.errorDetail && <p className="text-paper-muted">Browser said: “{location.errorDetail}”</p>}

              {(persistedlyBlocked || location.status === 'denied') && (
                <div className="text-paper-muted">
                  <p>
                    Reset it for <code className="rounded bg-black/5 px-1 py-0.5">{origin || 'this site'}</code>:
                  </p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    <li>
                      <strong>Chrome / Edge (desktop):</strong> click the 🔒 or ⓘ icon left of the address bar → Site settings (or Permissions) → Location → change
                      "Block" to "Ask" or "Allow" → reload this page.
                    </li>
                    <li>
                      <strong>Chrome (Android):</strong> tap ⋮ → Settings → Site settings → Location → find this site → change to Allow.
                    </li>
                    <li>
                      <strong>Safari (iOS):</strong> Settings app → Safari → Location, or Settings → Privacy &amp; Security → Location Services → Safari Websites.
                    </li>
                    <li>
                      <strong>Firefox:</strong> click the 🔒 icon → Clear permission next to Location, then retry.
                    </li>
                  </ul>
                </div>
              )}
              {!persistedlyBlocked && location.status === 'unavailable' && (
                <p className="text-paper-muted">
                  Most common cause: your operating system's location service is turned off. On Windows: Settings → Privacy &amp; security → Location → turn it on, and
                  allow desktop apps (including your browser) to use it. On macOS: System Settings → Privacy &amp; Security → Location Services.
                </p>
              )}
            </div>
            <button onClick={requestLocation} className="shrink-0 rounded-md border border-paper-border bg-paper-surface px-2.5 py-1 text-xs font-medium hover:bg-paper-bg">
              Retry
            </button>
            <button onClick={() => setLocationBannerDismissed(true)} aria-label="Dismiss" className="shrink-0 rounded-md p-1 text-paper-muted hover:bg-paper-bg">
              <X size={14} />
            </button>
          </div>
        )}

        {menuOpen && (
          <nav className="scrollbar-thin max-h-[70vh] overflow-y-auto border-b border-paper-border bg-paper-surface p-2 md:hidden">
            {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                    active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-paper-muted hover:bg-paper-bg'
                  }`}
                >
                  <Icon size={17} />
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex-1">{children}</main>

        <footer className="border-t border-paper-border px-4 py-5 text-center text-xs text-paper-faint">
          <p>
            KumbhOS Prototype · Demo/simulation data unless otherwise labeled · Not affiliated with any government authority ·{' '}
            <Link href="/data-sources" className="underline hover:text-paper-muted">
              Data sources
            </Link>
          </p>
          <p className="mt-1.5 text-sm font-bold text-paper-text">A SPANDAN PARAKH PRODUCTION</p>
        </footer>
      </div>

      {sosOpen && <SosModal onClose={() => setSosOpen(false)} />}
    </div>
  );
}
