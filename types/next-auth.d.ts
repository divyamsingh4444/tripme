import type { DefaultSession } from 'next-auth';

/**
 * Two fields added to the session, both read by the UI.
 *
 * `isDemo` is the important one: a signed-in demo visitor must be visibly a
 * demo visitor, so the label has to survive from the provider all the way to
 * the account menu.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      isDemo?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isDemo?: boolean;
  }
}

export {};
