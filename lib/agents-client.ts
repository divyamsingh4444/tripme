/**
 * Frontend orchestration for the 7-agent system.
 *
 * This is NOT a straight line. The Referee Agent audits the Itinerary Agent's
 * real costs against the Budget Agent's allocation and, when they conflict,
 * sends the brief BACK to the Budget Agent to re-allocate — so the pipeline is
 * a graph with a feedback edge, not a sequence.
 *
 * In group mode the agent count is dynamic: one Traveller Advocate per person
 * argues for their human, and the Referee negotiates consensus between them.
 */

import type {
  AgentApiResponse,
  AgentKey,
  BookingItem,
  BudgetOutput,
  ConflictAudit,
  CorporatePolicy,
  ItineraryOutput,
  SelectedDestination,
  SplitLine,
  TripInput,
  TripMode,
  TripState,
} from './types';
import { getPastTripsCompact } from './storage';

/* ---------- deterministic audit: code owns the money maths ---------- */

/** Sum every planned activity cost across the itinerary. */
export function itineraryTotal(itinerary: ItineraryOutput): number {
  return itinerary.days.reduce(
    (sum, d) =>
      sum +
      (Number(d.morning?.approxCostINR) || 0) +
      (Number(d.afternoon?.approxCostINR) || 0) +
      (Number(d.evening?.approxCostINR) || 0),
    0,
  );
}

/**
 * The Referee's trigger. Activity spend is checked against the activities
 * allocation plus a slice of food (many itinerary items bundle a meal).
 */
export function auditItineraryVsBudget(
  itinerary: ItineraryOutput,
  budget: BudgetOutput,
): ConflictAudit {
  const total = itineraryTotal(itinerary);
  const allowance =
    (Number(budget.allocation?.activities?.amountINR) || 0) +
    Math.round((Number(budget.allocation?.food?.amountINR) || 0) * 0.5);
  const gap = total - allowance;
  return {
    itineraryTotalINR: total,
    allowanceINR: allowance,
    gapINR: gap,
    // Ignore rounding noise; arbitrate only real overruns.
    hasConflict: gap > Math.max(500, allowance * 0.05),
  };
}

/* ---------- agent metadata ---------- */

export interface AgentMeta {
  key: AgentKey;
  name: string;
  emoji: string;
  running: string;
}

export const AGENT_META: Record<AgentKey, AgentMeta> = {
  mood: { key: 'mood', name: 'Mood & Intent Agent', emoji: '✨', running: 'Reading your vibe and turning it into travel parameters…' },
  mood_family: { key: 'mood_family', name: 'Mood & Intent Agent · household', emoji: '👨‍👩‍👧', running: 'Reading the household and finding the most constrained traveller…' },
  mood_pilgrimage: { key: 'mood_pilgrimage', name: 'Mood & Intent Agent · faith', emoji: '🕉', running: 'Sequencing the circuit, season, darshan timing and access…' },
  mood_corporate: { key: 'mood_corporate', name: 'Mood & Intent Agent · policy', emoji: '💼', running: 'Translating travel policy into hard constraints…' },
  advocate: { key: 'advocate', name: 'Traveller Advocate', emoji: '🙋', running: 'Arguing this traveller’s case…' },
  consensus: { key: 'consensus', name: 'Referee Agent · consensus', emoji: '⚖️', running: 'Negotiating between the advocates…' },
  destination: { key: 'destination', name: 'Discovery Agent', emoji: '🗺️', running: 'Scanning destinations that satisfy every non-negotiable…' },
  budget: { key: 'budget', name: 'Budget Agent', emoji: '💰', running: 'Allocating your budget across travel, stay, food and fun…' },
  itinerary: { key: 'itinerary', name: 'Itinerary Agent', emoji: '📅', running: 'Building your day-by-day plan at real local prices…' },
  referee: { key: 'referee', name: 'Referee Agent · budget audit', emoji: '⚖️', running: 'Auditing the itinerary against the budget…' },
  referee_family: { key: 'referee_family', name: 'Referee Agent · pacing audit', emoji: '⚖️', running: 'Checking the plan is survivable for everyone travelling…' },
  referee_policy: { key: 'referee_policy', name: 'Referee Agent · compliance audit', emoji: '⚖️', running: 'Checking every booking against travel policy…' },
  booking: { key: 'booking', name: 'Booking Agent', emoji: '🎫', running: 'Preparing your bookings (demo)…' },
  notification: { key: 'notification', name: 'Notification Agent', emoji: '🔔', running: 'Scheduling your trip reminders…' },
};

/** Which Intent-agent variant each entry path uses. */
export function intentAgentFor(mode: TripMode): AgentKey {
  if (mode === 'family') return 'mood_family';
  if (mode === 'pilgrimage') return 'mood_pilgrimage';
  if (mode === 'corporate') return 'mood_corporate';
  return 'mood';
}

export const usesAdvocates = (mode: TripMode) => mode === 'couple' || mode === 'group';

export const MODE_LABEL: Record<TripMode, string> = {
  solo: 'Solo',
  couple: 'Couple',
  group: 'Group',
  family: 'Family',
  pilgrimage: 'Pilgrimage',
  corporate: 'Corporate',
};

/* ---------- payload builders (the handoff map) ---------- */

export interface PipelineContext {
  input: TripInput;
  advocates?: unknown[];
  /** Intent-agent output. Mode variants add householdConstraints / faithContext / policyBrief. */
  mood?: {
    moodProfile: unknown;
    destinationParameters: unknown;
    travelIntent: string;
    householdConstraints?: unknown;
    faithContext?: unknown;
    policyBrief?: unknown;
  };
  destination?: { selected: SelectedDestination };
  budget?: BudgetOutput;
  itinerary?: ItineraryOutput;
  booking?: { bookings: BookingItem[] };
  /** set by the Referee when it orders the Budget Agent to re-allocate */
  refereeInstruction?: string;
  /** hard ceiling handed to the Itinerary Agent only after arbitration */
  itineraryCapINR?: number;
}

export function moodPayload(input: TripInput): object {
  const pastTrips = getPastTripsCompact();
  const base = {
    mode: input.mode,
    mood: input.mood,
    moodNote: input.moodNote,
    budgetTotalINR: input.budgetTotalINR,
    durationDays: input.durationDays,
    originCity: input.originCity,
    startDate: input.startDate,
    travelers: input.travelers,
    foodPref: input.foodPref,
    pace: input.pace,
    ...(pastTrips.length > 0 ? { pastTrips } : {}),
  };
  if (input.mode === 'family') return { ...base, household: input.household };
  if (input.mode === 'pilgrimage') return { ...base, pilgrimage: input.pilgrimage };
  if (input.mode === 'corporate') return { ...base, corporate: input.corporate };
  return base;
}

export function advocatePayload(input: TripInput, index: number): object {
  const t = input.travellersList[index];
  return {
    traveller: t.name,
    mood: t.mood,
    primaryMood: t.mood,
    note: t.note,
    budgetINR: t.budgetINR,
    tripContext: {
      originCity: input.originCity,
      startDate: input.startDate,
      durationDays: input.durationDays,
      groupSize: input.travellersList.length,
    },
  };
}

export function consensusPayload(input: TripInput, advocates: unknown[]): object {
  return {
    advocates,
    groupSize: input.travellersList.length,
    budgetTotalINR: input.budgetTotalINR,
    durationDays: input.durationDays,
    originCity: input.originCity,
    startDate: input.startDate,
    foodPref: input.foodPref,
    pace: input.pace,
  };
}

export function buildPayload(agent: AgentKey, ctx: PipelineContext): object {
  const { input } = ctx;
  /** Mode-specific brief fields the Intent agent produced, forwarded downstream. */
  const modeBrief = {
    ...(ctx.mood?.householdConstraints ? { householdConstraints: ctx.mood.householdConstraints } : {}),
    ...(ctx.mood?.faithContext ? { faithContext: ctx.mood.faithContext } : {}),
    ...(ctx.mood?.policyBrief ? { policyBrief: ctx.mood.policyBrief } : {}),
  };

  switch (agent) {
    case 'mood':
    case 'mood_family':
    case 'mood_pilgrimage':
    case 'mood_corporate':
      return moodPayload(input);
    case 'destination':
      return {
        mode: input.mode,
        moodProfile: ctx.mood!.moodProfile,
        destinationParameters: ctx.mood!.destinationParameters,
        travelIntent: ctx.mood!.travelIntent,
        originCity: input.originCity,
        startDate: input.startDate,
        durationDays: input.durationDays,
        travelers: input.travelers,
        budgetTotalINR: input.budgetTotalINR,
        ...modeBrief,
        // Corporate travel: the meeting fixes the city, so Discovery picks the district.
        ...(input.mode === 'corporate' && input.corporate?.destinationCity
          ? { fixedDestinationCity: input.corporate.destinationCity }
          : {}),
      };
    case 'budget':
      return {
        mode: input.mode,
        selected: ctx.destination!.selected,
        budgetTotalINR: input.budgetTotalINR,
        durationDays: input.durationDays,
        travelers: input.travelers,
        primaryMood: (ctx.mood!.moodProfile as { primaryMood: string }).primaryMood,
        pace: input.pace,
        ...modeBrief,
        ...(ctx.refereeInstruction ? { refereeInstruction: ctx.refereeInstruction } : {}),
      };
    case 'referee_family':
      return {
        household: input.household,
        householdConstraints: ctx.mood?.householdConstraints,
        days: ctx.itinerary!.days,
        durationDays: input.durationDays,
        destination: ctx.destination!.selected.name,
      };
    case 'referee_policy': {
      // Normalise to per-night / per-day here so the Referee compares like with
      // like. Left to the model, it read a multi-night stay total as a nightly
      // rate and raised a false violation.
      const nights = Math.max(1, input.durationDays - 1);
      const alloc = ctx.budget!.allocation;
      const policy = (ctx.mood?.policyBrief ?? input.corporate) as CorporatePolicy | undefined;
      return {
        policyBrief: policy,
        bookings: ctx.booking!.bookings,
        allocation: alloc,
        durationDays: input.durationDays,
        nights,
        totalBudgetINR: input.budgetTotalINR,
        computed: {
          stayTotalINR: alloc.stay.amountINR,
          stayPerNightINR: Math.round(alloc.stay.amountINR / nights),
          stayCapPerNightINR: policy?.hotelCapPerNightINR ?? null,
          stayWithinCap:
            policy?.hotelCapPerNightINR != null
              ? Math.round(alloc.stay.amountINR / nights) <= policy.hotelCapPerNightINR
              : null,
          foodTotalINR: alloc.food.amountINR,
          foodPerDayINR: Math.round(alloc.food.amountINR / Math.max(1, input.durationDays)),
          perDiemCapINR: policy?.perDiemINR ?? null,
          foodWithinPerDiem:
            policy?.perDiemINR != null
              ? Math.round(alloc.food.amountINR / Math.max(1, input.durationDays)) <= policy.perDiemINR
              : null,
        },
      };
    }
    case 'itinerary':
      // Deliberately withholds the budget allocation on the first pass: the
      // Itinerary Agent optimises for experience, the Budget Agent for thrift,
      // and the Referee reconciles. A cap only appears after arbitration.
      return {
        mode: input.mode,
        selected: ctx.destination!.selected,
        destinationParameters: ctx.mood!.destinationParameters,
        durationDays: input.durationDays,
        startDate: input.startDate,
        moodProfile: ctx.mood!.moodProfile,
        foodPref: input.foodPref,
        pace: input.pace,
        travelers: input.travelers,
        ...modeBrief,
        ...(input.mode === 'family' ? { household: input.household } : {}),
        ...(ctx.itineraryCapINR ? { spendCapINR: ctx.itineraryCapINR } : {}),
      };
    case 'referee': {
      const audit = auditItineraryVsBudget(ctx.itinerary!, ctx.budget!);
      return {
        allocation: ctx.budget!.allocation,
        totalBudgetINR: input.budgetTotalINR,
        itineraryPlannedActivityCostINR: audit.itineraryTotalINR,
        activitiesAllowanceINR: audit.allowanceINR,
        gapINR: audit.gapINR,
        durationDays: input.durationDays,
        destination: ctx.destination!.selected.name,
      };
    }
    case 'booking': {
      const days = ctx.itinerary!.days;
      const highlightActivities = [
        days[0]?.morning.activity,
        days[1]?.morning.activity ?? days[0]?.afternoon.activity,
      ].filter(Boolean);
      return {
        mode: input.mode,
        selected: ctx.destination!.selected,
        startDate: input.startDate,
        durationDays: input.durationDays,
        travelers: input.travelers,
        allocation: ctx.budget!.allocation,
        totalINR: input.budgetTotalINR,
        highlightActivities,
        ...modeBrief,
      };
    }
    case 'notification':
      return {
        destination: ctx.destination!.selected.name,
        originCity: input.originCity,
        startDate: input.startDate,
        durationDays: input.durationDays,
        bookings: ctx.booking!.bookings,
        days: ctx.itinerary!.days.map((d) => ({ day: d.day, theme: d.theme })),
        travellerContext: {
          mode: input.mode,
          groupSize: usesAdvocates(input.mode)
            ? input.travellersList.length
            : input.mode === 'family'
              ? input.household.length
              : 1,
          travellerNames: usesAdvocates(input.mode)
            ? input.travellersList.map((t) => t.name)
            : input.household.map((h) => h.name),
          primaryMood: (ctx.mood!.moodProfile as { primaryMood: string }).primaryMood,
          // Drives channel choice: SMS/voice fallback, calendar sync, organiser-only.
          digitalFluency:
            input.mode === 'pilgrimage'
              ? 'low — prefer SMS or voice call fallback, low-connectivity route'
              : 'high',
          accessibility: input.pilgrimage?.accessibility,
          organiserOnly: input.mode === 'family',
          calendarSync: input.mode === 'corporate',
        },
        ...modeBrief,
      };
    default:
      return {};
  }
}

/* ---------- transport ---------- */

export class AgentError extends Error {
  constructor(
    public code: 'parse_failed' | 'rate_limited' | 'server_error' | 'missing_key' | 'network',
    public retryAfterSeconds?: number,
  ) {
    super(code);
  }
}

export async function runAgent<T>(agent: AgentKey, payload: object): Promise<T> {
  let res: Response;
  try {
    res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, payload }),
    });
  } catch {
    throw new AgentError('network');
  }
  let body: AgentApiResponse;
  try {
    body = await res.json();
  } catch {
    throw new AgentError('server_error');
  }
  if (!body.ok || !body.data) {
    throw new AgentError(body.error ?? 'server_error', body.retryAfterSeconds);
  }
  return body.data as T;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function selectedFromAlternate(
  alt: { name: string; oneLineReason: string },
  previous: SelectedDestination,
): SelectedDestination {
  return {
    name: alt.name,
    region: '',
    country: previous.country || 'India',
    whyMatched: alt.oneLineReason,
    travelFromOrigin: { mode: previous.travelFromOrigin?.mode ?? 'road/rail', approxHours: 0 },
    weatherAtTravelDates: '',
    crowdLevel: '',
    dailyCostBandINR: '',
  };
}

/* ---------- expense split (derived from approved bookings) ---------- */

export function computeSplit(state: TripState, approvedIdx: Record<number, boolean>): SplitLine[] {
  const names =
    state.input.mode === 'group' && state.input.travellersList.length > 0
      ? state.input.travellersList.map((t) => t.name)
      : ['You'];
  const approved = state.booking.bookings.filter((_, i) => approvedIdx[i]);
  const total = approved.reduce((s, b) => s + b.amountINR, 0);
  const perHead = names.length > 0 ? total / names.length : 0;

  // Round-robin payer assignment keeps the demo deterministic and explainable.
  const paid = new Map<string, number>(names.map((n) => [n, 0]));
  approved.forEach((b, i) => {
    const payer = names[i % names.length];
    paid.set(payer, (paid.get(payer) ?? 0) + b.amountINR);
  });

  return names.map((n) => {
    const p = paid.get(n) ?? 0;
    return {
      traveller: n,
      shareINR: Math.round(perHead),
      paidINR: p,
      balanceINR: Math.round(p - perHead),
    };
  });
}

/* ---------- deep links (built by the frontend, never the model) ---------- */

export function flightsLink(origin: string, destination: string, dateISO: string): string {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(
    `Flights from ${origin} to ${destination} on ${dateISO}`,
  )}`;
}

export function hotelLink(destination: string, checkin: string, checkout: string, adults: number): string {
  const p = new URLSearchParams({
    ss: destination,
    checkin,
    checkout,
    group_adults: String(adults),
  });
  return `https://www.booking.com/searchresults.html?${p.toString()}`;
}

export function activitiesLink(destination: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`things to do in ${destination}`)}`;
}

export function bookingRef(seed: string, index: number): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let hash = index * 7 + 13;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[hash % chars.length];
    hash = (hash * 1103515245 + 12345) >>> 0;
  }
  return `TRPME-${out}`;
}
