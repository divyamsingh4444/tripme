'use client';

/**
 * The in-app notification itself: a reminder arriving while you are using
 * TripME, rather than sitting in the bell waiting to be found.
 *
 * It only ever fires for reminders that come due DURING this session. On first
 * load it takes a snapshot of everything already overdue and stays silent about
 * it — opening the app the week before a trip should not fling six toasts at
 * you for things that passed days ago. Those live in the bell, which is exactly
 * what the bell is for.
 *
 * One at a time, newest first, dismissible, and it stays out of the way of the
 * other two things that float. Measured on a 390px screen before this: the
 * toast covered the assistant bubble AND sat on top of Save trip and Plan
 * another.
 *
 * Two rules keep it clear, because one is not enough:
 *   - it sits high enough to clear the trip page's fixed action bar, and parks
 *     on the side opposite the assistant;
 *   - on a narrow screen it announces itself, and the assistant's bubble stands
 *     down while it is up. Side-swapping is meaningless at 375px, where the
 *     toast is 352px wide and spans almost the whole viewport — so the honest
 *     fix is one floating thing at a time.
 */

/** Fired while a toast is on screen, so the assistant can stay out of its way. */
export const TOAST_VISIBILITY_EVENT = 'tripme:toast-visibility';

function announceToast(visible: boolean): void {
  try {
    window.dispatchEvent(new CustomEvent(TOAST_VISIBILITY_EVENT, { detail: { visible } }));
  } catch {
    /* ignore */
  }
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collectReminders, groupReminders, KIND_ICON, markRead, type AppReminder } from '@/lib/reminders';
import { listTrips, setCurrentTrip, TRIPS_CHANGED_EVENT } from '@/lib/storage';

const TICK_MS = 30_000;

/** The edge the assistant is parked on, so the toast can take the other one. */
function assistantSide(): 'left' | 'right' {
  try {
    const raw = localStorage.getItem('tripme.assistant.pos');
    if (raw) {
      const parsed = JSON.parse(raw) as { side?: string };
      if (parsed?.side === 'left' || parsed?.side === 'right') return parsed.side;
    }
  } catch {
    /* default below */
  }
  return 'right';
}

export function ReminderToast() {
  const router = useRouter();
  const [toast, setToast] = useState<AppReminder | null>(null);
  const [side, setSide] = useState<'left' | 'right'>('left');
  /** Everything already due when this session began — deliberately not shown. */
  const seen = useRef<Set<string> | null>(null);

  const check = useCallback(() => {
    const all = collectReminders();
    const due = groupReminders(all, new Date()).due;

    if (seen.current === null) {
      seen.current = new Set(due.map((r) => r.id));
      return; // first pass only establishes the baseline
    }

    const fresh = due.find((r) => !seen.current!.has(r.id));
    if (fresh) {
      seen.current.add(fresh.id);
      // Read the assistant's corner at the moment of showing, not at mount —
      // it can be dragged to the other side in between.
      setSide(assistantSide() === 'left' ? 'right' : 'left');
      setToast(fresh);
      announceToast(true);
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, TICK_MS);
    window.addEventListener(TRIPS_CHANGED_EVENT, check);
    return () => {
      clearInterval(timer);
      window.removeEventListener(TRIPS_CHANGED_EVENT, check);
    };
  }, [check]);

  if (!toast) return null;

  const dismiss = () => {
    announceToast(false);
    setToast(null);
  };

  const open = () => {
    markRead(toast.id);
    announceToast(false);
    const saved = listTrips().find((t) => (t.state?.tripId ?? t.id) === toast.tripId);
    if (saved) setCurrentTrip(saved.state);
    setToast(null);
    router.push('/trip');
  };

  return (
    <div
      role="status"
      aria-live="polite"
      data-no-translate
      className={`no-print fixed bottom-28 z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden ${
        side === 'left' ? 'left-4' : 'right-4'
      }`}
    >
      <div className="flex gap-3 p-4">
        <span className="text-xl leading-none mt-0.5" aria-hidden="true">
          {KIND_ICON[toast.kind]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-sm leading-tight">{toast.title}</div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{toast.body}</p>
          <div className="text-[10px] text-muted-foreground mt-1.5">{toast.tripName}</div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={open}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
            >
              Open trip
            </button>
            <button
              onClick={() => {
                markRead(toast.id);
                dismiss();
              }}
              className="px-3.5 py-1.5 rounded-lg border border-input text-xs font-semibold hover:bg-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Close reminder"
          className="text-muted-foreground hover:text-foreground self-start"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
