'use client';

/**
 * Nav + footer.
 * The nav rides transparently over the hero on the home page and solidifies on
 * scroll — the reference pattern. Everywhere else it is solid from the start.
 */

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/', label: 'Plan' },
  { href: '/trips', label: 'My Trips' },
  { href: '/how-it-works', label: 'How it works' },
];

export function SiteNav() {
  const pathname = usePathname();
  const overHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);

  useEffect(() => setOpen(false), [pathname]);

  const solid = !overHero || scrolled;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-card/90 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[70px] sm:h-20 flex items-center justify-between gap-3">
        {/* The mark IS the wordmark — no duplicate text beside it */}
        <Link href="/" className="shrink-0" aria-label="TripME home">
          <Image
            src={solid ? '/logo.svg' : '/logo-white.svg'}
            alt="TripME"
            width={169}
            height={150}
            className="h-12 sm:h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* desktop */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  solid
                    ? active
                      ? 'bg-muted text-foreground'
                      : 'hover:bg-muted'
                    : active
                      ? 'bg-white/15 text-white'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <span
            className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              solid ? 'bg-accent/20 border-accent/50 text-foreground' : 'bg-white/10 border-white/25 text-white'
            }`}
          >
            Demo Mode
          </span>
        </div>

        {/* mobile */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={`md:hidden p-2 rounded-lg ${solid ? 'hover:bg-muted' : 'text-white hover:bg-white/10'}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border px-4 py-3 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2.5 rounded-lg font-medium ${
                pathname === l.href ? 'bg-muted' : 'hover:bg-muted'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="px-3 pt-1">
            <span className="inline-block px-3 py-1.5 rounded-full bg-accent/20 border border-accent/50 text-xs font-semibold">
              Demo Mode
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="surface-deep mt-16">
      <div className="perforation perforation-light" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div className="max-w-sm">
            <Image src="/logo-white.svg" alt="TripME" width={169} height={150} className="h-14 w-auto object-contain" />
            <p className="mt-3 text-sm opacity-75 leading-relaxed">
              One mood, one budget, one complete trip — planned by seven AI agents that check each
              other&apos;s work.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div>
              <div className="font-display font-bold mb-3">Product</div>
              <ul className="space-y-2 opacity-75">
                <li><Link href="/" className="hover:opacity-100 hover:text-accent transition-colors">Plan a trip</Link></li>
                <li><Link href="/trips" className="hover:opacity-100 hover:text-accent transition-colors">My Trips</Link></li>
                <li><Link href="/how-it-works" className="hover:opacity-100 hover:text-accent transition-colors">How it works</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-display font-bold mb-3">Built with</div>
              <ul className="space-y-2 opacity-75">
                <li>Llama 3.3 70B on Groq</li>
                <li>Next.js · three.js</li>
                <li>7-agent pipeline</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="perforation perforation-light my-8" />

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs opacity-70">
          <span>TripME · BITSoM Capstone by Team DEBUGGERS</span>
          <span>Demo product — no real bookings are made. Your trip data stays in your browser.</span>
        </div>
      </div>
    </footer>
  );
}
