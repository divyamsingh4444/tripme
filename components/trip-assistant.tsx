'use client';

/**
 * TripME Assistant — the trip, answerable.
 *
 * Most of what anyone asks about their own trip is a lookup, not a question:
 * when do I leave, what's on day two, how much is left, what needs approval.
 * Those are answered straight from the plan — instantly, offline, and at no
 * quota cost. Anything genuinely open-ended falls through to the model.
 *
 * That split is the point. A chatbot that bills a model call to reread a JSON
 * field it already has is a worse product and a more expensive one.
 *
 * The launcher is draggable and always parks against a side. A floating bubble
 * that cannot be moved will sooner or later sit on top of the one thing the
 * traveller is trying to read — it was covering the stay options and the
 * summary rail — and the honest fix is to let them move it rather than to keep
 * guessing at a safe corner.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { runAgent } from '@/lib/agents-client';
import { applyChoices, itineraryWithEdits } from '@/lib/recompute';
import { fmtWhen, scheduleView } from '@/lib/notifications';
import { fmtINR, fmtDate, addDays } from '@/lib/storage';
import type { TripState } from '@/lib/types';

interface Message {
  from: 'you' | 'tripme';
  text: string;
  /** True when the model was asked, so the UI can be honest about the source. */
  viaModel?: boolean;
}

/** Answer from the plan itself. Returns null when this needs real reasoning. */
function localAnswer(question: string, state: TripState): string | null {
  const q = question.toLowerCase();
  const money = applyChoices(state);
  const itinerary = itineraryWithEdits(state.itinerary, state.choices);
  const dest = state.destination.selected;
  const endDate = addDays(state.input.startDate, Math.max(0, state.input.durationDays - 1));

  const asks = (...words: string[]) => words.some((w) => q.includes(w));

  if (asks('where am i going', 'which destination', 'where are we going', 'where is the trip')) {
    return `${dest.name}, ${dest.region}. ${dest.whyMatched}`;
  }

  if (asks('when do i leave', 'departure', 'what time do i leave', 'when does the trip start', 'start date')) {
    const first = scheduleView(state.notification?.reminders ?? [], state.input.startDate)[0];
    return `You leave on ${fmtDate(state.input.startDate)} and return ${fmtDate(endDate)} — ${state.input.durationDays} days.${
      first?.at ? ` Your first reminder is ${fmtWhen(first.at)}.` : ''
    }`;
  }

  if (asks('budget', 'how much', 'cost', 'spend', 'left', 'remaining')) {
    return `Your budget is ${fmtINR(state.input.budgetTotalINR)}. ${fmtINR(money.totalCommittedINR)} is committed across ${money.bookings.length} bookings, leaving ${fmtINR(Math.max(0, money.remainingBudgetINR))}.${
      money.overBudget ? ` You are currently ${fmtINR(money.overspendINR)} over.` : ''
    }`;
  }

  if (asks('where am i staying', 'hotel', 'accommodation', 'stay')) {
    const stay = money.bookings.find((b) => b.type === 'stay');
    return stay ? `${stay.title}. ${stay.detail} — ${fmtINR(stay.amountINR)}.` : 'No stay is booked on this plan yet.';
  }

  if (asks('how do i get there', 'transport', 'flight', 'train', 'bus', 'travel there')) {
    const t = money.bookings.find((b) => b.type === 'transport');
    return t ? `${t.title}. ${t.detail} — ${fmtINR(t.amountINR)}.` : 'No transport is booked on this plan yet.';
  }

  if (asks('approval', 'approve', 'sign off', 'sign-off')) {
    const needs = money.bookings.filter((b) => b.needsApprovalReason);
    return needs.length === 0
      ? 'Nothing on this trip needs approval.'
      : `${needs.length} item${needs.length === 1 ? '' : 's'} need approval:\n` +
          needs.map((b) => `• ${b.title} (${fmtINR(b.amountINR)}) — ${b.needsApprovalReason}`).join('\n');
  }

  if (asks('pack', 'packing', 'what should i bring', 'what to bring')) {
    return itinerary.packingTips.length ? `• ${itinerary.packingTips.join('\n• ')}` : 'No packing tips on this plan.';
  }

  const dayMatch = q.match(/day\s*(\d+)/);
  if (dayMatch) {
    const day = itinerary.days.find((d) => d.day === parseInt(dayMatch[1], 10));
    if (day) {
      return `Day ${day.day} — ${day.theme}\n• Morning: ${day.morning.activity} (${fmtINR(day.morning.approxCostINR)})\n• Afternoon: ${day.afternoon.activity} (${fmtINR(day.afternoon.approxCostINR)})\n• Evening: ${day.evening.activity} (${fmtINR(day.evening.approxCostINR)})\n• Meals: ${day.meals}`;
    }
    return `This trip only has ${itinerary.days.length} days.`;
  }

  if (asks('what next', "what's next", 'upcoming', 'next reminder')) {
    const next = scheduleView(state.notification?.reminders ?? [], state.input.startDate).find((s) => !s.past);
    return next
      ? `${next.reminder.title} — ${fmtWhen(next.at)}. ${next.reminder.body}`
      : 'Nothing upcoming on the reminder schedule.';
  }

  if (asks('itinerary', 'plan', 'schedule', 'what am i doing')) {
    return itinerary.days.map((d) => `Day ${d.day} — ${d.theme}: ${d.morning.activity}, ${d.afternoon.activity}, ${d.evening.activity}`).join('\n');
  }

  return null;
}

/** A compact view of the trip for the model — never the whole state object. */
function briefFor(state: TripState) {
  const money = applyChoices(state);
  const itinerary = itineraryWithEdits(state.itinerary, state.choices);
  return {
    destination: `${state.destination.selected.name}, ${state.destination.selected.region}`,
    originCity: state.input.originCity,
    startDate: state.input.startDate,
    durationDays: state.input.durationDays,
    travellers: state.input.travelers,
    budgetTotalINR: state.input.budgetTotalINR,
    committedINR: money.totalCommittedINR,
    remainingINR: Math.max(0, money.remainingBudgetINR),
    weather: state.destination.selected.weatherAtTravelDates,
    days: itinerary.days.map((d) => ({
      day: d.day,
      theme: d.theme,
      morning: d.morning.activity,
      afternoon: d.afternoon.activity,
      evening: d.evening.activity,
      meals: d.meals,
    })),
    bookings: money.bookings.map((b) => ({ title: b.title, amountINR: b.amountINR })),
    packingTips: itinerary.packingTips,
  };
}

const SUGGESTIONS = ['What is on day 2?', 'How much is left?', 'What should I pack?', 'What needs approval?'];

const POSITION_KEY = 'tripme.assistant.pos';
/** Below this, a pointer gesture was a click, not a drag. */
const DRAG_THRESHOLD_PX = 4;
const EDGE_MARGIN = 16;
const BUBBLE_H = 52;

interface Pos {
  side: 'left' | 'right';
  /** Distance from the top of the viewport, in px. */
  top: number;
}

function clampTop(top: number): number {
  const max = Math.max(EDGE_MARGIN, window.innerHeight - BUBBLE_H - 96);
  return Math.min(Math.max(top, 88), max);
}

export function TripAssistant({ state }: { state: TripState }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'tripme',
      text: `Ask me anything about your ${state.destination.selected.name} trip — the days, the money, what needs approval, what to pack.`,
    },
  ]);
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  /*
   * The live position, mirrored outside React state.
   *
   * pointermove and pointerup can both fire before a re-render, so the `pos`
   * captured in the handler's closure is the value from BEFORE the drag —
   * persisting from it saved the old corner and the bubble sprang back.
   */
  const posRef = useRef<Pos | null>(null);

  /* Restore where this traveller last parked it. */
  useEffect(() => {
    let restored: Pos = { side: 'right', top: Math.max(120, window.innerHeight - 180) };
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Pos;
        if (saved && (saved.side === 'left' || saved.side === 'right') && typeof saved.top === 'number') {
          restored = { side: saved.side, top: saved.top };
        }
      }
    } catch {
      /* no storage — the default corner is fine */
    }
    const initial = { ...restored, top: clampTop(restored.top) };
    posRef.current = initial;
    setPos(initial);
  }, []);

  /* A window that shrinks must not strand the bubble off-screen. */
  useEffect(() => {
    const onResize = () =>
      setPos((p) => {
        if (!p) return p;
        const next = { ...p, top: clampTop(p.top) };
        posRef.current = next;
        return next;
      });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const persist = useCallback((next: Pos) => {
    posRef.current = next;
    setPos(next);
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    drag.current = { startX: e.clientX, startY: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || !pos) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    d.moved = true;
    setDragging(true);
    /*
     * Follows the pointer vertically, but the side is decided by which half of
     * the window the pointer is in — so it can never be dropped in the middle
     * of the page, on top of the content someone is reading.
     */
    const next: Pos = {
      side: e.clientX < window.innerWidth / 2 ? 'left' : 'right',
      top: clampTop(e.clientY - BUBBLE_H / 2),
    };
    posRef.current = next;
    setPos(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    if (!d) return;
    if (d.moved) {
      if (posRef.current) persist(posRef.current); // snapped to a side already; remember it
    } else {
      setOpen(true); // a tap, not a drag
    }
  };

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((m) => [...m, { from: 'you', text }]);

    const local = localAnswer(text, state);
    if (local) {
      setMessages((m) => [...m, { from: 'tripme', text: local }]);
      return;
    }

    setBusy(true);
    try {
      const reply = await runAgent<{ answer: string }>('assistant', { question: text, trip: briefFor(state) });
      setMessages((m) => [...m, { from: 'tripme', text: reply.answer, viaModel: true }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          from: 'tripme',
          text: "I could not reach the model for that one. I can still answer anything that is in your plan — try asking about a specific day, the budget, your stay or what to pack.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (!pos) return null; // waiting for the viewport, one frame

  const sideStyle =
    pos.side === 'left' ? { left: EDGE_MARGIN, top: pos.top } : { right: EDGE_MARGIN, top: pos.top };

  if (!open) {
    return (
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={sideStyle}
        className={`no-print fixed z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-4 pr-5 py-3 shadow-lg touch-none select-none ${
          dragging ? 'cursor-grabbing scale-105 shadow-2xl' : 'cursor-grab hover:opacity-95'
        } transition-[transform,opacity]`}
        aria-label="Open the TripME assistant — drag to move it"
        title="Drag to move"
      >
        <span aria-hidden="true">💬</span>
        <span className="text-sm font-semibold whitespace-nowrap">Ask about your trip</span>
      </button>
    );
  }

  return (
    <div
      style={sideStyle}
      className="no-print fixed z-40 w-[min(24rem,calc(100vw-2rem))] rounded-3xl border border-border bg-card shadow-2xl flex flex-col max-h-[min(32rem,70vh)]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-display font-bold text-sm">TripME Assistant</span>
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

      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.from === 'you' ? 'text-right' : ''}>
            <div
              className={`inline-block max-w-[85%] text-left rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
                m.from === 'you' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              {m.text}
            </div>
            {m.viaModel && <div className="text-[10px] text-muted-foreground mt-1">answered by the model</div>}
          </div>
        ))}
        {busy && <div className="text-sm text-muted-foreground">Thinking…</div>}
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
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
        className="flex gap-2 p-3 border-t border-border"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your trip…"
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
