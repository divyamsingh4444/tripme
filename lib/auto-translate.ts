/**
 * Whole-page translation.
 *
 * The static dictionary in lib/i18n.ts translates strings we wrote. That is the
 * smaller half of the product: an itinerary, a Referee ruling and a packing list
 * are written by the agents at runtime, so no dictionary can ever hold them. A
 * plan in Tamil with an English trip inside it is not a translated product.
 *
 * So this works on the rendered page instead of on source strings. It walks the
 * DOM, translates what it finds, and keeps watching — which means agent output
 * gets translated the moment it appears, without the pages knowing this exists.
 *
 * Two guards make it safe to re-run continuously:
 *   - a string with no Latin letter is skipped, so our own output is never
 *     re-translated on the next pass;
 *   - every original is kept, so switching back to English is exact rather than
 *     a second round trip through the model.
 */

import { DICTS } from '@/lib/i18n';

const CACHE_PREFIX = 'tripme.tr.';
/*
 * Small on purpose. A batch's reply is Indic script, which costs several times
 * more tokens than the English going in — 60 strings at a time overran the
 * model's output room and came back as invalid JSON, wasting the whole call.
 */
const CHUNK = 20;
/** After this many failed attempts a string stays English for the session. */
const MAX_ATTEMPTS = 2;

/** Elements whose text is markup, data or already-localised — never send these. */
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG', 'PATH', 'CIRCLE']);

const memory = new Map<string, Map<string, string>>();
const originalText = new WeakMap<Text, string>();
const originalAttr = new WeakMap<Element, Record<string, string>>();
let touchedText: Text[] = [];
let touchedAttr: Element[] = [];

/**
 * Every string we already have a hand-written translation for, keyed by its
 * English text rather than by its dictionary key.
 *
 * The dictionary is looked up by key, but this pass only ever sees rendered
 * text, so without this bridge the nav, footer, hero and buttons would all be
 * sent to the model — text we already translated by hand, at a cost, worse.
 * Seeding these first typically removes most of a page from the request.
 */
const seeded = new Map<string, Set<string>>();

function seedFromDictionary(lang: string, into: Map<string, string>): void {
  const target = DICTS[lang as keyof typeof DICTS];
  const english = DICTS.en;
  if (!target || target === english) return;
  const keys = new Set<string>();
  for (const [key, source] of Object.entries(english)) {
    const translated = (target as Record<string, string>)[key];
    if (typeof source !== 'string' || typeof translated !== 'string') continue;
    const trimmed = source.trim();
    if (!trimmed || into.has(trimmed)) continue;
    into.set(trimmed, translated);
    keys.add(trimmed);
  }
  seeded.set(lang, keys);
}

function cacheFor(lang: string): Map<string, string> {
  let m = memory.get(lang);
  if (m) return m;
  m = new Map();
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + lang);
    if (raw) for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, string>)) m.set(k, v);
  } catch {
    /* no storage, or corrupt entry — an empty cache is a working cache */
  }
  seedFromDictionary(lang, m);
  memory.set(lang, m);
  return m;
}

/** Strings the model has already failed on, so a re-run does not hammer them. */
const attempts = new Map<string, number>();

function persist(lang: string): void {
  const m = memory.get(lang);
  if (!m) return;
  const fromDict = seeded.get(lang);
  try {
    // Bounded so a long session cannot fill the origin's storage quota. Seeded
    // entries are excluded — they are already in the bundle, and storing them
    // would push out the model-translated content this cache exists for.
    const entries = [...m.entries()].filter(([k]) => !fromDict?.has(k)).slice(-3000);
    localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* over quota — the in-memory cache still works for this session */
  }
}

/**
 * Worth translating? Anything without a Latin letter is either a number, a
 * symbol, or text this pass already translated.
 */
function translatable(s: string): boolean {
  const t = s.trim();
  if (t.length < 2 || t.length > 600) return false;
  /*
   * Devanagari through Kannada. Any of these means the string is already in an
   * Indian language — either the hand-written dictionary supplied it or this
   * pass did. Without this check, a translated line that still holds an English
   * acronym ("travel DNA") looks translatable and gets sent back to the model,
   * which then translates the Hindi around it a second time.
   */
  if (/[ऀ-೿]/.test(t)) return false;
  return /[A-Za-z]{2}/.test(t);
}

function skipped(el: Element | null): boolean {
  for (let n = el; n; n = n.parentElement) {
    if (SKIP_TAGS.has(n.tagName)) return true;
    if (n.hasAttribute?.('data-no-translate')) return true;
  }
  return false;
}

interface Target {
  source: string;
  apply: (value: string) => void;
}

function collect(root: HTMLElement): Target[] {
  const targets: Target[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue ?? '';
      if (!translatable(text)) return NodeFilter.FILTER_REJECT;
      if (skipped(node.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text;
    const source = originalText.get(node) ?? node.nodeValue ?? '';
    if (!translatable(source)) continue;
    if (!originalText.has(node)) {
      originalText.set(node, source);
      touchedText.push(node);
    }
    targets.push({
      source: source.trim(),
      apply: (value) => {
        // Surrounding whitespace is layout — "Day 1 " is not the same as "Day 1".
        const raw = originalText.get(node) ?? source;
        const lead = raw.match(/^\s*/)?.[0] ?? '';
        const tail = raw.match(/\s*$/)?.[0] ?? '';
        node.nodeValue = lead + value + tail;
      },
    });
  }

  // Placeholders are read as often as labels are.
  root.querySelectorAll<HTMLElement>('[placeholder]').forEach((el) => {
    if (skipped(el)) return;
    const saved = originalAttr.get(el)?.placeholder;
    const source = saved ?? el.getAttribute('placeholder') ?? '';
    if (!translatable(source)) return;
    if (saved === undefined) {
      originalAttr.set(el, { ...(originalAttr.get(el) ?? {}), placeholder: source });
      touchedAttr.push(el);
    }
    targets.push({ source: source.trim(), apply: (value) => el.setAttribute('placeholder', value) });
  });

  return targets;
}

/** Put every original back. Exact, and free — no model call to return home. */
export function restoreOriginals(): void {
  for (const node of touchedText) {
    const original = originalText.get(node);
    if (original !== undefined && node.isConnected) node.nodeValue = original;
  }
  for (const el of touchedAttr) {
    const saved = originalAttr.get(el);
    if (saved?.placeholder !== undefined && el.isConnected) el.setAttribute('placeholder', saved.placeholder);
  }
  touchedText = touchedText.filter((n) => n.isConnected);
  touchedAttr = touchedAttr.filter((e) => e.isConnected);
}

async function fetchBatch(lang: string, strings: string[], signal: AbortSignal): Promise<string[] | null> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, strings }),
      signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { ok?: boolean; translations?: string[] };
    return json.ok && Array.isArray(json.translations) ? json.translations : null;
  } catch {
    return null; // aborted or offline — leave the English in place
  }
}

export interface PassResult {
  /** Strings that needed a model call. Zero means the page was fully cached. */
  fetched: number;
}

/**
 * Translate everything currently on the page.
 *
 * Cached strings are applied synchronously before anything is requested, so
 * revisiting a page in a chosen language is instant and silent; only genuinely
 * new text — which in practice means a freshly generated plan — waits.
 */
export async function translatePage(
  lang: string,
  signal: AbortSignal,
  onProgress?: (done: boolean) => void,
): Promise<PassResult> {
  if (lang === 'en') {
    restoreOriginals();
    return { fetched: 0 };
  }

  const cache = cacheFor(lang);
  const targets = collect(document.body);

  const pending = new Map<string, Target[]>();
  for (const target of targets) {
    const hit = cache.get(target.source);
    if (hit !== undefined) {
      target.apply(hit);
      continue;
    }
    const group = pending.get(target.source);
    if (group) group.push(target);
    else pending.set(target.source, [target]);
  }

  /*
   * A string the model could not translate is not cached, so the next pass
   * would ask again — and since this pass re-runs on every DOM change, that is
   * a loop that spends quota forever. Two tries, then it stays English.
   */
  const sources = [...pending.keys()].filter((s) => (attempts.get(`${lang} ${s}`) ?? 0) < MAX_ATTEMPTS);
  if (sources.length === 0) return { fetched: 0 };

  onProgress?.(false);

  for (let i = 0; i < sources.length; i += CHUNK) {
    if (signal.aborted) break;
    const chunk = sources.slice(i, i + CHUNK);
    for (const source of chunk) {
      const k = `${lang} ${source}`;
      attempts.set(k, (attempts.get(k) ?? 0) + 1);
    }

    const translated = await fetchBatch(lang, chunk, signal);
    if (!translated) continue; // this chunk stays English; the rest still tries

    chunk.forEach((source, n) => {
      const value = translated[n];
      // Unchanged means the server kept the original — treat it as a miss so
      // the second attempt can still succeed, rather than caching English.
      if (typeof value !== 'string' || !value.trim() || value === source) return;
      cache.set(source, value);
      attempts.delete(`${lang} ${source}`);
      // The node may have been re-rendered away while the request was in flight.
      for (const target of pending.get(source) ?? []) target.apply(value);
    });
    persist(lang);
  }

  onProgress?.(true);
  return { fetched: sources.length };
}
