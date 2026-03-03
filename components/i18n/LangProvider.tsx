'use client';
// components/i18n/LangProvider.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Lang } from '@/lib/i18n/dict';
import { t as translate } from '@/lib/i18n/dict';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
  dir: 'rtl' | 'ltr';
}

const LangContext = createContext<LangContextValue>({
  lang: 'ar',
  setLang: () => {},
  t: (p) => p,
  dir: 'rtl',
});

const STORAGE_KEY = 'aether_lang';
const COOKIE_NAME = 'aether_lang';

function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'ar';
  try {
    const ls = localStorage.getItem(STORAGE_KEY);
    if (ls === 'ar' || ls === 'en') return ls;
    // fallback: read cookie
    const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match?.[1] === 'ar' || match?.[1] === 'en') return match[1] as Lang;
  } catch {}
  return 'ar';
}

function persistLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=31536000;SameSite=Lax`;
  } catch {}
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    const stored = readStoredLang();
    setLangState(stored);
    document.documentElement.lang = stored;
    document.documentElement.dir  = stored === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    persistLang(l);
    document.documentElement.lang = l;
    document.documentElement.dir  = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const tFn = useCallback((path: string) => translate(path, lang), [lang]);

  return (
    <LangContext.Provider
      value={{ lang, setLang, t: tFn, dir: lang === 'ar' ? 'rtl' : 'ltr' }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// Compact toggle button for header use
export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      aria-label="Toggle language"
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-[var(--neon-cyan)] ${className}`}
    >
      <span className={lang === 'ar' ? 'text-[var(--neon-cyan)] font-bold' : ''}>AR</span>
      <span className="text-white/30">/</span>
      <span className={lang === 'en' ? 'text-[var(--neon-cyan)] font-bold' : ''}>EN</span>
    </button>
  );
}
