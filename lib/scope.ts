/**
 * What TripME can and cannot plan, and how it says so.
 *
 * The product is India-only, and it always was — prices are in rupees, the
 * language card teaches Indian languages, the Discovery Agent's pilgrimage
 * knowledge is Indian, geocoding is scoped to India. What it never did was
 * *say* so. Someone typing "Paris" got no warning, spent a minute of agent
 * time, and received an Indian city with no explanation. That reads as a
 * broken product rather than a scoped one.
 *
 * Three layers handle it, cheapest first:
 *   1. the planner states the scope up front, which prevents most of it;
 *   2. this file catches the obvious cases at the input, before a single agent
 *      call is spent, and offers the closest thing we CAN plan;
 *   3. the Discovery Agent is contractually bound to return an Indian
 *      destination and to explain itself if the brief asked for otherwise.
 *
 * This list is a heuristic, not validation. It is deliberately small and covers
 * what Indian travellers actually type when they mean "abroad". It will miss
 * things, which is why layer 3 exists — nothing here is load-bearing.
 */

export const SCOPE_NOTE = 'TripME plans trips within India.';

interface ScopeHit {
  /** What we matched in their text. */
  term: string;
  /** The closest thing we can genuinely plan, when there is a good answer. */
  suggestion?: string;
  reason?: string;
}

/** Common overseas destinations, with the nearest Indian equivalent we can plan. */
const OUT_OF_SCOPE: { match: RegExp; term: string; suggestion?: string; reason?: string }[] = [
  { match: /\bbali\b/i, term: 'Bali', suggestion: 'Goa or the Andamans', reason: 'beaches, temples and a slow island pace' },
  { match: /\bmaldives\b/i, term: 'the Maldives', suggestion: 'Lakshadweep or the Andamans', reason: 'clear water and reef diving' },
  { match: /\b(thailand|bangkok|phuket|krabi)\b/i, term: 'Thailand', suggestion: 'Goa or Gokarna' },
  { match: /\b(dubai|abu dhabi|uae)\b/i, term: 'Dubai', suggestion: 'Mumbai or Hyderabad', reason: 'city energy, shopping and food' },
  { match: /\b(singapore)\b/i, term: 'Singapore', suggestion: 'Mumbai or Bengaluru' },
  { match: /\b(paris|france)\b/i, term: 'Paris', suggestion: 'Puducherry', reason: 'French quarter, cafés and boulevards' },
  { match: /\b(switzerland|swiss|zurich|interlaken)\b/i, term: 'Switzerland', suggestion: 'Himachal or Sikkim', reason: 'alpine valleys and snow' },
  { match: /\b(japan|tokyo|kyoto)\b/i, term: 'Japan', suggestion: 'Sikkim or Tawang', reason: 'monasteries, mountains and blossom season' },
  { match: /\b(nepal|kathmandu|pokhara)\b/i, term: 'Nepal', suggestion: 'Uttarakhand or Sikkim' },
  { match: /\b(sri lanka|colombo)\b/i, term: 'Sri Lanka', suggestion: 'Kerala' },
  { match: /\b(bhutan|thimphu|paro)\b/i, term: 'Bhutan', suggestion: 'Tawang or Sikkim' },
  { match: /\b(vietnam|hanoi)\b/i, term: 'Vietnam', suggestion: 'Meghalaya', reason: 'green valleys, caves and waterfalls' },
  { match: /\b(london|england|uk|scotland)\b/i, term: 'the UK', suggestion: 'Shillong or Ooty' },
  { match: /\b(europe|european)\b/i, term: 'Europe', suggestion: 'Himachal, Sikkim or Puducherry' },
  { match: /\b(usa|america|new york|california)\b/i, term: 'the USA' },
  { match: /\b(australia|sydney|melbourne)\b/i, term: 'Australia' },
  { match: /\b(indonesia|malaysia|kuala lumpur)\b/i, term: 'South-East Asia', suggestion: 'Goa or the Andamans' },
  { match: /\b(turkey|istanbul|cappadocia)\b/i, term: 'Turkey', suggestion: 'Rajasthan', reason: 'palaces, bazaars and desert light' },
  { match: /\b(egypt|cairo)\b/i, term: 'Egypt', suggestion: 'Hampi or Khajuraho', reason: 'ancient monuments at scale' },
  { match: /\b(international|abroad|overseas|foreign country|out of india|outside india)\b/i, term: 'travel outside India' },
];

/** Anything in this text we cannot plan? Returns the first match only. */
export function detectOutOfScope(text: string): ScopeHit | null {
  const value = (text ?? '').trim();
  if (value.length < 2) return null;
  for (const entry of OUT_OF_SCOPE) {
    if (entry.match.test(value)) {
      return { term: entry.term, suggestion: entry.suggestion, reason: entry.reason };
    }
  }
  return null;
}

/**
 * The sentence shown to the traveller. Written to be useful rather than
 * apologetic: it names the limit once, then immediately offers what we can do.
 */
export function outOfScopeMessage(hit: ScopeHit): string {
  const base = `${SCOPE_NOTE} We can’t plan ${hit.term} yet`;
  if (!hit.suggestion) {
    return `${base}, so the agents will plan somewhere in India instead — and say why on your trip page.`;
  }
  const after = hit.reason ? `If it was ${hit.reason} you were after` : 'If you were after something similar';
  return `${base}. ${after}, try ${hit.suggestion} — plan as you are and the agents will explain the swap, or edit your note to name an Indian place directly.`;
}
