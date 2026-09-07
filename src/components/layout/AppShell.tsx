'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Navigation as NavigationIcon, ShieldAlert, Waves, Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { useLocation } from './LocationProvider';
import { SosModal } from '@/components/emergency/SosModal';
import { LANG_LABELS, type DictionaryKey, type Lang } from '@/lib/i18n/dictionary';

type NavGroup = 'overview' | 'explore' | 'safety' | 'info';

const NAV_ITEMS: { href: string; labelKey: DictionaryKey; emoji: string; group: NavGroup }[] = [
  { href: '/', labelKey: 'navHome', emoji: '📊', group: 'overview' },
  { href: '/billboard', labelKey: 'navBillboard', emoji: '📡', group: 'overview' },
  { href: '/events', labelKey: 'navEvents', emoji: '📅', group: 'overview' },
  { href: '/live-map', labelKey: 'navLiveMap', emoji: '🗺️', group: 'explore' },
  { href: '/eguide', labelKey: 'navEGuide', emoji: '🛕', group: 'explore' },
  { href: '/market-prices', labelKey: 'navMarketPrices', emoji: '💰', group: 'explore' },
  { href: '/navigation', labelKey: 'navNavigation', emoji: '🧭', group: 'explore' },
  { href: '/homestays', labelKey: 'navHomestays', emoji: '🏠', group: 'explore' },
  { href: '/crowd', labelKey: 'navCrowd', emoji: '👥', group: 'safety' },
  { href: '/emergency', labelKey: 'navEmergency', emoji: '🚨', group: 'safety' },
  { href: '/wristband', labelKey: 'navWristband', emoji: '🆔', group: 'safety' },
  { href: '/lost-found', labelKey: 'navLostFound', emoji: '🔍', group: 'safety' },
  { href: '/facilities', labelKey: 'navFacilities', emoji: '🏢', group: 'info' },
  { href: '/water-quality', labelKey: 'navWaterQuality', emoji: '💧', group: 'info' },
  { href: '/assistant', labelKey: 'navAssistant', emoji: '🤖', group: 'info' },
  { href: '/data-sources', labelKey: 'navDataSources', emoji: '🗂️', group: 'info' }
];

const NAV_GROUP_META: Record<NavGroup, { labelKey: DictionaryKey; tint: string }> = {
  overview: { labelKey: 'navGroupOverview', tint: 'bg-brand-50 text-brand-700' },
  explore: { labelKey: 'navGroupExplore', tint: 'bg-chip-mint/20 text-emerald-700' },
  safety: { labelKey: 'navGroupSafety', tint: 'bg-risk-intervention/10 text-risk-intervention' },
  info: { labelKey: 'navGroupInfo', tint: 'bg-chip-coral/15 text-orange-700' }
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const [sosOpen, setSosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  // Auto-hide the header on scroll-down, reveal on scroll-up — the standard
  // Material "top app bar" scroll pattern: it gives content more room on a
  // long page without ever putting the header more than one upward swipe
  // away. A small delta threshold avoids flicker from sub-pixel scroll
  // jitter, and it always stays visible near the top of the page and
  // whenever the mobile menu is open (sliding it away mid-interaction would
  // take the open dropdown with it).
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    function onScroll() {
      if (menuOpen) return;
      const y = window.scrollY;
      if (y < 64) {
        setHeaderVisible(true);
      } else if (y > lastScrollY.current + 8) {
        setHeaderVisible(false);
      } else if (y < lastScrollY.current - 8) {
        setHeaderVisible(true);
      }
      lastScrollY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

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
    <div className="relative flex min-h-screen overflow-hidden bg-paper-bg">
      {/* Soft, fixed color fields behind everything — glassmorphism reads as
          "glass" only when there's something with shape/color underneath to
          blur. A flat cream background gives every frosted panel nothing to
          show, so these three blurred blobs (brand lavender / mint / coral,
          all very low-opacity) sit behind the whole app, fixed so they don't
          scroll away under a tall page. */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-chip-mint/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-chip-coral/15 blur-3xl" />
      </div>

      <aside className="glass-panel hidden w-60 shrink-0 flex-col border-r-0 md:flex">
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
          {NAV_ITEMS.map(({ href, labelKey, emoji }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-paper-muted hover:bg-paper-bg hover:text-paper-text'
                }`}
              >
                <span className="text-base" aria-hidden="true">{emoji}</span>
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

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-paper-border bg-paper-surface/70 px-4 py-3 backdrop-blur-md backdrop-saturate-150 transition-transform duration-300 ease-out ${
            headerVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          {/* `sticky` already establishes a positioning context, so the
              menuOpen dropdown rendered as this header's child below can use
              `absolute top-full` to mean "right below this header", not
              "100% of the whole page height". */}
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
            <label className="fast-transition flex items-center gap-1.5 rounded-full border border-paper-border px-3 py-1.5 text-xs font-medium text-paper-muted hover:bg-paper-bg">
              <Globe size={13} />
              <select
                aria-label={t('language')}
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="cursor-pointer bg-transparent text-xs font-medium text-paper-muted outline-none"
              >
                {(Object.keys(LANG_LABELS) as Lang[]).map((code) => (
                  <option key={code} value={code}>
                    {LANG_LABELS[code]}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => setSosOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-risk-intervention px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              <ShieldAlert size={14} />
              {t('sos')}
            </button>
          </div>

          {/* Always rendered (not conditionally mounted) so the open/close
              transition can actually animate both directions — grouped
              icon-tile grid instead of a long flat list, since scanning 15
              items is much faster in labelled clusters of 3-4 than in one
              undifferentiated column. */}
          <nav
            aria-hidden={!menuOpen}
            className={`scrollbar-thin absolute inset-x-0 top-full z-30 max-h-[75vh] overflow-y-auto rounded-b-2xl border-b border-paper-border bg-paper-surface p-4 shadow-xl transition-all duration-200 ease-out md:hidden ${
              menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
            }`}
          >
            {(Object.keys(NAV_GROUP_META) as NavGroup[]).map((group) => {
              const meta = NAV_GROUP_META[group];
              const items = NAV_ITEMS.filter((i) => i.group === group);
              return (
                <div key={group} className="mb-4 last:mb-0">
                  <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-paper-faint">{t(meta.labelKey)}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {items.map(({ href, labelKey, emoji }) => {
                      const active = pathname === href;
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition ${active ? 'bg-brand-500' : 'hover:bg-paper-bg'}`}
                        >
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${active ? 'bg-white/20' : meta.tint}`}
                            aria-hidden="true"
                          >
                            {emoji}
                          </span>
                          <span className={`text-[11px] font-medium leading-tight ${active ? 'text-white' : 'text-paper-text'}`}>{t(labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </header>

        {/* z-10, strictly below header's z-20 — the backdrop is a DOM
            sibling of header, so at equal z-index it would paint on top of
            header (later in DOM order) and silently swallow every tap
            aimed at the menu tiles inside it, even though the tiles
            themselves have z-30 (that only wins comparisons within
            header's own stacking context, not against this sibling). */}
        <div
          className={`fixed inset-0 z-10 bg-black/30 backdrop-blur-[1px] transition-opacity duration-200 md:hidden ${
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

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

        <main className="flex-1">{children}</main>

        <footer className="border-t border-paper-border px-4 py-5 text-center text-xs text-paper-faint">
          <p>
            {t('footerLine')} ·{' '}
            <Link href="/data-sources" className="underline hover:text-paper-muted">
              {t('footerDataSources')}
            </Link>{' '}
            ·{' '}
            <Link href="/privacy" className="underline hover:text-paper-muted">
              {t('pagePrivacyTitle')}
            </Link>
          </p>
          <p className="mt-1.5 text-sm font-bold text-paper-text">A SPANDAN PARAKH PRODUCTION</p>
        </footer>
      </div>

      {sosOpen && <SosModal onClose={() => setSosOpen(false)} />}
    </div>
  );
}
