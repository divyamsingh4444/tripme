'use client';

/**
 * Nav + footer.
 * The nav rides transparently over the hero on the home page and solidifies on
 * scroll. On mobile it opens a slide-in drawer on the brand's deep surface —
 * a white dropdown read as an unstyled default against the dark hero.
 */

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LanguageSwitch, useT } from '@/components/language-switch';

const LINKS = [
  { href: '/', key: 'plan' },
  { href: '/trips', key: 'trips' },
  { href: '/how-it-works', key: 'how' },
  { href: '/contact', key: 'contact' },
];

export function SiteNav() {
  const t = useT();
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

  // While the drawer is open: lock the page behind it and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const solid = !overHero || scrolled;

  return (
    <>
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
                  {t('nav.' + l.key)}
                </Link>
              );
            })}
            <LanguageSwitch onDark={!solid} />
            <Link
              href="/"
              className="ml-1 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-95 transition"
            >
              {t('nav.cta')}
            </Link>
          </div>

          {/* mobile trigger */}
          <button
            onClick={() => setOpen(true)}
            className={`md:hidden p-2 -mr-2 rounded-lg transition-colors ${
              solid ? 'hover:bg-muted' : 'text-white hover:bg-white/10'
            }`}
            aria-label={t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ---- mobile drawer ---- */}
      <div
        className={`md:hidden fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        {/* scrim */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-[#0e1f1a]/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* panel */}
        <aside
          id="mobile-drawer"
          className={`absolute right-0 top-0 h-full w-[84%] max-w-sm surface-deep-grad shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-[70px] shrink-0">
            <Image src="/logo-white.svg" alt="TripME" width={169} height={150} className="h-11 w-auto object-contain" />
            <button
              onClick={() => setOpen(false)}
              className="p-2 -mr-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={t('nav.closeMenu')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="perforation perforation-light" />

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            {LINKS.map((l, i) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}
                  className={`flex items-center justify-between gap-3 px-4 py-4 rounded-2xl mb-1.5 transition-all duration-300 ${
                    open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  } ${active ? 'bg-white/15 border border-white/20' : 'hover:bg-white/10 border border-transparent'}`}
                >
                  <span>
                    <span className="font-display font-bold text-lg text-white block leading-tight">{t('nav.' + l.key)}</span>
                    <span className="text-xs text-white/55">{t('nav.hint.' + l.key)}</span>
                  </span>
                  <span className="text-accent text-lg" aria-hidden="true">→</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-5 pb-7 pt-4 shrink-0">
            <div className="mb-3 flex justify-center [&_button]:text-white/85 [&_button:hover]:bg-white/10">
              <LanguageSwitch onDark />
            </div>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block w-full text-center px-5 py-3.5 rounded-2xl bg-accent text-accent-foreground font-display font-bold glow-accent"
            >
              {t('nav.cta')}
            </Link>
            <p className="mt-4 text-[11px] text-white/45 text-center leading-relaxed">
              Demo product · no real bookings are made
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="surface-deep mt-16">
      <div className="perforation perforation-light" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 max-w-sm">
            <Image src="/logo-white.svg" alt="TripME" width={169} height={150} className="h-14 w-auto object-contain" />
            <p className="mt-4 text-sm opacity-75 leading-relaxed">{t('footer.tagline')}</p>
            <Link
              href="/"
              className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-95 transition"
            >
              {t('nav.cta')}
            </Link>
          </div>

          <div>
            <div className="font-display font-bold mb-3">{t('footer.product')}</div>
            <ul className="space-y-2.5 text-sm opacity-75">
              <li><Link href="/" className="hover:opacity-100 hover:text-accent transition-colors">Plan a trip</Link></li>
              <li><Link href="/trips" className="hover:opacity-100 hover:text-accent transition-colors">My Trips</Link></li>
              <li><Link href="/how-it-works" className="hover:opacity-100 hover:text-accent transition-colors">How it works</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-display font-bold mb-3">{t('footer.company')}</div>
            <ul className="space-y-2.5 text-sm opacity-75">
              <li><Link href="/contact" className="hover:opacity-100 hover:text-accent transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href="/contact#support" className="hover:opacity-100 hover:text-accent transition-colors">{t('footer.support')}</Link></li>
              <li><Link href="/contact#privacy" className="hover:opacity-100 hover:text-accent transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="perforation perforation-light my-9" />

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs opacity-60">
          <span>© {year} TripME. {t('footer.rights')}</span>
          <span>Made in India 🇮🇳 · {t('footer.demo')}</span>
        </div>
      </div>
    </footer>
  );
}
