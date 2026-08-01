import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Mono, Inter } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-bricolage',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  title: 'TripME — One mood. One budget. One complete trip.',
  description:
    'Five AI agents plan your entire trip — destination, budget, day-by-day itinerary and bookings — in under a minute. Capstone MVP by Team DEBUGGERS.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#EEF4EF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <nav className="sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="TripME home">
              <Image
                src="/logo.png"
                alt="TripME"
                width={112}
                height={112}
                className="logo-blend h-14 w-14 object-contain"
                priority
              />
              <span className="font-display font-bold text-xl tracking-tight hidden sm:inline">
                Trip<span className="text-accent">ME</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
              <Link href="/" className="px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
                Plan
              </Link>
              <Link href="/trips" className="px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
                My Trips
              </Link>
              <Link
                href="/how-it-works"
                className="px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
              >
                How it works
              </Link>
              <span className="ml-1 px-2.5 py-1 rounded-full bg-accent/20 border border-accent/50 text-xs font-semibold whitespace-nowrap">
                Demo Mode
              </span>
            </div>
          </div>
        </nav>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-muted-foreground text-center leading-relaxed">
            TripME · BITSoM Capstone by Team DEBUGGERS · Powered by Llama 3.3 70B on Groq
            <br />
            Demo product — no real bookings are made. Your trip data stays in your browser.
          </div>
        </footer>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
