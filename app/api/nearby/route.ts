import { NextRequest, NextResponse } from 'next/server';

/**
 * Real places near a destination — hotels and things to do.
 * GET /api/nearby?place=Puri&region=Odisha&kind=stay|activity
 *
 * Why this exists: every stay and activity in a plan was invented by a model
 * and labelled "(sample property)". That is honest, but it is also the weakest
 * part of the product — a traveller cannot act on a hotel that does not exist.
 *
 * What is genuinely free, and what is not, decided this design:
 *   - real PLACES are free. OpenStreetMap knows where the hotels and the
 *     attractions are, Nominatim geocodes the destination, and neither needs
 *     an API key. Wikipedia supplies photographs for anything notable.
 *   - real PRICES are not. Live hotel rates and flight fares come from paid
 *     inventory APIs (Amadeus, Booking, Skyscanner) behind commercial
 *     agreements. Nothing free returns them.
 *
 * So this returns real, named, locatable places, and the product keeps saying
 * plainly that the money beside them is an estimate. Inventing a price and
 * attaching it to a real hotel's name would be the one genuinely dishonest
 * thing available here, and it is the thing we do not do.
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
/*
 * Overpass is a free, shared, frequently overloaded service — the same query
 * returned 200 and then 504 minutes apart while this was being built. So it is
 * tried across mirrors, and every failure path here ends in an empty list
 * rather than an error: the caller falls back to the model's own suggestions,
 * which still produce a usable plan.
 */
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

/* Both services ask for a real identifier and rate-limit anonymous traffic. */
const UA = 'TripME/1.0 (student capstone project; contact via github.com/divyamsingh4444/tripme)';

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  /** Free-text locality, when OSM has one. */
  area?: string;
  lat: number;
  lon: number;
  /** Wikipedia thumbnail, when the place is notable enough to have an article. */
  image?: string;
  imageCredit?: string;
  /** Deep link to the place on a real map. */
  mapUrl: string;
  website?: string;
}

/** Places change slowly; a day of caching is generous to both APIs. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: NearbyPlace[] }>();

function cached(key: string): NearbyPlace[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

async function geocode(place: string, region: string): Promise<{ lat: number; lon: number } | null> {
  const q = [place, region, 'India'].filter(Boolean).join(', ');
  const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat: string; lon: string }[];
    if (!rows?.[0]) return null;
    return { lat: parseFloat(rows[0].lat), lon: parseFloat(rows[0].lon) };
  } catch {
    return null;
  }
}

/**
 * Overpass QL for the two things a traveller actually chooses between.
 *
 * Every value set is bounded on purpose. An unqualified `node["historic"]` over
 * a 20km radius is a table scan that the public server answers with a 504 under
 * any load — measured, not guessed. Narrow filters return fewer places but
 * return them reliably, which is the better trade for a page someone is waiting
 * on.
 */
function overpassQuery(kind: string, lat: number, lon: number): string {
  const at = (r: number) => `(around:${r},${lat},${lon})`;
  const filters =
    kind === 'stay'
      ? [
          `node["tourism"~"^(hotel|guest_house|hostel|resort)$"]${at(12000)}`,
          `way["tourism"~"^(hotel|guest_house|resort)$"]${at(12000)}`,
        ]
      : [
          `node["tourism"~"^(attraction|museum|viewpoint|artwork)$"]${at(18000)}`,
          `way["tourism"~"^(attraction|museum)$"]${at(18000)}`,
          `node["historic"~"^(monument|memorial|ruins|fort|castle|archaeological_site|temple)$"]${at(18000)}`,
          `node["natural"~"^(beach|waterfall|peak)$"]${at(18000)}`,
          // Temples matter more than most categories for Indian travel, but the
          // unfiltered tag is enormous — the wikipedia tag keeps it to the ones
          // a traveller would actually cross a city for.
          `node["amenity"="place_of_worship"]["wikipedia"]${at(18000)}`,
          `way["amenity"="place_of_worship"]["wikipedia"]${at(18000)}`,
        ];
  return `[out:json][timeout:25];(${filters.map((f) => `${f};`).join('')});out center tags 60;`;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function categorise(tags: Record<string, string>): string {
  if (tags.tourism === 'hotel') return 'Hotel';
  if (tags.tourism === 'resort') return 'Resort';
  if (tags.tourism === 'guest_house') return 'Guest house';
  if (tags.tourism === 'hostel') return 'Hostel';
  if (tags.tourism === 'museum') return 'Museum';
  if (tags.tourism === 'viewpoint') return 'Viewpoint';
  if (tags.natural === 'beach') return 'Beach';
  if (tags.natural === 'waterfall') return 'Waterfall';
  if (tags.natural === 'peak') return 'Peak';
  if (tags.historic) return tags.historic.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  return 'Attraction';
}

/** A photograph, but only where one genuinely exists for THIS place. */
async function photoFor(tags: Record<string, string>): Promise<{ image?: string; credit?: string }> {
  const article = tags['wikipedia'];
  if (!article) return {};
  // Tag format is "en:Article Title"; anything else we leave alone.
  const [lang, ...rest] = article.split(':');
  const title = rest.join(':');
  if (!title || lang !== 'en') return {};
  try {
    const res = await fetch(`${WIKI_SUMMARY}${encodeURIComponent(title.replace(/ /g, '_'))}`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) return {};
    const body = (await res.json()) as { thumbnail?: { source: string } };
    return body.thumbnail?.source ? { image: body.thumbnail.source, credit: 'Wikipedia' } : {};
  } catch {
    return {};
  }
}

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const place = (params.get('place') ?? '').trim().slice(0, 80);
  const region = (params.get('region') ?? '').trim().slice(0, 80);
  const kind = params.get('kind') === 'stay' ? 'stay' : 'activity';
  if (!place) {
    return NextResponse.json({ ok: false, error: 'missing_place' }, { status: 400 });
  }

  const key = `${kind}|${place}|${region}`.toLowerCase();
  const hit = cached(key);
  if (hit) return NextResponse.json({ ok: true, data: hit, cached: true });

  const point = await geocode(place, region);
  if (!point) {
    // Not an error the traveller needs to see — the caller falls back to the
    // model's own suggestions, which still work.
    return NextResponse.json({ ok: true, data: [] });
  }

  let elements: OverpassElement[] = [];
  const query = overpassQuery(kind, point.lat, point.lon);
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: `data=${encodeURIComponent(query)}`,
        // Fail fast. A busy Overpass will hold a connection open far longer
        // than anyone waiting on a page will tolerate, and this is a bonus on
        // top of a plan that already works — better to give up and let the
        // next mirror, or the model's own suggestions, answer.
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) continue; // busy or rate-limited — try the next mirror
      const body = (await res.json()) as { elements?: OverpassElement[] };
      elements = body.elements ?? [];
      if (elements.length) break;
    } catch {
      continue;
    }
  }

  const seen = new Set<string>();
  const candidates = elements
    .filter((el) => {
      const name = el.tags?.name?.trim();
      if (!name || name.length > 60) return false;
      const lower = name.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    })
    // Anything with a Wikipedia article or a website is more likely to be a
    // real, findable destination rather than an unmapped roadside sign.
    .sort((a, b) => {
      const score = (el: OverpassElement) =>
        (el.tags?.wikipedia ? 2 : 0) + (el.tags?.website || el.tags?.['contact:website'] ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 12);

  const results: NearbyPlace[] = await Promise.all(
    candidates.map(async (el) => {
      const tags = el.tags ?? {};
      const lat = el.lat ?? el.center?.lat ?? point.lat;
      const lon = el.lon ?? el.center?.lon ?? point.lon;
      const { image, credit } = await photoFor(tags);
      return {
        id: `${el.type}/${el.id}`,
        name: tags.name,
        category: categorise(tags),
        area: tags['addr:suburb'] || tags['addr:city'] || tags['addr:district'] || undefined,
        lat,
        lon,
        image,
        imageCredit: credit,
        mapUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        website: tags.website || tags['contact:website'] || undefined,
      };
    }),
  );

  cache.set(key, { at: Date.now(), data: results });
  return NextResponse.json({ ok: true, data: results });
}
