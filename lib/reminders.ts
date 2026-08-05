/**
 * Everything the traveller should be reminded about, across every trip they
 * have confirmed.
 *
 * Two design decisions worth stating, because they are what keep this honest:
 *
 * DERIVED, NOT STORED. Reminders are computed from the confirmed trips in this
 * browser every time they are asked for. Storing a copy would let the list
 * drift from the plan the moment someone changes a hotel or unconfirms a trip —
 * and a reminder telling you to check in somewhere you no longer booked is
 * worse than no reminder at all. The only thing persisted is which ones you
 * have read or dismissed.
 *
 * ONLY CONFIRMED TRIPS. A draft plan is a proposal; reminding someone to leave
 * for a journey they have not agreed to take is noise. This mirrors the rule
 * the trip page already enforces.
 *
 * The Notification Agent writes the booking reminders. The per-day itinerary
 * reminders are generated here, in code, because they are pure derivation from
 * the plan — asking a model to restate days it already produced would spend
 * quota to add nothing.
 */

import { reminderTime } from '@/lib/notifications';
import { getCurrentTrip, listTrips } from '@/lib/storage';
import type { ReminderItem, SavedTrip, TripState } from '@/lib/types';

const READ_KEY = 'tripme.reminders.read';

export type ReminderKind = 'trip-start' | 'booking' | 'day' | 'return';

export interface AppReminder {
  /** Stable across reloads so read state sticks to the right reminder. */
  id: string;
  tripId: string;
  tripName: string;
  title: string;
  body: string;
  at: Date | null;
  kind: ReminderKind;
  priority: 'high' | 'normal';
  channel: string;
}

export interface ReminderGroups {
  due: AppReminder[];
  today: AppReminder[];
  upcoming: AppReminder[];
  past: AppReminder[];
}

const isBrowser = () => typeof window !== 'undefined';

/* ---------------- read / dismissed state ---------------- */

export function readIds(): Set<string> {
  if (!isBrowser()) return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>): void {
  if (!isBrowser()) return;
  try {
    // Bounded: old ids belong to trips long gone and would grow without limit.
    localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-500)));
  } catch {
    /* storage unavailable — read state is a convenience, not the feature */
  }
}

export function markRead(id: string): void {
  const ids = readIds();
  ids.add(id);
  writeIds(ids);
}

export function markAllRead(all: AppReminder[]): void {
  const ids = readIds();
  for (const r of all) ids.add(r.id);
  writeIds(ids);
}

/* ---------------- building the list ---------------- */

/** A day's plan, as one reminder. Generated in code — see the file header. */
function dayReminders(trip: TripState, tripId: string): AppReminder[] {
  const days = trip.itinerary?.days ?? [];
  return days.map((day) => {
    const parts = [day.morning?.activity, day.afternoon?.activity, day.evening?.activity].filter(Boolean);
    // Same anchoring the agent's own reminders use, so everything sorts together.
    const at = reminderTime(
      { whenLabel: `Day ${day.day}, 8:00 AM` } as ReminderItem,
      trip.input.startDate,
    );
    return {
      id: `${tripId}:day:${day.day}`,
      tripId,
      tripName: trip.destination.selected.name,
      title: `Day ${day.day} — ${day.theme}`,
      body: parts.join(' · ') || 'Nothing planned — the day is yours.',
      at,
      kind: 'day' as const,
      priority: 'normal' as const,
      channel: 'push',
    };
  });
}

function bookingReminders(trip: TripState, tripId: string): AppReminder[] {
  const items = trip.notification?.reminders ?? [];
  return items.map((r, i) => ({
    id: `${tripId}:agent:${i}`,
    tripId,
    tripName: trip.destination.selected.name,
    title: r.title,
    body: r.body,
    at: reminderTime(r, trip.input.startDate),
    kind: 'booking' as const,
    priority: r.priority === 'high' ? ('high' as const) : ('normal' as const),
    channel: r.channel ?? 'push',
  }));
}

/**
 * The countdown, which no agent writes because it is not about a booking.
 *
 * It fires a day out, which is when packing and documents actually matter —
 * a reminder on the morning of departure is too late to be useful.
 */
function tripStartReminder(trip: TripState, tripId: string): AppReminder | null {
  const start = new Date(`${trip.input.startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const at = new Date(start);
  at.setDate(at.getDate() - 1);
  at.setHours(18, 0, 0, 0);
  return {
    id: `${tripId}:start`,
    tripId,
    tripName: trip.destination.selected.name,
    title: `${trip.destination.selected.name} — you leave tomorrow`,
    body: `${trip.input.durationDays} days from ${trip.input.originCity}. Worth checking your packing list and documents tonight.`,
    at,
    kind: 'trip-start',
    priority: 'high',
    channel: 'push',
  };
}

/** Every confirmed trip in this browser, current one included, deduped by id. */
function confirmedTrips(): { tripId: string; state: TripState }[] {
  const out = new Map<string, TripState>();
  for (const saved of listTrips() as SavedTrip[]) {
    const id = saved.state?.tripId ?? saved.id;
    if (saved.state?.status === 'confirmed' && id) out.set(id, saved.state);
  }
  const current = getCurrentTrip();
  // The open trip may be confirmed but not yet saved, so it is added last and
  // wins — it is the freshest version of that plan.
  if (current?.status === 'confirmed' && current.tripId) out.set(current.tripId, current);
  return [...out.entries()].map(([tripId, state]) => ({ tripId, state }));
}

export function collectReminders(): AppReminder[] {
  if (!isBrowser()) return [];
  const all: AppReminder[] = [];
  for (const { tripId, state } of confirmedTrips()) {
    const start = tripStartReminder(state, tripId);
    if (start) all.push(start);
    all.push(...bookingReminders(state, tripId));
    all.push(...dayReminders(state, tripId));
  }
  // Undated reminders sort last: they are still worth showing, just not urgent.
  return all.sort((a, b) => {
    if (!a.at && !b.at) return 0;
    if (!a.at) return 1;
    if (!b.at) return -1;
    return a.at.getTime() - b.at.getTime();
  });
}

/* ---------------- grouping ---------------- */

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Split by urgency rather than listing everything at once.
 *
 * "Due" is anything whose moment has arrived and which has not been read — the
 * only group that earns a badge. Everything already read drops to `past`
 * regardless of time, because a reminder you have acknowledged is history.
 */
export function groupReminders(all: AppReminder[], now = new Date()): ReminderGroups {
  const read = readIds();
  const groups: ReminderGroups = { due: [], today: [], upcoming: [], past: [] };

  for (const r of all) {
    if (!r.at) {
      groups.upcoming.push(r);
      continue;
    }
    const passed = r.at.getTime() <= now.getTime();
    if (passed) {
      (read.has(r.id) ? groups.past : groups.due).push(r);
    } else if (isSameDay(r.at, now)) {
      groups.today.push(r);
    } else {
      groups.upcoming.push(r);
    }
  }

  groups.past.reverse(); // most recently passed first
  return groups;
}

/** What the badge shows: things that have come due and not been acknowledged. */
export function dueCount(all: AppReminder[], now = new Date()): number {
  return groupReminders(all, now).due.length;
}

/** Human relative time — "in 3 days", "2 hours ago". */
export function relativeWhen(at: Date | null, now = new Date()): string {
  if (!at) return 'No time set';
  const diffMs = at.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  let value: string;
  if (mins < 1) return 'Now';
  else if (mins < 60) value = `${mins} minute${mins === 1 ? '' : 's'}`;
  else if (hours < 24) value = `${hours} hour${hours === 1 ? '' : 's'}`;
  else value = `${days} day${days === 1 ? '' : 's'}`;

  return diffMs > 0 ? `in ${value}` : `${value} ago`;
}

export const KIND_ICON: Record<ReminderKind, string> = {
  'trip-start': '🧳',
  booking: '🎫',
  day: '📅',
  return: '🏠',
};
