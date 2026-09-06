'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { LANG_LABELS, type Lang } from '@/lib/i18n/dictionary';

// Shown once on app launch. Two jobs: greet in the languages people actually
// speak at the Nashik/Trimbakeshwar mela, and get the language choice made
// up front — before anyone has to read a settings label they may not be able
// to read. Each option shows its own script, so picking is recognition, not
// reading comprehension.
const GREETINGS = [
  { text: 'स्वागत आहे', lang: 'Marathi' },
  { text: 'स्वागत है', lang: 'Hindi' },
  { text: 'Welcome', lang: 'English' },
  { text: 'સ્વાગત છે', lang: 'Gujarati' },
  { text: 'ਜੀ ਆਇਆਂ ਨੂੰ', lang: 'Punjabi' },
  { text: 'স্বাগতম', lang: 'Bengali' },
  { text: 'స్వాగతం', lang: 'Telugu' },
  { text: 'வரவேற்கிறோம்', lang: 'Tamil' },
  { text: 'ಸ್ವಾಗತ', lang: 'Kannada' },
  { text: 'സ്വാഗതം', lang: 'Malayalam' },
  { text: 'ସ୍ୱାଗତ', lang: 'Odia' },
  { text: 'خوش آمدید', lang: 'Urdu' }
];

const STORAGE_KEY = 'kumbhos-welcome-seen';

export function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const { setLang } = useLanguage();

  // Cycle the greeting so every script gets a turn while the user decides.
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % GREETINGS.length), 1400);
    return () => clearInterval(id);
  }, []);

  function choose(lang: Lang) {
    setLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage blocked — worst case the welcome shows again next launch.
    }
    onDone();
  }

  const greeting = GREETINGS[index]!;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper-bg px-6">
      <div className="flex h-28 items-center justify-center">
        <p key={index} className="heading-serif animate-fade-in text-center text-4xl text-paper-text">
          {greeting.text}
        </p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-widest text-paper-faint">{greeting.lang}</p>

      <div className="mt-10 flex items-center gap-2 text-3xl" aria-hidden="true">
        🕉️ 🪔 🛕
      </div>
      <h1 className="heading-serif mt-4 text-center text-2xl text-paper-text">KumbhOS</h1>
      <p className="mt-1 text-center text-sm text-paper-muted">Kumbh Mela safety &amp; navigation</p>

      <div className="mt-10 w-full max-w-xs space-y-2.5">
        {(Object.keys(LANG_LABELS) as Lang[]).map((code) => (
          <button
            key={code}
            onClick={() => choose(code)}
            className="fast-transition flex w-full items-center justify-center gap-2 rounded-xl border border-paper-border bg-paper-surface py-4 text-lg font-semibold text-paper-text hover:bg-brand-50"
          >
            <span aria-hidden="true">🗣️</span>
            {LANG_LABELS[code]}
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-[11px] leading-snug text-paper-faint">Choose your language · भाषा निवडा · भाषा चुनें</p>
    </div>
  );
}

/** True until the user has picked a language on the welcome screen. */
export function useWelcomeGate(): { show: boolean; dismiss: () => void } {
  // Starts false so server render and first client render agree; the effect
  // flips it on if this device hasn't been through the welcome yet.
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  return { show, dismiss: () => setShow(false) };
}
