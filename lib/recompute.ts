/**
 * What happens to the money when a traveller changes their mind.
 *
 * Every figure here is computed in code, never asked of a model. That is the
 * same rule the Budget Agent's output already lives under ("the model proposes,
 * code guarantees") and it matters more here, not less: a traveller tapping
 * through stay options would otherwise re-price the trip on every tap, and
 * could quietly undo the allocation the Budget Agent and the Referee already
 * argued their way to.
 *
 * Nothing in this file mutates its arguments — callers get a new booking set
 * back and decide whether to keep it.
 */

import type {
  BookingItem,
  BookingOutput,
  ItineraryOutput,
  LocalTransportOption,
  StayOption,
  TransportOption,
  TripChoices,
  TripState,
} from '@/lib/types';

/** Spend above this needs explicit sign-off on a personal trip. */
const PERSONAL_APPROVAL_GATE_INR = 3000;

export interface MoneyView {
  bookings: BookingItem[];
  totalCommittedINR: number;
  remainingBudgetINR: number;
  /** True when choices have pushed the trip past what the traveller has. */
  overBudget: boolean;
  overspendINR: number;
  /** Corporate only: per-night cap breaches created by the chosen stay. */
  policyBreaches: string[];
}

function nightsOf(state: TripState): number {
  return Math.max(1, state.input.durationDays - 1);
}

function approvalReasonFor(item: BookingItem, state: TripState): string | undefined {
  const threshold = state.input.corporate?.approvalThresholdINR;
  if (threshold && item.amountINR > threshold) {
    return `Above the ₹${threshold.toLocaleString('en-IN')} approval threshold for ${state.input.corporate?.costCentre ?? 'this cost centre'}`;
  }
  if (!threshold && item.amountINR > PERSONAL_APPROVAL_GATE_INR) {
    return `Above ₹${PERSONAL_APPROVAL_GATE_INR.toLocaleString('en-IN')} spend gate`;
  }
  /*
   * No threshold of ours is crossed. The Booking Agent may still have given a
   * reason that has nothing to do with amount ("non-refundable after 24h"), and
   * that stays. But a reason that quotes a rupee figure is a claim about a gate
   * this item no longer trips — observed live: a ₹3,000 booking still carrying
   * "Above ₹3,000 spend gate". Once we own the gate, we own the sentence.
   */
  if (item.needsApprovalReason && /₹|threshold|gate/i.test(item.needsApprovalReason)) return undefined;
  return item.needsApprovalReason;
}

/**
 * Apply the traveller's transport and stay picks to the booking set.
 *
 * The chosen option replaces the corresponding line rather than adding one —
 * a trip has one way of getting there, and appending would double-count it
 * against the budget.
 */
export function applyChoices(state: TripState): MoneyView {
  const { booking, options, choices, input } = state;
  const transport = options?.transport.find((t) => t.id === choices?.transportId);
  const stay = options?.stays.find((s) => s.id === choices?.stayId);
  const local = options?.localTransport?.find((l) => l.id === choices?.localTransportId);
  const realStay = state.realStays?.find((r) => r.id === choices?.realStayId);
  const nights = nightsOf(state);

  const bookings = booking.bookings.map((item): BookingItem => {
    if (item.type === 'transport' && transport) {
      return {
        ...item,
        title: `${transport.label} · ${transport.mode}`,
        detail: `${transport.durationLabel} · ${transport.comfortNote}`,
        amountINR: transport.amountINR,
      };
    }
    if (item.type === 'stay' && (stay || realStay)) {
      /*
       * A real hotel keeps the chosen tier's nightly estimate, because no free
       * source publishes its actual rate. The UI says so beside the name — the
       * one thing not to do is print a number next to a real property in a way
       * that reads as its price.
       */
      const perNight = stay?.perNightINR ?? Math.round((booking.bookings.find((b) => b.type === 'stay')?.amountINR ?? 0) / nights);
      const name = realStay ? realStay.name : stay!.name;
      const where = realStay ? [realStay.category, realStay.area].filter(Boolean).join(' · ') : stay!.area;
      return {
        ...item,
        title: `${nights} night${nights === 1 ? '' : 's'} · ${name}`,
        detail: `${where} · ₹${perNight.toLocaleString('en-IN')}/night (estimate)${
          realStay ? ' · real listing' : ` · ${stay!.amenities.slice(0, 3).join(', ')}`
        }`,
        amountINR: perNight * nights,
      };
    }
    return item;
  });

  /*
   * Getting around is an extra line, not a replacement: it is a different
   * purchase from the journey there, and folding it into the transport booking
   * would hide it from the budget the traveller is watching.
   */
  if (local) {
    bookings.push({
      type: 'transport',
      title: `${local.mode} · getting around ${state.destination.selected.name}`,
      detail: `${local.label} · ₹${local.perDayINR.toLocaleString('en-IN')}/day × ${input.durationDays} days (estimate)`,
      dates: `${input.durationDays} days`,
      amountINR: local.perDayINR * input.durationDays,
      budgetCategory: 'transport',
    });
  }

  // Approval gates are re-derived from the NEW amounts. Carrying the old reason
  // across would show "above the ₹3,000 gate" on a line now costing ₹900.
  const priced = bookings.map((item) => ({ ...item, needsApprovalReason: approvalReasonFor(item, state) }));

  const totalCommittedINR = priced.reduce((sum, b) => sum + b.amountINR, 0);
  const remainingBudgetINR = input.budgetTotalINR - totalCommittedINR;

  const policyBreaches: string[] = [];
  const cap = input.corporate?.hotelCapPerNightINR;
  if (cap && stay && stay.perNightINR > cap) {
    policyBreaches.push(
      `${stay.name} is ₹${stay.perNightINR.toLocaleString('en-IN')}/night against a ₹${cap.toLocaleString('en-IN')} cap — ₹${((stay.perNightINR - cap) * nights).toLocaleString('en-IN')} over across ${nights} night${nights === 1 ? '' : 's'} and not reimbursable.`,
    );
  }

  return {
    bookings: priced,
    totalCommittedINR,
    remainingBudgetINR,
    overBudget: remainingBudgetINR < 0,
    overspendINR: Math.max(0, -remainingBudgetINR),
    policyBreaches,
  };
}

/** Fold a MoneyView back into a BookingOutput for saving. */
export function bookingWithChoices(state: TripState): BookingOutput {
  const view = applyChoices(state);
  return {
    ...state.booking,
    bookings: view.bookings,
    totalCommittedINR: view.totalCommittedINR,
    remainingBudgetINR: Math.max(0, view.remainingBudgetINR),
  };
}

/* ---- Itinerary edits ---- */

export type SlotName = 'morning' | 'afternoon' | 'evening';

export function slotKey(day: number, slot: SlotName): string {
  return `${day}-${slot}`;
}

/**
 * The itinerary as the traveller has edited it.
 *
 * A cleared slot keeps its place in the day rather than collapsing it — the
 * shape of a day is information ("nothing planned before lunch" is a choice),
 * and removing the row would make an edited day look like a shorter one.
 */
export function itineraryWithEdits(itinerary: ItineraryOutput, choices?: TripChoices): ItineraryOutput {
  const edits = choices?.slotEdits;
  if (!edits || Object.keys(edits).length === 0) return itinerary;

  return {
    ...itinerary,
    days: itinerary.days.map((day) => {
      const next = { ...day };
      for (const slot of ['morning', 'afternoon', 'evening'] as SlotName[]) {
        const edit = edits[slotKey(day.day, slot)];
        if (!edit) continue;
        next[slot] = edit.cleared
          ? { activity: 'Free time — nothing planned', area: day[slot].area, approxCostINR: 0 }
          : { ...day[slot], activity: edit.activity, approxCostINR: edit.approxCostINR };
      }
      return next;
    }),
  };
}

/** What the days now cost, after edits. Feeds the budget-vs-itinerary audit. */
export function itineraryTotalINR(itinerary: ItineraryOutput): number {
  return itinerary.days.reduce(
    (sum, d) => sum + d.morning.approxCostINR + d.afternoon.approxCostINR + d.evening.approxCostINR,
    0,
  );
}

/** Convenience for the UI: has this traveller changed anything at all? */
export function hasChoices(choices?: TripChoices): boolean {
  if (!choices) return false;
  return Boolean(
    choices.transportId ||
      choices.stayId ||
      choices.realStayId ||
      choices.localTransportId ||
      Object.keys(choices.slotEdits ?? {}).length > 0,
  );
}

export type { TransportOption, StayOption, LocalTransportOption };
