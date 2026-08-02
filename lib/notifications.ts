/**
 * Turning the Notification Agent's schedule into notifications that actually fire.
 *
 * The agent writes reminders for people — `whenLabel: "Day 1, 6:00 AM"` — which
 * is the right thing to show and useless to a timer. This parses those back into
 * real times, anchored to the trip's start date.
 *
 * What this can and cannot do, stated plainly because the product says so too:
 * a web page can raise a notification while it is open, and that is what happens
 * here. Delivering a reminder at 6am three weeks from now, with the tab closed,
 * needs a push server and a service worker subscription — real infrastructure,
 * not free, and honestly out of scope for this MVP. So reminders due while the
 * app is open fire for real; the rest are shown with their exact times and
 * labelled as not yet deliverable, rather than pretended.
 */

import type { ReminderItem } from '@/lib/types';

/** setTimeout overflows past ~24.8 days and fires immediately — never schedule beyond this. */
const MAX_TIMEOUT_MS = 20 * 24 * 60 * 60 * 1000;

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

export function notificationSupport(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as PermissionState;
}

export async function requestPermission(): Promise<PermissionState> {
  if (notificationSupport() === 'unsupported') return 'unsupported';
  try {
    return (await Notification.requestPermission()) as PermissionState;
  } catch {
    return 'denied';
  }
}

export function notify(title: string, body: string): boolean {
  if (notificationSupport() !== 'granted') return false;
  try {
    new Notification(title, { body, icon: '/icon.svg', badge: '/icon.svg' });
    return true;
  } catch {
    return false;
  }
}

/**
 * "Day 2, 6:00 AM" + a start date -> a real Date.
 *
 * Deliberately forgiving: the agent writes prose, and a reminder we cannot time
 * is still worth showing. Returns null rather than guessing when the day number
 * is missing, because a reminder on the wrong day is worse than an untimed one.
 */
export function reminderTime(reminder: ReminderItem, startDateISO: string): Date | null {
  const label = reminder.whenLabel ?? '';
  const dayMatch = label.match(/day\s*(\d+)/i);
  if (!dayMatch) return null;

  const dayOffset = Math.max(0, parseInt(dayMatch[1], 10) - 1);
  const base = new Date(`${startDateISO}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setDate(base.getDate() + dayOffset);

  const timeMatch = label.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10) % 12;
    if (/pm/i.test(timeMatch[3])) hour += 12;
    base.setHours(hour, timeMatch[2] ? parseInt(timeMatch[2], 10) : 0, 0, 0);
  } else {
    const h24 = label.match(/(\d{1,2}):(\d{2})/);
    if (h24) base.setHours(parseInt(h24[1], 10), parseInt(h24[2], 10), 0, 0);
    else base.setHours(9, 0, 0, 0); // a sensible morning default, not a guess at intent
  }
  return base;
}

export interface ScheduledReminder {
  reminder: ReminderItem;
  at: Date | null;
  /** Already passed — shown struck through rather than silently dropped. */
  past: boolean;
  /** Close enough that this session can genuinely deliver it. */
  deliverable: boolean;
}

export function scheduleView(reminders: ReminderItem[], startDateISO: string, now = new Date()): ScheduledReminder[] {
  return reminders.map((reminder) => {
    const at = reminderTime(reminder, startDateISO);
    if (!at) return { reminder, at: null, past: false, deliverable: false };
    const delta = at.getTime() - now.getTime();
    return {
      reminder,
      at,
      past: delta < 0,
      deliverable: delta >= 0 && delta <= MAX_TIMEOUT_MS,
    };
  });
}

/**
 * Arm every reminder this session can reach. Returns a cancel function.
 *
 * Timers die with the page, which is the honest limit of doing this without a
 * push server — so this is called again on every load of a confirmed trip.
 */
export function armReminders(
  reminders: ReminderItem[],
  startDateISO: string,
  destination: string,
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  for (const item of scheduleView(reminders, startDateISO)) {
    if (!item.deliverable || !item.at) continue;
    const delay = item.at.getTime() - Date.now();
    timers.push(
      setTimeout(() => {
        notify(`${item.reminder.title} · ${destination}`, item.reminder.body);
      }, delay),
    );
  }
  return () => timers.forEach(clearTimeout);
}

export function fmtWhen(at: Date | null): string {
  if (!at) return 'Time not set';
  return at.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
