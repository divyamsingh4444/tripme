'use client';

import { useEffect, useState } from 'react';
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
import {
  CorporateForm,
  HouseholdForm,
  MOODS,
  PilgrimageForm,
  TravellersForm,
} from '@/components/mode-forms';

const AGENT_CHIPS = [
  { emoji: '✨', name: 'Intent' },
  { emoji: '🗺️', name: 'Discovery' },
  { emoji: '💰', name: 'Budget' },
  { emoji: '📅', name: 'Itinerary' },
  { emoji: '🎫', name: 'Booking' },
  { emoji: '⚖️', name: 'Referee' },
  { emoji: '🔔', name: 'Notify' },
];

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

export default function PlanPage() {
  const router = useRouter();

  const [mode, setMode] = useState<TripMode>('solo');
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [budget, setBudget] = useState(25000);
  const [duration, setDuration] = useState(3);
  const [origin, setOrigin] = useState('Bengaluru');
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(2);
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
  const effectiveTravellers = usesPeople
    ? people.length
    : mode === 'family'
      ? household.length
      : travelers;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'solo' && !mood) {
      setError('Pick a mood — it is the one thing the agents cannot guess.');
      return;
    }
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
    if (mode === 'pilgrimage' && !pilgrimage.circuit.trim())
      return setError('Which yatra or temple are you planning for?');
    if (mode === 'corporate' && !corporate.destinationCity.trim())
      return setError('Corporate trips need the destination city — the meeting decides it.');
    if (!origin.trim()) return setError('Tell us the city you are starting from.');
    if (!startDate) return setError('Pick a start date.');

    setError('');
    const input: TripInput = {
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
    };
    setPendingInput(input);
    router.push('/run');
  };

  const loadSample = () => {
    setCurrentTrip(buildSampleTrip());
    router.push('/trip');
  };

  const ctaLabel =
    mode === 'corporate'
      ? 'Plan within policy'
      : usesPeople
        ? 'Negotiate our trip'
        : mode === 'family'
          ? 'Plan for everyone'
          : mode === 'pilgrimage'
            ? 'Plan the yatra'
            : 'Plan my trip';

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <section className="text-center mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          One mood. One budget.
          <br />
          One complete trip.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Seven AI agents plan your entire trip — and when two of them disagree, a Referee
          arbitrates in front of you.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
          {AGENT_CHIPS.map((a, i) => (
            <span key={a.name} className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-card border border-border shadow-sm">
                {a.emoji} {a.name}
              </span>
              {i < AGENT_CHIPS.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
      </section>

      <form onSubmit={submit} className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-7">
        {prefillNote && (
          <div className="flex items-start justify-between gap-3 text-sm bg-secondary/50 border border-secondary rounded-xl px-4 py-3">
            <span>Pre-filled from your travel history — change anything.</span>
            <button type="button" onClick={() => setPrefillNote(false)} className="font-semibold hover:opacity-70" aria-label="Dismiss">✕</button>
          </div>
        )}

        {/* Mode select — six entry paths, one per persona */}
        <div>
          <label className="block font-display font-semibold mb-1">Who&apos;s travelling?</label>
          <p className="text-xs text-muted-foreground mb-3">
            Each path runs a different Intent agent — and Family, Pilgrimage and Corporate skip the
            mood quiz entirely.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => { setMode(m.key); setError(''); }}
                className={`px-3 py-2.5 rounded-xl text-left border transition-colors ${
                  mode === m.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input hover:bg-muted'
                }`}
                aria-pressed={mode === m.key}
              >
                <div className="font-semibold text-sm">{m.emoji} {m.label}</div>
                <div className={`text-[11px] mt-0.5 ${mode === m.key ? 'opacity-80' : 'text-muted-foreground'}`}>{m.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode-specific inputs */}
        {mode === 'solo' && (
          <>
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
                    className={`px-3 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                      mood === m.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input hover:bg-muted'
                    }`}
                    aria-pressed={mood === m.key}
                  >
                    {m.emoji} {m.key}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Describe your vibe (optional)"
                className="mt-3 w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={120}
              />
            </div>
          </>
        )}

        {usesPeople && <TravellersForm people={people} setPeople={setPeople} max={mode === 'couple' ? 2 : 6} />}
        {mode === 'family' && <HouseholdForm household={household} setHousehold={setHousehold} />}
        {mode === 'pilgrimage' && <PilgrimageForm value={pilgrimage} setValue={setPilgrimage} />}
        {mode === 'corporate' && <CorporateForm value={corporate} setValue={setCorporate} />}

        {/* Budget — group modes derive it from the individual budgets */}
        {!usesPeople && (
          <div>
            <label className="block font-display font-semibold mb-1">
              Total budget <span className="font-mono text-primary">{fmtINR(budget)}</span>
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
                className="w-28 px-3 py-2 rounded-xl border border-input bg-card text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Budget amount"
              />
            </div>
            {mode === 'corporate' && (
              <p className="mt-1 text-xs text-muted-foreground">
                Policy caps above are hard ceilings — the Budget Agent may not exceed them, and the
                compliance audit checks every booking against them.
              </p>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block font-display font-semibold mb-2">Days</label>
            <div className="flex items-center rounded-xl border border-input overflow-hidden">
              <button type="button" onClick={() => setDuration((d) => Math.max(1, d - 1))} className="px-4 py-2.5 hover:bg-muted font-bold" aria-label="Fewer days">−</button>
              <span className="flex-1 text-center font-mono font-semibold">{duration}</span>
              <button type="button" onClick={() => setDuration((d) => Math.min(10, d + 1))} className="px-4 py-2.5 hover:bg-muted font-bold" aria-label="More days">+</button>
            </div>
          </div>
          <div>
            <label htmlFor="origin" className="block font-display font-semibold mb-2">From</label>
            <input id="origin" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Your city" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label htmlFor="start" className="block font-display font-semibold mb-2">Start date</label>
            <input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div>
          <button type="button" onClick={() => setShowMore((s) => !s)} className="text-sm font-semibold text-primary hover:opacity-80" aria-expanded={showMore}>
            {showMore ? '− Fewer preferences' : '+ More preferences'}
          </button>
          {showMore && (
            <div className="mt-4 grid sm:grid-cols-3 gap-5">
              {!usesPeople && mode !== 'family' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Travellers</label>
                  <div className="flex items-center rounded-xl border border-input overflow-hidden">
                    <button type="button" onClick={() => setTravelers((t) => Math.max(1, t - 1))} className="px-4 py-2 hover:bg-muted font-bold" aria-label="Fewer travellers">−</button>
                    <span className="flex-1 text-center font-mono font-semibold">{travelers}</span>
                    <button type="button" onClick={() => setTravelers((t) => Math.min(8, t + 1))} className="px-4 py-2 hover:bg-muted font-bold" aria-label="More travellers">+</button>
                  </div>
                </div>
              )}
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
          <button type="submit" className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-bold text-lg shadow-sm hover:brightness-95 active:scale-[0.99] transition">
            {ctaLabel}
          </button>
          <button type="button" onClick={loadSample} className="w-full text-center text-sm font-semibold text-primary hover:opacity-80">
            See a sample trip →
          </button>
        </div>
      </form>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        {[
          ['4–6 hrs → <60 s', 'planning time'],
          ['6 entry paths', 'one agent core'],
          ['7 agents, 1 referee', 'conflicts resolved in the open'],
        ].map(([big, small]) => (
          <div key={big} className="bg-card rounded-2xl border border-border px-4 py-4">
            <div className="font-display font-bold">{big}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{small}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
