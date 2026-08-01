import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

/**
 * TripME agent runner.
 * POST { agent: 'mood'|'destination'|'budget'|'itinerary'|'booking', payload: object }
 * -> { ok: true, data } | { ok: false, error, retryAfterSeconds? }
 *
 * The five agents form a sequential pipeline; each one receives a structured
 * JSON brief assembled by the frontend from the previous agents' outputs.
 * GROQ_API_KEY lives only here, server-side.
 */

const MODEL = 'llama-3.3-70b-versatile';

interface AgentConfig {
  system: string;
  temperature: number;
  maxTokens: number;
  /** top-level keys that must exist for the response to count as valid */
  requiredKeys: string[];
}

const AGENTS: Record<string, AgentConfig> = {
  mood: {
    temperature: 0.5,
    maxTokens: 700,
    requiredKeys: ['moodProfile', 'travelIntent', 'destinationParameters', 'personalizationNote'],
    system: `You are the Mood Agent, first of five agents in TripME, an AI travel planner for India-origin travellers. Convert the traveller's mood and constraints into structured travel parameters for the Destination Agent. Respond with ONLY valid JSON, no markdown, matching exactly:
{"moodProfile":{"primaryMood":string,"energyLevel":"low"|"medium"|"high","pace":"chill"|"balanced"|"packed","socialSetting":string},"travelIntent":string,"destinationParameters":{"settingTypes":[string],"climatePreference":string,"maxOneWayTravelHours":number,"crowdTolerance":"low"|"medium"|"high","experienceThemes":[string]},"personalizationNote":string}
Rules: travelIntent is one warm sentence describing what this trip should feel like. settingTypes from: beach, mountains, city, heritage, nature, desert, backwaters, island. Respect budget realism: low budgets mean shorter maxOneWayTravelHours. If payload.pastTrips exists, bias experienceThemes toward those patterns and say how in personalizationNote; otherwise personalizationNote is "First trip — no history yet."`,
  },
  destination: {
    temperature: 0.7,
    maxTokens: 900,
    requiredKeys: ['selected', 'alternates', 'decisionNote'],
    system: `You are the Destination Agent in TripME. Given a mood profile, destination parameters, origin city, start date, duration, travellers and total budget in INR, choose the single best-fit destination plus two alternates. Prefer destinations realistically reachable from the origin within budget (India first; nearby international only if budget clearly allows). Respond with ONLY valid JSON matching exactly:
{"selected":{"name":string,"region":string,"country":string,"whyMatched":string,"travelFromOrigin":{"mode":string,"approxHours":number},"weatherAtTravelDates":string,"crowdLevel":string,"dailyCostBandINR":string},"alternates":[{"name":string,"oneLineReason":string},{"name":string,"oneLineReason":string}],"decisionNote":string}
Rules: whyMatched must reference the traveller's mood words, not generic praise. weatherAtTravelDates must reflect the actual month of travel. dailyCostBandINR like "₹2,500–₹4,000/day". decisionNote is one sentence on why selected beat the alternates.`,
  },
  budget: {
    temperature: 0.3,
    maxTokens: 800,
    requiredKeys: ['currency', 'totalINR', 'allocation', 'perDaySpendINR', 'savingTips'],
    system: `You are the Budget Optimizer Agent in TripME. Allocate the traveller's total INR budget across the trip BEFORE any booking, for the selected destination, duration and travellers. Respond with ONLY valid JSON matching exactly:
{"currency":"INR","totalINR":number,"allocation":{"transport":{"amountINR":number,"pct":number,"note":string},"stay":{"amountINR":number,"pct":number,"tier":string,"note":string},"food":{"amountINR":number,"pct":number,"note":string},"activities":{"amountINR":number,"pct":number,"note":string},"buffer":{"amountINR":number,"pct":number,"note":string}},"perDaySpendINR":number,"savingTips":[string,string,string]}
Rules: amounts must sum exactly to totalINR; buffer 8–12%. Be realistic for the destination's cost band and the group size; notes are one practical line each (e.g., which class of transport or stay tier this buys). perDaySpendINR = (food+activities) / number of days, rounded.`,
  },
  itinerary: {
    temperature: 0.7,
    maxTokens: 3400,
    requiredKeys: ['days', 'languageCard', 'packingTips'],
    system: `You are the Itinerary Agent in TripME. Build a realistic day-by-day plan for the selected destination that fits the budget allocation, mood profile, pace and food preference. Respond with ONLY valid JSON matching exactly:
{"days":[{"day":number,"theme":string,"morning":{"activity":string,"area":string,"approxCostINR":number},"afternoon":{"activity":string,"area":string,"approxCostINR":number},"evening":{"activity":string,"area":string,"approxCostINR":number},"meals":string,"swapIfNeeded":string}],"languageCard":{"language":string,"phrases":[{"english":string,"local":string,"phonetic":string}]},"packingTips":[string]}
Rules: exactly one entry per trip day. Activity costs must stay within the activities+food allocation overall. meals is one line honouring the food preference with a named local dish or spot type. swapIfNeeded is one alternative for rain or low energy. languageCard uses the destination's local language with exactly 8 useful phrases (greetings, thanks, how much, help, food, directions). 3–5 packingTips specific to the season and activities.`,
  },
  booking: {
    temperature: 0.4,
    maxTokens: 900,
    requiredKeys: ['simulated', 'bookings', 'totalCommittedINR', 'remainingBudgetINR'],
    system: `You are the Booking Agent in TripME, running in DEMO MODE: you prepare simulated bookings only; no real reservation is ever made. From the selected destination, dates, travellers, budget allocation and highlight activities, produce booking line items. Respond with ONLY valid JSON matching exactly:
{"simulated":true,"bookings":[{"type":"transport"|"stay"|"activity","title":string,"detail":string,"dates":string,"amountINR":number,"budgetCategory":string}],"totalCommittedINR":number,"remainingBudgetINR":number,"bookingNote":"Demo mode — no real reservations made."}
Rules: 3–4 bookings: one transport (match the Destination Agent's suggested mode; title like "Bengaluru → Gokarna overnight sleeper bus", generic operators only, never real brand names), one stay ("3 nights · beach-side guesthouse (sample property)"), one or two activities from the itinerary highlights. Amounts must come from and respect the allocation; totalCommittedINR = sum; remainingBudgetINR = totalINR − sum and must be ≥ 0.`,
  },
};

function stripFences(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return t.trim();
}

function tryParse(text: string, requiredKeys: string[]): object | null {
  try {
    const obj = JSON.parse(stripFences(text));
    if (typeof obj !== 'object' || obj === null) return null;
    for (const key of requiredKeys) {
      if (!(key in obj)) return null;
    }
    return obj;
  } catch {
    return null;
  }
}

/**
 * Deterministic guardrails on top of the model output.
 * LLMs drift on arithmetic; money must not. The budget must sum exactly to
 * the requested total and booking totals must be internally consistent.
 */
function postProcess(agent: string, data: Record<string, unknown>, payload: Record<string, unknown>): object {
  if (agent === 'budget') {
    const total = Number(payload.budgetTotalINR);
    const durationDays = Math.max(1, Number(payload.durationDays) || 1);
    const alloc = data.allocation as Record<string, { amountINR: number; pct: number }> | undefined;
    if (!alloc || !Number.isFinite(total)) return data;
    const keys = ['transport', 'stay', 'food', 'activities', 'buffer'];
    for (const k of keys) {
      if (!alloc[k]) return data; // schema drift — let the frontend render what exists
      alloc[k].amountINR = Math.max(0, Math.round(Number(alloc[k].amountINR) || 0));
    }
    let sum = keys.reduce((s, k) => s + alloc[k].amountINR, 0);
    // Buffer absorbs the drift; if it would go negative, take from the largest category.
    alloc.buffer.amountINR += total - sum;
    if (alloc.buffer.amountINR < 0) {
      const largest = keys
        .filter((k) => k !== 'buffer')
        .sort((a, b) => alloc[b].amountINR - alloc[a].amountINR)[0];
      alloc[largest].amountINR += alloc.buffer.amountINR;
      alloc.buffer.amountINR = 0;
    }
    sum = keys.reduce((s, k) => s + alloc[k].amountINR, 0);
    for (const k of keys) alloc[k].pct = Math.round((alloc[k].amountINR / total) * 100);
    data.totalINR = sum;
    data.perDaySpendINR = Math.round(
      (alloc.food.amountINR + alloc.activities.amountINR) / durationDays,
    );
  }

  if (agent === 'booking') {
    const total = Number(payload.totalINR);
    let items = (data.bookings as { amountINR: number }[] | undefined) ?? [];
    items = items.filter((b) => b && Number.isFinite(Number(b.amountINR)));
    items.forEach((b) => (b.amountINR = Math.max(0, Math.round(Number(b.amountINR)))));
    // Never let simulated commitments exceed the stated budget.
    if (Number.isFinite(total)) {
      while (items.length > 1 && items.reduce((s, b) => s + b.amountINR, 0) > total) {
        items.pop();
      }
    }
    const committed = items.reduce((s, b) => s + b.amountINR, 0);
    data.bookings = items;
    data.totalCommittedINR = committed;
    data.remainingBudgetINR = Number.isFinite(total) ? Math.max(0, total - committed) : 0;
    data.simulated = true;
    data.bookingNote = 'Demo mode — no real reservations made.';
  }

  return data;
}

let groq: Groq | null = null;
function getGroq(): Groq {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

async function callModel(config: AgentConfig, payload: object, strict: boolean): Promise<string> {
  const system = strict
    ? config.system + '\nReturn ONLY valid JSON matching the schema. No prose.'
    : config.system;
  const res = await getGroq().chat.completions.create({
    model: MODEL,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify(payload) },
    ],
  });
  return res.choices[0]?.message?.content ?? '';
}

export async function POST(request: NextRequest) {
  let body: { agent?: string; payload?: object };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 400 });
  }

  const agentKey = body.agent ?? '';
  const config = AGENTS[agentKey];
  if (!config || typeof body.payload !== 'object' || body.payload === null) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ ok: false, error: 'missing_key' }, { status: 503 });
  }

  try {
    let raw = await callModel(config, body.payload, false);
    let data = tryParse(raw, config.requiredKeys);
    if (!data) {
      // one strict retry, per contract
      raw = await callModel(config, body.payload, true);
      data = tryParse(raw, config.requiredKeys);
    }
    if (!data) {
      console.error(`[TripME] ${body.agent}: parse failed after retry`);
      return NextResponse.json({ ok: false, error: 'parse_failed' }, { status: 502 });
    }
    const processed = postProcess(
      agentKey,
      data as Record<string, unknown>,
      body.payload as Record<string, unknown>,
    );
    return NextResponse.json({ ok: true, data: processed });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json(
        { ok: false, error: 'rate_limited', retryAfterSeconds: 12 },
        { status: 429 },
      );
    }
    console.error(`[TripME] ${body.agent}: model call failed`, err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 502 });
  }
}
