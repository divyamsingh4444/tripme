'use client';

/**
 * The landing page's editorial furniture: trending places, ready-made briefs,
 * and the traveller's own recent trips.
 *
 * The reference site fills this space with booking volume ("143+ trips booked
 * last week", named strangers with timestamps). We have no booking volume, so
 * anything of that shape here would be fabricated. These sections are honest
 * equivalents: curation we stand behind, and the visitor's own real history.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlacePhoto } from '@/components/place-photo';
import { TRENDING, TRIP_IDEAS, type TripIdea, type TrendingPlace } from '@/lib/inspiration';
import { SAMPLES, type SampleEntry } from '@/lib/sample-trips';
import { fmtDate, fmtINR, readTrips, setCurrentTrip } from '@/lib/storage';
import type { SavedTrip } from '@/lib/types';

const MOOD_EMOJI: Record<string, string> = {
  Relax: '🌊',
  Adventure: '🏔️',
  Explore: '🧭',
  Connect: '👥',
  Spiritual: '🕉',
  Celebrate: '🎉',
};

/* ---------- a scroll-snapping rail with arrow controls ---------- */
function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 640), behavior: 'smooth' });
  };
  return (
    <div className="relative">
      <div className="hidden sm:flex absolute -top-14 right-0 gap-2">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            onClick={() => nudge(d)}
            className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center"
            aria-label={d === -1 ? `Scroll ${label} left` : `Scroll ${label} right`}
          >
            {d === -1 ? '‹' : '›'}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- trending destinations ---------- */
export function TrendingDestinations({
  onPick,
}: {
  onPick: (place: TrendingPlace) => void;
}) {
  return (
    <section className="mt-20 sm:mt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="type-section font-display font-extrabold">Trending destinations</h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Hand-picked for this season. Tap one and we&apos;ll start your plan there — the agents
              still work out the budget, the days and the bookings.
            </p>
          </div>
        </div>

        <Rail label="trending destinations">
          {TRENDING.map((p) => (
            <button
              key={p.name}
              onClick={() => onPick(p)}
              className="snap-start shrink-0 w-[260px] sm:w-[290px] text-left rounded-3xl overflow-hidden border border-border bg-card card-lift"
            >
              <PlacePhoto
                place={p.name}
                region={p.region}
                className="h-44"
                overlay="bg-gradient-to-t from-[#0e1f1a]/90 via-[#0e1f1a]/25 to-transparent"
              >
                <div className="h-44 flex flex-col justify-between p-4">
                  <span className="self-start px-2.5 py-1 rounded-full bg-black/35 backdrop-blur border border-white/20 text-white text-[11px] font-semibold">
                    {MOOD_EMOJI[p.mood]} {p.mood}
                  </span>
                  <div>
                    <div className="font-display text-2xl font-extrabold text-white drop-shadow leading-tight">
                      {p.name}
                    </div>
                    <div className="text-xs text-white/75">{p.region}</div>
                  </div>
                </div>
              </PlacePhoto>
              <div className="p-4">
                <p className="text-sm text-muted-foreground leading-snug min-h-[40px]">{p.blurb}</p>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">🗓 {p.bestMonths}</span>
                  <span className="font-mono font-semibold">
                    from {fmtINR(p.fromINR)}
                  </span>
                </div>
                <div className="mt-3 text-sm font-semibold text-primary">Plan this trip →</div>
              </div>
            </button>
          ))}
        </Rail>
      </div>
    </section>
  );
}

/* ---------- ready-made briefs ---------- */
export function TripIdeas({ onPick }: { onPick: (idea: TripIdea) => void }) {
  return (
    <section className="mt-20 sm:mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="type-section font-display font-extrabold">Not sure yet? Start from a feeling</h2>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Six ready-made briefs. Tap one, and the seven agents decide where it should actually
            take you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRIP_IDEAS.map((idea) => (
            <button
              key={idea.title}
              onClick={() => onPick(idea)}
              className="text-left rounded-3xl overflow-hidden border border-border bg-card card-lift group"
            >
              <PlacePhoto
                place={idea.photoHint}
                className="h-32"
                overlay="bg-gradient-to-t from-[#0e1f1a]/85 via-[#0e1f1a]/30 to-transparent"
              >
                <div className="h-32 flex items-end p-4">
                  <span className="px-2.5 py-1 rounded-full bg-black/35 backdrop-blur border border-white/20 text-white text-[11px] font-semibold">
                    {MOOD_EMOJI[idea.mood]} {idea.mood}
                  </span>
                </div>
              </PlacePhoto>
              <div className="p-5">
                <div className="font-display font-bold text-lg leading-tight">{idea.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{idea.hook}</p>
                <div className="mt-3 flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span>{idea.days} days</span>
                  <span>·</span>
                  <span>{fmtINR(idea.budgetINR)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- the visitor's own history ---------- */
export function RecentTrips() {
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    setTrips(readTrips().trips.slice(0, 6));
  }, []);

  if (trips.length === 0) return null;

  const open = (t: SavedTrip) => {
    setCurrentTrip(t.state);
    router.push('/trip');
  };

  return (
    <section className="mt-20 sm:mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="type-section font-display font-extrabold">Your recent trips</h2>
            <p className="mt-2 text-muted-foreground">
              Saved on this device — {trips.length} {trips.length === 1 ? 'plan' : 'plans'} you can
              reopen any time.
            </p>
          </div>
          <button
            onClick={() => router.push('/trips')}
            className="hidden sm:block shrink-0 px-4 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-muted transition-colors"
          >
            See all
          </button>
        </div>

        <Rail label="your recent trips">
          {trips.map((t) => (
            <button
              key={t.id}
              onClick={() => open(t)}
              className="snap-start shrink-0 w-[250px] text-left rounded-3xl overflow-hidden border border-border bg-card card-lift"
            >
              <PlacePhoto
                place={t.state.destination.selected.name}
                region={t.state.destination.selected.region}
                className="h-32"
                overlay="bg-gradient-to-t from-[#0e1f1a]/90 to-transparent"
              >
                <div className="h-32 flex items-end p-4">
                  <span className="font-display text-xl font-extrabold text-white drop-shadow">
                    {t.state.destination.selected.name}
                  </span>
                </div>
              </PlacePhoto>
              <div className="p-4 text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{MOOD_EMOJI[t.state.mood.moodProfile.primaryMood] ?? ''} {t.state.mood.moodProfile.primaryMood}</span>
                  <span>·</span>
                  <span>{t.state.input.durationDays} days</span>
                </div>
                <div className="mt-1.5 font-mono font-semibold">{fmtINR(t.state.input.budgetTotalINR)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{fmtDate(t.state.input.startDate)}</div>
              </div>
            </button>
          ))}
        </Rail>
      </div>
    </section>
  );
}

/* ---------- sample gallery ---------- */
export function SampleGallery() {
  const router = useRouter();
  const open = (s: SampleEntry) => {
    setCurrentTrip(s.build());
    router.push('/trip');
  };
  return (
    <section className="mt-20 sm:mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="type-section font-display font-extrabold">See a finished plan first</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Four real plans, each showing a different part of the system. They open instantly — no
            waiting, and they work even if the free-tier quota is busy.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => open(s)}
              className="text-left rounded-3xl overflow-hidden border border-border bg-card card-lift"
            >
              <PlacePhoto
                place={s.place}
                region={s.region}
                className="h-32"
                overlay="bg-gradient-to-t from-[#0e1f1a]/90 via-[#0e1f1a]/30 to-transparent"
              >
                <div className="h-32 flex flex-col justify-between p-4">
                  <span className="self-start px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white text-[11px] font-semibold">
                    {s.label}
                  </span>
                  <span className="font-display text-xl font-extrabold text-white drop-shadow">
                    {s.place}
                  </span>
                </div>
              </PlacePhoto>
              <div className="p-4">
                <p className="text-sm text-muted-foreground leading-snug min-h-[60px]">{s.demonstrates}</p>
                <div className="mt-2 text-sm font-semibold text-primary">Open this plan →</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- brand ticker ---------- */
export function Marquee() {
  const items = [
    'One mood in',
    'A whole trip out',
    'Seven agents',
    'One Referee',
    'No tab juggling',
    'Budget locked before booking',
  ];
  const strip = [...items, ...items];
  return (
    <div className="mt-20 sm:mt-24 overflow-hidden bg-accent text-accent-foreground py-3 select-none">
      <div className="marquee-track flex gap-8 w-max whitespace-nowrap font-display font-bold text-sm sm:text-base">
        {strip.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            {t}
            <span aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
