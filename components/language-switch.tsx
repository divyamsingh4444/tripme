'use client';

/**
 * Language switcher.
 *
 * Honest scope: this translates the interface chrome, not agent output — plans
 * are generated live and come back in English. Saying so on the control itself
 * is better than letting someone switch to हिन्दी, receive an English itinerary
 * and conclude the feature is broken.
 *
 * Phase 1 committed to multilingual support and the accessibility argument is
 * real (the Pilgrimage persona in particular), so the surface is built and the
 * chrome genuinely translates. Full agent-output localisation is a declared
 * post-MVP item rather than something quietly implied.
 */

import { useEffect, useRef, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];

const KEY = 'tripme.lang';

export function useLanguage(): [LangCode, (c: LangCode) => void] {
  const [lang, setLang] = useState<LangCode>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as LangCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLang(saved);
    } catch {
      /* storage unavailable — English is a fine default */
    }
  }, []);
  const set = (c: LangCode) => {
    setLang(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = c;
  };
  return [lang, set];
}

export function LanguageSwitch({ onDark = false }: { onDark?: boolean }) {
  const [lang, setLang] = useLanguage();
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
    <div ref={wrap} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          onDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'hover:bg-muted'
        }`}
        aria-label={`Change language — currently ${current.label}`}
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
          aria-label="Language"
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
                  <span className="block">{l.native}</span>
                  <span className="block text-xs text-muted-foreground">{l.label}</span>
                </span>
                {l.code === lang && <span className="text-primary shrink-0">✓</span>}
              </button>
            ))}
          </div>
          <p className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
            Translates the interface. Trip plans are generated live and currently come back in
            English — full plan translation is next.
          </p>
        </div>
      )}
    </div>
  );
}
