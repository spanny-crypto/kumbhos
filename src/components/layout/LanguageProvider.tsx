'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionary, type DictionaryKey, type Lang } from '@/lib/i18n/dictionary';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictionaryKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'kumbhos-lang';

function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'hi' || value === 'mr';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Reads the saved preference after mount only, to avoid a server/client
  // hydration mismatch (the server always renders 'en' since it has no
  // access to localStorage) — same pattern as useClock() elsewhere in the
  // app for the same reason.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) setLangState(saved);
    } catch {
      // Private browsing / storage blocked — fall back to the 'en' default.
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal — the choice just won't persist across visits.
    }
  }, []);

  const t = useCallback((key: DictionaryKey) => dictionary[key][lang], [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
