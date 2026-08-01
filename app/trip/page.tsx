'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  activitiesLink,
  bookingRef,
  buildPayload,
  computeSplit,
  flightsLink,
  hotelLink,
  MODE_LABEL,
  runAgent,
  selectedFromAlternate,
  sleep,
  type PipelineContext,
} from '@/lib/agents-client';
import type {
  BookingItem,
  BookingOutput,
  BudgetOutput,
  DestinationOutput,
  ItineraryOutput,
  TripState,
} from '@/lib/types';
import { addDays, fmtDate, fmtINR, getCurrentTrip, saveTrip, setCurrentTrip } from '@/lib/storage';

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#14453D',
  stay: '#2E6B5E',
  food: '#FFB52E',
  activities: '#CFE6E0',
  buffer: '#8FB5AA',
};

const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  stay: 'Stay',
  food: 'Food',
  activities: 'Activities',
  buffer: 'Buffer',
};

const CHANNEL_ICON: Record<string, string> = {
  push: '📱',
  sms: '💬',
  voice: '📞',
  calendar: '📆',
  email: '✉️',
};

function linkFor(item: BookingItem, state: TripState): string {
  const dest = state.destination.selected.name;
  const start = state.input.startDate;
  const end = addDays(start, Math.max(1, state.input.durationDays - 1));
  if (item.type === 'transport') return flightsLink(state.input.originCity, dest, start);
  if (item.type === 'stay') return hotelLink(dest, start, end, state.input.travelers);
  return activitiesLink(dest);
}

export default function TripPage() {
  const router = useRouter();
  const [state, setState] = useState<TripState | null>(null);
  const [missing, setMissing] = useState(false);
  const [approved, setApproved] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<'idle' | 'saved' | 'failed'>('idle');
  const [showAlternates, setShowAlternates] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState('');
  const [showLog, setShowLog] = useState(false);
  const [chosenResolution, setChosenResolution] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const switchBusy = useRef(false);

  useEffect(() => {
    const t = getCurrentTrip();
    if (t) setState(t);
    else setMissing(true);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const split = useMemo(
    () => (state ? computeSplit(state, approved) : []),
    [state, approved],
  );

  if (missing) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium">No trip loaded.</p>
        <button onClick={() => router.push('/')} className="mt-4 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold">
          Plan a trip
        </button>
      </main>
    );
  }
  if (!state) return null;

  const { input, mood, destination, budget, itinerary, booking, referee, consensus, advocates, notification, familyAudit, policyAudit } = state;
  const endDate = addDays(input.startDate, Math.max(0, input.durationDays - 1));
  const approvedTotal = booking.bookings.reduce((sum, b, i) => sum + (approved[i] ? b.amountINR : 0), 0);
  const isGroup = input.mode === 'group' && (consensus?.perTraveller?.length ?? 0) > 0;

  const doSave = () => setSaved(saveTrip(state) ? 'saved' : 'failed');

  const switchDestination = async (alt: { name: string; oneLineReason: string }) => {
    if (switchBusy.current) return;
    switchBusy.current = true;
    setSwitchError('');
    setShowAlternates(false);
    try {
      /*
       * Discovery has to run first. Skipping it was the bug: the header kept the
       * PREVIOUS destination's `nonNegotiablesMet` receipt, so the page showed
       * one city's proof lines under another city's name — falsifying the single
       * claim the product leans on hardest.
       */
      const ctx: PipelineContext = { input, mood, pinnedDestinationName: alt.name };
      setSwitching(`Re-planning for ${alt.name} — Discovery Agent…`);
      let newDestination: DestinationOutput;
      try {
        newDestination = await runAgent<DestinationOutput>('destination', buildPayload('destination', ctx));
        // The model is told to keep the name; trust but verify.
        if (newDestination.selected?.name?.trim().toLowerCase() !== alt.name.trim().toLowerCase()) {
          newDestination.selected = { ...newDestination.selected, name: alt.name };
        }
      } catch {
        // Rather than fail the whole switch, fall back to the thin record — but
        // drop the stale receipt, which is the part that would actively lie.
        newDestination = {
          selected: selectedFromAlternate(alt, destination.selected),
          alternates: [],
          decisionNote: '',
        };
      }
      const newSelected = newDestination.selected;
      ctx.destination = { selected: newSelected };
      setSwitching(`Re-planning for ${alt.name} — Budget Agent…`);
      const newBudget = await runAgent<BudgetOutput>('budget', buildPayload('budget', ctx));
      ctx.budget = newBudget;
      await sleep(1200);
      setSwitching(`Re-planning for ${alt.name} — Itinerary Agent…`);
      ctx.itineraryCapINR =
        newBudget.allocation.activities.amountINR +
        Math.round(newBudget.allocation.food.amountINR * 0.5);
      const newItinerary = await runAgent<ItineraryOutput>('itinerary', buildPayload('itinerary', ctx));
      ctx.itinerary = newItinerary;
      await sleep(1200);
      setSwitching(`Re-planning for ${alt.name} — Booking Agent…`);
      const newBooking = await runAgent<BookingOutput>('booking', buildPayload('booking', ctx));

      const newAlternates = [
        { name: destination.selected.name, oneLineReason: 'Your previous pick.' },
        ...destination.alternates.filter((a) => a.name !== alt.name),
      ].slice(0, 2);

      const next: TripState = {
        ...state,
        // Spread the NEW Discovery output, never the old one — `nonNegotiablesMet`
        // and `decisionNote` must describe where you are actually going.
        destination: { ...newDestination, selected: newSelected, alternates: newAlternates },
        budget: newBudget,
        itinerary: newItinerary,
        booking: newBooking,
      };
      setState(next);
      setCurrentTrip(next);
      setApproved({});
      setSaved('idle');
    } catch {
      setSwitchError('Could not re-plan for that destination right now — your current plan is untouched.');
    } finally {
      setSwitching(null);
      switchBusy.current = false;
    }
  };

  const allocationEntries = Object.entries(budget.allocation) as [
    string,
    { amountINR: number; pct: number; note: string; tier?: string },
  ][];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-36">
      {offline && (
        <div className="no-print mb-4 rounded-xl bg-secondary/60 border border-secondary px-4 py-2.5 text-sm text-center">
          You&apos;re offline — saved trips still work.
        </div>
      )}

      {/* Header — the destination gets to be a statement, not a form field */}
      <section className="surface-deep-grad rounded-3xl overflow-hidden shadow-lg print-block">
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold mb-5">
            {state.isSample && <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">Sample</span>}
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
              {MODE_LABEL[input.mode] ?? 'Solo'} trip
            </span>
            <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
              {mood.moodProfile.primaryMood}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 font-mono">
              ⚡ {state.agentsRun ?? 5} agents · {state.plannedInSeconds}s of agent time
            </span>
            {state.replanned && (
              <span className="px-2.5 py-1 rounded-full bg-destructive/25 border border-destructive/40">
                ↩ Re-planned by Referee
              </span>
            )}
            {state.hadHistory && mood.personalizationNote && (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 cursor-help" title={mood.personalizationNote}>
                ✨ Personalised
              </span>
            )}
          </div>

          <h1 className="type-hero font-display font-extrabold text-white">
            {destination.selected.name}
          </h1>
          {[destination.selected.region, destination.selected.country].filter(Boolean).length > 0 && (
            <p className="text-white/60 mt-2 text-lg">
              {[destination.selected.region, destination.selected.country].filter(Boolean).join(', ')}
            </p>
          )}

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              ['Dates', `${fmtDate(input.startDate)} – ${fmtDate(endDate)}`, `${input.durationDays} ${input.durationDays === 1 ? 'day' : 'days'}`],
              ['Travellers', `${input.travelers}`, input.travelers === 1 ? 'person' : 'people'],
              ['Getting there', destination.selected.travelFromOrigin.mode || 'travel', `from ${input.originCity}`],
            ].map(([label, big, small]) => (
              <div key={label} className="rounded-2xl bg-white/[0.07] border border-white/12 px-4 py-3">
                <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">{label}</div>
                <div className="font-display font-bold mt-0.5 leading-tight">{big}</div>
                <div className="text-xs text-white/60">{small}</div>
              </div>
            ))}
          </div>

          <p className="mt-6 leading-relaxed text-white/85">{destination.selected.whyMatched}</p>
        </div>

        {/* Non-negotiables contract — the Discovery Agent's receipt */}
        {destination.nonNegotiablesMet && destination.nonNegotiablesMet.length > 0 && (
          <>
            <div className="perforation perforation-light" />
            <div className="px-6 sm:px-10 py-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-3">
                Your non-negotiables, and where they&apos;re met
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {destination.nonNegotiablesMet.map((n, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="text-accent font-bold shrink-0">✓</span>
                    <span className="text-white/85">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 print-block">
        <div className="no-print">
          <button onClick={() => setShowAlternates((s) => !s)} className="text-sm font-semibold text-primary hover:opacity-80" aria-expanded={showAlternates}>
            {showAlternates ? '− Hide alternates' : 'Switch destination →'}
          </button>
          {showAlternates && (
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {destination.alternates.map((alt) => (
                <button key={alt.name} onClick={() => switchDestination(alt)} className="text-left rounded-xl border border-input bg-card px-4 py-3 hover:border-primary transition-colors">
                  <div className="font-semibold">{alt.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{alt.oneLineReason}</div>
                  <div className="text-xs font-semibold text-primary mt-1.5">Re-plan budget, days &amp; bookings →</div>
                </button>
              ))}
            </div>
          )}
          {switchError && <p className="mt-2 text-sm text-destructive">{switchError}</p>}
        </div>
      </section>

      {/* Group consensus */}
      {isGroup && consensus && (
        <section className="mt-10 bg-card rounded-3xl border-2 border-primary shadow-sm p-6 sm:p-8 print-block">
          <h2 className="type-section font-display font-extrabold">⚖️ How the Referee settled it</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {advocates?.length ?? 0} Advocate agents argued. Nobody got everything — here is exactly
            who conceded what.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-semibold">Traveller</th>
                  <th className="py-2 pr-3 font-semibold">Wanted</th>
                  <th className="py-2 pr-3 font-semibold">Got</th>
                  <th className="py-2 pr-3 font-semibold">Conceded</th>
                  <th className="py-2 font-semibold text-right">Happy</th>
                </tr>
              </thead>
              <tbody>
                {consensus.perTraveller.map((p) => (
                  <tr key={p.traveller} className="border-b border-border/60 last:border-0 align-top">
                    <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{p.traveller}</td>
                    <td className="py-2.5 pr-3">{p.wanted}</td>
                    <td className="py-2.5 pr-3">{p.got}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{p.conceded}</td>
                    <td className="py-2.5 text-right whitespace-nowrap font-mono">
                      {'●'.repeat(p.satisfaction)}
                      <span className="opacity-25">{'●'.repeat(5 - p.satisfaction)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {consensus.tradeOffsMade?.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {consensus.tradeOffsMade.map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-accent font-bold">⇄</span><span>{t}</span></li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm italic text-muted-foreground">“{consensus.refereeNote}”</p>

          {advocates && advocates.length > 0 && (
            <details className="mt-4 no-print">
              <summary className="text-sm font-semibold text-primary cursor-pointer hover:opacity-80">
                What each advocate argued →
              </summary>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {advocates.map((a) => (
                  <div key={a.traveller} className="rounded-xl border border-input p-3.5 text-sm">
                    <div className="font-semibold">{a.traveller} <span className="font-normal text-muted-foreground">· {a.primaryMood}</span></div>
                    <p className="italic mt-1">“{a.advocacyLine}”</p>
                    <p className="mt-1.5 text-xs"><span className="font-semibold">Must have:</span> {a.mustHave}</p>
                    <p className="text-xs"><span className="font-semibold">Deal-breaker:</span> {a.dealBreaker}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      {/* Family pacing audit */}
      {familyAudit && (
        <section className="mt-10 bg-card rounded-3xl border-2 border-primary shadow-sm p-6 sm:p-8 print-block">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">
                Referee checked this works for everyone
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full align-middle ${
                  familyAudit.pacingVerdict === 'workable' ? 'bg-secondary text-foreground' : 'bg-destructive/15 text-destructive'
                }`}>
                  {familyAudit.pacingVerdict}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                The Itinerary Agent optimised the trip. The Referee audited it against the actual
                people travelling — by name.
              </p>
            </div>
          </div>

          {familyAudit.conflictsFound?.length > 0 ? (
            <div className="mt-4 space-y-2">
              {familyAudit.conflictsFound.map((c, i) => (
                <div key={i} className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display font-bold text-sm">Day {c.day}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border font-semibold">
                      affects {c.affects}
                    </span>
                  </div>
                  <p className="text-sm mt-1.5">{c.issue}</p>
                  <p className="text-sm mt-1.5"><span className="font-semibold">Fix:</span> {c.fix}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm rounded-xl bg-secondary/40 border border-secondary px-4 py-3">
              ✓ No pacing conflicts — every day works for the youngest and the oldest traveller.
            </p>
          )}

          {familyAudit.restWindows?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {familyAudit.restWindows.map((r, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">😴 {r}</span>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm italic text-muted-foreground">“{familyAudit.refereeNote}”</p>
        </section>
      )}

      {/* Corporate compliance + expense report */}
      {policyAudit && (
        <section className="mt-10 bg-card rounded-3xl border-2 shadow-sm p-6 sm:p-8 print-block border-primary">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💼</span>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">
                Policy compliance
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full align-middle ${
                  policyAudit.compliant ? 'bg-secondary text-foreground' : 'bg-destructive/15 text-destructive'
                }`}>
                  {policyAudit.compliant ? 'compliant' : 'needs approval'}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Checked by the Referee before anything is approved.
              </p>
            </div>
          </div>

          {policyAudit.violations?.length > 0 && (
            <div className="mt-4 space-y-2">
              {policyAudit.violations.map((v, i) => (
                <div key={i} className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
                  <div className="font-semibold">{v.item}</div>
                  <p className="text-muted-foreground mt-0.5">Rule: {v.policyRule}</p>
                  <p className="mt-1">
                    {v.overageINR > 0 && <span className="font-mono font-semibold">{fmtINR(v.overageINR)} over · </span>}
                    <span className="font-semibold">{v.action}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {policyAudit.expenseReport?.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Reimbursement-ready expense report
                {input.corporate?.costCentre && <span className="font-mono normal-case"> · {input.corporate.costCentre}</span>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2 pr-3 font-semibold">Category</th>
                      <th className="py-2 pr-3 font-semibold text-right">Amount</th>
                      <th className="py-2 pr-3 font-semibold">Reimbursable</th>
                      <th className="py-2 font-semibold hidden sm:table-cell">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyAudit.expenseReport.map((r, i) => (
                      <tr key={i} className="border-b border-border/60 last:border-0 align-top">
                        <td className="py-2.5 pr-3 font-medium capitalize">{r.category}</td>
                        <td className="py-2.5 pr-3 text-right font-mono">{fmtINR(r.amountINR)}</td>
                        <td className="py-2.5 pr-3">{r.reimbursable ? '✓ Yes' : '✕ No'}</td>
                        <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{r.note}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border font-semibold">
                      <td className="py-2.5 pr-3">Total reimbursable</td>
                      <td className="py-2.5 pr-3 text-right font-mono">{fmtINR(policyAudit.totalReimbursableINR ?? 0)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p className="mt-4 text-sm italic text-muted-foreground">“{policyAudit.complianceNote}”</p>
        </section>
      )}

      {/* Referee conflict */}
      {referee && (
        <section className="mt-10 bg-card rounded-3xl border-2 border-destructive/50 shadow-sm p-6 sm:p-8 print-block">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚖️</span>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">
                Two agents disagreed
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full align-middle ${referee.severity === 'material' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                  {referee.severity}
                </span>
              </h2>
              <p className="text-sm mt-1.5">{referee.conflictStatement}</p>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            {referee.resolutionOptions?.map((opt, i) => {
              const isRec = referee.recommendation !== 'accept' && i === 0;
              const isChosen = chosenResolution === i;
              return (
                <button
                  key={i}
                  onClick={() => setChosenResolution(i)}
                  className={`text-left rounded-xl border p-3.5 transition-colors ${isChosen ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'}`}
                >
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    {opt.label}
                    {isRec && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-bold">REFEREE&apos;S PICK</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{opt.detail}</p>
                  <p className="text-xs mt-1.5"><span className="font-semibold">Impact:</span> {opt.impact}</p>
                  {isChosen && <p className="text-xs font-semibold text-primary mt-2">✓ Selected</p>}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm italic text-muted-foreground">“{referee.refereeNote}”</p>

          {state.replanned && state.budgetV1 && (
            <div className="mt-4 rounded-xl bg-secondary/40 border border-secondary p-4 text-sm">
              <div className="font-semibold mb-1">↩ The Budget Agent was sent back to re-plan</div>
              <p className="text-muted-foreground">
                Activities allocation moved from{' '}
                <span className="font-mono line-through">{fmtINR(state.budgetV1.allocation.activities.amountINR)}</span>{' '}
                to <span className="font-mono font-semibold text-foreground">{fmtINR(budget.allocation.activities.amountINR)}</span>{' '}
                after the Referee rejected the first allocation as infeasible against the real itinerary.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Budget */}
      <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 print-block">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <h2 className="type-section font-display font-extrabold">Budget</h2>
          <span className="font-mono text-lg font-semibold">{fmtINR(budget.totalINR)}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Allocated across every category <em>before</em> a single booking is prepared.
        </p>
        <div className="h-6 rounded-full overflow-hidden flex border border-border" role="img" aria-label="Budget split">
          {allocationEntries.map(([key, cat]) => (
            <div key={key} style={{ width: `${cat.pct}%`, backgroundColor: CATEGORY_COLORS[key] ?? '#ccc' }} title={`${CATEGORY_LABELS[key] ?? key}: ${fmtINR(cat.amountINR)} (${cat.pct}%)`} />
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 font-semibold">Category</th>
                <th className="py-2 pr-3 font-semibold text-right">Amount</th>
                <th className="py-2 pr-3 font-semibold text-right">%</th>
                <th className="py-2 font-semibold hidden sm:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {allocationEntries.map(([key, cat]) => (
                <tr key={key} className="border-b border-border/60 last:border-0 align-top">
                  <td className="py-2.5 pr-3">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[key] ?? '#ccc' }} />
                    <span className="font-medium">{CATEGORY_LABELS[key] ?? key}</span>
                    {cat.tier && <span className="text-muted-foreground"> · {cat.tier}</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono">{fmtINR(cat.amountINR)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{cat.pct}%</td>
                  <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{cat.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-display font-semibold">≈ {fmtINR(budget.perDaySpendINR)}/day on food &amp; activities</p>
        <div className="mt-3 grid sm:grid-cols-3 gap-2">
          {budget.savingTips.map((tipText, i) => (
            <div key={i} className="rounded-xl bg-secondary/40 border border-secondary px-3.5 py-2.5 text-xs leading-relaxed">💡 {tipText}</div>
          ))}
        </div>
      </section>

      {/* Itinerary — a timeline, not a table of rows */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-3 mb-5 px-1">
          <h2 className="type-section font-display font-extrabold">Day by day</h2>
          <span className="text-sm text-muted-foreground shrink-0">
            {itinerary.days.length} {itinerary.days.length === 1 ? 'day' : 'days'} planned
          </span>
        </div>
        <div className="space-y-5">
          {itinerary.days.map((day) => (
            <article key={day.day} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden print-block">
              <header className="flex items-center gap-4 px-5 sm:px-7 py-4 bg-primary text-primary-foreground">
                <span className="shrink-0 w-12 h-12 rounded-2xl bg-white/12 border border-white/20 flex flex-col items-center justify-center leading-none">
                  <span className="text-[9px] uppercase tracking-wider opacity-70">Day</span>
                  <span className="font-display font-extrabold text-lg">{day.day}</span>
                </span>
                <span className="font-display font-bold text-lg leading-tight">{day.theme}</span>
              </header>

              <div className="px-5 sm:px-7 py-5">
                <ol className="relative">
                  {([
                    ['Morning', '🌅', day.morning],
                    ['Afternoon', '☀️', day.afternoon],
                    ['Evening', '🌙', day.evening],
                  ] as const).map(([label, icon, slot], idx, arr) => (
                    <li key={label} className="relative flex gap-4 pb-5 last:pb-0">
                      {/* connector */}
                      {idx < arr.length - 1 && (
                        <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden="true" />
                      )}
                      <span className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-secondary border border-secondary flex items-center justify-center text-sm">
                        {icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                            {label}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {slot.approxCostINR > 0 ? fmtINR(slot.approxCostINR) : 'Free'}
                          </span>
                        </div>
                        <p className="mt-0.5 font-medium leading-snug">{slot.activity}</p>
                        {slot.area && <p className="text-sm text-muted-foreground">📍 {slot.area}</p>}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                      🍽 Meals
                    </div>
                    <p>{day.meals}</p>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                      ☔ If plans change
                    </div>
                    <p className="text-muted-foreground">{day.swapIfNeeded}</p>
                  </div>
                </div>

                {day.suitabilityNote && (
                  <div className="mt-3 rounded-xl bg-secondary/40 border border-secondary px-4 py-2.5 text-sm">
                    <span className="font-semibold">Works for you because</span> — {day.suitabilityNote}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Language card */}
      <section className="mt-10 surface-deep-grad rounded-3xl shadow-lg p-6 sm:p-8 print-block">
        <h2 className="font-display text-xl font-bold">Pocket {itinerary.languageCard.language} card</h2>
        <p className="text-sm opacity-80 mt-0.5 mb-4">Eight phrases that cover 90% of traveller moments.</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
          {itinerary.languageCard.phrases.map((p, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 border-b border-primary-foreground/15 pb-2">
              <span className="opacity-80">{p.english}</span>
              <span className="text-right">
                <span className="font-semibold">{p.local}</span>
                <span className="block text-xs opacity-70 font-mono">{p.phonetic}</span>
              </span>
            </div>
          ))}
        </div>
        {itinerary.packingTips.length > 0 && <p className="mt-4 text-xs opacity-80">🎒 {itinerary.packingTips.join(' · ')}</p>}
      </section>

      {/* Bookings */}
      <section className="mt-10">
        <h2 className="type-section font-display font-extrabold mb-1 px-1">Bookings</h2>
        <p className="text-sm text-muted-foreground mb-4 px-1">
          Nothing is booked without your approval — and in this demo, nothing is ever really booked.
        </p>
        <div className="space-y-4">
          {booking.bookings.map((item, i) => {
            const isApproved = !!approved[i];
            const reference = bookingRef(destination.selected.name + item.title, i);
            return (
              <article key={i} className={`boarding-pass bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col sm:flex-row booking-flip print-block ${isApproved ? 'border-primary' : 'border-border'}`}>
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.type}</span>
                    <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-wide">
                      Demo Mode — no real reservation
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg mt-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                  <p className="text-sm mt-1.5">🗓 {item.dates}</p>
                  {item.needsApprovalReason && (
                    <p className="text-xs mt-1.5 text-muted-foreground">
                      ⚖️ Referee gate: {item.needsApprovalReason}
                    </p>
                  )}
                  <a href={linkFor(item, state)} target="_blank" rel="noopener noreferrer" className="no-print inline-block mt-2 text-sm font-semibold text-primary hover:opacity-80">
                    See real options →
                  </a>
                </div>
                <div className="relative stub-divider sm:w-56 shrink-0 p-5 sm:p-6 flex sm:flex-col items-center justify-between gap-3 bg-muted/40">
                  <span className="notch notch-top hidden sm:block" />
                  <span className="notch notch-bottom hidden sm:block" />
                  <div className="text-center">
                    <div className="font-mono font-semibold text-lg">{fmtINR(item.amountINR)}</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">from {item.budgetCategory}</div>
                  </div>
                  {isApproved ? (
                    <div className="text-center">
                      <div className="text-primary font-bold text-sm">Confirmed ✓</div>
                      <div className="font-mono text-xs mt-1 bg-card border border-border rounded-lg px-2 py-1">{reference}</div>
                    </div>
                  ) : (
                    <button onClick={() => setApproved((a) => ({ ...a, [i]: true }))} className="no-print px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:brightness-95">
                      Approve (simulated)
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Live spend + split */}
      <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 print-block">
        <h2 className="type-section font-display font-extrabold">
          Live spend{split.length > 1 && ' & settle-up'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Planned vs actually approved, updating as you approve each booking.
          {split.length > 1 && ' No separate app.'}
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {[
            ['Planned', fmtINR(budget.totalINR)],
            ['Approved so far', fmtINR(approvedTotal)],
            ['Still unspent', fmtINR(Math.max(0, budget.totalINR - approvedTotal))],
          ].map(([label, val]) => (
            <div key={label} className="rounded-xl bg-secondary/40 border border-secondary px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
              <div className="font-mono font-bold text-lg mt-0.5">{val}</div>
            </div>
          ))}
        </div>
        {/* A settle-up ledger needs someone to settle up with — one traveller
            would otherwise get a row owing themselves nothing. */}
        {split.length > 1 &&
          (approvedTotal === 0 ? (
            <p className="text-sm text-muted-foreground italic">Approve a booking above to see the split.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-semibold">Traveller</th>
                  <th className="py-2 pr-3 font-semibold text-right">Fair share</th>
                  <th className="py-2 pr-3 font-semibold text-right">Paid</th>
                  <th className="py-2 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {split.map((s) => (
                  <tr key={s.traveller} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{s.traveller}</td>
                    <td className="py-2.5 pr-3 text-right font-mono">{fmtINR(s.shareINR)}</td>
                    <td className="py-2.5 pr-3 text-right font-mono">{fmtINR(s.paidINR)}</td>
                    <td className={`py-2.5 text-right font-mono font-semibold ${s.balanceINR > 0 ? 'text-primary' : s.balanceINR < 0 ? 'text-destructive' : ''}`}>
                      {s.balanceINR > 0 ? `is owed ${fmtINR(s.balanceINR)}` : s.balanceINR < 0 ? `owes ${fmtINR(-s.balanceINR)}` : 'settled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ))}
      </section>

      {/* Notification schedule */}
      {notification && notification.reminders?.length > 0 && (
        <section className="mt-10 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8 print-block">
          <h2 className="type-section font-display font-extrabold">🔔 Your reminder schedule</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Scheduled by the Notification Agent. In this MVP the schedule is real; delivery over
            push/SMS/voice is post-MVP.
          </p>
          <ol className="space-y-2.5">
            {notification.reminders.map((r, i) => (
              <li key={i} className="flex gap-3 items-start rounded-xl border border-input px-4 py-3">
                <span className="text-lg mt-0.5">{CHANNEL_ICON[r.channel] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.title}</span>
                    {r.priority === 'high' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold uppercase">Critical</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{r.body}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {r.whenLabel} · {r.offsetLabel} · via {r.channel}
                    {r.forWhom ? ` · ${r.forWhom}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm italic text-muted-foreground">{notification.channelStrategy}</p>
          {notification.quietHoursNote && <p className="mt-1 text-xs text-muted-foreground">{notification.quietHoursNote}</p>}
        </section>
      )}

      {/* Agent log */}
      <section className="mt-6 no-print">
        <button onClick={() => setShowLog((s) => !s)} className="w-full bg-card rounded-2xl border border-border px-5 py-4 text-left font-display font-semibold hover:bg-muted/50 transition-colors" aria-expanded={showLog}>
          🔍 Agent log — raw JSON handoffs {showLog ? '▲' : '▼'}
        </button>
        {showLog && (
          <div className="mt-2 space-y-2">
            {([
              advocates ? [`Traveller Advocates ×${advocates.length}`, advocates] : null,
              consensus ? ['Referee Agent · consensus', consensus] : null,
              ['1 · Mood & Intent Agent', mood],
              ['2 · Discovery Agent', destination],
              ['3 · Budget Agent', budget],
              ['4 · Itinerary Agent', itinerary],
              referee ? ['6 · Referee Agent · budget audit', referee] : null,
              familyAudit ? ['6 · Referee Agent · family pacing audit', familyAudit] : null,
              policyAudit ? ['6 · Referee Agent · policy compliance audit', policyAudit] : null,
              state.audit ? ['Deterministic audit (code, not model)', state.audit] : null,
              ['5 · Booking Agent', booking],
              notification ? ['7 · Notification Agent', notification] : null,
            ].filter(Boolean) as [string, unknown][]).map(([label, data]) => (
              <details key={label} className="bg-card rounded-xl border border-border overflow-hidden">
                <summary className="px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted/50">{label}</summary>
                <pre className="px-4 pb-4 text-xs font-mono overflow-x-auto text-muted-foreground max-h-80 overflow-y-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </section>

      {/* Sticky bar */}
      <div className="no-print fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm">
            <span className="font-mono font-semibold">{fmtINR(approvedTotal)}</span>
            <span className="text-muted-foreground"> approved · </span>
            <span className="font-mono font-semibold">{fmtINR(Math.max(0, budget.totalINR - approvedTotal))}</span>
            <span className="text-muted-foreground"> remaining</span>
          </div>
          <div className="flex gap-2">
            <button onClick={doSave} disabled={saved === 'saved'} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {saved === 'saved' ? 'Saved ✓' : 'Save trip'}
            </button>
            <button onClick={() => router.push('/')} className="px-4 py-2 rounded-xl border border-input text-sm font-semibold hover:bg-muted">Plan another</button>
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl border border-input text-sm font-semibold hover:bg-muted hidden sm:block">Print</button>
          </div>
        </div>
        {saved === 'failed' && <p className="text-center text-xs text-destructive pb-2">Couldn&apos;t save on this device — the plan still works this session.</p>}
      </div>

      {switching && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl border border-border shadow-lg px-8 py-6 text-center max-w-sm">
            <div className="text-3xl mb-3">🧭</div>
            <p className="font-display font-semibold">{switching}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Discovery, Budget, Itinerary and Booking re-run for the new place — your mood profile
              and its non-negotiables carry over unchanged.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
