'use client';

/**
 * The sticky summary beside a trip.
 *
 * It exists because the trip page is long — hero, reasoning, budget, arbitration,
 * day-by-day, bookings, phrasebook, choices, confirmation — and by the time you
 * are reading day four you have lost sight of what the whole thing costs and how
 * much of it you have approved. Those two numbers, plus a way back to any
 * section, are what people scroll up for.
 *
 * It is also what earns the page its width: rather than stretching prose across
 * a desktop screen, the recovered space carries something worth reading.
 */

import { fmtDate, fmtINR } from '@/lib/storage';
import type { MoneyView } from '@/lib/recompute';
import type { TripState } from '@/lib/types';

const SECTIONS = [
  { id: 'trip-budget', label: 'Budget' },
  { id: 'trip-itinerary', label: 'Day by day' },
  { id: 'trip-bookings', label: 'Bookings' },
  { id: 'trip-choices', label: 'Change something' },
];

export function TripRail({
  state,
  money,
  approvedTotal,
}: {
  state: TripState;
  money: MoneyView;
  approvedTotal: number;
}) {
  const { input, destination } = state;
  const total = input.budgetTotalINR;
  const committedPct = total > 0 ? Math.min(100, (money.totalCommittedINR / total) * 100) : 0;
  const approvedPct = total > 0 ? Math.min(100, (approvedTotal / total) * 100) : 0;
  const confirmed = state.status === 'confirmed';

  return (
    <aside className="hidden xl:block sticky top-28 no-print">
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${confirmed ? 'bg-primary' : 'bg-muted-foreground/40'}`}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {confirmed ? 'Confirmed' : 'Draft plan'}
          </span>
        </div>

        <h2 className="font-display font-extrabold text-lg mt-1.5 leading-tight">
          {destination.selected.name}
        </h2>
        <p className="text-xs text-muted-foreground">{destination.selected.region}</p>

        <dl className="mt-4 space-y-2 text-sm">
          {[
            ['Dates', `${fmtDate(input.startDate)} · ${input.durationDays}d`],
            ['From', input.originCity],
            ['Travelling', `${input.travelers} ${input.travelers === 1 ? 'person' : 'people'}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground text-xs uppercase tracking-wide shrink-0">{label}</dt>
              <dd className="font-medium text-right text-[13px]">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Money, the thing worth keeping on screen the whole way down. */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Budget</span>
            <span className="font-mono font-semibold text-sm">{fmtINR(total)}</span>
          </div>

          <div className="mt-2.5 h-2 rounded-full bg-muted overflow-hidden relative" role="presentation">
            <div className="absolute inset-y-0 left-0 bg-secondary" style={{ width: `${committedPct}%` }} />
            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${approvedPct}%` }} />
          </div>

          <ul className="mt-2.5 space-y-1 text-xs">
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-sm bg-primary" aria-hidden="true" /> Approved
              </span>
              <span className="font-mono">{fmtINR(approvedTotal)}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-sm bg-secondary" aria-hidden="true" /> Committed
              </span>
              <span className="font-mono">{fmtINR(money.totalCommittedINR)}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {money.overBudget ? 'Over budget' : 'Unspent'}
              </span>
              <span className={`font-mono ${money.overBudget ? 'text-destructive font-semibold' : ''}`}>
                {money.overBudget ? fmtINR(money.overspendINR) : fmtINR(Math.max(0, money.remainingBudgetINR))}
              </span>
            </li>
          </ul>
        </div>

        <nav className="mt-4 pt-4 border-t border-border" aria-label="Jump to section">
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block px-2 py-1.5 -mx-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
