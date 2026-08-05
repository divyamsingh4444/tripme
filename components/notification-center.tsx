'use client';

/**
 * In-app reminders for confirmed trips.
 *
 * Why this exists alongside browser notifications: a browser notification only
 * arrives if the tab happens to be open AND permission was granted AND the
 * moment passes while you are looking. None of that is reliable, and TripME
 * cannot deliver push when the app is closed — that needs a push server, which
 * this project does not have. So the app itself carries the schedule: a bell
 * that is right there whenever the traveller opens TripME, showing what has
 * come due since they last looked.
 *
 * That is the honest version of this feature, and it is genuinely the more
 * useful half — people open a travel app repeatedly in the days before a trip.
 *
 * Grouped by urgency rather than listed flat, because "what needs me now" and
 * "what is coming" are different questions. Only things that have come due and
 * not been acknowledged earn the badge.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collectReminders,
  dueCount,
  groupReminders,
  KIND_ICON,
  markAllRead,
  markRead,
  relativeWhen,
  type AppReminder,
} from '@/lib/reminders';
import { fmtWhen } from '@/lib/notifications';
import { listTrips, setCurrentTrip, TRIPS_CHANGED_EVENT } from '@/lib/storage';

/** Often enough to feel live, rare enough to be invisible. */
const TICK_MS = 30_000;

function Row({
  reminder,
  onOpen,
  dim = false,
}: {
  reminder: AppReminder;
  onOpen: (r: AppReminder) => void;
  dim?: boolean;
}) {
  return (
    <button
      onClick={() => onOpen(reminder)}
      className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex gap-3 ${dim ? 'opacity-60' : ''}`}
    >
      <span className="text-lg leading-none mt-0.5 shrink-0" aria-hidden="true">
        {KIND_ICON[reminder.kind]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-sm leading-tight">
            {reminder.priority === 'high' && <span className="text-destructive mr-1">●</span>}
            {reminder.title}
          </span>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
            {relativeWhen(reminder.at)}
          </span>
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {reminder.body}
        </span>
        <span className="block text-[10px] text-muted-foreground mt-1">
          {reminder.tripName} · {fmtWhen(reminder.at)}
        </span>
      </span>
    </button>
  );
}

function Section({
  label,
  items,
  onOpen,
  dim,
}: {
  label: string;
  items: AppReminder[];
  onOpen: (r: AppReminder) => void;
  dim?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="divide-y divide-border">
        {items.map((r) => (
          <Row key={r.id} reminder={r} onOpen={onOpen} dim={dim} />
        ))}
      </div>
    </div>
  );
}

export function NotificationCenter({ onDark = false }: { onDark?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reminders, setReminders] = useState<AppReminder[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    setReminders(collectReminders());
    setNow(new Date());
  }, []);

  /*
   * Deliberately after mount, never during render: reminders read localStorage
   * and compare against the clock, and doing either while rendering would
   * produce server and client markup that disagree.
   */
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, TICK_MS);
    window.addEventListener(TRIPS_CHANGED_EVENT, refresh);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(TRIPS_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    refresh();
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, refresh]);

  // Nothing to say until the clock has been read on the client.
  if (!now) return null;
  // No confirmed trips means no schedule — an empty bell is clutter.
  if (reminders.length === 0) return null;

  const groups = groupReminders(reminders, now);
  const badge = dueCount(reminders, now);

  const openReminder = (r: AppReminder) => {
    markRead(r.id);
    setOpen(false);
    // Bring that trip to the front before navigating, so the page opens on the
    // trip the reminder is about rather than whatever was last viewed.
    const saved = listTrips().find((t) => (t.state?.tripId ?? t.id) === r.tripId);
    if (saved) setCurrentTrip(saved.state);
    router.push('/trip');
    refresh();
  };

  return (
    <div ref={wrap} className="relative" data-no-translate>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={badge > 0 ? `Reminders — ${badge} due` : 'Reminders'}
        className={`relative p-2 rounded-lg transition-colors ${
          onDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'hover:bg-muted'
        }`}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Trip reminders"
          className="absolute right-0 top-full mt-2 w-[min(23rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-display font-bold text-sm">Reminders</span>
            {badge > 0 && (
              <button
                onClick={() => {
                  markAllRead(groups.due);
                  refresh();
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            <Section label="Needs you now" items={groups.due} onOpen={openReminder} />
            <Section label="Later today" items={groups.today} onOpen={openReminder} />
            <Section label="Coming up" items={groups.upcoming.slice(0, 8)} onOpen={openReminder} />
            <Section label="Done" items={groups.past.slice(0, 4)} onOpen={openReminder} dim />
          </div>

          <p className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
            Reminders for trips you have confirmed. They appear here whenever you open TripME; delivery to
            a closed app needs push infrastructure this demo does not have.
          </p>
        </div>
      )}
    </div>
  );
}
