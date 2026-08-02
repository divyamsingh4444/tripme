'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Client boundary for the session context.
 *
 * `refetchOnWindowFocus` is off deliberately: the session's only job here is to
 * show who you are in the nav, and re-checking it every time someone alt-tabs
 * back to a trip they are reading is a request nobody asked for.
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
