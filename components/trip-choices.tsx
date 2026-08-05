'use client';

/**
 * The part of the plan the traveller gets to argue with.
 *
 * Everything up to here was decided by agents. This is where a person overrides
 * them — how they travel, where they sleep, what they do each day — and sees the
 * money move as they do. The recomputation is deterministic (lib/recompute.ts):
 * the model produced the menu, code prices the choice.
 *
 * Options are fetched the first time someone asks, not with every plan. Most
 * travellers never open this, and a spare agent call on every run is exactly
 * what emptied the daily quota before.
 */

import { useRef, useState } from 'react';
import { buildPayload, runAgent, type PipelineContext } from '@/lib/agents-client';
import { applyChoices, itineraryWithEdits, slotKey, type SlotName } from '@/lib/recompute';
import { fmtINR } from '@/lib/storage';
import type { StayOption, TransportOption, TripOptions, TripState } from '@/lib/types';

const SLOTS: SlotName[] = ['morning', 'afternoon', 'evening'];
const SLOT_LABEL: Record<SlotName, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

const TIER_LABEL: Record<StayOption['tier'], string> = {
  budget: 'Budget',
  comfort: 'Comfort',
  premium: 'Premium',
};

interface Props {
  state: TripState;
  onChange: (next: TripState) => void;
  /** Choices are locked once the traveller has committed to going. */
  locked: boolean;
}

export function TripChoices({ state, onChange, locked }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  const options = state.options;
  const choices = state.choices ?? {};
  const money = applyChoices(state);
  const nights = Math.max(1, state.input.durationDays - 1);
  const editedItinerary = itineraryWithEdits(state.itinerary, choices);

  const loadOptions = async () => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const ctx: PipelineContext = {
        input: state.input,
        mood: state.mood,
        destination: state.destination,
        budget: state.budget,
      };
      const fetched = await runAgent<TripOptions>('options', buildPayload('options', ctx));
      onChange({ ...state, options: fetched });
    } catch {
      setError('Could not load alternatives right now — your plan is untouched. Try again in a moment.');
    } finally {
      setLoading(false);
      busy.current = false;
    }
  };

  const setChoice = (patch: Partial<typeof choices>) => {
    onChange({ ...state, choices: { ...choices, ...patch } });
  };

  const editSlot = (day: number, slot: SlotName, activity: string, cost: number, cleared?: boolean) => {
    const key = slotKey(day, slot);
    const nextEdits = { ...(choices.slotEdits ?? {}) };
    nextEdits[key] = { activity, approxCostINR: cost, cleared };
    setChoice({ slotEdits: nextEdits });
  };

  const resetSlot = (day: number, slot: SlotName) => {
    const nextEdits = { ...(choices.slotEdits ?? {}) };
    delete nextEdits[slotKey(day, slot)];
    setChoice({ slotEdits: nextEdits });
  };

  if (!options) {
    return (
      <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 no-print">
        <h2 id="trip-choices" className="scroll-mt-28 font-display text-xl font-bold">Not quite right? Change it</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          The agents made a first call on how you travel and where you stay. You get the final one — and the
          budget, the approvals and any policy checks update as you choose.
        </p>
        <button
          onClick={loadOptions}
          disabled={loading || locked}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-60"
        >
          {loading ? 'Finding alternatives…' : 'Show me the alternatives'}
        </button>
        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      </section>
    );
  }

  return (
    <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 no-print">
      <h2 id="trip-choices" className="scroll-mt-28 font-display text-xl font-bold">Your call</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Every change below re-prices the trip in code, not by asking the model again — so the totals stay
        honest.
      </p>

      {/* ---------- Getting there ---------- */}
      <h3 className="font-display font-semibold mt-6 mb-2">How you get there</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        {options.transport.map((t: TransportOption) => {
          const active = choices.transportId === t.id;
          return (
            <button
              key={t.id}
              disabled={locked}
              onClick={() => setChoice({ transportId: active ? undefined : t.id })}
              aria-pressed={active}
              className={`text-left rounded-2xl border-2 p-4 transition-colors disabled:opacity-60 ${
                active ? 'border-primary bg-secondary/40' : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-sm">{t.mode}</span>
                <span className="font-mono text-sm">{fmtINR(t.amountINR)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t.durationLabel}</div>
              <p className="text-xs mt-2 leading-relaxed">{t.comfortNote}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">Best for {t.bestFor}</p>
            </button>
          );
        })}
      </div>

      {/* ---------- Where you stay ---------- */}
      <h3 className="font-display font-semibold mt-6 mb-2">Where you stay</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        {options.stays.map((s: StayOption) => {
          const active = choices.stayId === s.id;
          const cap = state.input.corporate?.hotelCapPerNightINR;
          const breaches = Boolean(cap && s.perNightINR > cap);
          return (
            <button
              key={s.id}
              disabled={locked}
              onClick={() => setChoice({ stayId: active ? undefined : s.id })}
              aria-pressed={active}
              className={`text-left rounded-2xl border-2 p-4 transition-colors disabled:opacity-60 ${
                active ? 'border-primary bg-secondary/40' : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-sm">{TIER_LABEL[s.tier]}</span>
                <span className="font-mono text-sm">{fmtINR(s.perNightINR)}<span className="text-muted-foreground">/night</span></span>
              </div>
              <div className="text-xs mt-1">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.area}</div>
              <p className="text-xs mt-2 leading-relaxed">{s.note}</p>
              <div className="text-[11px] text-muted-foreground mt-1.5">{fmtINR(s.perNightINR * nights)} for {nights} night{nights === 1 ? '' : 's'}</div>
              {breaches && (
                <div className="text-[11px] text-destructive font-medium mt-1.5">⚠ Over your travel policy cap</div>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------- What you do ---------- */}
      <h3 className="font-display font-semibold mt-6 mb-2">What you actually do</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Swap a slot for the Itinerary Agent&apos;s own alternative, or clear it and keep the time free.
      </p>
      <div className="space-y-3">
        {editedItinerary.days.map((day) => (
          <div key={day.day} className="rounded-2xl border border-border p-4">
            <div className="font-semibold text-sm mb-2">
              Day {day.day} · <span className="font-normal text-muted-foreground">{day.theme}</span>
            </div>
            <div className="space-y-2">
              {SLOTS.map((slot) => {
                const edited = choices.slotEdits?.[slotKey(day.day, slot)];
                const original = state.itinerary.days.find((d) => d.day === day.day)?.[slot];
                return (
                  <div key={slot} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                    <span className="w-20 shrink-0 text-xs text-muted-foreground">{SLOT_LABEL[slot]}</span>
                    <span className={`flex-1 min-w-[12rem] ${edited?.cleared ? 'italic text-muted-foreground' : ''}`}>
                      {day[slot].activity}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{fmtINR(day[slot].approxCostINR)}</span>
                    {!locked && (
                      <span className="flex gap-2">
                        {edited ? (
                          <button
                            onClick={() => resetSlot(day.day, slot)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Undo
                          </button>
                        ) : (
                          <>
                            {day.swapIfNeeded && (
                              <button
                                onClick={() => editSlot(day.day, slot, day.swapIfNeeded, original?.approxCostINR ?? 0)}
                                className="text-xs font-medium text-primary hover:underline"
                                title={day.swapIfNeeded}
                              >
                                Swap
                              </button>
                            )}
                            <button
                              onClick={() => editSlot(day.day, slot, '', 0, true)}
                              className="text-xs font-medium text-muted-foreground hover:underline"
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- What it now costs ---------- */}
      <div className="mt-6 rounded-2xl bg-secondary/40 border border-secondary p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-display font-semibold">After your changes</span>
          <span className="font-mono text-sm">
            {fmtINR(money.totalCommittedINR)} committed ·{' '}
            <span className={money.overBudget ? 'text-destructive font-semibold' : ''}>
              {money.overBudget
                ? `${fmtINR(money.overspendINR)} over budget`
                : `${fmtINR(money.remainingBudgetINR)} left`}
            </span>
          </span>
        </div>
        {money.overBudget && (
          <p className="text-sm text-destructive mt-2">
            That is more than your {fmtINR(state.input.budgetTotalINR)} budget. Nothing stops you — but the
            Budget Agent planned around that number, so something else has to give.
          </p>
        )}
        {money.policyBreaches.map((breach, i) => (
          <p key={i} className="text-sm text-destructive mt-2">⚠ {breach}</p>
        ))}
      </div>

      {locked && (
        <p className="text-xs text-muted-foreground mt-4">
          This trip is confirmed, so the plan is locked. Unconfirm it above if you need to change something.
        </p>
      )}
    </section>
  );
}
