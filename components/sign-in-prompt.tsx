'use client';

/**
 * Shown in place of an action that needs an account.
 *
 * Planning is deliberately open to everyone — the product has to prove itself
 * before it asks for anything. The line falls at the two actions that create
 * something owned: confirming a trip (which turns on a reminder schedule
 * addressed to a person) and saving one (which builds Travel DNA that shapes
 * later plans).
 *
 * It carries `next` so signing in returns to the trip rather than dumping the
 * traveller on a generic page with their plan seemingly gone.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SignInPrompt({
  title,
  body,
  compact = false,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const href = `/signin?next=${encodeURIComponent(pathname || '/trip')}`;

  if (compact) {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-input font-semibold text-sm hover:bg-muted transition-colors"
        title={body}
      >
        🔒 {title}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-input bg-muted/40 p-5 sm:p-6">
      <h3 className="font-display font-bold flex items-center gap-2">
        <span aria-hidden="true">🔒</span>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">{body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-opacity"
        >
          Sign in to continue
        </Link>
        <span className="text-xs text-muted-foreground">
          No account? One tap signs you in as a test user.
        </span>
      </div>
    </div>
  );
}
