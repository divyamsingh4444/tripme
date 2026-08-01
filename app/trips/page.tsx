'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SavedTrip } from '@/lib/types';
import {
  computeTravelDNA,
  deleteTrip,
  fmtDate,
  fmtINR,
  listTrips,
  setCurrentTrip,
  setPendingInput,
  type TravelDNA,
} from '@/lib/storage';

const MOOD_EMOJI: Record<string, string> = {
  Relax: '🌊',
  Adventure: '🏔️',
  Explore: '🧭',
  Connect: '👥',
  Spiritual: '🕉',
  Celebrate: '🎉',
};

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [dna, setDna] = useState<TravelDNA | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = () => {
    setTrips(listTrips());
    setDna(computeTravelDNA());
  };

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  const openTrip = (trip: SavedTrip) => {
    setCurrentTrip(trip.state);
    router.push('/trip');
  };

  const planSimilar = (trip: SavedTrip) => {
    setPendingInput(trip.state.input);
    router.push('/run');
  };

  const remove = (id: string) => {
    deleteTrip(id);
    setConfirmId(null);
    refresh();
  };

  if (!ready) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">My Trips</h1>

      {/* Travel DNA */}
      {dna && dna.tripCount > 0 && (
        <section className="mb-8 bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-display text-lg font-bold mb-3">🧬 Your Travel DNA</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">
                Top mood
              </div>
              <div className="font-display font-bold mt-0.5">
                {dna.topMood
                  ? `${MOOD_EMOJI[dna.topMood.mood] ?? ''} ${dna.topMood.mood} ×${dna.topMood.count}`
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">
                Avg budget/day
              </div>
              <div className="font-display font-bold mt-0.5 font-mono">{fmtINR(dna.avgPerDayINR)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">
                Usual pace
              </div>
              <div className="font-display font-bold mt-0.5">{dna.commonPace ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">
                Trips saved
              </div>
              <div className="font-display font-bold mt-0.5">{dna.tripCount}</div>
            </div>
          </div>
          {dna.destinations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {dna.destinations.map((d) => (
                <span key={d} className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">
                  📍 {d}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            TripME learns from every trip you save — your next plan starts smarter.
          </p>
        </section>
      )}

      {/* Trip grid */}
      {trips.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <div className="text-4xl mb-3">🧳</div>
          <p className="font-medium">No trips yet — your saved plans will live here, on your device.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-5 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold"
          >
            Plan your first trip
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {trips.map((trip) => {
            const s = trip.state;
            return (
              <article key={trip.id} className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col">
                <button onClick={() => openTrip(trip)} className="text-left flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-bold hover:text-primary transition-colors">
                      {s.destination.selected.name}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                      {MOOD_EMOJI[s.mood.moodProfile.primaryMood] ?? ''} {s.mood.moodProfile.primaryMood}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmtDate(s.input.startDate)} · {s.input.durationDays}{' '}
                    {s.input.durationDays === 1 ? 'day' : 'days'} · {s.input.travelers}{' '}
                    {s.input.travelers === 1 ? 'traveller' : 'travellers'}
                  </p>
                  <p className="text-sm font-mono font-semibold mt-1.5">{fmtINR(s.input.budgetTotalINR)}</p>
                  {s.isSample && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-muted text-[11px] font-semibold">
                      Sample
                    </span>
                  )}
                </button>
                <div className="mt-4 pt-3 border-t border-border flex gap-2 text-xs font-semibold">
                  <button onClick={() => openTrip(trip)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
                    Open
                  </button>
                  <button onClick={() => planSimilar(trip)} className="px-3 py-1.5 rounded-lg border border-input hover:bg-muted">
                    Plan similar
                  </button>
                  {confirmId === trip.id ? (
                    <span className="ml-auto flex gap-1.5 items-center">
                      <span className="text-muted-foreground">Delete?</span>
                      <button onClick={() => remove(trip.id)} className="px-2.5 py-1.5 rounded-lg bg-destructive text-white">
                        Yes
                      </button>
                      <button onClick={() => setConfirmId(null)} className="px-2.5 py-1.5 rounded-lg border border-input">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmId(trip.id)}
                      className="ml-auto px-3 py-1.5 rounded-lg border border-input text-destructive hover:bg-destructive/5"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
