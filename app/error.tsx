'use client';

/**
 * Last line of defence. Every page here is a client component reading data the
 * user's own browser owns, and the saved-trip shape has changed twice in this
 * repo's history — so one stale record could take down the landing page with
 * nothing but a white screen and no way back. The reset button is the point:
 * it clears the three storage keys, which is the actual fix in nearly every
 * case, and which a visitor could never guess.
 */

import { useEffect } from 'react';

const KEYS = ['tripme.trips', 'tripme.current', 'tripme.pending'];

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[TripME] unhandled error', error);
  }, [error]);

  const resetLocalData = () => {
    try {
      KEYS.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch {
      /* storage unavailable — nothing to clear */
    }
    window.location.href = '/';
  };

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
      <div className="text-4xl mb-4">🧭</div>
      <h1 className="type-section font-display font-extrabold">That took a wrong turn</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Something broke while rendering this page. Your saved trips are stored in this browser, so
        the most common cause is a trip saved by an older version of TripME that no longer matches
        the current format.
      </p>

      <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-display font-bold"
        >
          Try again
        </button>
        <button
          onClick={resetLocalData}
          className="px-6 py-3 rounded-xl border border-input font-semibold hover:bg-muted"
        >
          Clear saved data &amp; restart
        </button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Clearing removes saved trips from this device only. Nothing was ever sent to a server.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground">ref {error.digest}</p>
      )}
    </main>
  );
}
