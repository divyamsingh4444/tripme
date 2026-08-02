import { NextRequest, NextResponse } from 'next/server';

/**
 * Destination photography, free and legally clean.
 *
 * Pickyourtrail's warmth comes from commissioned photography and film. We have
 * no budget for either — but Wikimedia has a properly-licensed photograph of
 * essentially every place a traveller would go, with no API key and no quota.
 *
 * Resolution is search-first on purpose: hitting /page/summary/Gokarna returns
 * a disambiguation stub with no image, while searching "Gokarna India" lands on
 * "Gokarna, Karnataka" which has one. Results are cached in-process because the
 * same destination recurs constantly across a demo.
 */

export const revalidate = 86400;

const UA = {
  'User-Agent': 'TripME/1.0 (BITSoM capstone project; github.com/divyamsingh4444/tripme)',
};

interface PlaceImage {
  title: string;
  image: string;
  width: number;
  pageUrl: string;
  /** Wikimedia content is CC-licensed — the source link is the attribution. */
  attribution: string;
}

const cache = new Map<string, { at: number; data: PlaceImage | null }>();
const TTL = 24 * 60 * 60 * 1000;

async function searchTitles(query: string): Promise<string[]> {
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
    encodeURIComponent(query) +
    '&srlimit=3&format=json&origin=*';
  const res = await fetch(url, { headers: UA, next: { revalidate } });
  if (!res.ok) return [];
  const json = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (json.query?.search ?? []).map((s) => s.title);
}

async function summaryFor(title: string): Promise<PlaceImage | null> {
  const res = await fetch(
    'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title),
    { headers: UA, next: { revalidate } },
  );
  if (!res.ok) return null;
  const j = (await res.json()) as {
    type?: string;
    title?: string;
    originalimage?: { source: string; width: number };
    thumbnail?: { source: string; width: number };
    content_urls?: { desktop?: { page?: string } };
  };
  if (j.type === 'disambiguation') return null;
  const pic = j.originalimage ?? j.thumbnail;
  if (!pic?.source) return null;
  return {
    title: j.title ?? title,
    image: pic.source,
    width: pic.width,
    pageUrl: j.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    attribution: `Photo via Wikimedia Commons · ${j.title ?? title}`,
  };
}

export async function GET(request: NextRequest) {
  const place = (request.nextUrl.searchParams.get('place') ?? '').trim().slice(0, 80);
  const region = (request.nextUrl.searchParams.get('region') ?? '').trim().slice(0, 80);
  if (!place) return NextResponse.json({ ok: false }, { status: 400 });

  const key = `${place}|${region}`.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json({ ok: true, data: hit.data, cached: true });
  }

  try {
    const titles = await searchTitles(`${place} ${region || 'India'}`.trim());
    let data: PlaceImage | null = null;
    for (const t of titles) {
      data = await summaryFor(t);
      if (data) break;
    }
    cache.set(key, { at: Date.now(), data });
    return NextResponse.json({ ok: true, data });
  } catch {
    // A missing photograph is cosmetic — never let it break the trip page.
    return NextResponse.json({ ok: true, data: null });
  }
}
