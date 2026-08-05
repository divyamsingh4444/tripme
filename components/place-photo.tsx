'use client';

/**
 * A free, properly-licensed photograph of a real place.
 * Decorative by contract: it fades in when it arrives and simply never appears
 * if it doesn't, so nothing downstream depends on it resolving.
 */

import { useEffect, useState } from 'react';

/**
 * One request per place, shared by every card asking for it.
 *
 * My Trips renders a card per saved trip, and six trips to the same city fired
 * six identical requests at once — enough for the free Wikimedia lookup to come
 * back empty and leave every card blank. Promises are cached, not just results,
 * so simultaneous callers wait on the same fetch.
 */
const inflight = new Map<string, Promise<string | null>>();

function fetchPlaceImage(place: string, region: string): Promise<string | null> {
  const key = `${place}|${region}`.toLowerCase();
  const hit = inflight.get(key);
  if (hit) return hit;
  const req = fetch(`/api/place-image?place=${encodeURIComponent(place)}&region=${encodeURIComponent(region)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => (b?.data?.image as string) ?? null)
    .catch(() => null)
    .then((value) => {
      // A miss is worth retrying later; a hit is worth keeping for the session.
      if (value === null) inflight.delete(key);
      return value;
    });
  inflight.set(key, req);
  return req;
}

interface Props {
  place: string;
  region?: string;
  className?: string;
  /** darkening laid over the photo so text above it stays legible */
  overlay?: string;
  children?: React.ReactNode;
}

export function PlacePhoto({ place, region, className = '', overlay, children }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    setSrc(null);
    setLoaded(false);
    setFailed(false);
    fetchPlaceImage(place, region ?? '').then((image) => {
      if (!cancelled && image) setSrc(image);
      if (!cancelled && !image) setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [place, region]);

  return (
    <div className={`relative overflow-hidden bg-secondary ${className}`}>
      {src && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setSrc(null);
            setFailed(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {/*
        When no photograph exists, show the place's initial rather than an empty
        gradient. A blank card reads as a broken image; a monogram reads as a
        design decision, and it is honest either way — we simply have no picture.
      */}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="font-display font-extrabold text-5xl text-primary/15 select-none">
            {place.trim().charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {overlay && <div className={`absolute inset-0 ${overlay}`} />}
      {children && <div className="relative">{children}</div>}
    </div>
  );
}
