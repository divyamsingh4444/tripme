import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Mono, Inter } from 'next/font/google'
import { AutoTranslate } from '@/components/auto-translate'
import { LanguageProvider } from '@/components/language-switch'
import { AuthSessionProvider } from '@/components/session-provider'
import { SiteFooter, SiteNav } from '@/components/site-chrome'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TripME — One mood. One budget. One complete trip.',
  description:
    'Seven AI agents plan your entire trip — destination, budget, day-by-day itinerary and bookings — in under a minute. When two of them disagree, a Referee arbitrates in front of you.',
  // The tab icon is the simplified mark, not the full lockup — the script
  // wordmark is unreadable at 16px.
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0E1F1A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden">
        <AuthSessionProvider>
          <LanguageProvider>
            <SiteNav />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            {/* Translates whatever is on screen, including text the agents write. */}
            <AutoTranslate />
          </LanguageProvider>
        </AuthSessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
