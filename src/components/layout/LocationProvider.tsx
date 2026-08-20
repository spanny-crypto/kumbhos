'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure';
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

interface LocationContextValue {
  status: LocationStatus;
  coords: { lat: number; lng: number } | null;
  /** Raw message text from the browser, when available — the actual reason, not our guess at one. */
  errorDetail: string | null;
  /**
   * The browser's own stored permission decision for this origin, read via
   * the Permissions API *before* we ever call getCurrentPosition. If this
   * is already 'denied', the browser will silently fail every future call
   * with no prompt at all — that's a persisted "Block" from a previous
   * visit, not something a retry can fix. Distinguishing this from a
   * fresh, unprompted state is the whole point of this field.
   */
  permissionState: PermissionState;
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
 * Two distinct failure modes get conflated by users as "it doesn't work,"
 * so this module tells them apart explicitly:
 *  1. Browser-level permission is set to "Block" for this origin (often
 *     from an earlier visit) — Chrome will NOT show a prompt again and
 *     will fail instantly and silently every time. Only a manual reset in
 *     the browser's site settings fixes this; no retry from the page can.
 *  2. Permission is granted/not-yet-decided, but the OS itself has no
 *     location fix to give (Windows Location Services off, no GPS/Wi-Fi
 *     positioning available, etc.) — this shows up as POSITION_UNAVAILABLE
 *     even though the permission prompt succeeded.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return;
    let permissionStatus: PermissionStatus | null = null;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        permissionStatus = result;
        setPermissionState(result.state as PermissionState);
        result.addEventListener('change', () => setPermissionState(result.state as PermissionState));
      })
      .catch(() => setPermissionState('unknown'));
    return () => {
      // No explicit removeEventListener call needed — the PermissionStatus
      // object is garbage collected with this effect's closure once the
      // provider unmounts (which in practice never happens for a root
      // layout provider), but referencing it silences unused-var lint.
      void permissionStatus;
    };
  }, []);

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
    if (permissionState === 'denied') {
      // Calling getCurrentPosition here would just fail instantly with no
      // browser UI at all — skip straight to the actionable message
      // instead of pretending we're "requesting."
      setStatus('denied');
      setErrorDetail('Location is set to "Block" for this site in your browser — it will not prompt again until you reset it manually.');
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
  }, [permissionState]);

  const value = useMemo(() => ({ status, coords, errorDetail, permissionState, request }), [status, coords, errorDetail, permissionState, request]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
