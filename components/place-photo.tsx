'use client';

/**
 * A free, properly-licensed photograph of a real place.
 * Decorative by contract: it fades in when it arrives and simply never appears
 * if it doesn't, so nothing downstream depends on it resolving.
 */

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    setSrc(null);
    setLoaded(false);
    fetch(`/api/place-image?place=${encodeURIComponent(place)}&region=${encodeURIComponent(region ?? '')}`)
      .then((r) => r.json())
      .then((b) => {
        if (!cancelled && b?.data?.image) setSrc(b.data.image);
      })
      .catch(() => {});
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
          onError={() => setSrc(null)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {overlay && <div className={`absolute inset-0 ${overlay}`} />}
      {children && <div className="relative">{children}</div>}
    </div>
  );
}
