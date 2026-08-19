'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure';

interface LocationContextValue {
  status: LocationStatus;
  coords: { lat: number; lng: number } | null;
  /** Raw message text from the browser, when available — the actual reason, not our guess at one. */
  errorDetail: string | null;
  request: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

/**
 * Purely client-side, consent-gated geolocation. This calls the real
 * browser Geolocation API, which triggers the browser/OS's native
 * permission prompt on first use — there is no other way for a web page to
 * "ask for permission" and no way to force that native UI to appear (it's
 * fully owned by the browser). Coordinates never leave the browser on their
 * own; nothing in this file makes a network request. See docs/SECURITY.md
 * and docs/TROUBLESHOOTING.md ("Location / Enable live tracking").
 *
 * The most common real-world cause of "unavailable" is NOT a bug in this
 * app — it's the operating system's location service being turned off
 * (e.g. Windows Settings > Privacy & security > Location, or macOS System
 * Settings > Privacy & Security > Location Services), which Chrome/Edge
 * depend on. The browser grants the *permission* but still can't produce a
 * fix without an OS-level location provider. We surface the browser's own
 * error message text below so this is diagnosable instead of guessed at.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      setErrorDetail(null);
      return;
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      // Geolocation is blocked outright on insecure (non-HTTPS, non-localhost)
      // origins — the browser won't even show a permission prompt. This is a
      // deployment/URL issue, not something fixable from inside the page.
      setStatus('insecure');
      setErrorDetail('This page must be served over HTTPS (or localhost) for location access to work.');
      return;
    }
    setStatus('requesting');
    setErrorDetail(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
        setErrorDetail(null);
      },
      (err) => {
        setErrorDetail(err.message || null);
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
        else if (err.code === err.TIMEOUT) setStatus('timeout');
        else setStatus('unavailable');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const value = useMemo(() => ({ status, coords, errorDetail, request }), [status, coords, errorDetail, request]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
