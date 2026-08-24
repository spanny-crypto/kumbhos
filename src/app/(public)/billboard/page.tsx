'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { ProblemCarousel } from '@/components/billboard/ProblemCarousel';
import type { BillboardEntry } from '@/app/api/billboard/route';

function useClock() {
  // Starts null so server and first client render match exactly (both
  // render the placeholder) — the real clock only appears after mount,
  // avoiding a hydration mismatch from SSR/client clock skew.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function BillboardPage() {
  const api = useApi<BillboardEntry[]>('/api/billboard', { pollMs: 8000 });
  const now = useClock();
  const problems = (api.data ?? []).filter((e) => e.severity === 'CRITICAL' || e.severity === 'WARNING');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper-bg">
      <div className="flex items-center justify-between border-b border-paper-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-blink rounded-full bg-risk-intervention" />
          <span className="text-xs font-bold uppercase tracking-widest text-paper-muted">Live Billboard</span>
        </div>
        <span className="text-xs text-paper-faint">{now ? now.toLocaleTimeString('en-IN', { hour12: false }) : '--:--:--'}</span>
      </div>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage="No active situations.">
        <ProblemCarousel problems={problems} />
      </AsyncState>
    </div>
  );
}
