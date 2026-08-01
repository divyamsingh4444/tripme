'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AGENT_SEQUENCE,
  AgentError,
  buildPayload,
  runAgent,
  sleep,
  type PipelineContext,
} from '@/lib/agents-client';
import type {
  BookingOutput,
  BudgetOutput,
  DestinationOutput,
  ItineraryOutput,
  MoodOutput,
  TripInput,
  TripState,
} from '@/lib/types';
import { getPastTripsCompact, getPendingInput, setCurrentTrip } from '@/lib/storage';
import { buildSampleTrip } from '@/lib/sample-trip';

type StepStatus =
  | { kind: 'pending' }
  | { kind: 'running' }
  | { kind: 'waiting'; secondsLeft: number }
  | { kind: 'done'; summary: string }
  | { kind: 'error'; message: string };

const TIPS = [
  'Agents pass structured briefs to each other — no context is lost between steps.',
  'The Budget Optimizer locks allocations before a single booking is prepared.',
  'Every plan is generated live by Llama 3.3 70B — nothing here is pre-written.',
  'Bookings are simulated and always wait for your approval. Demo mode, honestly.',
  'Save a trip and the Mood Agent learns your patterns for next time.',
];

export default function RunPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<StepStatus[]>(
    AGENT_SEQUENCE.map(() => ({ kind: 'pending' })),
  );
  const [elapsed, setElapsed] = useState(0);
  const [tip, setTip] = useState(0);
  const [offerSample, setOfferSample] = useState(false);
  const [noInput, setNoInput] = useState(false);

  const started = useRef(false);
  const ctxRef = useRef<PipelineContext | null>(null);
  const hardFails = useRef(0);
  const timerStart = useRef(0);
  const finished = useRef(false);

  const setStep = (i: number, status: StepStatus) =>
    setSteps((prev) => prev.map((s, j) => (j === i ? status : s)));

  useEffect(() => {
    if (started.current) return; // guard against StrictMode double-run
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

    void runFrom(0);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runFrom(startIndex: number) {
    const ctx = ctxRef.current!;
    for (let i = startIndex; i < AGENT_SEQUENCE.length; i++) {
      const meta = AGENT_SEQUENCE[i];
      setStep(i, { kind: 'running' });
      let rateRetries = 0;

      while (true) {
        try {
          const payload = buildPayload(meta.key, ctx);
          const data = await runAgent<object>(meta.key, payload);
          // stash by key
          if (meta.key === 'mood') ctx.mood = data as MoodOutput;
          else if (meta.key === 'destination') ctx.destination = data as DestinationOutput;
          else if (meta.key === 'budget') ctx.budget = data as BudgetOutput;
          else if (meta.key === 'itinerary') ctx.itinerary = data as ItineraryOutput;
          else if (meta.key === 'booking') ctx.booking = data as BookingOutput;
          hardFails.current = 0;
          setStep(i, { kind: 'done', summary: meta.doneSummary(ctx) });
          break;
        } catch (err) {
          const e = err instanceof AgentError ? err : new AgentError('server_error');
          if (e.code === 'rate_limited' && rateRetries < 2) {
            rateRetries++;
            const wait = e.retryAfterSeconds ?? 12;
            for (let s = wait; s > 0; s--) {
              setStep(i, { kind: 'waiting', secondsLeft: s });
              await sleep(1000);
            }
            continue; // auto-retry
          }
          hardFails.current++;
          if (hardFails.current >= 2) setOfferSample(true);
          const msg =
            e.code === 'rate_limited'
              ? 'Still busy after retries — give it a few seconds, then retry.'
              : e.code === 'missing_key'
                ? 'The AI backend is not configured on this deployment.'
                : e.code === 'network'
                  ? 'Network hiccup — check your connection and retry.'
                  : `The ${meta.name} hit a snag.`;
          setStep(i, { kind: 'error', message: msg });
          return; // stop pipeline; user can retry this step
        }
      }

      if (i < AGENT_SEQUENCE.length - 1) await sleep(1200); // rate-limit spacing
    }

    // All five done — assemble and go.
    finished.current = true;
    const seconds = Math.floor((Date.now() - timerStart.current) / 1000);
    const state: TripState = {
      input: ctx.input,
      mood: ctx.mood as MoodOutput,
      destination: ctx.destination as DestinationOutput,
      budget: ctx.budget as BudgetOutput,
      itinerary: ctx.itinerary as ItineraryOutput,
      booking: ctx.booking as BookingOutput,
      plannedInSeconds: seconds,
      hadHistory: getPastTripsCompact().length > 0,
      createdAt: Date.now(),
    };
    setCurrentTrip(state);
    await sleep(700);
    router.push('/trip');
  }

  const retryStep = (i: number) => {
    hardFails.current = Math.max(0, hardFails.current - 1);
    void runFrom(i);
  };

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Planning your trip…</h1>
        <span className="font-mono text-lg font-semibold text-primary tabular-nums" aria-live="polite">
          {elapsed}s
        </span>
      </div>

      <ol className="space-y-3">
        {AGENT_SEQUENCE.map((meta, i) => {
          const st = steps[i];
          return (
            <li
              key={meta.key}
              className={`bg-card rounded-2xl border px-5 py-4 flex items-start gap-4 ${
                st.kind === 'running' || st.kind === 'waiting'
                  ? 'border-accent agent-active'
                  : st.kind === 'error'
                    ? 'border-destructive'
                    : 'border-border'
              }`}
            >
              <span className="text-2xl leading-none mt-0.5">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold">{meta.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {st.kind === 'pending' && 'Waiting…'}
                  {st.kind === 'running' && meta.running}
                  {st.kind === 'waiting' && (
                    <span>High demand — retrying in {st.secondsLeft}s…</span>
                  )}
                  {st.kind === 'done' && (
                    <span className="text-foreground font-medium">✓ {st.summary}</span>
                  )}
                  {st.kind === 'error' && <span className="text-destructive">{st.message}</span>}
                </div>
                {st.kind === 'error' && (
                  <button
                    onClick={() => retryStep(i)}
                    className="mt-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                  >
                    Retry step
                  </button>
                )}
              </div>
              {st.kind === 'done' && <span className="text-primary font-bold">✓</span>}
            </li>
          );
        })}
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
