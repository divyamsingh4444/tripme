'use client';

/**
 * Drives the whole-page translation pass and keeps it current.
 *
 * Mounted once in the layout. It re-runs on three signals:
 *   - the language changes,
 *   - the route changes,
 *   - the DOM changes — which is how agent output gets translated. The run page
 *     writes each agent's result as it lands, so by watching mutations we
 *     translate the plan once it exists, rather than trying to translate text
 *     that has not been generated yet.
 *
 * Re-running constantly is affordable because the pass is cache-first: a page
 * whose strings are all known applies them synchronously and makes no request.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/language-switch';
import { restoreOriginals, translatePage } from '@/lib/auto-translate';

/** Long enough for a React render to settle, short enough to feel immediate. */
const SETTLE_MS = 450;

export function AutoTranslate() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [working, setWorking] = useState(false);

  const applying = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lang === 'en') {
      restoreOriginals();
      setWorking(false);
      return;
    }

    const controller = new AbortController();
    let observer: MutationObserver | null = null;

    const run = async () => {
      if (controller.signal.aborted) return;
      // Our own writes are mutations too; without this the observer feeds itself.
      applying.current = true;
      try {
        await translatePage(lang, controller.signal, (done) => setWorking(!done));
      } finally {
        applying.current = false;
        setWorking(false);
        // Anything that rendered while we were writing is caught by the next tick.
        observer?.takeRecords();
      }
    };

    const schedule = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(run, SETTLE_MS);
    };

    schedule();

    observer = new MutationObserver(() => {
      if (applying.current) return;
      schedule();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      controller.abort();
      observer?.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lang, pathname]);

  if (!working) return null;

  return (
    <div
      data-no-translate
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-medium text-background shadow-lg backdrop-blur"
    >
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-background/40 border-t-background" />
      Translating…
    </div>
  );
}
