/**
 * Frontend orchestration for the 5-agent pipeline.
 * Each agent's payload is assembled from the previous agents' structured
 * outputs — this handoff map IS the multi-agent architecture.
 */

import type {
  AgentApiResponse,
  AgentKey,
  BudgetOutput,
  DestinationOutput,
  ItineraryOutput,
  MoodOutput,
  SelectedDestination,
  TripInput,
} from './types';
import { getPastTripsCompact } from './storage';

export interface AgentMeta {
  key: AgentKey;
  name: string;
  emoji: string;
  running: string;
  doneSummary: (ctx: PipelineContext) => string;
}

export interface PipelineContext {
  input: TripInput;
  mood?: MoodOutput;
  destination?: DestinationOutput;
  budget?: BudgetOutput;
  itinerary?: ItineraryOutput;
  booking?: { bookings: unknown[] };
}

export const AGENT_SEQUENCE: AgentMeta[] = [
  {
    key: 'mood',
    name: 'Mood Agent',
    emoji: '✨',
    running: 'Reading your vibe and turning it into travel parameters…',
    doneSummary: (ctx) =>
      ctx.mood
        ? `Matched: ${ctx.mood.moodProfile.primaryMood}, ${ctx.mood.moodProfile.pace} pace`
        : 'Done',
  },
  {
    key: 'destination',
    name: 'Destination Agent',
    emoji: '🗺️',
    running: 'Scanning destinations that fit your mood, month and budget…',
    doneSummary: (ctx) =>
      ctx.destination ? `Picked ${ctx.destination.selected.name} (+2 alternates)` : 'Done',
  },
  {
    key: 'budget',
    name: 'Budget Optimizer',
    emoji: '💰',
    running: 'Allocating your budget across travel, stay, food and fun…',
    doneSummary: (ctx) =>
      ctx.budget ? `Budget locked, ₹${ctx.budget.perDaySpendINR.toLocaleString('en-IN')}/day` : 'Done',
  },
  {
    key: 'itinerary',
    name: 'Itinerary Agent',
    emoji: '📅',
    running: 'Building your day-by-day plan…',
    doneSummary: (ctx) =>
      ctx.itinerary ? `${ctx.itinerary.days.length} days planned` : 'Done',
  },
  {
    key: 'booking',
    name: 'Booking Agent',
    emoji: '🎫',
    running: 'Preparing your bookings (demo)…',
    doneSummary: (ctx) =>
      ctx.booking ? `${ctx.booking.bookings.length} bookings ready for approval` : 'Done',
  },
];

/** Build each agent's payload from the running context — the handoff map. */
export function buildPayload(agent: AgentKey, ctx: PipelineContext): object {
  const { input } = ctx;
  switch (agent) {
    case 'mood': {
      const pastTrips = getPastTripsCompact();
      return {
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
    }
    case 'destination':
      return {
        moodProfile: ctx.mood!.moodProfile,
        destinationParameters: ctx.mood!.destinationParameters,
        travelIntent: ctx.mood!.travelIntent,
        originCity: input.originCity,
        startDate: input.startDate,
        durationDays: input.durationDays,
        travelers: input.travelers,
        budgetTotalINR: input.budgetTotalINR,
      };
    case 'budget':
      return {
        selected: ctx.destination!.selected,
        budgetTotalINR: input.budgetTotalINR,
        durationDays: input.durationDays,
        travelers: input.travelers,
        primaryMood: ctx.mood!.moodProfile.primaryMood,
        pace: ctx.mood!.moodProfile.pace,
      };
    case 'itinerary':
      return {
        selected: ctx.destination!.selected,
        allocation: ctx.budget!.allocation,
        perDaySpendINR: ctx.budget!.perDaySpendINR,
        durationDays: input.durationDays,
        startDate: input.startDate,
        moodProfile: ctx.mood!.moodProfile,
        foodPref: input.foodPref,
        pace: input.pace,
      };
    case 'booking': {
      const days = ctx.itinerary!.days;
      const highlightActivities = [
        days[0]?.morning.activity,
        days[1]?.morning.activity ?? days[0]?.afternoon.activity,
      ].filter(Boolean);
      return {
        selected: ctx.destination!.selected,
        startDate: input.startDate,
        durationDays: input.durationDays,
        travelers: input.travelers,
        allocation: ctx.budget!.allocation,
        totalINR: input.budgetTotalINR,
        highlightActivities,
      };
    }
  }
}

export class AgentError extends Error {
  constructor(
    public code: 'parse_failed' | 'rate_limited' | 'server_error' | 'missing_key' | 'network',
    public retryAfterSeconds?: number,
  ) {
    super(code);
  }
}

/** Call one agent through the backend. Throws AgentError on failure. */
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

/** Synthesize a minimal `selected` object from an alternate, for destination switching. */
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

/* ---- Deep links (built by the frontend, never the model) ---- */
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

/** Monospace demo booking reference like TRPME-8F3K2A. */
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
