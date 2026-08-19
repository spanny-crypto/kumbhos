'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { dictionary, type DictionaryKey, type Lang } from '@/lib/i18n/dictionary';

interface LanguageContextValue {
  lang: Lang;
  toggle: () => void;
  t: (key: DictionaryKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'mr' : 'en')), []);
  const t = useCallback((key: DictionaryKey) => dictionary[key][lang], [lang]);
  const value = useMemo(() => ({ lang, toggle, t }), [lang, toggle, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
