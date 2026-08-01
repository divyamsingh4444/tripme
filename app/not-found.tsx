import Link from 'next/link';

export const metadata = {
  title: 'Page not found — TripME',
};

export default function NotFound() {
  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
      <div className="text-4xl mb-4">🗺️</div>
      <h1 className="type-section font-display font-extrabold">No such destination</h1>
      <p className="mt-3 text-muted-foreground">
        That page isn&apos;t on the itinerary. The planner is one click away.
      </p>
      <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-display font-bold"
        >
          Plan a trip
        </Link>
        <Link href="/trips" className="px-6 py-3 rounded-xl border border-input font-semibold hover:bg-muted">
          My Trips
        </Link>
      </div>
    </main>
  );
}
