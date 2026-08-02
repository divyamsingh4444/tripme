'use client';

/**
 * Language provider + switcher.
 *
 * The first version stored the choice in per-component state, so switching in
 * the nav updated the nav and nothing else — the control looked functional and
 * changed no visible text. One shared context fixes that: every consumer reads
 * the same value and re-renders together.
 *
 * This context supplies the hand-written dictionary, which is instant and covers
 * the chrome. Everything else on the page — including the trip the agents write
 * — is handled by the pass in components/auto-translate.tsx, which reads the
 * same `lang` value from here.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGES, translate, type LangCode } from '@/lib/i18n';

export { LANGUAGES } from '@/lib/i18n';
export type { LangCode } from '@/lib/i18n';

const KEY = 'tripme.lang';

interface Ctx {
  lang: LangCode;
  setLang: (c: LangCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<Ctx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => translate('en', k),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as LangCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      /* storage unavailable — English is a fine default */
    }
  }, []);

  const setLang = useCallback((c: LangCode) => {
    setLangState(c);
    document.documentElement.lang = c;
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (key: string) => translate(lang, key) }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
/** Shorthand for components that only need the lookup. */
export const useT = () => useContext(LanguageContext).t;

export function LanguageSwitch({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    // Exempt from the page translation pass: a language menu that renamed
    // "Hindi" into Hindi would be unusable to the person looking for it.
    <div ref={wrap} className="relative" data-no-translate>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          onDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'hover:bg-muted'
        }`}
        aria-label={`${t('lang.aria')} — ${current.label}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
        </svg>
        <span>{current.native}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('lang.aria')}
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50"
        >
          <div className="max-h-72 overflow-y-auto py-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 hover:bg-muted transition-colors ${
                  l.code === lang ? 'font-semibold' : ''
                }`}
              >
                <span>
                  <span className="block text-foreground">{l.native}</span>
                  <span className="block text-xs text-muted-foreground">{l.label}</span>
                </span>
                {l.code === lang && <span className="text-primary shrink-0">✓</span>}
              </button>
            ))}
          </div>
          <p className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
            {t('lang.note')}
          </p>
        </div>
      )}
    </div>
  );
}
