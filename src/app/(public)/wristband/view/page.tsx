'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, AlertTriangle } from 'lucide-react';

interface QRPayload {
  n: string;   // fullName
  a?: number | null;
  g: string;   // guardianName
  p: string;   // guardianPhone
  z?: string | null;  // meeting zone name (already resolved)
  med?: string | null;
}

function decode(hash: string): QRPayload | null {
  try {
    const b64 = hash.startsWith('#') ? hash.slice(1) : hash;
    return JSON.parse(decodeURIComponent(atob(b64))) as QRPayload;
  } catch {
    return null;
  }
}

export default function WristbandViewPage() {
  const [data, setData] = useState<QRPayload | null | 'loading'>('loading');

  useEffect(() => {
    setData(decode(window.location.hash));
  }, []);

  if (data === 'loading') return null;

  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-center">
        <p className="text-risk-critical font-semibold">Invalid or missing wristband data.</p>
        <Link href="/lost-found" className="mt-3 block text-sm underline text-paper-muted">
          File a lost-person report instead
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="paper-card p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-risk-intervention">
          Found this person? Here is who to contact.
        </p>
        <p className="heading-serif mt-2 text-3xl text-paper-text">{data.n}</p>
        {data.a != null && (
          <p className="text-sm text-paper-muted">Age {data.a}</p>
        )}

        <a
          href={`tel:${data.p.replace(/\s/g, '')}`}
          className="fast-transition mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-risk-intervention py-4 text-lg font-bold text-white hover:opacity-90"
        >
          <Phone size={20} /> Call {data.g}
        </a>
        <p className="mt-2 text-xl font-black tracking-wide text-paper-text">{data.p}</p>

        {data.z && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-paper-muted">
            <MapPin size={14} /> Meeting point: {data.z}
          </p>
        )}
        {data.med && (
          <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-risk-intervention/10 p-2.5 text-sm font-semibold text-risk-intervention">
            <AlertTriangle size={15} className="shrink-0" /> {data.med}
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-paper-faint">
        Can&apos;t reach the guardian?{' '}
        <Link href="/lost-found" className="underline hover:text-paper-muted">
          File a lost-person report
        </Link>
        .
      </p>
    </div>
  );
}
