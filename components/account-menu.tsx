'use client';

/**
 * The account control in the nav.
 *
 * Renders nothing at all when sign-in is not configured on this deployment.
 * That is the point: TripME planned trips without accounts long before it had
 * them, and a dead "Sign in" link on a deployment with no credentials would be
 * a worse first impression than no link.
 */

import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

export function AccountMenu({ onDark = false }: { onDark?: boolean }) {
  const { data: session, status } = useSession();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  /*
   * Asked at runtime rather than passed down from the server.
   *
   * The obvious approach — read process.env in the layout and pass a prop —
   * looks right and is quietly wrong: most pages here are statically
   * prerendered, so the value gets baked in at BUILD time. Adding the OAuth
   * credentials afterwards would leave the nav insisting sign-in is unavailable
   * until someone thought to rebuild. Verified in the built output, where the
   * prerendered pages carried authConfigured:false regardless.
   *
   * NextAuth's own providers endpoint always tells the truth about right now.
   */
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/providers')
      .then((r) => (r.ok ? r.json() : null))
      .then((providers) => {
        if (!cancelled) setConfigured(Boolean(providers && Object.keys(providers).length > 0));
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // null means we have not heard back yet. Render nothing until both questions
  // are answered, rather than flashing "Sign in" at someone already signed in.
  if (!configured || status === 'loading') return null;

  if (!session?.user) {
    return (
      <Link
        href="/signin"
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          onDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'hover:bg-muted'
        }`}
      >
        Sign in
      </Link>
    );
  }

  const name = session.user.name ?? 'Traveller';
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div ref={wrap} className="relative" data-no-translate>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account — ${name}`}
        className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full transition-colors ${
          onDark ? 'hover:bg-white/10' : 'hover:bg-muted'
        }`}
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={26}
            height={26}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <span className="w-[26px] h-[26px] rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
            {initial}
          </span>
        )}
        <span className={`text-sm font-medium ${onDark ? 'text-white/85' : ''}`}>{name.split(' ')[0]}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
            {session.user.isDemo && (
              <div className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                Demo account
              </div>
            )}
          </div>
          <Link
            href="/trips"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-4 py-2.5 text-sm hover:bg-muted"
          >
            My Trips
          </Link>
          <button
            onClick={() => signOut({ redirectTo: '/' })}
            role="menuitem"
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted"
          >
            Sign out
          </button>
          <p className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
            Your trips are saved in this browser, not to your account.
          </p>
        </div>
      )}
    </div>
  );
}
