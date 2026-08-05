'use client';

/**
 * The part of the plan the traveller gets to argue with.
 *
 * Everything up to here was decided by agents. This is where a person overrides
 * them — how they travel there, how they get around, where they sleep, what
 * they do each day — and sees the money move as they do. The recomputation is
 * deterministic (lib/recompute.ts): the model produced the menu, code prices
 * the choice.
 *
 * On real data, and where the line is drawn:
 *   - the HOTELS and ATTRACTIONS listed here are real, named places pulled from
 *     OpenStreetMap, with photographs from Wikipedia where they exist. A
 *     traveller can look them up, map them, and go.
 *   - the PRICES beside them are estimates, and say so. Live rates come from
 *     paid inventory APIs; nothing free returns them. Printing an invented
 *     number next to a real hotel's name would read as a quote, and that is the
 *     one genuinely dishonest thing available here.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildPayload, runAgent, type PipelineContext } from '@/lib/agents-client';
import { applyChoices, itineraryWithEdits, slotKey, type SlotName } from '@/lib/recompute';
import { fmtINR } from '@/lib/storage';
import type {
  LocalTransportOption,
  RealPlace,
  StayOption,
  TransportOption,
  TripOptions,
  TripState,
} from '@/lib/types';

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

/** Small helper so every price on this panel is visibly an estimate. */
function Estimate({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-sm">
      {children}
      <span className="text-[10px] text-muted-foreground font-sans ml-1">est.</span>
    </span>
  );
}

function PlaceCard({
  place,
  active,
  disabled,
  onPick,
  footer,
}: {
  place: RealPlace;
  active: boolean;
  disabled: boolean;
  onPick: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-colors ${
        active ? 'border-primary bg-secondary/40' : 'border-border'
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onPick}
        aria-pressed={active}
        className="w-full text-left disabled:opacity-60"
      >
        {place.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={place.image} alt="" className="w-full h-28 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-28 bg-secondary/50 flex items-center justify-center text-2xl" aria-hidden="true">
            📍
          </div>
        )}
        <div className="p-3.5">
          <div className="font-semibold text-sm leading-tight">{place.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {[place.category, place.area].filter(Boolean).join(' · ')}
          </div>
          {footer}
        </div>
      </button>
      <div className="px-3.5 pb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        <a
          href={place.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          View on map →
        </a>
        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Website →
          </a>
        )}
        {place.image && <span className="text-muted-foreground">Photo: {place.imageCredit}</span>}
      </div>
    </div>
  );
}

export function TripChoices({ state, onChange, locked }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingReal, setLoadingReal] = useState(false);
  const [error, setError] = useState('');
  const [swapFor, setSwapFor] = useState<string | null>(null);
  const busy = useRef(false);

  const options = state.options;
  const choices = state.choices ?? {};
  const money = applyChoices(state);
  const nights = Math.max(1, state.input.durationDays - 1);
  const editedItinerary = itineraryWithEdits(state.itinerary, choices);
  const dest = state.destination.selected;

  /*
   * Real places load in the background once the options panel is open. They are
   * a bonus on top of a plan that already works, so nothing waits on them and
   * an empty result is not an error — Overpass is a free shared service and is
   * regularly too busy to answer.
   */
  const loadRealPlaces = useCallback(async (force = false) => {
    if (!force && state.realStays && state.realActivities) return;
    setLoadingReal(true);
    const q = (kind: string) =>
      `/api/nearby?kind=${kind}&place=${encodeURIComponent(dest.name)}&region=${encodeURIComponent(dest.region ?? '')}`;
    try {
      const [stays, activities] = await Promise.all([
        fetch(q('stay')).then((r) => r.json()).catch(() => null),
        fetch(q('activity')).then((r) => r.json()).catch(() => null),
      ]);
      onChange({
        ...state,
        realStays: stays?.data ?? [],
        realActivities: activities?.data ?? [],
      });
    } finally {
      setLoadingReal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dest.name, dest.region]);

  useEffect(() => {
    if (options && !state.realStays) void loadRealPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

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
    const nextEdits = { ...(choices.slotEdits ?? {}) };
    nextEdits[slotKey(day, slot)] = { activity, approxCostINR: cost, cleared };
    setChoice({ slotEdits: nextEdits });
    setSwapFor(null);
  };

  const resetSlot = (day: number, slot: SlotName) => {
    const nextEdits = { ...(choices.slotEdits ?? {}) };
    delete nextEdits[slotKey(day, slot)];
    setChoice({ slotEdits: nextEdits });
  };

  if (!options) {
    return (
      <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 no-print">
        <h2 id="trip-choices" className="scroll-mt-28 font-display text-xl font-bold">
          Not quite right? Change it
        </h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-2xl">
          The agents made a first call on how you travel and where you stay. You get the final one — and the
          budget, the approvals and any policy checks update as you choose. We will also pull real hotels and
          places to visit near {dest.name}.
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

  const realStays = state.realStays ?? [];
  const realActivities = state.realActivities ?? [];

  return (
    <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 no-print">
      <h2 id="trip-choices" className="scroll-mt-28 font-display text-xl font-bold">
        Your call
      </h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
        Every change re-prices the trip in code, not by asking the model again — so the totals stay honest.
        Hotels and places below are real listings from OpenStreetMap; the prices beside them are estimates,
        because live rates are not available for free.
      </p>

      {/* ---------- 1 · Getting there and back ---------- */}
      <h3 className="font-display font-semibold mt-7 mb-1">1 · Getting there and back</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Return journey for all {state.input.travelers}{' '}
        {state.input.travelers === 1 ? 'traveller' : 'travellers'}, {state.input.originCity} ↔ {dest.name}.
      </p>
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
                <Estimate>{fmtINR(t.amountINR)}</Estimate>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t.durationLabel} each way</div>
              <p className="text-xs mt-2 leading-relaxed">{t.comfortNote}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">Best for {t.bestFor}</p>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Booking for real?{' '}
        <a
          className="text-primary font-medium hover:underline"
          href={`https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${state.input.originCity} to ${dest.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Check live fares on Google Flights →
        </a>
      </p>

      {/* ---------- 2 · Getting around ---------- */}
      {options.localTransport && options.localTransport.length > 0 && (
        <>
          <h3 className="font-display font-semibold mt-7 mb-1">2 · Getting around while you are there</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Charged per day across {state.input.durationDays} days, and added as its own line on the budget.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {options.localTransport.map((l: LocalTransportOption) => {
              const active = choices.localTransportId === l.id;
              return (
                <button
                  key={l.id}
                  disabled={locked}
                  onClick={() => setChoice({ localTransportId: active ? undefined : l.id })}
                  aria-pressed={active}
                  className={`text-left rounded-2xl border-2 p-4 transition-colors disabled:opacity-60 ${
                    active ? 'border-primary bg-secondary/40' : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm">{l.mode}</span>
                    <Estimate>{fmtINR(l.perDayINR)}/day</Estimate>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {fmtINR(l.perDayINR * state.input.durationDays)} for the trip
                  </div>
                  <p className="text-xs mt-2 leading-relaxed">{l.note}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">Best for {l.bestFor}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- 3 · Where you stay ---------- */}
      <h3 className="font-display font-semibold mt-7 mb-1">3 · Where you stay</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Pick a comfort level, or choose a real hotel near {dest.name} below.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {options.stays.map((s: StayOption) => {
          const active = choices.stayId === s.id && !choices.realStayId;
          const cap = state.input.corporate?.hotelCapPerNightINR;
          const breaches = Boolean(cap && s.perNightINR > cap);
          return (
            <button
              key={s.id}
              disabled={locked}
              onClick={() => setChoice({ stayId: active ? undefined : s.id, realStayId: undefined })}
              aria-pressed={active}
              className={`text-left rounded-2xl border-2 p-4 transition-colors disabled:opacity-60 ${
                active ? 'border-primary bg-secondary/40' : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-sm">{TIER_LABEL[s.tier]}</span>
                <Estimate>{fmtINR(s.perNightINR)}/night</Estimate>
              </div>
              <div className="text-xs mt-1">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.area}</div>
              <p className="text-xs mt-2 leading-relaxed">{s.note}</p>
              <div className="text-[11px] text-muted-foreground mt-1.5">
                {fmtINR(s.perNightINR * nights)} for {nights} night{nights === 1 ? '' : 's'}
              </div>
              {breaches && (
                <div className="text-[11px] text-destructive font-medium mt-1.5">⚠ Over your travel policy cap</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Real hotels */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
          <h4 className="font-semibold text-sm">Real hotels near {dest.name}</h4>
          <span className="text-[11px] text-muted-foreground">
            {loadingReal ? 'Looking these up…' : `from OpenStreetMap · nightly rate is our estimate, not theirs`}
          </span>
        </div>
        {realStays.length > 0 ? (
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {realStays.slice(0, 8).map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                active={choices.realStayId === place.id}
                disabled={locked}
                onPick={() =>
                  setChoice({
                    realStayId: choices.realStayId === place.id ? undefined : place.id,
                    stayId: choices.realStayId === place.id ? choices.stayId : choices.stayId ?? options.stays[1]?.id,
                  })
                }
              />
            ))}
          </div>
        ) : (
          !loadingReal && (
            <p className="text-xs text-muted-foreground">
              No mapped hotels came back for {dest.name} just now — the free places service is shared and
              frequently busy. The comfort levels above still work.{' '}
              <button onClick={() => void loadRealPlaces(true)} className="text-primary font-medium hover:underline">
                Try again →
              </button>
            </p>
          )
        )}
      </div>

      {/* ---------- 4 · What you do ---------- */}
      <h3 className="font-display font-semibold mt-7 mb-1">4 · What you actually do</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Swap any slot for a real place nearby, take the Itinerary Agent&apos;s own alternative, or clear it and
        keep the time free.
      </p>
      <div className="space-y-3">
        {editedItinerary.days.map((day) => (
          <div key={day.day} className="rounded-2xl border border-border p-4">
            <div className="font-semibold text-sm mb-2">
              Day {day.day} · <span className="font-normal text-muted-foreground">{day.theme}</span>
            </div>
            <div className="space-y-2">
              {SLOTS.map((slot) => {
                const key = slotKey(day.day, slot);
                const edited = choices.slotEdits?.[key];
                const original = state.itinerary.days.find((d) => d.day === day.day)?.[slot];
                return (
                  <div key={slot}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                      <span className="w-20 shrink-0 text-xs text-muted-foreground">{SLOT_LABEL[slot]}</span>
                      <span className={`flex-1 min-w-[12rem] ${edited?.cleared ? 'italic text-muted-foreground' : ''}`}>
                        {day[slot].activity}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{fmtINR(day[slot].approxCostINR)}</span>
                      {!locked && (
                        <span className="flex gap-2">
                          {edited ? (
                            <button onClick={() => resetSlot(day.day, slot)} className="text-xs font-medium text-primary hover:underline">
                              Undo
                            </button>
                          ) : (
                            <>
                              {realActivities.length > 0 && (
                                <button
                                  onClick={() => setSwapFor(swapFor === key ? null : key)}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  {swapFor === key ? 'Close' : 'Nearby places'}
                                </button>
                              )}
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

                    {swapFor === key && (
                      <div className="mt-2 grid sm:grid-cols-3 xl:grid-cols-4 gap-2.5 pb-2">
                        {realActivities.slice(0, 8).map((place) => (
                          <PlaceCard
                            key={place.id}
                            place={place}
                            active={false}
                            disabled={locked}
                            onPick={() =>
                              editSlot(day.day, slot, `${place.name} (${place.category})`, original?.approxCostINR ?? 0)
                            }
                          />
                        ))}
                      </div>
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
