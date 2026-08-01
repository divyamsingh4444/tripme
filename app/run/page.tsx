'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AGENT_META,
  AgentError,
  advocatePayload,
  auditItineraryVsBudget,
  buildPayload,
  consensusPayload,
  intentAgentFor,
  moodPayload,
  runAgent,
  sleep,
  usesAdvocates,
  type PipelineContext,
} from '@/lib/agents-client';
import type {
  AdvocateOutput,
  AgentKey,
  BookingOutput,
  BudgetOutput,
  ConsensusOutput,
  DestinationOutput,
  FamilyAuditOutput,
  ItineraryOutput,
  MoodOutput,
  NotificationOutput,
  PolicyAuditOutput,
  RefereeOutput,
  TripInput,
  TripState,
} from '@/lib/types';
import { getPastTripsCompact, getPendingInput, setCurrentTrip, fmtINR } from '@/lib/storage';
import { buildSampleTrip } from '@/lib/sample-trip';

type StepState =
  | { kind: 'pending' }
  | { kind: 'running' }
  | { kind: 'waiting'; secondsLeft: number }
  | { kind: 'done'; summary: string }
  | { kind: 'conflict'; summary: string }
  | { kind: 'error'; message: string };

interface Step {
  id: string;
  agent: AgentKey;
  name: string;
  emoji: string;
  running: string;
  /** true for the re-planning steps inserted after the Referee rejects */
  isLoopback?: boolean;
  state: StepState;
}

const TIPS = [
  'Agents pass structured briefs to each other — no context is lost between steps.',
  'The Referee Agent audits the Itinerary against the Budget, and can send it back.',
  'Every plan is generated live by Llama 3.3 70B — nothing here is pre-written.',
  'In group mode, one Advocate Agent argues for each traveller before the Referee negotiates.',
  'Bookings are simulated and always wait for your approval. Demo mode, honestly.',
];

export default function RunPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [tip, setTip] = useState(0);
  const [offerSample, setOfferSample] = useState(false);
  const [noInput, setNoInput] = useState(false);
  const [agentCount, setAgentCount] = useState(0);

  const started = useRef(false);
  const ctxRef = useRef<PipelineContext | null>(null);
  const timerStart = useRef(0);
  const finished = useRef(false);
  const hardFails = useRef(0);

  const patch = (id: string, state: StepState) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, state } : s)));

  const push = (step: Step) => setSteps((prev) => [...prev, step]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const input = getPendingInput<TripInput>();
    if (!input) {
      setNoInput(true);
      return;
    }
    ctxRef.current = { input };
    timerStart.current = Date.now();

    const timer = setInterval(() => {
      if (!finished.current) setElapsed(Math.floor((Date.now() - timerStart.current) / 1000));
    }, 500);
    const tipTimer = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 5000);

    void runPipeline(input);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Run one agent with rate-limit auto-retry. Returns null on hard failure. */
  async function call<T>(id: string, agent: AgentKey, payload: object): Promise<T | null> {
    patch(id, { kind: 'running' });
    let rateRetries = 0;
    while (true) {
      try {
        const data = await runAgent<T>(agent, payload);
        setAgentCount((c) => c + 1);
        hardFails.current = 0;
        return data;
      } catch (err) {
        const e = err instanceof AgentError ? err : new AgentError('server_error');
        if (e.code === 'rate_limited' && rateRetries < 2) {
          rateRetries++;
          const wait = e.retryAfterSeconds ?? 12;
          for (let s = wait; s > 0; s--) {
            patch(id, { kind: 'waiting', secondsLeft: s });
            await sleep(1000);
          }
          continue;
        }
        hardFails.current++;
        if (hardFails.current >= 2) setOfferSample(true);
        patch(id, {
          kind: 'error',
          message:
            e.code === 'rate_limited'
              ? 'Still busy after retries — wait a few seconds and retry.'
              : e.code === 'missing_key'
                ? 'The AI backend is not configured on this deployment.'
                : e.code === 'network'
                  ? 'Network hiccup — check your connection and retry.'
                  : 'This agent hit a snag.',
        });
        return null;
      }
    }
  }

  function stepFor(agent: AgentKey, id: string, nameOverride?: string, isLoopback?: boolean): Step {
    const m = AGENT_META[agent];
    return {
      id,
      agent,
      name: nameOverride ?? m.name,
      emoji: m.emoji,
      running: m.running,
      isLoopback,
      state: { kind: 'pending' },
    };
  }

  async function runPipeline(input: TripInput) {
    const ctx = ctxRef.current!;
    const isGroup = usesAdvocates(input.mode) && input.travellersList.length > 1;

    /* ---- Phase 1: intent.
       couple/group -> N Advocates + Referee consensus.
       solo/family/pilgrimage/corporate -> the matching Intent-agent variant. ---- */
    let moodOut: MoodOutput | null = null;
    const advocates: AdvocateOutput[] = [];
    let consensusInfo: ConsensusOutput['consensus'] | undefined;

    if (isGroup) {
      const advSteps = input.travellersList.map((t, i) =>
        stepFor('advocate', `adv-${i}`, `Advocate · ${t.name}`),
      );
      setSteps([...advSteps, stepFor('consensus', 'consensus')]);

      for (let i = 0; i < input.travellersList.length; i++) {
        const out = await call<AdvocateOutput>(`adv-${i}`, 'advocate', advocatePayload(input, i));
        if (!out) return;
        advocates.push(out);
        patch(`adv-${i}`, { kind: 'done', summary: `“${out.advocacyLine}”` });
        await sleep(900);
      }

      const cons = await call<ConsensusOutput>('consensus', 'consensus', consensusPayload(input, advocates));
      if (!cons) return;
      consensusInfo = cons.consensus;
      moodOut = {
        moodProfile: cons.moodProfile,
        travelIntent: cons.travelIntent,
        destinationParameters: cons.destinationParameters,
        personalizationNote: cons.personalizationNote,
      };
      const low = cons.consensus?.perTraveller?.length
        ? Math.min(...cons.consensus.perTraveller.map((p) => p.satisfaction))
        : 0;
      patch('consensus', {
        kind: 'done',
        summary: `Consensus: ${cons.moodProfile.primaryMood} · everyone ≥ ${low}/5 satisfied`,
      });
      await sleep(1100);
    } else {
      const intentKey = intentAgentFor(input.mode);
      setSteps([stepFor(intentKey, 'mood')]);
      const out = await call<MoodOutput>('mood', intentKey, moodPayload(input));
      if (!out) return;
      moodOut = out;
      patch('mood', {
        kind: 'done',
        summary:
          out.destinationParameters.nonNegotiables?.length
            ? `${out.moodProfile.primaryMood} · ${out.destinationParameters.nonNegotiables.slice(0, 2).join(', ')}`
            : `${out.moodProfile.primaryMood} · ${out.moodProfile.pace} pace`,
      });
      await sleep(1100);
    }
    ctx.mood = moodOut!;

    /* ---- Phase 2: discovery -> budget -> itinerary ---- */
    push(stepFor('destination', 'destination'));
    const dest = await call<DestinationOutput>('destination', 'destination', buildPayload('destination', ctx));
    if (!dest) return;
    ctx.destination = dest;
    patch('destination', { kind: 'done', summary: `Picked ${dest.selected.name} (+2 alternates)` });
    await sleep(1100);

    push(stepFor('budget', 'budget'));
    const budget = await call<BudgetOutput>('budget', 'budget', buildPayload('budget', ctx));
    if (!budget) return;
    ctx.budget = budget;
    patch('budget', {
      kind: 'done',
      summary: `Allocated ${fmtINR(budget.totalINR)} · ${fmtINR(budget.perDaySpendINR)}/day`,
    });
    await sleep(1100);

    push(stepFor('itinerary', 'itinerary'));
    const itin = await call<ItineraryOutput>('itinerary', 'itinerary', buildPayload('itinerary', ctx));
    if (!itin) return;
    ctx.itinerary = itin;
    patch('itinerary', { kind: 'done', summary: `${itin.days.length} days planned` });
    await sleep(1100);

    /* ---- Phase 3: Referee audit — the feedback edge ---- */
    let audit = auditItineraryVsBudget(itin, budget);
    let refereeOut: RefereeOutput | undefined;
    let budgetV1: BudgetOutput | undefined;
    let replanned = false;

    push(stepFor('referee', 'referee'));
    if (audit.hasConflict) {
      const ref = await call<RefereeOutput>('referee', 'referee', buildPayload('referee', ctx));
      if (!ref) return;
      refereeOut = ref;
      patch('referee', {
        kind: 'conflict',
        summary: ref.conflictStatement,
      });
      await sleep(1400);

      if (ref.recommendation !== 'accept') {
        replanned = true;
        let workingBudget = budget;

        // Path 1 — the Referee orders the Budget Agent to find the money.
        if (ref.recommendation === 'reallocate' && ref.reallocationInstruction) {
          budgetV1 = budget;
          ctx.refereeInstruction = `${ref.reallocationInstruction} The itinerary genuinely costs ${fmtINR(audit.itineraryTotalINR)} against an allowance of ${fmtINR(audit.allowanceINR)} — cover the ${fmtINR(audit.gapINR)} shortfall.`;

          push(stepFor('budget', 'budget-v2', 'Budget Agent · re-planning', true));
          const budget2 = await call<BudgetOutput>('budget-v2', 'budget', buildPayload('budget', ctx));
          if (!budget2) return;
          ctx.budget = budget2;
          workingBudget = budget2;
          patch('budget-v2', {
            kind: 'done',
            summary: `Re-allocated · activities ${fmtINR(budget.allocation.activities.amountINR)} → ${fmtINR(budget2.allocation.activities.amountINR)}`,
          });
          await sleep(1100);
        }

        // Path 2 — whatever the money now is, the Itinerary Agent must fit it.
        const newAudit = auditItineraryVsBudget(itin, workingBudget);
        ctx.itineraryCapINR = newAudit.allowanceINR;

        push(stepFor('itinerary', 'itinerary-v2', 'Itinerary Agent · revised to fit', true));
        const itin2 = await call<ItineraryOutput>('itinerary-v2', 'itinerary', buildPayload('itinerary', ctx));
        if (!itin2) return;
        ctx.itinerary = itin2;
        audit = auditItineraryVsBudget(itin2, workingBudget);
        patch('itinerary-v2', {
          kind: 'done',
          summary: audit.hasConflict
            ? `Revised to ${fmtINR(audit.itineraryTotalINR)} — residual ${fmtINR(audit.gapINR)} absorbed by buffer`
            : `Revised to ${fmtINR(audit.itineraryTotalINR)} — now within budget ✓`,
        });
        await sleep(1100);
      }
    } else {
      patch('referee', {
        kind: 'done',
        summary: `No conflict — itinerary ${fmtINR(audit.itineraryTotalINR)} fits the ${fmtINR(audit.allowanceINR)} allowance`,
      });
      await sleep(900);
    }

    /* ---- Phase 3b: family pacing audit — a second, non-money conflict class ---- */
    let familyAudit: FamilyAuditOutput | undefined;
    if (input.mode === 'family' && input.household.length > 0) {
      push(stepFor('referee_family', 'referee-family'));
      const fam = await call<FamilyAuditOutput>('referee-family', 'referee_family', buildPayload('referee_family', ctx));
      if (fam) {
        familyAudit = fam;
        const n = fam.conflictsFound?.length ?? 0;
        patch('referee-family', {
          kind: n > 0 ? 'conflict' : 'done',
          summary:
            n > 0
              ? `${n} pacing ${n === 1 ? 'problem' : 'problems'} found — ${fam.pacingVerdict}`
              : `Plan is workable for every age band`,
        });
        await sleep(1200);
      }
    }

    /* ---- Phase 4: booking -> [policy audit] -> notification ---- */
    push(stepFor('booking', 'booking'));
    const booking = await call<BookingOutput>('booking', 'booking', buildPayload('booking', ctx));
    if (!booking) return;
    ctx.booking = booking;
    patch('booking', { kind: 'done', summary: `${booking.bookings.length} bookings ready for approval` });
    await sleep(1100);

    /* ---- Phase 4b: corporate compliance audit ---- */
    let policyAudit: PolicyAuditOutput | undefined;
    if (input.mode === 'corporate') {
      push(stepFor('referee_policy', 'referee-policy'));
      const pol = await call<PolicyAuditOutput>('referee-policy', 'referee_policy', buildPayload('referee_policy', ctx));
      if (pol) {
        policyAudit = pol;
        const v = pol.violations?.length ?? 0;
        patch('referee-policy', {
          kind: pol.compliant ? 'done' : 'conflict',
          summary: pol.compliant
            ? `Policy compliant · ${fmtINR(pol.totalReimbursableINR ?? 0)} reimbursable`
            : `${v} policy ${v === 1 ? 'violation' : 'violations'} flagged`,
        });
        await sleep(1200);
      }
    }

    push(stepFor('notification', 'notification'));
    const notif = await call<NotificationOutput>('notification', 'notification', buildPayload('notification', ctx));
    if (notif) {
      patch('notification', { kind: 'done', summary: `${notif.reminders.length} reminders scheduled` });
    }

    /* ---- assemble ---- */
    finished.current = true;
    const seconds = Math.floor((Date.now() - timerStart.current) / 1000);
    const state: TripState = {
      input,
      mood: ctx.mood as MoodOutput,
      advocates: advocates.length ? advocates : undefined,
      consensus: consensusInfo,
      destination: ctx.destination as DestinationOutput,
      budget: ctx.budget as BudgetOutput,
      itinerary: ctx.itinerary as ItineraryOutput,
      referee: refereeOut,
      audit,
      familyAudit,
      policyAudit,
      replanned,
      budgetV1,
      booking,
      notification: notif ?? undefined,
      agentsRun:
        (isGroup ? advocates.length + 1 : 1) + // intent phase
        5 + // discovery, budget, itinerary, booking, notification
        1 + // referee budget audit
        (replanned ? 2 : 0) +
        (familyAudit ? 1 : 0) +
        (policyAudit ? 1 : 0),
      plannedInSeconds: seconds,
      hadHistory: getPastTripsCompact().length > 0,
      createdAt: Date.now(),
    };
    setCurrentTrip(state);
    await sleep(800);
    router.push('/trip');
  }

  const loadSample = () => {
    setCurrentTrip(buildSampleTrip());
    router.push('/trip');
  };

  if (noInput) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium">No trip request found.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold"
        >
          Start planning
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Planning your trip…</h1>
        <span className="font-mono text-lg font-semibold text-primary tabular-nums" aria-live="polite">
          {elapsed}s
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {agentCount} agent {agentCount === 1 ? 'call' : 'calls'} completed · each one hands a
        structured brief to the next
      </p>

      <ol className="space-y-3">
        {steps.map((s) => (
          <li
            key={s.id}
            className={`bg-card rounded-2xl border px-5 py-4 flex items-start gap-4 ${
              s.state.kind === 'running' || s.state.kind === 'waiting'
                ? 'border-accent agent-active'
                : s.state.kind === 'error'
                  ? 'border-destructive'
                  : s.state.kind === 'conflict'
                    ? 'border-destructive/60 bg-destructive/5'
                    : 'border-border'
            } ${s.isLoopback ? 'ml-6 border-dashed' : ''}`}
          >
            <span className="text-2xl leading-none mt-0.5">{s.isLoopback ? '↩' : s.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold">
                {s.name}
                {s.isLoopback && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    triggered by Referee
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5 break-words">
                {s.state.kind === 'pending' && 'Waiting…'}
                {s.state.kind === 'running' && s.running}
                {s.state.kind === 'waiting' && <>High demand — retrying in {s.state.secondsLeft}s…</>}
                {s.state.kind === 'done' && (
                  <span className="text-foreground font-medium">✓ {s.state.summary}</span>
                )}
                {s.state.kind === 'conflict' && (
                  <span className="text-destructive font-medium">⚠ {s.state.summary}</span>
                )}
                {s.state.kind === 'error' && (
                  <span className="text-destructive">{s.state.message}</span>
                )}
              </div>
            </div>
            {s.state.kind === 'done' && <span className="text-primary font-bold">✓</span>}
          </li>
        ))}
      </ol>

      {offerSample && (
        <div className="mt-6 bg-secondary/50 border border-secondary rounded-2xl px-5 py-4 text-sm flex items-center justify-between gap-3 flex-wrap">
          <span>Having a rough run? You can still see the full product experience.</span>
          <button
            onClick={loadSample}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold whitespace-nowrap"
          >
            Show me a sample instead
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground italic" aria-live="polite">
        {TIPS[tip]}
      </p>
    </main>
  );
}
