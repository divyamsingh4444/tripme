'use client';

/**
 * The two sign-in doors.
 *
 * Client-side rather than server actions, and that is the whole point of this
 * file. A server action calling `signIn` redirects through the App Router,
 * which is a client-side navigation — so the session context never refetches
 * and the app still believes you are signed out. Observed exactly that: signing
 * in landed back on the trip with "Sign in to confirm this trip" still showing,
 * and only a manual reload fixed it.
 *
 * `signIn` from next-auth/react sets `window.location`, which is a real
 * document load, so the session is rebuilt and every gate opens immediately.
 */

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function GoogleSignInButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        signIn('google', { callbackUrl: next });
      }}
      className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border-2 border-border bg-background font-semibold hover:bg-muted hover:border-input transition-colors disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
        <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.47 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {busy ? 'Taking you to Google…' : 'Continue with Google'}
    </button>
  );
}

export function DemoSignInButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        signIn('demo', { callbackUrl: next });
      }}
      className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-95 transition-opacity disabled:opacity-70"
    >
      <span aria-hidden="true">🧭</span>
      {busy ? 'Signing you in…' : 'Continue as a test user'}
    </button>
  );
}
