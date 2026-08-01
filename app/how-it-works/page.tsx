import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'How it works — TripME',
  description:
    'How five specialised AI agents turn one mood + budget + duration into a complete, bookable trip plan.',
};

const AGENTS = [
  {
    emoji: '✨',
    name: 'Mood Agent',
    role: 'Turns your vibe into structured travel parameters — setting, climate, crowd tolerance, themes.',
  },
  {
    emoji: '🗺️',
    name: 'Destination Agent',
    role: 'Matches those parameters against month, budget and distance to pick one destination (+2 alternates).',
  },
  {
    emoji: '💰',
    name: 'Budget Optimizer',
    role: 'Allocates the full budget across transport, stay, food, activities and buffer — before any booking.',
  },
  {
    emoji: '📅',
    name: 'Itinerary Agent',
    role: 'Builds the day-by-day plan with costs, meals, plan-B swaps and a local language card.',
  },
  {
    emoji: '🎫',
    name: 'Booking Agent',
    role: 'Prepares simulated bookings within the allocation, each waiting for your explicit approval.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">How TripME works</h1>

      {/* Problem */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold mb-3">The problem</h2>
        <p className="text-muted-foreground leading-relaxed">
          Planning one trip today means 4–6 hours across 6–8 disconnected apps — flights on one,
          hotels on another, restaurants on a third — re-entering the same context every time and
          never seeing your total spend until it is too late.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          {[
            ['4–6 hrs → <60 s', 'planning time'],
            ['6–8 apps → 1 input', 'one interface'],
            ['0 → full budget view', 'before any booking'],
          ].map(([big, small]) => (
            <div key={big} className="bg-card rounded-2xl border border-border px-4 py-4">
              <div className="font-display font-bold">{big}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The answer */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold mb-3">The TripME answer</h2>
        <p className="text-muted-foreground leading-relaxed">
          One input — mood + budget + duration — triggers five specialised agents in sequence. Each
          agent does one job well, then hands a structured JSON brief to the next. Context flows
          from intent all the way to bookings; nothing is re-typed, nothing is lost.
        </p>
        <ol className="mt-5 space-y-0">
          {AGENTS.map((agent, i) => (
            <li key={agent.name}>
              <div className="bg-card rounded-2xl border border-border p-5 flex gap-4 items-start">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <div className="font-display font-bold">
                    {i + 1}. {agent.name}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{agent.role}</p>
                </div>
              </div>
              {i < AGENTS.length - 1 && (
                <div className="flex items-center gap-2 pl-8 py-1.5 text-xs text-muted-foreground font-mono">
                  <span>↓</span>
                  <span>structured JSON handoff</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Tech */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold mb-3">Under the hood</h2>
        <div className="bg-card rounded-2xl border border-border p-5 text-sm leading-relaxed">
          <p>
            <span className="font-semibold">Model:</span> Llama 3.3 70B running on Groq — every plan is
            generated live, in JSON mode, with per-agent prompts and temperatures.
          </p>
          <p className="mt-2">
            <span className="font-semibold">Orchestration:</span> a sequential in-app pipeline with
            typed handoffs between agents (open the &quot;Agent log&quot; on any trip page to see the raw
            JSON each agent produced).
          </p>
          <p className="mt-2">
            <span className="font-semibold">Memory:</span> saved trips stay in your browser and feed the
            Mood Agent&apos;s personalisation on your next plan — no accounts, no server database.
          </p>
        </div>
      </section>

      {/* Honesty block */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold mb-3">What&apos;s real, what&apos;s simulated</h2>
        <div className="rounded-2xl border-2 border-accent bg-accent/10 p-5 text-sm leading-relaxed">
          <p>
            <span className="font-bold">Real:</span> live AI planning by Llama 3.3 70B on Groq — mood
            analysis, destination choice, budget allocation, itinerary and language card are generated
            fresh for every request.
          </p>
          <p className="mt-2">
            <span className="font-bold">Simulated:</span> bookings. This is a capstone MVP — booking
            cards are demo artefacts with reference codes, and every card links out to real
            Google Flights / Booking.com searches for that exact trip. No payment, no reservation,
            ever.
          </p>
        </div>
      </section>

      {/* Credit */}
      <section className="mt-10 bg-card rounded-2xl border border-border p-6 flex items-center gap-5">
        <Image
          src="/logo.png"
          alt="TripME logo"
          width={80}
          height={80}
          className="logo-blend w-20 h-20 object-contain shrink-0"
        />
        <div className="text-sm">
          <p className="font-display font-bold">Built by Team DEBUGGERS</p>
          <p className="text-muted-foreground mt-1">
            BITSoM · Product Management with Generative &amp; Agentic AI — Capstone Project, Phase 2.
          </p>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-bold text-lg shadow-sm hover:brightness-95"
        >
          Plan my trip
        </Link>
      </div>
    </main>
  );
}
