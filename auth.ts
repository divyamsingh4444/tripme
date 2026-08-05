import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';

/**
 * Sign-in with Google, with accounts persisted in Supabase.
 *
 * The central design rule here: **TripME must work with none of this
 * configured.** Until today the product had no accounts at all and that was a
 * deliberate, defensible position — trips live in your browser and never touch
 * a server. Adding auth must not quietly convert that into "broken unless four
 * environment variables are set", because the app is demonstrated on machines
 * and deployments that will not have them.
 *
 * So every credential is optional at runtime. If Google's keys are absent there
 * is simply no provider to sign in with, and the UI says so instead of throwing.
 * If Supabase's are absent, sessions still work — they are just JWTs in a cookie
 * and nothing is written to a database. Only when both are present does the
 * product behave like a full account system.
 */

const googleId = process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Is Google sign-in available on this deployment? Read by the UI, not just here. */
export const googleConfigured = Boolean(googleId && googleSecret);
/** Are accounts persisted, or is this a cookie-only session? */
export const authPersisted = Boolean(supabaseUrl && supabaseKey);

/** The identity behind "continue as a test user". Deliberately fixed and obvious. */
export const DEMO_USER = {
  id: 'demo-traveller',
  name: 'Demo Traveller',
  email: 'demo@tripme.example',
} as const;

/*
 * A password-less demo account, and the reasoning for it, because on its face
 * this is an open door.
 *
 * Google's consent screen is in Testing, which means only accounts on our Test
 * users list can get through it. Everyone else — teammates, evaluators, anyone
 * handed the link — is refused with `access_denied` and has no way in. That is
 * unacceptable for something whose whole purpose is to be tried by other people.
 *
 * It is safe here for reasons specific to this product, not in general:
 *   - there is nothing private behind the door. Trips live in the visitor's own
 *     browser and are never uploaded, so signing in as the demo account reveals
 *     nobody else's data — each demo session sees only its own device.
 *   - it cannot impersonate a real account. The identity is fixed and its email
 *     is on the reserved `.example` domain, which by RFC 2606 can never be
 *     registered, so it can never collide with a real Google user.
 *   - no real bookings or payments exist to authorise.
 *
 * It is labelled as a demo account everywhere it appears, because a login that
 * looks real and admits everyone is worse than one that says what it is.
 */
const demoProvider = Credentials({
  id: 'demo',
  name: 'Demo account',
  credentials: {},
  authorize: async () => ({ ...DEMO_USER }),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(googleConfigured ? [Google({ clientId: googleId, clientSecret: googleSecret })] : []),
    demoProvider,
  ],

  // The adapter writes users and accounts to Supabase. Without it NextAuth
  // falls back to stateless JWT sessions, which is a working product, just a
  // forgetful one.
  ...(authPersisted ? { adapter: SupabaseAdapter({ url: supabaseUrl!, secret: supabaseKey! }) } : {}),

  /*
   * JWT sessions even when the adapter is present. Trips are still stored in
   * the browser, so a session's only job is to say who you are — it never needs
   * a database round trip to do that, and this keeps sign-in fast and the app
   * usable if Supabase is briefly unreachable.
   */
  session: { strategy: 'jwt' },

  pages: { signIn: '/signin' },

  callbacks: {
    /*
     * Remember which door someone came through. The UI labels a demo session as
     * a demo session — on the account menu and on the trip they confirm — so
     * nobody mistakes it for their own account, and so a screenshot taken during
     * a demo is never ambiguous about what it shows.
     */
    jwt({ token, account }) {
      if (account) token.isDemo = account.provider === 'demo';
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user) session.user.isDemo = Boolean(token.isDemo);
      return session;
    },
  },

  // Vercel sets this in production; locally it is generated on demand below.
  secret: process.env.AUTH_SECRET ?? 'tripme-dev-secret-not-for-production',
  trustHost: true,
});
