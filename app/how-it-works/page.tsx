import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'How it works — TripME',
  description:
    'How seven specialised AI agents turn one mood + budget + duration into a complete, bookable trip plan — and what happens when two of them disagree.',
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
    /*
       Laid out to the same 6xl the nav and footer use. The page was capped at
       3xl, which left the content stranded in the middle of a wide screen while
       the chrome ran full width — the page read as broken rather than narrow.
       Widening alone would have given unreadable 1400px line lengths, so the
       recovered space carries real structure: the problem sits beside its
       numbers, the agents form a grid, and the two closing panels sit side by
       side. Prose blocks keep their own max-width inside the wider shell.
    */
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
      <h1 className="type-hero font-display font-extrabold">How TripME works</h1>

      {/* Problem — prose beside the numbers it is claiming */}
      <section className="mt-8 grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-start">
        <div>
          <h2 className="font-display text-xl font-bold mb-3">The problem</h2>
          <p className="text-muted-foreground leading-relaxed">
            Planning one trip today means 4–6 hours across 6–8 disconnected apps — flights on one,
            hotels on another, restaurants on a third — re-entering the same context every time and
            never seeing your total spend until it is too late.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          {[
            ['4–6 hrs → <60 s', 'planning time'],
            ['6–8 apps → 1 input', 'one interface'],
            ['0 → full budget view', 'before any booking'],
          ].map(([big, small]) => (
            <div key={big} className="bg-card rounded-2xl border border-border px-4 py-4 lg:flex lg:items-baseline lg:justify-between lg:gap-4">
              <div className="font-display font-bold">{big}</div>
              <div className="text-xs text-muted-foreground mt-0.5 lg:mt-0">{small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The answer — the argument, with the group-mode case beside it */}
      <section className="mt-12">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-10 items-start">
          <div>
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
          </div>
          <div className="rounded-2xl border-2 border-accent bg-accent/10 p-5">
            <h3 className="font-display font-bold">Group mode: one agent per human</h3>
            <p className="text-sm mt-1.5 leading-relaxed">
              Plan with friends and the architecture changes shape. Every traveller gets their own{' '}
              <strong>Traveller Advocate agent</strong> whose only instruction is to argue for that
              person and <em>never</em> compromise — a group of five runs five advocates plus the core
              seven. The Referee then negotiates, and publishes exactly who conceded what, with a
              satisfaction score per person and a hard floor: nobody is allowed to lose twice.
            </p>
          </div>
        </div>

        <h3 className="font-display text-lg font-bold mt-10 mb-3">Six entry paths, one agent core</h3>
        <p className="text-muted-foreground leading-relaxed text-sm max-w-3xl">
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
        {/*
          A pipeline strip, then a grid. Stacking seven cards vertically inside a
          wide page wastes the width and, worse, tells the wrong story: it reads
          as a queue. The strip shows the order and the one edge that runs
          backwards; the grid then gives each agent room to be read.
        */}
        <h3 className="font-display text-lg font-bold mt-12 mb-3">The seven agents</h3>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 overflow-x-auto">
          <ol className="flex items-stretch gap-2 min-w-max">
            {AGENTS.map((agent, i) => (
              <li key={agent.name} className="flex items-center gap-2">
                <div className="flex flex-col items-center justify-center text-center px-3 py-2 rounded-xl bg-secondary/50 min-w-[5.5rem]">
                  <span className="text-lg" aria-hidden="true">{agent.emoji}</span>
                  <span className="text-[11px] font-semibold mt-0.5 leading-tight">
                    {agent.name.replace(/ Agent$/, '')}
                  </span>
                </div>
                {i < AGENTS.length - 1 && (
                  <span className="text-muted-foreground text-xs font-mono" aria-hidden="true">→</span>
                )}
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground font-mono mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>→ structured JSON handoff</span>
            <span className="text-accent-foreground/80">↩ Referee can send the brief back to Budget</span>
          </p>
        </div>

        <ol className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {AGENTS.map((agent, i) => (
            <li key={agent.name} className="bg-card rounded-2xl border border-border p-5 flex gap-4 items-start">
              <span className="text-2xl shrink-0" aria-hidden="true">{agent.emoji}</span>
              <div>
                <div className="font-display font-bold">
                  {i + 1}. {agent.name}
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{agent.role}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>


      {/*
        The page used to end at the seven agents, which was where the product
        ended when it was written. It no longer does — a traveller can now argue
        with the plan, commit to it, and be reminded about it. Leaving that out
        made "How it works" describe an older product than the one being used.
      */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold mb-3">Then it becomes yours</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          The agents make the first call, not the last one. Everything below happens after the pipeline
          finishes, and none of it asks a model to re-price your trip — the money is recomputed in code, so
          the totals stay honest however much you change.
        </p>
        <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              n: '1',
              title: 'Argue with it',
              body: 'Change how you travel there and back, how you get around once there, where you stay, and what you do each day. Or switch destination entirely and watch four agents re-run.',
            },
            {
              n: '2',
              title: 'Real places, honest prices',
              body: 'Hotels and things to do come from OpenStreetMap with photographs from Wikipedia — real, named, mappable. The prices beside them are our estimates, marked “est.”, because live rates need paid inventory APIs.',
            },
            {
              n: '3',
              title: 'Approve, then confirm',
              body: 'Approve each booking, then confirm the trip, in that order — confirming switches on a schedule built from what you actually agreed to. Change something afterwards and the approvals are asked for again.',
            },
            {
              n: '4',
              title: 'Be reminded',
              body: 'Reminders are opt-in per trip. Turn them on and departure, check-in, every activity and each day’s plan appear in the bell, wherever you are in TripME.',
            },
          ].map((step) => (
            <div key={step.n} className="bg-card rounded-2xl border border-border p-5">
              <div className="text-xs font-bold text-muted-foreground">{step.n}</div>
              <div className="font-display font-bold mt-1">{step.title}</div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold">Where TripME can take you</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              India, and only India. Prices are in rupees, the phrase card teaches Indian languages, and the
              agents’ local knowledge is Indian. Ask for somewhere outside it and we say so at the form,
              suggest the closest Indian equivalent, and the Discovery Agent explains the swap on your trip
              page rather than quietly planning something else.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold">Seven languages, including the trip itself</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              English, Hindi, Marathi, Bengali, Tamil, Telugu and Kannada. Not just the buttons: the plan the
              agents wrote is translated too, once they have finished writing it.
            </p>
          </div>
        </div>
      </section>

      {/* Under the hood and the honesty block, side by side — they answer the
          same evaluator question from two directions. */}
      <section className="mt-12 grid lg:grid-cols-2 gap-6 items-start">
        <div>
        <h2 className="font-display text-xl font-bold mb-3">Under the hood</h2>
        <div className="bg-card rounded-2xl border border-border p-5 text-sm leading-relaxed">
          <p>
            <span className="font-semibold">Model:</span>{' '}three Llama and GPT-OSS models routed on Groq, each agent on the one that suits its job — every plan is
            generated live, in JSON mode, with per-agent prompts and temperatures.
          </p>
          <p className="mt-2">
            <span className="font-semibold">Orchestration:</span>{' '}an in-app pipeline with typed
            handoffs between agents — a graph with a feedback edge, not a straight line: the Referee
            can send the brief back to the Budget Agent, and the affected steps re-run (open the
            &quot;Agent log&quot; on any trip page to see the raw JSON each agent produced).
          </p>
          <p className="mt-2">
            <span className="font-semibold">Memory:</span>{' '}saved trips stay in your browser and feed the
            Mood Agent&apos;s personalisation on your next plan. Signing in is optional and only needed to
            confirm or save — an account holds your name, email and picture, never your trips, which is also
            why they do not follow you to another device.
          </p>
        </div>
        </div>

        <div>
        <h2 className="font-display text-xl font-bold mb-3">What&apos;s real, what&apos;s simulated</h2>
        <div className="rounded-2xl border-2 border-accent bg-accent/10 p-5 text-sm leading-relaxed">
          <p>
            <span className="font-bold">Real:</span> the planning — mood analysis, destination choice,
            budget allocation, itinerary and language card are generated live for every request. Also real:
            the hotels and attractions in the options panel, which are named places from OpenStreetMap you
            can open on a map.
          </p>
          <p className="mt-2">
            <span className="font-bold">Estimated:</span> every price. Live fares and nightly rates come
            from paid inventory APIs this project does not use, so figures are marked “est.” and each
            booking links out to Google Flights or Booking.com for the real thing.
          </p>
          <p className="mt-2">
            <span className="font-bold">Simulated:</span> the bookings themselves — demo artefacts with
            reference codes. No payment, no reservation, ever.
          </p>
          <p className="mt-2">
            <span className="font-bold">Partly delivered:</span> reminders. They appear in the app and as
            browser notifications while TripME is open. Reaching a closed app needs a push server, and the
            SMS and voice channels the agent picks for low-connectivity routes need telephony — both real
            infrastructure, and both honestly out of scope here.
          </p>
        </div>
        </div>
      </section>

      {/* Credit */}
      <section className="mt-12 bg-card rounded-2xl border border-border p-6 flex items-center gap-5">
        <Image
          src="/icon.svg"
          alt="TripME logo"
          width={80}
          height={80}
          className="w-20 h-20 object-contain shrink-0"
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
