import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, authPersisted, googleConfigured } from '@/auth';
import { DemoSignInButton, GoogleSignInButton } from '@/components/signin-buttons';

/**
 * Sign in.
 *
 * Two doors, and the page is honest about both. Google is the real one. The
 * demo account exists because the Google consent screen is still in Testing —
 * only accounts on the Test users list can get through it, so without a second
 * door everyone else is simply refused. It is labelled as a demo account rather
 * than dressed up as a second tier of membership.
 *
 * The page also states what signing in is actually for, which most login pages
 * leave you to guess: your trips live in this browser either way. An account
 * exists so a confirmed trip has an owner, not to unlock the product.
 */

export const metadata = { title: 'Sign in — TripME' };

const REASONS = [
  {
    icon: '🔒',
    title: 'Confirm a trip as you',
    body: 'A confirmed trip and its reminder schedule belong to someone. Planning stays open to everyone.',
  },
  {
    icon: '🗂️',
    title: 'Keep your saved plans',
    body: 'Saved trips build your Travel DNA, so later plans learn from the ones before them.',
  },
  {
    icon: '🙈',
    title: 'We never see a password',
    body: 'Google verifies you and passes back a name, an email and a picture. That is all we hold.',
  },
];

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const next = params.next ?? '/trips';
  if (session?.user) redirect(next);

  return (
    // The nav is fixed, so both panels start below it rather than under it.
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- Brand panel ---------- */}
      <section className="relative surface-deep-grad text-white hidden lg:flex flex-col justify-between p-12 xl:p-16 pt-32 xl:pt-32 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div
          className="absolute -left-32 bottom-0 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl"
          aria-hidden="true"
        />

        {/* No logo here — the fixed nav already carries it, and two on one
            screen read as a rendering fault rather than as branding. */}
        <div className="relative z-10 max-w-md mt-auto">
          <h2 className="font-display text-3xl xl:text-4xl font-extrabold leading-tight">
            One mood. One budget. One complete trip.
          </h2>
          <p className="mt-4 text-white/75 leading-relaxed">
            Seven agents plan the whole journey — where to go, what it costs, what you do each day. When
            two of them disagree, a Referee settles it in front of you.
          </p>
          <ul className="mt-9 space-y-5">
            {REASONS.map((r) => (
              <li key={r.title} className="flex gap-3.5">
                <span className="text-xl leading-none mt-0.5" aria-hidden="true">
                  {r.icon}
                </span>
                <span>
                  <span className="block font-semibold text-[15px]">{r.title}</span>
                  <span className="block text-sm text-white/65 leading-relaxed mt-0.5">{r.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/45 mt-12">
          Demo product · no real bookings are ever made.
        </p>
      </section>

      {/* ---------- Form panel ---------- */}
      <section className="flex items-center justify-center px-4 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You can plan a trip without an account. Signing in is for confirming and saving one.
          </p>

          {params.error && (
            <p
              role="alert"
              className="mt-6 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
            >
              {params.error === 'AccessDenied'
                ? 'That Google account is not on the test-user list for this project yet. Use the demo account below instead.'
                : 'That sign-in did not complete. Please try again, or use the demo account below.'}
            </p>
          )}

          {googleConfigured && (
            <div className="mt-7">
              <GoogleSignInButton next={next} />
            </div>
          )}

          <div className="flex items-center gap-3 my-6" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {googleConfigured ? 'or' : 'Available sign-in'}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* ---------- Demo door ---------- */}
          <DemoSignInButton next={next} />
          <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
            No password, no email, nothing to set up — you are signed in as <strong>Demo Traveller</strong>.
            {googleConfigured
              ? ' Use this if Google turns you away: the project’s consent screen is still in testing, so only listed accounts get through.'
              : ' Google sign-in is not configured on this deployment.'}
          </p>

          <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              <span className="font-semibold text-foreground">Your trips stay in this browser.</span>{' '}
              {authPersisted
                ? 'Your account is stored in our database; your trip plans are not sent to it, and signing in does not move them between devices.'
                : 'Nothing is written to any database on this deployment.'}
            </p>
            <p>
              <Link href="/" className="text-primary font-medium hover:underline">
                Plan a trip without signing in →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
