'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Phone, Printer } from 'lucide-react';
import type { WristbandProfile } from '@/lib/data/types';

// The QR encodes a plain `tel:` URI — scanning it with any phone's camera
// opens the dialer with the guardian's number pre-filled. No hosted page, no
// server, no network of any kind involved: it works the same whether the
// finder has signal, wifi, or neither. Every other detail (name, age,
// meeting point, medical notes) is already printed as plain text on the
// card itself, so nothing is lost by keeping the QR this simple.
function buildTelUri(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`;
}

// The printable card itself — used both right after creation (public
// /wristband page) and for staff re-printing a lost band (command centre).
// Deliberately plain, high-contrast, and large-print: this gets printed on
// whatever paper is at hand and read at arm's length by a stranger, not
// admired as a design piece.
export function WristbandCard({ profile, zoneName }: { profile: WristbandProfile; zoneName: string | null }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(buildTelUri(profile.guardianPhone), { margin: 1, width: 200 }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    });
    return () => { cancelled = true; };
  }, [profile.guardianPhone]);

  return (
    <div>
      <div id="wristband-print-card" className="mx-auto max-w-sm rounded-2xl border-2 border-dashed border-paper-text/40 bg-white p-5 text-black">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-black/60">KumbhOS ID Wristband — Scan to call guardian</p>
        <div className="mt-3 flex items-center gap-4">
          {qrDataUrl && <img src={qrDataUrl} alt="Scan to call guardian" width={110} height={110} className="shrink-0" />}
          <div className="min-w-0">
            <p className="text-2xl font-black tracking-wide">{profile.fullName}</p>
            {profile.age !== null && <p className="text-sm">Age {profile.age}</p>}
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-black/60">Code</p>
            <p className="font-mono text-xl font-bold tracking-[0.2em]">{profile.id}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-dashed border-black/20 pt-3 text-sm">
          <p className="font-semibold">Guardian: {profile.guardianName}</p>
          <p className="text-lg font-black">{profile.guardianPhone}</p>
          {zoneName && <p className="mt-1 text-xs">Meeting point: {zoneName}</p>}
          {profile.medicalNotes && <p className="mt-1 text-xs font-semibold text-red-700">⚠ {profile.medicalNotes}</p>}
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-2 print:hidden">
        <a
          href={buildTelUri(profile.guardianPhone)}
          className="fast-transition flex items-center gap-1.5 rounded-md border border-paper-border px-3 py-1.5 text-xs font-medium text-paper-text hover:bg-paper-bg"
        >
          <Phone size={13} /> Test call link
        </a>
        <button
          onClick={() => window.print()}
          className="fast-transition flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
        >
          <Printer size={13} /> Print wristband
        </button>
      </div>
    </div>
  );
}
