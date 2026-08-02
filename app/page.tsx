'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CorporatePolicy,
  FoodPref,
  HouseholdMember,
  MoodKey,
  Pace,
  PilgrimageInput,
  Traveller,
  TripInput,
  TripMode,
} from '@/lib/types';
import { computeTravelDNA, fmtINR, setCurrentTrip, setPendingInput } from '@/lib/storage';
import { buildSampleTrip } from '@/lib/sample-trip';
import { CorporateForm, HouseholdForm, MOODS, PilgrimageForm, TravellersForm } from '@/components/mode-forms';

const GlobeBackdrop = dynamic(() => import('@/components/globe-backdrop'), { ssr: false });

const AGENTS = ['Intent', 'Discovery', 'Budget', 'Itinerary', 'Booking', 'Referee', 'Notify'];

const MODES: { key: TripMode; label: string; emoji: string; sub: string }[] = [
  { key: 'solo', label: 'Solo', emoji: '🧍', sub: 'Mood quiz' },
  { key: 'couple', label: 'Couple', emoji: '💑', sub: '2 advocates, blended' },
  { key: 'group', label: 'Group', emoji: '👥', sub: '1 advocate per friend' },
  { key: 'family', label: 'Family', emoji: '👨‍👩‍👧', sub: 'Paced by age bands' },
  { key: 'pilgrimage', label: 'Pilgrimage', emoji: '🕉', sub: 'Circuit & darshan' },
  { key: 'corporate', label: 'Corporate', emoji: '💼', sub: 'Policy, not mood' },
];

const FOODS: FoodPref[] = ['Veg', 'Non-veg', 'Anything'];
const PACES: Pace[] = ['Chill', 'Balanced', 'Packed'];

// couple/group/family derive the head-count from their lists — these three carry a plain number
const defaultTravellers = (m: TripMode) => (m === 'solo' || m === 'corporate' ? 1 : 2);

export default function PlanPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<TripMode>('solo');
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [budget, setBudget] = useState(25000);
  const [duration, setDuration] = useState(3);
  const [origin, setOrigin] = useState('Bengaluru');
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(defaultTravellers('solo'));
  const [foodPref, setFoodPref] = useState<FoodPref>('Anything');
  const [pace, setPace] = useState<Pace>('Balanced');
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState('');
  const [prefillNote, setPrefillNote] = useState(false);

  const [people, setPeople] = useState<Traveller[]>([
    { name: 'Priya', mood: 'Adventure', budgetINR: 20000, note: '' },
    { name: 'Rohan', mood: 'Relax', budgetINR: 15000, note: '' },
  ]);
  const [household, setHousehold] = useState<HouseholdMember[]>([
    { name: 'Anil', band: 'adult', age: 44, note: '' },
    { name: 'Meera', band: 'adult', age: 41, note: '' },
    { name: 'Ira', band: 'child', age: 8, note: 'tires quickly, needs snack breaks' },
    { name: 'Dadi', band: 'senior', age: 71, note: 'knee trouble — avoid long stair climbs' },
  ]);
  const [pilgrimage, setPilgrimage] = useState<PilgrimageInput>({
    circuit: 'Char Dham',
    tradition: 'Hindu',
    accessibility: 'limited walking',
    dietary: 'strict satvik, no onion or garlic',
    languagePref: 'Hindi',
  });
  const [corporate, setCorporate] = useState<CorporatePolicy>({
    destinationCity: 'Hyderabad',
    purpose: 'Client QBR',
    hotelCapPerNightINR: 6000,
    cabinClass: 'Economy',
    perDiemINR: 2000,
    approvalThresholdINR: 15000,
    costCentre: 'SALES-WEST-04',
  });

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    setStartDate(d.toISOString().slice(0, 10));
    const dna = computeTravelDNA();
    if (dna) {
      if (dna.topMood) setMood(dna.topMood.mood as MoodKey);
      if (dna.lastOrigin) setOrigin(dna.lastOrigin);
      if (dna.medianBudgetINR) setBudget(dna.medianBudgetINR);
      setPrefillNote(true);
    }
  }, []);

  const usesPeople = mode === 'couple' || mode === 'group';
  const groupBudget = people.reduce((s, p) => s + (Number(p.budgetINR) || 0), 0);
  const effectiveBudget = usesPeople ? groupBudget : budget;
  const effectiveTravellers = usesPeople ? people.length : mode === 'family' ? household.length : travelers;
  // Solo is excluded deliberately: the mode already answers the question, and a
  // stepper going to 8 under a button labelled "Solo" contradicts itself.
  const usesTravellerCount = !usesPeople && mode !== 'family' && mode !== 'solo';

  const pickMode = (m: TripMode) => {
    setMode(m);
    setTravelers(defaultTravellers(m)); // a count set in one mode must never leak into the next
    setError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'solo' && !mood) return setError('Pick a mood — it is the one thing the agents cannot guess.');
    if (usesPeople) {
      if (people.length < 2) return setError('This mode needs at least two travellers.');
      if (people.some((p) => !p.name.trim()))
        return setError('Every traveller needs a name — their Advocate agent argues in that name.');
    }
    if (mode === 'family') {
      if (household.length < 2) return setError('Add at least two household members.');
      if (household.some((m) => !m.name.trim()))
        return setError('Every family member needs a name — the Referee flags conflicts by name.');
    }
    if (mode === 'pilgrimage' && !pilgrimage.circuit.trim()) return setError('Which yatra or temple are you planning for?');
    if (mode === 'corporate' && !corporate.destinationCity.trim())
      return setError('Corporate trips need the destination city — the meeting decides it.');
    if (!origin.trim()) return setError('Tell us the city you are starting from.');
    if (!startDate) return setError('Pick a start date.');

    setError('');
    setPendingInput({
      mode,
      mood: usesPeople ? people[0].mood : mode === 'pilgrimage' ? 'Spiritual' : (mood ?? 'Explore'),
      moodNote: moodNote.trim(),
      travellersList: usesPeople ? people.map((p) => ({ ...p, name: p.name.trim() })) : [],
      household: mode === 'family' ? household.map((m) => ({ ...m, name: m.name.trim() })) : [],
      ...(mode === 'pilgrimage' ? { pilgrimage } : {}),
      ...(mode === 'corporate' ? { corporate } : {}),
      budgetTotalINR: effectiveBudget,
      durationDays: duration,
      originCity: origin.trim(),
      startDate,
      travelers: effectiveTravellers,
      foodPref: mode === 'pilgrimage' ? 'Veg' : foodPref,
      pace,
    } satisfies TripInput);
    router.push('/run');
  };

  const loadSample = () => {
    setCurrentTrip(buildSampleTrip());
    router.push('/trip');
  };

  const ctaLabel =
    mode === 'corporate' ? 'Plan within policy'
      : usesPeople ? 'Negotiate our trip'
      : mode === 'family' ? 'Plan for everyone'
      : mode === 'pilgrimage' ? 'Plan the yatra'
      : 'Plan my trip';

  const fieldCls =
    'w-full px-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <main>
      {/* ---------------- HERO ---------------- */}
      <section className="relative min-h-[88svh] flex items-center justify-center overflow-hidden">
        <GlobeBackdrop />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-white/90 text-xs sm:text-sm font-medium rise">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Seven agents · one pipeline · live on Llama 3.3 70B
          </span>

          <h1 className="type-hero font-display font-extrabold text-white mt-6 rise">
            One mood.
            <br />
            One budget.
            <br />
            <span className="text-accent">One complete trip.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed rise">
            Stop juggling eight tabs. Tell us how you want to feel and what you can spend — seven AI
            agents do the rest, and when two of them disagree, a Referee settles it in front of you.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center rise">
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-display font-bold text-lg glow-accent hover:brightness-95 active:scale-[0.99] transition"
            >
              Start planning
            </button>
            <button
              onClick={loadSample}
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/25 backdrop-blur text-white font-display font-semibold text-lg hover:bg-white/20 transition"
            >
              See a sample trip
            </button>
          </div>

          {/*
            The seven agents as a flight path — the same dashed arc as the logo.
            Seven pills wrapped into ragged rows on a phone and read as loose
            chrome; a single line that never wraps reads as one journey.
          */}
          <div className="mt-12 sm:mt-14">
            <div className="relative mx-auto max-w-2xl px-2">
              <span
                className="absolute left-2 right-2 top-[7px] border-t-2 border-dashed border-white/20"
                aria-hidden="true"
              />
              <ol className="relative flex items-start justify-between">
                {AGENTS.map((a, i) => (
                  <li key={a} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                        i === AGENTS.length - 1
                          ? 'bg-accent border-accent'
                          : 'bg-[#0e1f1a] border-white/40'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-[9px] sm:text-[11px] font-medium text-white/65 text-center leading-tight truncate w-full">
                      {a}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- STAT STRIP ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['4–6 hrs → under 60s', 'Planning time, measured on screen'],
            ['6–8 apps → 1 input', 'One brief, carried end to end'],
            ['3 conflict types', 'Money, pacing and policy — arbitrated'],
          ].map(([big, small]) => (
            <div key={big} className="bg-card rounded-2xl border border-border shadow-sm px-5 py-5 card-lift">
              <div className="font-display font-extrabold text-lg">{big}</div>
              <div className="text-xs text-muted-foreground mt-1">{small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- PLANNER ---------------- */}
      <section ref={formRef} className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="type-section font-display font-extrabold">Who&apos;s coming along?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Each path runs a different Intent agent. Family, Pilgrimage and Corporate skip the mood
            quiz entirely — because for them, the intent is already known.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-10">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => pickMode(m.key)}
              className={`px-4 py-4 rounded-2xl text-left border card-lift ${
                mode === m.key
                  ? 'surface-deep-grad border-primary shadow-lg'
                  : 'bg-card border-border hover:border-primary/40'
              }`}
              aria-pressed={mode === m.key}
            >
              <div className="text-2xl leading-none">{m.emoji}</div>
              <div className={`font-display font-bold mt-2 ${mode === m.key ? 'text-white' : ''}`}>{m.label}</div>
              <div className={`text-[11px] mt-0.5 ${mode === m.key ? 'text-white/70' : 'text-muted-foreground'}`}>
                {m.sub}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="bg-card rounded-3xl border border-border shadow-sm p-5 sm:p-8 space-y-7">
          {prefillNote && (
            <div className="flex items-start justify-between gap-3 text-sm bg-secondary/50 border border-secondary rounded-xl px-4 py-3">
              <span>Pre-filled from your travel history — change anything.</span>
              <button type="button" onClick={() => setPrefillNote(false)} className="font-semibold hover:opacity-70" aria-label="Dismiss">✕</button>
            </div>
          )}

          {mode === 'solo' && (
            <div>
              <label className="block font-display font-semibold mb-3">
                What&apos;s the mood? <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(m.key)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium border transition-colors ${
                      mood === m.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input hover:bg-muted'
                    }`}
                    aria-pressed={mood === m.key}
                  >
                    <span className="text-lg mr-1">{m.emoji}</span> {m.key}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-input glow-focus transition">
                <input
                  type="text"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Describe your vibe — “slow mornings, sea breeze, no alarms”"
                  className="w-full px-4 py-3 rounded-xl bg-card text-sm focus:outline-none"
                  maxLength={120}
                />
              </div>
            </div>
          )}

          {usesPeople && <TravellersForm people={people} setPeople={setPeople} max={mode === 'couple' ? 2 : 6} />}
          {mode === 'family' && <HouseholdForm household={household} setHousehold={setHousehold} />}
          {mode === 'pilgrimage' && <PilgrimageForm value={pilgrimage} setValue={setPilgrimage} />}
          {mode === 'corporate' && <CorporateForm value={corporate} setValue={setCorporate} />}

          {!usesPeople && (
            <div>
              <label className="block font-display font-semibold mb-2">
                Total budget <span className="font-mono text-primary ml-1">{fmtINR(budget)}</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={5000} max={200000} step={1000} value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="flex-1 accent-[#14453D]" aria-label="Budget slider"
                />
                <input
                  type="number" min={5000} max={200000} step={1000} value={budget}
                  onChange={(e) => setBudget(Math.min(200000, Math.max(5000, Number(e.target.value) || 5000)))}
                  className="w-28 px-3 py-2.5 rounded-xl border border-input bg-card text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Budget amount"
                />
              </div>
              {mode === 'corporate' && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Policy caps above are hard ceilings — enforced in code, then audited by the Referee.
                </p>
              )}
            </div>
          )}

          {/* four fields pair up 2×2 rather than squeezing the date input into a quarter column */}
          <div className={`grid gap-4 sm:gap-5 ${usesTravellerCount ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
            <div>
              <label className="block font-display font-semibold mb-2">Days</label>
              <div className="flex items-center rounded-xl border border-input overflow-hidden">
                <button type="button" onClick={() => setDuration((d) => Math.max(1, d - 1))} className="px-4 py-3 hover:bg-muted font-bold" aria-label="Fewer days">−</button>
                <span className="flex-1 text-center font-mono font-semibold">{duration}</span>
                <button type="button" onClick={() => setDuration((d) => Math.min(10, d + 1))} className="px-4 py-3 hover:bg-muted font-bold" aria-label="More days">+</button>
              </div>
            </div>
            {usesTravellerCount && (
              <div>
                <label className="block font-display font-semibold mb-2">Travellers</label>
                <div className="flex items-center rounded-xl border border-input overflow-hidden">
                  <button type="button" onClick={() => setTravelers((t) => Math.max(1, t - 1))} className="px-4 py-3 hover:bg-muted font-bold" aria-label="Fewer travellers">−</button>
                  <span className="flex-1 text-center font-mono font-semibold">{travelers}</span>
                  <button type="button" onClick={() => setTravelers((t) => Math.min(8, t + 1))} className="px-4 py-3 hover:bg-muted font-bold" aria-label="More travellers">+</button>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="origin" className="block font-display font-semibold mb-2">From</label>
              <input id="origin" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Your city" className={fieldCls} />
            </div>
            <div>
              <label htmlFor="start" className="block font-display font-semibold mb-2">Start date</label>
              <input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={fieldCls} />
            </div>
          </div>

          <div>
            <button type="button" onClick={() => setShowMore((s) => !s)} className="text-sm font-semibold text-primary hover:opacity-80" aria-expanded={showMore}>
              {showMore ? '− Fewer preferences' : '+ More preferences'}
            </button>
            {showMore && (
              <div className="mt-4 grid sm:grid-cols-2 gap-5">
                {mode !== 'pilgrimage' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Food</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {FOODS.map((f) => (
                        <button key={f} type="button" onClick={() => setFoodPref(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${foodPref === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input hover:bg-muted'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold mb-2">Pace</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PACES.map((p) => (
                      <button key={p} type="button" onClick={() => setPace(p)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${pace === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input hover:bg-muted'}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive font-medium" role="alert">{error}</p>}

          <div className="pt-1 space-y-3">
            <button type="submit" className="w-full py-4 rounded-2xl bg-accent text-accent-foreground font-display font-bold text-lg glow-accent hover:brightness-95 active:scale-[0.99] transition">
              {ctaLabel}
            </button>
            {/*
              This used to read "…· nothing is ever really booked", which
              apologised for the product at the exact moment of commitment.
              The Demo Mode badge in the nav and the label on every booking card
              already carry that disclosure honestly, without undercutting.
            */}
            <p className="text-center text-xs text-muted-foreground">
              Your whole trip, planned in about 20 seconds
            </p>
          </div>
        </form>
      </section>

      {/* ---------------- WHY IT'S DIFFERENT ---------------- */}
      <section className="mt-20 surface-deep-grad">
        <div className="perforation perforation-light" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="type-section font-display font-extrabold text-center">
            Most AI trip planners are <span className="text-accent">one prompt</span> in a trench coat
          </h2>
          <p className="mt-4 text-center text-white/75 max-w-2xl mx-auto">
            TripME is a system. The agents have opposing objectives, audit each other&apos;s work, and
            can send the plan backwards for a re-think.
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              {
                t: 'They disagree on purpose',
                d: 'The Itinerary Agent is never shown the budget — it plans the trip you deserve at honest prices. The Budget Agent argues for thrift. Real tension, not theatre.',
              },
              {
                t: 'A Referee arbitrates',
                d: 'It states the conflict in rupees on screen, offers three genuine trade-offs, and can send the Budget Agent back to re-plan. Money, pacing and policy.',
              },
              {
                t: 'One agent per human',
                d: 'Plan with friends and everyone gets their own Advocate that never compromises. The Referee publishes who conceded what — with a fairness floor.',
              },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl bg-white/[0.06] border border-white/12 p-6 backdrop-blur-sm">
                <div className="font-display font-bold text-lg text-accent">{c.t}</div>
                <p className="mt-2 text-sm text-white/75 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="/how-it-works" className="inline-block px-7 py-3.5 rounded-2xl bg-white/10 border border-white/25 font-display font-semibold hover:bg-white/20 transition">
              See how the seven agents work →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
