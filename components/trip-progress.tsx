'use client';

/**
 * What happens next with this plan, and what is already done.
 *
 * This exists because of a real complaint: "I don't see any of the changes."
 * Every step below was built and deployed, and none of it was visible, because
 * each one only appears once the previous one is finished — sign in, then
 * approve every booking, then confirm, and only then do reminders and the
 * email option exist at all. Walk the whole chain and it works; look at the
 * page and it appears unchanged.
 *
 * A gate that hides what is behind it is indistinguishable from a feature that
 * was never built. So the sequence is now stated up front: four steps, where
 * you are, and what each one unlocks — visible from the moment a plan exists.
 */

import { useSession } from 'next-auth/react';
import { hasChoices } from '@/lib/recompute';
import type { TripState } from '@/lib/types';

interface Props {
  state: TripState;
  totalBookings: number;
  approvedCount: number;
}

type StepState = 'done' | 'current' | 'todo';

export function TripProgress({ state, totalBookings, approvedCount }: Props) {
  const { data: session } = useSession();
  const confirmed = state.status === 'confirmed';
  const remindersOn = state.notificationsEnabled === true;
  const allApproved = totalBookings > 0 && approvedCount === totalBookings;
  const adjusted = hasChoices(state.choices) || Boolean(state.options);

  const steps: { key: string; label: string; detail: string; state: StepState; href: string }[] = [
    {
      key: 'adjust',
      label: 'Adjust',
      detail: adjusted ? 'You have looked at the alternatives' : 'Change travel, stay or any day — optional',
      state: adjusted ? 'done' : confirmed ? 'done' : 'current',
      href: '#trip-choices',
    },
    {
      key: 'approve',
      label: 'Approve',
      detail: allApproved
        ? `All ${totalBookings} bookings approved`
        : `${totalBookings - approvedCount} of ${totalBookings} still need you`,
      state: allApproved ? 'done' : 'current',
      href: '#trip-bookings',
    },
    {
      key: 'confirm',
      label: 'Confirm',
      detail: confirmed
        ? 'This trip is confirmed'
        : allApproved
          ? session?.user
            ? 'Say you are going — this locks the plan'
            : 'Sign in, then say you are going'
          : 'Unlocks once the bookings are approved',
      state: confirmed ? 'done' : allApproved ? 'current' : 'todo',
      href: '#trip-confirm',
    },
    {
      key: 'remind',
      label: 'Reminders',
      detail: !confirmed
        ? 'Available once the trip is confirmed'
        : remindersOn
          ? 'On — check the bell in the navigation'
          : 'Switch on departure, check-in and daily reminders',
      state: remindersOn ? 'done' : confirmed ? 'current' : 'todo',
      href: '#trip-confirm',
    },
  ];

  return (
    <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 no-print">
      <h2 className="font-display text-xl font-bold">What happens next</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-2xl">
        The agents have made their first call. These four steps are yours — and they run in this order
        because confirming switches on reminders built from the bookings you actually agreed to.
      </p>

      <ol className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <li key={step.key}>
            <a
              href={step.href}
              className={`block h-full rounded-2xl border-2 p-4 transition-colors ${
                step.state === 'current'
                  ? 'border-primary bg-secondary/40'
                  : step.state === 'done'
                    ? 'border-border bg-muted/40'
                    : 'border-dashed border-input opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold shrink-0 ${
                    step.state === 'done'
                      ? 'bg-primary text-primary-foreground'
                      : step.state === 'current'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  aria-hidden="true"
                >
                  {step.state === 'done' ? '✓' : i + 1}
                </span>
                <span className="font-display font-bold text-sm">{step.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.detail}</p>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
