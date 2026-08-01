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
    name: 'Mood & Intent Agent',
    role: 'Turns your vibe into a structured brief — setting types, crowd tolerance, and a list of non-negotiables the next agent is contractually bound to satisfy.',
  },
  {
    emoji: '🗺️',
    name: 'Discovery Agent',
    role: 'Picks one destination (+2 alternates) and must show, line by line, where each of your non-negotiables is met.',
  },
  {
    emoji: '💰',
    name: 'Budget Agent',
    role: 'Allocates the full budget across transport, stay, food, activities and buffer — before any booking.',
  },
  {
    emoji: '📅',
    name: 'Itinerary Agent',
    role: 'Builds the day-by-day plan at honest local prices — it is told NOT to shrink costs to fit the budget.',
  },
  {
    emoji: '🎫',
    name: 'Booking Agent',
    role: 'Prepares simulated bookings within the allocation, each gated behind your explicit approval.',
  },
  {
    emoji: '⚖️',
    name: 'Referee Agent',
    role: 'The one that makes this a system, not a sequence: it audits Itinerary against Budget, states any conflict out loud, and can send the Budget Agent back to re-plan. In group mode it also negotiates between everyone’s Advocates.',
  },
  {
    emoji: '🔔',
    name: 'Notification Agent',
    role: 'Schedules trip reminders from the confirmed bookings, choosing a channel per traveller — push, SMS or voice fallback, or calendar sync.',
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
          One input — mood + budget + duration — triggers seven specialised agents. Each does one
          job well, then hands a structured JSON brief to the next. But this is deliberately{' '}
          <strong className="text-foreground">not a straight line</strong>: the Referee Agent audits
          the Itinerary Agent&apos;s real costs against the Budget Agent&apos;s allocation, and when
          they conflict it says so on screen and sends the brief <em>backwards</em> for a re-plan.
          Agents that can reject each other&apos;s work are what separate a multi-agent system from
          one long prompt.
        </p>
        <div className="mt-4 rounded-2xl border-2 border-accent bg-accent/10 p-5">
          <h3 className="font-display font-bold">Group mode: one agent per human</h3>
          <p className="text-sm mt-1.5 leading-relaxed">
            Plan with friends and the architecture changes shape. Every traveller gets their own{' '}
            <strong>Traveller Advocate agent</strong> whose only instruction is to argue for that
            person and <em>never</em> compromise — a group of five runs five advocates plus the core
            seven. The Referee then negotiates, and publishes exactly who conceded what, with a
            satisfaction score per person and a hard floor: nobody is allowed to lose twice.
          </p>
        </div>

        <h3 className="font-display text-lg font-bold mt-8 mb-3">Six entry paths, one agent core</h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
          Different travellers need different questions asked. Three of the six paths skip the mood
          quiz entirely, because for them the intent is already known — and each path changes what
          the agents actually do, not just what the form looks like.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 font-semibold">Path</th>
                <th className="py-2 pr-3 font-semibold">What it asks instead</th>
                <th className="py-2 font-semibold">How the agents change</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🧍 Solo', 'Mood quiz', 'The standard seven'],
                ['💑 Couple', 'Both moods + budgets', '2 Advocates → Referee blends them'],
                ['👥 Group', 'Everyone’s mood + budget', 'One Advocate per friend; Referee publishes the concessions'],
                ['👨‍👩‍👧 Family', 'Household ages + limitations', 'Paced by the most constrained member; Referee adds a pacing audit, flagging conflicts by name'],
                ['🕉 Pilgrimage', 'Circuit, tradition, mobility, diet', 'Route sequenced traditionally, season checked, darshan timing planned; reminders fall back to SMS/voice'],
                ['💼 Corporate', 'Travel policy — no mood at all', 'City is fixed by the meeting so Discovery picks the district; policy caps are enforced in code; Referee adds a compliance audit and builds the expense report'],
              ].map(([path, asks, changes]) => (
                <tr key={path} className="border-b border-border/60 last:border-0 align-top">
                  <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{path}</td>
                  <td className="py-2.5 pr-3">{asks}</td>
                  <td className="py-2.5 text-muted-foreground">{changes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
