import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, authConfigured, authPersisted, signIn } from '@/auth';

/**
 * Sign in.
 *
 * Deliberately honest about two things a login page usually hides. First, what
 * signing in is actually for here — your trips live in this browser either way,
 * so an account is about carrying them between devices, not about unlocking the
 * product. Second, whether sign-in is configured at all on this deployment: a
 * button that cannot work is worse than a sentence explaining why.
 */

export const metadata = { title: 'Sign in — TripME' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) redirect(params.next ?? '/trips');

  return (
    <main className="max-w-md mx-auto px-4 py-24 sm:py-28">
      <div className="bg-card rounded-3xl border border-border shadow-sm p-7 sm:p-9">
        <h1 className="font-display text-2xl font-extrabold">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Sign in to keep your trips with you rather than with this browser. You can plan without an
          account — nothing below is a paywall.
        </p>

        {params.error && (
          <p className="mt-5 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            That sign-in did not complete. Please try again.
          </p>
        )}

        {authConfigured ? (
          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: params.next ?? '/trips' });
            }}
            className="mt-6"
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border-2 border-border bg-background font-semibold hover:bg-muted transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
                <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.47 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-xl bg-secondary/50 border border-secondary px-4 py-4 text-sm leading-relaxed">
            <p className="font-semibold">Sign-in is not configured on this deployment.</p>
            <p className="text-muted-foreground mt-1.5">
              TripME works fully without it — plan a trip and it is saved in this browser. Accounts need
              Google OAuth credentials, and we would rather show you this than a button that cannot work.
            </p>
          </div>
        )}

        <div className="mt-7 pt-6 border-t border-border text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            <span className="font-semibold text-foreground">What we store:</span> your name, email and
            profile picture from Google — nothing else, and no password, because we never see one.
          </p>
          <p>
            <span className="font-semibold text-foreground">Where your trips live:</span> in this browser.
            {authPersisted
              ? ' Your account is stored in our database; your trip plans are not sent to it.'
              : ' Nothing is written to any database on this deployment.'}
          </p>
          <p>
            <Link href="/" className="text-primary hover:underline">
              Continue without an account →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
