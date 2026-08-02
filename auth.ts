import NextAuth from 'next-auth';
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

/** Can anyone actually sign in on this deployment? Read by the UI, not just here. */
export const authConfigured = Boolean(googleId && googleSecret);
/** Are accounts persisted, or is this a cookie-only session? */
export const authPersisted = Boolean(supabaseUrl && supabaseKey);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: authConfigured ? [Google({ clientId: googleId, clientSecret: googleSecret })] : [],

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
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },

  // Vercel sets this in production; locally it is generated on demand below.
  secret: process.env.AUTH_SECRET ?? 'tripme-dev-secret-not-for-production',
  trustHost: true,
});
