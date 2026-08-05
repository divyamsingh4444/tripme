'use client';

/**
 * The moment a plan becomes a trip.
 *
 * Until someone says they are actually going, a reminder schedule is noise —
 * it is telling you to leave for a journey you have not agreed to take. So the
 * reminders live behind this, and confirming is what turns them on.
 *
 * Confirming also locks the plan. Not to be strict, but because reminders that
 * quietly go stale when the itinerary changes underneath them are worse than no
 * reminders. Unconfirming is one click and puts everything back.
 */

import { useEffect, useRef, useState } from 'react';
import {
  armReminders,
  fmtWhen,
  notificationSupport,
  notify,
  requestPermission,
  scheduleView,
  type PermissionState,
} from '@/lib/notifications';
import { useSession } from 'next-auth/react';
import { CHANNEL_NOTE } from '@/lib/notification-copy';
import { buildPayload, runAgent, type PipelineContext } from '@/lib/agents-client';
import { bookingWithChoices, hasChoices, itineraryWithEdits } from '@/lib/recompute';
import { EmailTripButton } from '@/components/email-trip-button';
import { SignInPrompt } from '@/components/sign-in-prompt';
import type { NotificationOutput, TripState } from '@/lib/types';

interface Props {
  state: TripState;
  onChange: (next: TripState) => void;
  /** Bookings the traveller has not signed off yet. */
  unapprovedCount: number;
}

export function TripConfirm({ state, onChange, unapprovedCount }: Props) {
  const { data: session, status } = useSession();
  const [permission, setPermission] = useState<PermissionState>('default');
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const disarm = useRef<(() => void) | null>(null);

  const confirmed = state.status === 'confirmed';
  const remindersOn = state.notificationsEnabled === true;
  const reminders = state.notification?.reminders ?? [];
  const schedule = scheduleView(reminders, state.input.startDate);
  const deliverableCount = schedule.filter((s) => s.deliverable).length;

  useEffect(() => setPermission(notificationSupport()), []);

  /*
   * Re-arm on every load of a confirmed trip. Timers do not survive the page,
   * which is the honest ceiling of scheduling without a push server.
   */
  useEffect(() => {
    disarm.current?.();
    disarm.current = null;
    if (!confirmed || !remindersOn || notificationSupport() !== 'granted') return;
    disarm.current = armReminders(reminders, state.input.startDate, state.destination.selected.name);
    return () => {
      disarm.current?.();
      disarm.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, remindersOn, state.input.startDate, state.destination.selected.name, reminders.length]);

  const confirm = async () => {
    /*
     * Rebuild the schedule when the traveller changed the plan.
     *
     * The Notification Agent ran against the plan as first proposed. Someone who
     * then picked a different hotel was being told to check in at the one they
     * rejected — observed live. Reminders are the one output people act on
     * without re-reading the plan, so they have to describe the trip actually
     * being taken. This is the only agent call the confirm step makes, and only
     * when something was changed.
     */
    // Confirming does NOT switch reminders on — that is a separate, explicit
    // choice below. See TripState.notificationsEnabled for why.
    let next: TripState = { ...state, status: 'confirmed', confirmedAt: Date.now() };
    if (hasChoices(state.choices)) {
      setRebuilding(true);
      try {
        const ctx: PipelineContext = {
          input: state.input,
          mood: state.mood,
          destination: state.destination,
          budget: state.budget,
          itinerary: itineraryWithEdits(state.itinerary, state.choices),
          booking: bookingWithChoices(state),
        };
        const fresh = await runAgent<NotificationOutput>('notification', buildPayload('notification', ctx));
        next = { ...next, notification: fresh };
      } catch {
        // Keep the original schedule rather than losing reminders entirely; the
        // times stay right even if a title names the previous stay.
      } finally {
        setRebuilding(false);
      }
    }

    /*
     * Commit BEFORE asking for permission, and never await the prompt first.
     * The other order meant that an ignored or auto-dismissed browser prompt
     * left the promise unsettled and the trip silently unconfirmed — observed
     * in testing. Going on the trip is the traveller's decision; notifications
     * are a bonus, and a bonus must not be able to block the decision.
     */
    onChange(next);
    setJustConfirmed(true);

  };

  /** Turning reminders on is where the browser permission is actually earned. */
  const enableReminders = async () => {
    onChange({ ...state, notificationsEnabled: true });
    const granted = await requestPermission();
    setPermission(granted);
    if (granted === 'granted') {
      notify(
        `Reminders on — ${state.destination.selected.name}`,
        `${reminders.length} reminders are set. The first is ${schedule[0]?.at ? fmtWhen(schedule[0].at) : 'scheduled'}.`,
      );
    }
  };

  const disableReminders = () => {
    disarm.current?.();
    disarm.current = null;
    onChange({ ...state, notificationsEnabled: false });
  };

  const unconfirm = () => {
    disarm.current?.();
    disarm.current = null;
    setJustConfirmed(false);
    onChange({ ...state, status: 'planned', confirmedAt: undefined });
  };

  if (!confirmed) {
    return (
      <section className="mt-10 bg-card rounded-3xl border-2 border-primary shadow-sm p-6 sm:p-8 no-print">
        <h2 className="font-display text-xl font-bold">Going ahead with this?</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-2xl">
          Confirming locks the plan so it stops changing under you. Reminders stay off until you ask for
          them — you can switch them on for this trip straight afterwards. Nothing is booked for real: this
          is still a demo product.
        </p>

        {/*
          The gate. Planning stayed open all the way to here on purpose — the
          product proves itself before it asks for anything. But a confirmed
          trip has an owner: it carries a reminder schedule addressed to a
          person, so it should not belong to nobody.
        */}
        {status !== 'loading' && !session?.user && (
          <SignInPrompt
            title="Sign in to confirm this trip"
            body="Your plan is safe — it stays in this browser and nothing is lost by signing in. A confirmed trip and its reminders belong to an account."
          />
        )}

        {/*
          Approvals come before confirmation, and the order is not arbitrary:
          confirming switches on a reminder schedule built from these bookings,
          so it must not run ahead of the traveller agreeing to them. Previously
          you could confirm a trip whose every booking was still unapproved.
        */}
        {status !== 'loading' && session?.user && unapprovedCount > 0 && (
          <div className="rounded-2xl border-2 border-dashed border-input bg-muted/40 p-5">
            <h3 className="font-display font-bold">
              {unapprovedCount} booking{unapprovedCount === 1 ? '' : 's'} still need your approval
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
              Your reminders are built from what you have actually agreed to, so approve the bookings first.
              Nothing is really reserved either way — this stays a demo.
            </p>
            <a
              href="#trip-bookings"
              className="inline-block mt-3.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              Review the bookings →
            </a>
          </div>
        )}

        {status !== 'loading' && session?.user && unapprovedCount === 0 && (
        <button
          onClick={confirm}
          disabled={rebuilding}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-95 disabled:opacity-70"
        >
          {rebuilding ? 'Rebuilding your reminders…' : "Yes — I'm going"}
        </button>
        )}
        {session?.user && unapprovedCount === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            You can undo this at any time.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mt-10 bg-card rounded-3xl border-2 border-primary shadow-sm p-6 sm:p-8 print-block">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">
            Trip confirmed{justConfirmed ? ' 🎉' : ''}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {state.destination.selected.name}
            {session?.user?.name ? ` · ${session.user.name}` : ''} ·{' '}
            {remindersOn ? `${reminders.length} reminders on` : 'reminders off'}
          </p>
          {session?.user?.isDemo && (
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed on the shared demo account — fine for trying the product, and worth knowing if you
              are screenshotting this.
            </p>
          )}
        </div>
        <button
          onClick={unconfirm}
          className="text-sm font-medium text-muted-foreground hover:text-foreground underline no-print"
        >
          Unconfirm and edit
        </button>
      </div>

      {/*
        The opt-in. Kept separate from confirming because they are different
        decisions: one says the trip is happening, the other says keep telling
        me about it. Somebody with a dozen saved trips wants reminders for the
        one they are actually taking, not for the eleven that fell through.
      */}
      <div className="mt-5 rounded-2xl border-2 border-border p-5 no-print">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-bold flex items-center gap-2">
              <span aria-hidden="true">{remindersOn ? '🔔' : '🔕'}</span>
              Reminders for this trip
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
              {remindersOn
                ? 'On. These appear in the bell in the navigation whenever you open TripME, and pop up here if one falls due while you are using it.'
                : 'Off. Switch them on and this trip’s schedule shows up in the bell in the navigation — departure, check-in, each activity and every day’s plan.'}
            </p>
          </div>
          <button
            onClick={remindersOn ? disableReminders : enableReminders}
            aria-pressed={remindersOn}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm shrink-0 transition-colors ${
              remindersOn
                ? 'border-2 border-input hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:opacity-95'
            }`}
          >
            {remindersOn ? 'Turn off' : 'Turn on reminders'}
          </button>
        </div>

        <EmailTripButton state={state} />

        {remindersOn && permission !== 'granted' && (
          <div className="mt-4 rounded-xl bg-secondary/50 border border-secondary px-4 py-3 text-sm">
            {permission === 'denied' ? (
              <>
                Your browser is blocking notifications for this site, so reminders appear in the app only —
                in the bell and on this page. Site settings can re-enable them.
              </>
            ) : permission === 'unsupported' ? (
              <>This browser cannot show notifications, so reminders appear in the app only.</>
            ) : (
              <button onClick={enableReminders} className="font-semibold text-primary hover:underline">
                Also allow browser notifications →
              </button>
            )}
          </div>
        )}
      </div>

      <ul className="mt-5 space-y-2.5">
        {schedule.map((item, i) => (
          <li
            key={i}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-2.5 last:border-0"
          >
            <span className="font-semibold text-sm flex-1 min-w-[12rem]">
              {item.reminder.priority === 'high' && <span className="text-destructive mr-1">●</span>}
              {item.reminder.title}
            </span>
            <span className={`font-mono text-xs ${item.past ? 'line-through text-muted-foreground' : ''}`}>
              {fmtWhen(item.at)}
            </span>
            <span className="w-full text-xs text-muted-foreground">{item.reminder.body}</span>
            <span className="w-full text-[11px] text-muted-foreground">
              {CHANNEL_NOTE[item.reminder.channel] ?? item.reminder.channel}
              {item.reminder.forWhom ? ` · ${item.reminder.forWhom}` : ''}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        {deliverableCount > 0
          ? `${deliverableCount} of these can be delivered by this browser while TripME is open. `
          : ''}
        Reminders due when the app is closed, and the SMS and voice channels the agent chose for
        low-connectivity routes, need push and telephony infrastructure — real, and not free. The schedule
        below is what the system would send; delivery over those channels is post-MVP, and we would rather
        say so than pretend.
      </p>
    </section>
  );
}
