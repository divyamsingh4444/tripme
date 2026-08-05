'use client';

/**
 * "Email me this trip" — a snapshot sent on demand to the address you signed
 * in with.
 *
 * It hides itself entirely when email is not configured on the deployment,
 * the same rule the account control follows: a button that cannot work is a
 * worse first impression than no button.
 *
 * The copy is careful about one thing. This is a snapshot someone asked for,
 * NOT a scheduled reminder — the server does not hold your trips, so it cannot
 * send anything at a particular time. Implying otherwise would be the easiest
 * lie in the product to tell by accident.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { applyChoices, itineraryWithEdits } from '@/lib/recompute';
import { fmtWhen, scheduleView } from '@/lib/notifications';
import { addDays, fmtDate } from '@/lib/storage';
import type { TripState } from '@/lib/types';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function EmailTripButton({ state }: { state: TripState }) {
  const { data: session } = useSession();
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/email-trip')
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (!cancelled) setAvailable(Boolean(b?.configured));
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!available || !session?.user?.email) return null;

  const send = async () => {
    setStatus('sending');
    setMessage('');
    const money = applyChoices(state);
    const itinerary = itineraryWithEdits(state.itinerary, state.choices);
    const endDate = addDays(state.input.startDate, Math.max(0, state.input.durationDays - 1));

    const trip = {
      destination: state.destination.selected.name,
      region: state.destination.selected.region,
      originCity: state.input.originCity,
      startDate: fmtDate(state.input.startDate),
      endDate: fmtDate(endDate),
      durationDays: state.input.durationDays,
      travellers: state.input.travelers,
      budgetINR: state.input.budgetTotalINR,
      committedINR: money.totalCommittedINR,
      bookings: money.bookings.map((b) => ({ title: b.title, detail: b.detail, amountINR: b.amountINR })),
      days: itinerary.days.map((d) => ({
        day: d.day,
        theme: d.theme,
        morning: d.morning.activity,
        afternoon: d.afternoon.activity,
        evening: d.evening.activity,
      })),
      reminders: scheduleView(state.notification?.reminders ?? [], state.input.startDate).map((s) => ({
        title: s.reminder.title,
        body: s.reminder.body,
        when: fmtWhen(s.at),
      })),
      packingTips: itinerary.packingTips,
    };

    try {
      const res = await fetch('/api/email-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip }),
      });
      const body = await res.json().catch(() => null);

      if (res.ok && body?.ok) {
        setStatus('sent');
        setMessage(`Sent to ${body.to}.`);
        return;
      }

      setStatus('error');
      if (body?.error === 'demo_account') {
        setMessage('The shared demo account has no real inbox. Sign in with Google to email yourself a copy.');
      } else if (body?.error === 'sandbox_restricted') {
        setMessage(
          `Our email provider is still in test mode, so it will only deliver to the address the project owner registered — not ${body.to}. Verifying a domain lifts that.`,
        );
      } else if (body?.error === 'not_signed_in') {
        setMessage('Sign in first so we know where to send it.');
      } else {
        setMessage('That did not send. Your trip is untouched — the reminders in the bell still work.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not reach the mail service. Your trip is untouched.');
    }
  };

  return (
    <div className="mt-4 no-print">
      <button
        onClick={send}
        disabled={status === 'sending'}
        className="px-5 py-2.5 rounded-xl border-2 border-input font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : status === 'sent' ? '✓ Emailed to you' : '✉ Email me this trip'}
      </button>
      <p className={`text-xs mt-2 leading-relaxed ${status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
        {message ||
          `A copy of the plan and its reminder schedule, sent to ${session.user.email} now. It is a snapshot you asked for — reminders themselves arrive in the bell, not by email.`}
      </p>
    </div>
  );
}
