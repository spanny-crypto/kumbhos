'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BillboardEntry } from '@/app/api/billboard/route';

const AUTO_ADVANCE_MS = 6000;

/**
 * Plain, high-contrast "just the problem" billboard: one WARNING/CRITICAL
 * situation at a time in large black text on a pale background with an
 * alert emoji — meant to be readable at a glance, not a data-dense
 * dashboard. Slidable via prev/next, dot indicators, touch swipe, and
 * auto-advance (paused while the operator is interacting with it).
 */
export function ProblemCarousel({ problems }: { problems: BillboardEntry[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (index >= problems.length) setIndex(0);
  }, [problems.length, index]);

  useEffect(() => {
    if (paused || problems.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % problems.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, problems.length]);

  if (problems.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <span className="text-6xl">✅</span>
        <p className="mt-4 text-2xl font-extrabold text-black">No active problems</p>
        <p className="mt-2 text-base text-neutral-500">All monitored sectors are within normal or watch-level pressure.</p>
      </div>
    );
  }

  const entry = problems[index]!;
  const situation = entry.headline.split(' — ').slice(1).join(' — ') || entry.headline;

  function go(delta: number) {
    setIndex((i) => (i + delta + problems.length) % problems.length);
  }

  return (
    <div
      className="relative mx-auto min-h-[60vh] max-w-3xl px-4 py-10 sm:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        if (start !== null && end !== undefined) {
          const delta = end - start;
          if (delta > 40) go(-1);
          else if (delta < -40) go(1);
        }
        touchStartX.current = null;
        setPaused(false);
      }}
    >
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          Problem {index + 1} of {problems.length}
        </p>
        <span className="mt-4 block text-7xl sm:text-8xl">⚠️</span>
        <p className="mt-6 text-3xl font-extrabold leading-tight text-black sm:text-5xl">{entry.zoneName}</p>
        <p className="mt-3 text-lg font-bold text-neutral-800 sm:text-2xl">{situation}</p>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">{entry.detail}</p>
      </div>

      {problems.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous problem"
            className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white text-black shadow-sm transition hover:bg-neutral-100 sm:left-4"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next problem"
            className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white text-black shadow-sm transition hover:bg-neutral-100 sm:right-4"
          >
            <ChevronRight size={22} />
          </button>

          <div className="mt-8 flex justify-center gap-1.5">
            {problems.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to problem ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-black' : 'w-1.5 bg-neutral-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
