'use client';

/**
 * TripME Assistant — the product and your trips, answerable, on every page.
 *
 * Three sources of truth, cheapest first, and the order is the whole design:
 *
 *   1. THE PRODUCT (lib/assistant-knowledge.ts). "What is this", "are the
 *      bookings real", "where are my trips" are lookups, not reasoning. Written
 *      once, answered instantly, free, and — the part that matters — incapable
 *      of inventing a feature we do not have.
 *   2. YOUR DATA. Saved trips, the plan currently open, your Travel DNA. Read
 *      straight from this browser, so it works offline and costs nothing.
 *   3. THE MODEL, for genuinely open questions only, told to admit what it does
 *      not know rather than guess about someone's real journey.
 *
 * It lives in the layout rather than on the trip page, because most questions a
 * person has — what is this, how do I start, do I need an account — happen
 * before there is any trip to ask about.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { runAgent } from '@/lib/agents-client';
import { matchKnowledge } from '@/lib/assistant-knowledge';
import { applyChoices, itineraryWithEdits } from '@/lib/recompute';
import { fmtWhen, scheduleView } from '@/lib/notifications';
import { addDays, computeTravelDNA, fmtDate, fmtINR, getCurrentTrip, listTrips } from '@/lib/storage';
import type { SavedTrip, TripState } from '@/lib/types';

interface Reply {
  text: string;
  link?: { href: string; label: string };
  followUps?: string[];
  /** Set when the model answered, so the UI can be honest about the source. */
  viaModel?: boolean;
}

interface Message extends Reply {
  from: 'you' | 'tripme';
}

/* ------------------------------------------------------------------ */
/* Answers from the traveller's own data                               */
/* ------------------------------------------------------------------ */

function tripAnswer(question: string, trip: TripState): Reply | null {
  const q = question.toLowerCase();
  const asks = (...words: string[]) => words.some((w) => q.includes(w));
  const money = applyChoices(trip);
  const itinerary = itineraryWithEdits(trip.itinerary, trip.choices);
  const dest = trip.destination.selected;
  const endDate = addDays(trip.input.startDate, Math.max(0, trip.input.durationDays - 1));

  if (asks('where am i going', 'which destination', 'where are we going', 'where is the trip')) {
    return { text: `${dest.name}, ${dest.region}. ${dest.whyMatched}` };
  }

  if (asks('when do i leave', 'departure', 'when does the trip start', 'start date', 'what date')) {
    const first = scheduleView(trip.notification?.reminders ?? [], trip.input.startDate)[0];
    return {
      text: `You leave on ${fmtDate(trip.input.startDate)} and return ${fmtDate(endDate)} — ${trip.input.durationDays} days from ${trip.input.originCity}.${
        first?.at ? ` Your first reminder is ${fmtWhen(first.at)}.` : ''
      }`,
    };
  }

  if (asks('budget', 'how much', 'cost so far', 'spend', 'left', 'remaining')) {
    return {
      text: `Your budget is ${fmtINR(trip.input.budgetTotalINR)}. ${fmtINR(money.totalCommittedINR)} is committed across ${money.bookings.length} bookings, leaving ${fmtINR(Math.max(0, money.remainingBudgetINR))}.${
        money.overBudget ? ` You are ${fmtINR(money.overspendINR)} over.` : ''
      }`,
      followUps: ['How is the budget split?'],
    };
  }

  if (asks('where am i staying', 'my hotel', 'accommodation')) {
    const stay = money.bookings.find((b) => b.type === 'stay');
    return stay
      ? { text: `${stay.title}. ${stay.detail} — ${fmtINR(stay.amountINR)}.`, followUps: ['How do I change my hotel?'] }
      : { text: 'No stay is on this plan yet.' };
  }

  if (asks('how do i get there', 'my flight', 'my train', 'how am i travelling')) {
    const t = money.bookings.find((b) => b.type === 'transport');
    return t ? { text: `${t.title}. ${t.detail} — ${fmtINR(t.amountINR)}.` } : { text: 'No transport is on this plan yet.' };
  }

  if (asks('needs approval', 'to approve', 'unapproved')) {
    const needs = money.bookings.filter((b) => b.needsApprovalReason);
    return {
      text:
        needs.length === 0
          ? 'Nothing on this trip needs explicit approval — you can still approve each booking before confirming.'
          : `${needs.length} item${needs.length === 1 ? '' : 's'} need approval:\n` +
            needs.map((b) => `• ${b.title} (${fmtINR(b.amountINR)}) — ${b.needsApprovalReason}`).join('\n'),
      followUps: ['How do approvals work?'],
    };
  }

  if (asks('pack', 'packing', 'what should i bring', 'what to bring')) {
    return itinerary.packingTips.length
      ? { text: `• ${itinerary.packingTips.join('\n• ')}` }
      : { text: 'No packing tips on this plan.' };
  }

  const dayMatch = q.match(/day\s*(\d+)/);
  if (dayMatch) {
    const day = itinerary.days.find((d) => d.day === parseInt(dayMatch[1], 10));
    if (day) {
      return {
        text: `Day ${day.day} — ${day.theme}\n• Morning: ${day.morning.activity} (${fmtINR(day.morning.approxCostINR)})\n• Afternoon: ${day.afternoon.activity} (${fmtINR(day.afternoon.approxCostINR)})\n• Evening: ${day.evening.activity} (${fmtINR(day.evening.approxCostINR)})\n• Meals: ${day.meals}`,
      };
    }
    return { text: `This trip only has ${itinerary.days.length} days.` };
  }

  if (asks('what next', "what's next", 'upcoming', 'next reminder')) {
    const next = scheduleView(trip.notification?.reminders ?? [], trip.input.startDate).find((s) => !s.past);
    return next
      ? { text: `${next.reminder.title} — ${fmtWhen(next.at)}. ${next.reminder.body}` }
      : { text: 'Nothing upcoming on the reminder schedule.' };
  }

  if (asks('itinerary', 'my plan', 'what am i doing', 'schedule')) {
    return {
      text: itinerary.days
        .map((d) => `Day ${d.day} — ${d.theme}: ${d.morning.activity}, ${d.afternoon.activity}, ${d.evening.activity}`)
        .join('\n'),
    };
  }

  return null;
}

function savedTripsAnswer(question: string, trips: SavedTrip[]): Reply | null {
  const q = question.toLowerCase();
  const asksAbout =
    /\b(my trips|saved|any trips|how many trips|previous trips|past trips|do i have)\b/.test(q) ||
    q.includes('travel dna');

  if (!asksAbout) return null;

  if (q.includes('travel dna')) {
    const dna = computeTravelDNA();
    if (!dna || dna.tripCount === 0) {
      return {
        text: 'No Travel DNA yet — it builds from the trips you save, and then feeds your next plan so it starts smarter.',
        link: { href: '/', label: 'Plan your first trip' },
      };
    }
    return {
      text: `From ${dna.tripCount} saved trip${dna.tripCount === 1 ? '' : 's'}: your usual mood is ${dna.topMood?.mood ?? '—'}, you tend to spend about ${fmtINR(dna.avgPerDayINR)} a day, and your usual pace is ${dna.commonPace ?? '—'}.`,
      link: { href: '/trips', label: 'Open My Trips' },
    };
  }

  if (trips.length === 0) {
    return {
      text: 'You have no saved trips yet. Plan one and press Save trip — saved trips also build your Travel DNA, so the next plan starts from what you liked.',
      link: { href: '/', label: 'Plan a trip' },
      followUps: ['How do I plan a trip?'],
    };
  }

  const lines = trips
    .slice(0, 5)
    .map((t) => {
      const s = t.state;
      const status = s.status === 'confirmed' ? ' · confirmed' : '';
      return `• ${s.destination.selected.name} — ${fmtDate(s.input.startDate)}, ${s.input.durationDays} days, ${fmtINR(s.input.budgetTotalINR)}${status}`;
    })
    .join('\n');

  return {
    text: `You have ${trips.length} saved trip${trips.length === 1 ? '' : 's'}:\n${lines}${
      trips.length > 5 ? `\n…and ${trips.length - 5} more.` : ''
    }`,
    link: { href: '/trips', label: 'Open My Trips' },
  };
}

/* ------------------------------------------------------------------ */
/* Suggestions, by where the traveller is                              */
/* ------------------------------------------------------------------ */

function suggestionsFor(pathname: string, hasTrip: boolean, tripCount: number): string[] {
  if (pathname === '/trip' && hasTrip) {
    return ['What is on day 2?', 'How much is left?', 'What needs approval?', 'How do I change my hotel?', 'What should I pack?'];
  }
  if (pathname === '/trips') {
    return ['What are my saved trips?', "What's my Travel DNA?", 'How do I plan a trip?', 'Where is my data stored?'];
  }
  if (pathname === '/how-it-works') {
    return ['What are the seven agents?', 'What does the Referee do?', 'Are the bookings real?'];
  }
  if (pathname === '/contact' || pathname === '/signin') {
    return ['Do I need an account?', 'Where is my data stored?', 'Why did my plan stop halfway?'];
  }
  const base = ['What is TripME?', 'How do I plan a trip?', 'Can I travel outside India?', 'Are the bookings real?'];
  if (tripCount > 0) base.splice(1, 0, 'What are my saved trips?');
  return base;
}

/* ------------------------------------------------------------------ */

const POSITION_KEY = 'tripme.assistant.pos';
const DRAG_THRESHOLD_PX = 4;
const EDGE_MARGIN = 16;
const BUBBLE_H = 52;
/** Clear of the fixed nav. */
const TOP_LIMIT = 88;
/** Clear of the trip page's fixed action bar. */
const BOTTOM_LIMIT = 96;

interface Pos {
  side: 'left' | 'right';
  top: number;
}

function clampBubbleTop(top: number): number {
  const max = Math.max(TOP_LIMIT, window.innerHeight - BUBBLE_H - BOTTOM_LIMIT);
  return Math.min(Math.max(top, TOP_LIMIT), max);
}

function panelHeight(): number {
  return Math.min(512, window.innerHeight * 0.7);
}

/** Keeps the open panel entirely on screen, whatever it is asked for. */
function clampPanelTop(top: number): number {
  const lowest = Math.max(TOP_LIMIT, window.innerHeight - panelHeight() - EDGE_MARGIN);
  return Math.min(Math.max(top, TOP_LIMIT), lowest);
}

/**
 * Where the open panel sits.
 *
 * Not simply "wherever the bubble is": parked low, the panel ran off the bottom
 * of the window and the input was unreachable — reported, and the assistant was
 * unusable in that state. The panel is placed from the bubble and then pulled
 * back up until it fits entirely on screen.
 */
function panelTopFor(bubbleTop: number): number {
  return clampPanelTop(bubbleTop);
}

export function Assistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const [trip, setTrip] = useState<TripState | null>(null);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    startX: number;
    startY: number;
    /** Pointer position relative to the element's top, so it does not jump. */
    offsetY: number;
    moved: boolean;
    mode: 'bubble' | 'panel';
  } | null>(null);
  /*
   * The live position, mirrored outside React state: pointermove and pointerup
   * can both fire before a re-render, so the `pos` in the handler's closure is
   * the value from BEFORE the drag.
   */
  const posRef = useRef<Pos | null>(null);
  /*
   * A drag ends in a click event too. This swallows exactly that one, so
   * letting go after moving the bubble does not also open the panel — while
   * leaving ordinary clicks, and keyboard Enter/Space, to open it normally.
   */
  const suppressClick = useRef(false);

  /* Re-read local data whenever the panel opens or the route changes. */
  useEffect(() => {
    setTrip(getCurrentTrip());
    setTrips(listTrips());
  }, [pathname, open]);

  useEffect(() => {
    let restored: Pos = { side: 'right', top: Math.max(160, window.innerHeight - 200) };
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Pos;
        if (saved && (saved.side === 'left' || saved.side === 'right') && typeof saved.top === 'number') {
          restored = saved;
        }
      }
    } catch {
      /* no storage — the default corner is fine */
    }
    const initial = { ...restored, top: clampBubbleTop(restored.top) };
    posRef.current = initial;
    setPos(initial);
  }, []);

  useEffect(() => {
    const onResize = () =>
      setPos((p) => {
        if (!p) return p;
        const next = { ...p, top: clampBubbleTop(p.top) };
        posRef.current = next;
        return next;
      });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const greeting = trip
    ? `Ask me about your ${trip.destination.selected.name} trip, or about TripME itself — how it works, where to find things, what is real and what is simulated.`
    : 'Ask me anything about TripME — how it works, how to plan a trip, what is real and what is simulated, or your saved trips.';

  const persist = useCallback((next: Pos) => {
    posRef.current = next;
    setPos(next);
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  /**
   * One drag implementation for both the closed bubble and the open panel.
   *
   * Being able to move it only while closed was the wrong half of the feature:
   * the panel is the larger thing, and it is the one actually covering what you
   * are reading. `mode` differs only in what is clamped — a bubble may sit
   * lower than a panel, because a panel has height below its top edge.
   */
  const startDrag = (e: React.PointerEvent<HTMLElement>, mode: 'bubble' | 'panel') => {
    if (e.button !== 0) return;
    // Let the header's own controls behave like buttons, not drag handles.
    if ((e.target as HTMLElement).closest('button')) return;
    const currentTop = mode === 'bubble' ? (posRef.current?.top ?? 0) : panelTopFor(posRef.current?.top ?? 0);
    drag.current = { startX: e.clientX, startY: e.clientY, offsetY: e.clientY - currentTop, moved: false, mode };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported — dragging still works */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    d.moved = true;
    setDragging(true);
    // Keeping the grab offset means it tracks the cursor instead of snapping
    // its top edge to it, which on a panel this size is jarring.
    const rawTop = e.clientY - d.offsetY;
    // Side follows which half of the window the pointer is in, so it can never
    // be dropped in the middle of the page on top of what someone is reading.
    const next: Pos = {
      side: e.clientX < window.innerWidth / 2 ? 'left' : 'right',
      top: d.mode === 'bubble' ? clampBubbleTop(rawTop) : clampPanelTop(rawTop),
    };
    posRef.current = next;
    setPos(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (!d) return;
    if (d.moved) {
      // Only the bubble turns a click into "open"; the panel has nothing to
      // suppress, and setting the flag there would swallow the next real click.
      if (d.mode === 'bubble') suppressClick.current = true;
      if (posRef.current) persist(posRef.current);
    }
    // A tap is handled by onClick, so the bubble stays operable from the
    // keyboard — pointer handlers alone left it unreachable without a mouse.
  };

  /** Fill the box rather than sending — asked for, and it lets people edit first. */
  const fillInput = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((m) => [...m, { from: 'you', text }]);

    const current = getCurrentTrip();

    // 1 · this traveller's own data
    const fromTrips = savedTripsAnswer(text, listTrips());
    if (fromTrips) {
      setMessages((m) => [...m, { from: 'tripme', ...fromTrips }]);
      return;
    }
    if (current) {
      const fromTrip = tripAnswer(text, current);
      if (fromTrip) {
        setMessages((m) => [...m, { from: 'tripme', ...fromTrip }]);
        return;
      }
    }

    // 2 · the product itself
    const known = matchKnowledge(text);
    if (known) {
      setMessages((m) => [
        ...m,
        { from: 'tripme', text: known.answer, link: known.link, followUps: known.followUps },
      ]);
      return;
    }

    // 3 · the model, for what is genuinely open
    setBusy(true);
    try {
      const reply = await runAgent<{ answer: string }>('assistant', {
        question: text,
        product: {
          name: 'TripME',
          what: 'An AI travel planner for trips within India. Seven agents plan destination, budget, day-by-day itinerary and simulated bookings.',
          scope: 'India only. Prices in INR. Bookings are simulated, never real. Prices are estimates, not live quotes.',
          pages: 'Plan (/), My Trips (/trips), How it works (/how-it-works), Contact (/contact).',
        },
        trip: current
          ? {
              destination: `${current.destination.selected.name}, ${current.destination.selected.region}`,
              originCity: current.input.originCity,
              startDate: current.input.startDate,
              durationDays: current.input.durationDays,
              travellers: current.input.travelers,
              budgetTotalINR: current.input.budgetTotalINR,
              weather: current.destination.selected.weatherAtTravelDates,
              days: itineraryWithEdits(current.itinerary, current.choices).days.map((d) => ({
                day: d.day,
                theme: d.theme,
                morning: d.morning.activity,
                afternoon: d.afternoon.activity,
                evening: d.evening.activity,
              })),
            }
          : null,
      });
      setMessages((m) => [...m, { from: 'tripme', text: reply.answer, viaModel: true }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          from: 'tripme',
          text: 'I could not reach the model for that one. I can still answer anything about how TripME works, your saved trips, or the plan you have open — try one of the suggestions below.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (!pos) return null;

  const suggestions = suggestionsFor(pathname, Boolean(trip), trips.length);
  const bubbleStyle = pos.side === 'left' ? { left: EDGE_MARGIN, top: pos.top } : { right: EDGE_MARGIN, top: pos.top };
  const panelStyle =
    pos.side === 'left'
      ? { left: EDGE_MARGIN, top: panelTopFor(pos.top) }
      : { right: EDGE_MARGIN, top: panelTopFor(pos.top) };

  if (!open) {
    return (
      <button
        onPointerDown={(e) => startDrag(e, 'bubble')}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          setOpen(true);
        }}
        style={bubbleStyle}
        className={`no-print fixed z-[55] flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-4 pr-5 py-3 shadow-lg touch-none select-none ${
          dragging ? 'cursor-grabbing scale-105 shadow-2xl' : 'cursor-grab hover:opacity-95'
        } transition-[transform,opacity]`}
        aria-label="Open the TripME assistant — drag to move it"
        title="Ask about TripME · drag to move"
      >
        <span aria-hidden="true">💬</span>
        <span className="text-sm font-semibold whitespace-nowrap">Ask TripME</span>
      </button>
    );
  }

  return (
    <div
      style={panelStyle}
      data-no-translate
      className="no-print fixed z-[55] w-[min(24rem,calc(100vw-2rem))] rounded-3xl border border-border bg-card shadow-2xl flex flex-col max-h-[min(32rem,70vh)]"
    >
      <div
        onPointerDown={(e) => startDrag(e, 'panel')}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`flex items-center justify-between px-4 py-3 border-b border-border shrink-0 touch-none select-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Drag to move"
      >
        <span className="font-display font-bold text-sm flex items-center gap-2">
          <span className="text-muted-foreground text-base leading-none" aria-hidden="true">⠿</span>
          TripME Assistant
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => persist({ ...pos, side: pos.side === 'left' ? 'right' : 'left' })}
            className="text-muted-foreground hover:text-foreground px-1.5"
            aria-label={`Move to the ${pos.side === 'left' ? 'right' : 'left'} side`}
            title="Move to the other side"
          >
            {pos.side === 'left' ? '⇥' : '⇤'}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground px-1.5"
            aria-label="Close assistant"
          >
            ✕
          </button>
        </div>
      </div>

      <div ref={scroller} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        <div className="bg-muted rounded-2xl px-3.5 py-2 text-sm">{greeting}</div>

        {messages.map((m, i) => (
          <div key={i} className={m.from === 'you' ? 'text-right' : ''}>
            <div
              className={`inline-block max-w-[88%] text-left rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
                m.from === 'you' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              {m.text}
            </div>
            {m.link && (
              <div className="mt-1">
                <Link
                  href={m.link.href}
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {m.link.label} →
                </Link>
              </div>
            )}
            {m.followUps && m.followUps.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {m.followUps.map((f) => (
                  <button
                    key={f}
                    onClick={() => fillInput(f)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-muted text-left"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
            {m.viaModel && <div className="text-[10px] text-muted-foreground mt-1">answered by the model</div>}
          </div>
        ))}
        {busy && <div className="text-sm text-muted-foreground">Thinking…</div>}
      </div>

      {/* Tapping a suggestion fills the box instead of sending, so it can be
          edited into the question someone actually meant to ask. */}
      <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 shrink-0 border-t border-border">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => fillInput(s)}
            className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-muted"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2 p-3 border-t border-border shrink-0"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about TripME or your trip…"
          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-input bg-background text-sm"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
