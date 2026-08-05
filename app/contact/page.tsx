'use client';

import { useState } from 'react';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  EDIT THESE THREE LINES — they are the only place contact details live.
 *  The phone number is a PLACEHOLDER on purpose: publishing a real personal
 *  number to a public site is not something to do by accident. Replace it,
 *  or delete the phone block below if you would rather not list one.
 * ─────────────────────────────────────────────────────────────────────
 */
const CONTACT = {
  email: 'team.debuggers.tripme@gmail.com',
  phone: '+91 XXXXX XXXXX',
  hours: 'Mon–Sat, 10am – 7pm IST',
};

const REASONS = [
  'General enquiry',
  'Feedback on a trip plan',
  'Something is broken',
  'Partnership / press',
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState('');

  // No backend: this composes a mail draft in the visitor's own client.
  const mailto = () => {
    const subject = `TripME — ${reason}`;
    const body = `${message}\n\n—\nFrom: ${name || '(no name given)'}\nReply to: ${email || '(no email given)'}`;
    return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const field =
    'w-full px-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <main>
      {/*
        The heading sits beside what someone actually wants to know before
        writing in — who reads it and how fast. The right half of this band was
        empty, which on a wide screen reads as an unfinished page rather than as
        breathing room.
      */}
      <section className="surface-deep-grad pt-28 sm:pt-36 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-end">
          <div>
            <h1 className="type-hero font-display font-extrabold text-white">Talk to us</h1>
            <p className="mt-4 text-lg text-white/75 max-w-xl">
              Questions, feedback, or something that went wrong on a trip plan — we read everything
              and reply properly.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              ['⏱', 'Usually a reply within a day', 'Written by the four of us, not a helpdesk'],
              ['🧭', 'Trip gone wrong? Tell us what you entered', 'It is the fastest way for us to reproduce it'],
              ['🔒', 'Nothing you send is stored here', 'The form opens your own email app'],
            ].map(([icon, title, sub]) => (
              <li key={title} className="flex gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <span className="text-lg leading-none mt-0.5" aria-hidden="true">{icon}</span>
                <span>
                  <span className="block font-semibold text-white">{title}</span>
                  <span className="block text-white/60 text-xs mt-0.5">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="perforation" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {/* ways to reach us */}
        <div className="grid sm:grid-cols-3 gap-3">
          <a
            href={`mailto:${CONTACT.email}`}
            className="bg-card rounded-2xl border border-border p-5 card-lift block"
          >
            <div className="text-2xl">✉️</div>
            <div className="font-display font-bold mt-2">Email</div>
            <div className="text-sm text-primary break-all mt-0.5">{CONTACT.email}</div>
            <div className="text-xs text-muted-foreground mt-1">Usually within a day</div>
          </a>

          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
            className="bg-card rounded-2xl border border-border p-5 card-lift block"
          >
            <div className="text-2xl">📞</div>
            <div className="font-display font-bold mt-2">Phone</div>
            <div className="text-sm text-primary mt-0.5">{CONTACT.phone}</div>
            <div className="text-xs text-muted-foreground mt-1">{CONTACT.hours}</div>
          </a>

          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="text-2xl">📍</div>
            <div className="font-display font-bold mt-2">Where we are</div>
            <div className="text-sm mt-0.5">Bengaluru, India</div>
            <div className="text-xs text-muted-foreground mt-1">Built by Team DEBUGGERS</div>
          </div>
        </div>

        {/* Form and support as a pair — both are "I need help", and stacking
            them left a wide page with a stretched form and a lot of nothing. */}
        <div className="mt-10 grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
        <section className="bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8">
          <h2 className="type-section font-display font-extrabold">Send us a message</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            This opens your own email app with the message ready to send — nothing is stored on our
            side.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="c-name" className="block font-display font-semibold mb-2">Your name</label>
              <input id="c-name" className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Nair" maxLength={60} />
            </div>
            <div>
              <label htmlFor="c-email" className="block font-display font-semibold mb-2">Your email</label>
              <input id="c-email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={80} />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-display font-semibold mb-2">What&apos;s this about?</label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                    reason === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input hover:bg-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="c-msg" className="block font-display font-semibold mb-2">Message</label>
            <textarea
              id="c-msg"
              className={`${field} min-h-[140px] resize-y`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what happened, or what you'd like to see…"
              maxLength={1500}
            />
          </div>

          <a
            href={mailto()}
            className={`mt-6 block w-full text-center py-4 rounded-2xl font-display font-bold text-lg transition ${
              message.trim()
                ? 'bg-accent text-accent-foreground glow-accent hover:brightness-95'
                : 'bg-muted text-muted-foreground pointer-events-none'
            }`}
            aria-disabled={!message.trim()}
          >
            Send message
          </a>
        </section>

        {/* support */}
        <section id="support" className="scroll-mt-24 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8">
          <h2 className="type-section font-display font-extrabold">Support</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: 'My plan stopped halfway with a rate-limit message.',
                a: 'TripME runs on a free AI plan, so only a few trips can be planned each minute. Press “Retry step” — it resumes from exactly where it stopped and keeps everything already planned.',
              },
              {
                q: 'Are any of these bookings real?',
                a: 'No. Every booking is simulated and labelled Demo Mode. Each card links out to Google Flights or Booking.com if you want to book the real thing yourself.',
              },
              {
                q: 'Where are my saved trips stored?',
                a: 'In your browser, on your device. They never reach our servers, which also means they do not follow you to another phone or laptop.',
              },
              {
                q: 'Something looks wrong in my itinerary.',
                a: 'Tell us using the form above and include what you entered. Plans are generated live by an AI model, so occasional odd suggestions are possible — reports genuinely help us tighten the agents.',
              },
            ].map((f) => (
              <details key={f.q} className="rounded-2xl border border-border overflow-hidden group">
                <summary className="px-5 py-4 font-semibold cursor-pointer hover:bg-muted/50 flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        </div>

        {/* privacy */}
        <section id="privacy" className="mt-10 scroll-mt-24 surface-deep-grad rounded-3xl shadow-lg p-6 sm:p-8">
          <h2 className="type-section font-display font-extrabold">Your data</h2>
          <p className="text-white/75 mt-3 leading-relaxed">
            You can plan, and read a whole trip, without an account. Everything you plan — moods,
            budgets, saved trips — is written to your own browser&apos;s local storage and never sent
            anywhere else. Signing in is optional, and only needed to confirm or save a trip.
          </p>
          <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-white/80">
            {[
              'We do not ask for your name, email or phone to plan a trip.',
              'If you do sign in, we store only what Google returns — a name, an email and a picture. Never a password; we never see one.',
              'Signing in does not upload your trips. They stay in this browser, which is also why they do not follow you to another device.',
              'Your trip details are sent to our AI provider only to generate that plan, and are not used to train anything.',
              'Clearing your browser data deletes every trip permanently — we hold no copy to restore.',
              'No advertising trackers, no selling data. There is nothing to sell.',
            ].map((p) => (
              <li key={p} className="flex gap-2.5">
                <span className="text-accent font-bold shrink-0">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-white/50">
            Written to reflect India&apos;s DPDP Act and GDPR principles of data minimisation and
            purpose limitation.
          </p>
        </section>
      </div>
    </main>
  );
}
