'use client';

import { useState } from 'react';
import { AlertTriangle, Phone, Ambulance, MapPin, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/layout/LanguageProvider';

type ShareState = 'idle' | 'sharing' | 'shared' | 'copied' | 'denied' | 'unavailable' | 'timeout' | 'unsupported';

const SHARE_LABEL: Record<ShareState, string> = {
  idle: '',
  sharing: 'Getting your location…',
  shared: 'Shared',
  copied: 'Google Maps link copied',
  denied: 'Location permission denied — enable it in your browser/site settings',
  unavailable: "Couldn't determine your location — try again outdoors or with GPS on",
  timeout: 'Location request timed out — try again',
  unsupported: 'Geolocation is not supported on this device'
};

function googleMapsUrl(lat: number, lng: number): string {
  // Official Google Maps URL scheme — no API key required, opens directly
  // in the Google Maps app (mobile) or maps.google.com (desktop).
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function SosModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [shareState, setShareState] = useState<ShareState>('idle');
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  function shareLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setShareState('unsupported');
      return;
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setShareState('unavailable');
      setErrorDetail('This page must be served over HTTPS (or localhost) for location access to work.');
      return;
    }
    setShareState('sharing');
    setErrorDetail(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = googleMapsUrl(latitude, longitude);
        setMapsUrl(url);
        const text = `My live location: ${url}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: 'My location', text, url });
            setShareState('shared');
          } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            setShareState('copied');
          } else {
            setShareState('shared');
          }
        } catch {
          // Share sheet dismissed by the user, or clipboard blocked — the
          // Google Maps link below is still rendered so it's always
          // reachable even if the share/copy step itself failed.
          setShareState('shared');
        }
      },
      (err) => {
        setErrorDetail(err.message || null);
        if (err.code === err.PERMISSION_DENIED) setShareState('denied');
        else if (err.code === err.TIMEOUT) setShareState('timeout');
        else setShareState('unavailable');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-paper-surface p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-risk-intervention">
            <AlertTriangle size={22} />
            <h2 className="text-lg font-bold">{t('sosTitle')}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-paper-muted hover:bg-paper-bg">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <Phone size={16} /> {t('sosCallPolice')}
          </a>
          <a
            href="tel:108"
            className="flex items-center justify-center gap-2 rounded-lg bg-risk-intervention py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Ambulance size={16} /> {t('sosCallAmbulance')}
          </a>
          <button
            onClick={shareLocation}
            disabled={shareState === 'sharing'}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-paper-border py-3 text-sm font-semibold text-paper-text transition hover:bg-paper-bg disabled:opacity-60"
          >
            <MapPin size={16} />
            {shareState === 'idle' ? t('sosShareLocation') : SHARE_LABEL[shareState]}
          </button>
          {(shareState === 'denied' || shareState === 'unavailable' || shareState === 'timeout') && (
            <div className="rounded-lg bg-risk-critical/5 p-2.5 text-[11px] leading-snug text-paper-muted">
              {errorDetail && <p>Browser said: “{errorDetail}”</p>}
              {shareState === 'unavailable' && (
                <p className="mt-1">
                  Usually means your OS location service is off. Windows: Settings → Privacy &amp; security → Location. macOS: System Settings → Privacy &amp; Security →
                  Location Services.
                </p>
              )}
              {shareState === 'denied' && <p className="mt-1">Allow location for this site via the lock icon in your address bar, then try again.</p>}
            </div>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-brand-600 underline underline-offset-2"
            >
              <ExternalLink size={12} /> Open my location in Google Maps
            </a>
          )}
          <button onClick={onClose} className="w-full rounded-lg border border-paper-border py-3 text-sm font-semibold text-paper-text transition hover:bg-paper-bg">
            {t('sosCancel')}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-snug text-paper-faint">{t('sosDisclaimer')}</p>
      </div>
    </div>
  );
}
