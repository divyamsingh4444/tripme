/**
 * All persistence is browser-local (localStorage + sessionStorage).
 * This is TripME's MVP "preference graph": saved trips feed the Mood Agent's
 * pastTrips input, the Travel DNA panel and smart form pre-fill.
 */

import type { SavedTrip, TripState } from './types';

const TRIPS_KEY = 'tripme.trips';
const CURRENT_KEY = 'tripme.current';
const PENDING_KEY = 'tripme.pending';

const isBrowser = () => typeof window !== 'undefined';

/* ---- current trip (sessionStorage) ---- */
export function setCurrentTrip(state: TripState): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(CURRENT_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getCurrentTrip(): TripState | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as TripState) : null;
  } catch {
    return null;
  }
}

/* ---- pending input (sessionStorage, form -> run page) ---- */
export function setPendingInput(input: object): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(input));
  } catch {
    /* ignore */
  }
}

export function getPendingInput<T>(): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/* ---- saved trips (localStorage) ---- */

/** Bump when TripState's shape changes in a way older records can't satisfy. */
export const TRIP_SCHEMA_VERSION = 2;

/**
 * Structural guard over data the user's own browser owns.
 *
 * Every reader below walks deep paths — `state.mood.moodProfile.primaryMood`,
 * `state.destination.selected.name` — and this repo's saved-trip shape has
 * already changed twice (5-agent rebuild, then 7). A single stale record threw
 * inside a useEffect on the *landing page*, which renders as a white screen
 * with no way back. Anything missing a field we actually read is dropped.
 */
function isUsableTrip(t: unknown): t is SavedTrip {
  const trip = t as SavedTrip | null;
  const s = trip?.state;
  return (
    !!trip &&
    typeof trip.id === 'string' &&
    !!s &&
    !!s.input &&
    typeof s.input.budgetTotalINR === 'number' &&
    typeof s.input.durationDays === 'number' &&
    typeof s.mood?.moodProfile?.primaryMood === 'string' &&
    typeof s.destination?.selected?.name === 'string'
  );
}

/** Trips plus how many unreadable records were skipped, so the UI can say so. */
export function readTrips(): { trips: SavedTrip[]; dropped: number } {
  if (!isBrowser()) return { trips: [], dropped: 0 };
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return { trips: [], dropped: 0 };
    const trips = parsed.filter(isUsableTrip);
    return { trips, dropped: parsed.length - trips.length };
  } catch {
    return { trips: [], dropped: 0 };
  }
}

export function listTrips(): SavedTrip[] {
  return readTrips().trips;
}

/** @returns true when the save actually persisted */
export function saveTrip(state: TripState): boolean {
  if (!isBrowser()) return false;
  try {
    const trips = listTrips();
    const trip: SavedTrip = {
      id: `trip-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      savedAt: Date.now(),
      schemaVersion: TRIP_SCHEMA_VERSION,
      state,
    };
    trips.unshift(trip);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    return true;
  } catch {
    return false;
  }
}

export function deleteTrip(id: string): void {
  if (!isBrowser()) return;
  try {
    const trips = listTrips().filter((t) => t.id !== id);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch {
    /* ignore */
  }
}

/** Compact history for the Mood Agent payload (up to 3 most recent, non-sample). */
export function getPastTripsCompact(): { destination: string; primaryMood: string; totalINR: number }[] {
  return listTrips()
    .filter((t) => !t.state.isSample)
    .slice(0, 3)
    .map((t) => ({
      destination: t.state.destination.selected.name,
      primaryMood: t.state.mood.moodProfile.primaryMood,
      totalINR: t.state.input.budgetTotalINR,
    }));
}

/* ---- Travel DNA (aggregates over saved trips) ---- */
export interface TravelDNA {
  tripCount: number;
  topMood: { mood: string; count: number } | null;
  avgPerDayINR: number;
  commonPace: string | null;
  destinations: string[];
  lastOrigin: string | null;
  medianBudgetINR: number;
}

export function computeTravelDNA(): TravelDNA | null {
  const trips = listTrips().filter((t) => !t.state.isSample);
  if (trips.length === 0) return null;

  const moodCounts = new Map<string, number>();
  const paceCounts = new Map<string, number>();
  const budgets: number[] = [];
  let perDaySum = 0;

  for (const t of trips) {
    const mood = t.state.mood.moodProfile.primaryMood;
    moodCounts.set(mood, (moodCounts.get(mood) ?? 0) + 1);
    const pace = t.state.input.pace;
    paceCounts.set(pace, (paceCounts.get(pace) ?? 0) + 1);
    budgets.push(t.state.input.budgetTotalINR);
    perDaySum += t.state.input.budgetTotalINR / Math.max(1, t.state.input.durationDays);
  }

  const top = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const pace = [...paceCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const sorted = [...budgets].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    tripCount: trips.length,
    topMood: top ? { mood: top[0], count: top[1] } : null,
    avgPerDayINR: Math.round(perDaySum / trips.length),
    commonPace: pace ? pace[0] : null,
    destinations: [...new Set(trips.map((t) => t.state.destination.selected.name))],
    lastOrigin: trips[0]?.state.input.originCity ?? null,
    medianBudgetINR: median,
  };
}

/* ---- helpers ---- */
export function fmtINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
