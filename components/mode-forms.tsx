'use client';

/**
 * Per-persona entry forms. Each mode collects genuinely different inputs,
 * because each mode drives a different Intent-agent variant downstream:
 * household composition (family), faith logistics (pilgrimage), travel
 * policy (corporate).
 */

import type {
  AgeBand,
  CorporatePolicy,
  HouseholdMember,
  MoodKey,
  PilgrimageInput,
  Traveller,
} from '@/lib/types';
import { fmtINR } from '@/lib/storage';

export const MOODS: { key: MoodKey; emoji: string }[] = [
  { key: 'Relax', emoji: '🌊' },
  { key: 'Adventure', emoji: '🏔️' },
  { key: 'Explore', emoji: '🧭' },
  { key: 'Connect', emoji: '👥' },
  { key: 'Spiritual', emoji: '🕉' },
  { key: 'Celebrate', emoji: '🎉' },
];

const input = 'w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring';
const chip = (on: boolean) =>
  `px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
    on ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input hover:bg-muted'
  }`;

/* ---------------- Couple / Group: one Advocate agent per person ---------------- */

export function TravellersForm({
  people,
  setPeople,
  max,
}: {
  people: Traveller[];
  setPeople: (t: Traveller[]) => void;
  max: number;
}) {
  const update = (i: number, patch: Partial<Traveller>) =>
    setPeople(people.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const total = people.reduce((s, p) => s + (Number(p.budgetINR) || 0), 0);

  return (
    <div>
      <label className="block font-display font-semibold mb-1">Everyone&apos;s mood &amp; budget</label>
      <p className="text-xs text-muted-foreground mb-3">
        Each person gets their own Advocate agent that argues only for them. The Referee negotiates
        — and tells you who conceded what.
      </p>
      <div className="space-y-3">
        {people.map((p, i) => (
          <div key={i} className="rounded-xl border border-input p-4 space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name"
                className={`${input} flex-1 font-semibold`}
                maxLength={24}
              />
              <input
                type="number"
                min={2000}
                step={1000}
                value={p.budgetINR}
                onChange={(e) => update(i, { budgetINR: Math.max(2000, Number(e.target.value) || 2000) })}
                className={`${input} w-28 font-mono`}
                aria-label={`Budget for ${p.name}`}
              />
              {people.length > 2 && (
                <button
                  type="button"
                  onClick={() => setPeople(people.filter((_, j) => j !== i))}
                  className="px-2.5 py-2 rounded-lg border border-input text-destructive text-sm hover:bg-destructive/5"
                  aria-label={`Remove ${p.name}`}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button key={m.key} type="button" onClick={() => update(i, { mood: m.key })} className={chip(p.mood === m.key)}>
                  {m.emoji} {m.key}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={p.note}
              onChange={(e) => update(i, { note: e.target.value })}
              placeholder={`What does ${p.name || 'this person'} really want? (optional)`}
              className={input}
              maxLength={100}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        {people.length < max && (
          <button
            type="button"
            onClick={() => setPeople([...people, { name: '', mood: 'Explore', budgetINR: 20000, note: '' }])}
            className="text-sm font-semibold text-primary hover:opacity-80"
          >
            + Add traveller
          </button>
        )}
        <span className="text-sm">
          Combined budget <span className="font-mono font-semibold">{fmtINR(total)}</span>
          <span className="text-muted-foreground"> · {people.length + 1} agents just for intent</span>
        </span>
      </div>
    </div>
  );
}

/* ---------------- Family: household composition drives pacing ---------------- */

const BANDS: { key: AgeBand; label: string; emoji: string }[] = [
  { key: 'adult', label: 'Adult', emoji: '🧑' },
  { key: 'child', label: 'Child', emoji: '🧒' },
  { key: 'senior', label: 'Senior', emoji: '🧓' },
];

export function HouseholdForm({
  household,
  setHousehold,
}: {
  household: HouseholdMember[];
  setHousehold: (h: HouseholdMember[]) => void;
}) {
  const update = (i: number, patch: Partial<HouseholdMember>) =>
    setHousehold(household.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  return (
    <div>
      <label className="block font-display font-semibold mb-1">Who&apos;s in the household?</label>
      <p className="text-xs text-muted-foreground mb-3">
        The plan is paced by the <em>most constrained</em> person, never the average — one knee
        problem caps the whole itinerary. The Referee then audits every day against these people by
        name.
      </p>
      <div className="space-y-3">
        {household.map((m, i) => (
          <div key={i} className="rounded-xl border border-input p-4 space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={m.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name"
                className={`${input} flex-1 font-semibold`}
                maxLength={24}
              />
              <input
                type="number"
                min={1}
                max={100}
                value={m.age}
                onChange={(e) => update(i, { age: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })}
                className={`${input} w-20 font-mono`}
                aria-label={`Age of ${m.name}`}
              />
              {household.length > 2 && (
                <button
                  type="button"
                  onClick={() => setHousehold(household.filter((_, j) => j !== i))}
                  className="px-2.5 py-2 rounded-lg border border-input text-destructive text-sm hover:bg-destructive/5"
                  aria-label={`Remove ${m.name}`}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BANDS.map((b) => (
                <button key={b.key} type="button" onClick={() => update(i, { band: b.key })} className={chip(m.band === b.key)}>
                  {b.emoji} {b.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={m.note}
              onChange={(e) => update(i, { note: e.target.value })}
              placeholder="Anything the plan must respect? e.g. knee trouble, gets bored easily"
              className={input}
              maxLength={100}
            />
          </div>
        ))}
      </div>
      {household.length < 8 && (
        <button
          type="button"
          onClick={() => setHousehold([...household, { name: '', band: 'adult', age: 35, note: '' }])}
          className="mt-3 text-sm font-semibold text-primary hover:opacity-80"
        >
          + Add family member
        </button>
      )}
    </div>
  );
}

/* ---------------- Pilgrimage: faith logistics replace the mood quiz ---------------- */

const CIRCUITS = ['Char Dham', 'Varanasi ghats', 'Shirdi', 'Tirupati', 'Vaishno Devi', 'Golden Temple', 'Bodh Gaya'];
const ACCESS: PilgrimageInput['accessibility'][] = ['full mobility', 'limited walking', 'wheelchair required'];

export function PilgrimageForm({
  value,
  setValue,
}: {
  value: PilgrimageInput;
  setValue: (v: PilgrimageInput) => void;
}) {
  const set = (patch: Partial<PilgrimageInput>) => setValue({ ...value, ...patch });
  return (
    <div className="space-y-5">
      <div>
        <label className="block font-display font-semibold mb-1">Which yatra?</label>
        <p className="text-xs text-muted-foreground mb-3">
          No mood quiz here — the intent is already known. The agent sequences the circuit in
          traditional order, checks the season is open, and plans around darshan timing.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CIRCUITS.map((c) => (
            <button key={c} type="button" onClick={() => set({ circuit: c })} className={chip(value.circuit === c)}>
              {c}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={value.circuit}
          onChange={(e) => set({ circuit: e.target.value })}
          placeholder="Or type another circuit or temple"
          className={`${input} mt-3`}
          maxLength={60}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Tradition</label>
          <input
            type="text"
            value={value.tradition}
            onChange={(e) => set({ tradition: e.target.value })}
            placeholder="e.g. Hindu / Shaiva"
            className={input}
            maxLength={40}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Preferred language</label>
          <input
            type="text"
            value={value.languagePref}
            onChange={(e) => set({ languagePref: e.target.value })}
            placeholder="e.g. Hindi, Marathi"
            className={input}
            maxLength={40}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Mobility</label>
        <div className="flex flex-wrap gap-1.5">
          {ACCESS.map((a) => (
            <button key={a} type="button" onClick={() => set({ accessibility: a })} className={chip(value.accessibility === a)}>
              {a}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This becomes a hard non-negotiable — the agent must show how the circuit is completed at
          this mobility level, and reminders fall back to SMS or voice call.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Dietary rule</label>
        <input
          type="text"
          value={value.dietary}
          onChange={(e) => set({ dietary: e.target.value })}
          placeholder="e.g. strict satvik, no onion or garlic"
          className={input}
          maxLength={80}
        />
      </div>
    </div>
  );
}

/* ---------------- Corporate: policy replaces mood, destination is fixed ---------------- */

export function CorporateForm({
  value,
  setValue,
}: {
  value: CorporatePolicy;
  setValue: (v: CorporatePolicy) => void;
}) {
  const set = (patch: Partial<CorporatePolicy>) => setValue({ ...value, ...patch });
  return (
    <div className="space-y-5">
      <div>
        <label className="block font-display font-semibold mb-1">Trip &amp; policy</label>
        <p className="text-xs text-muted-foreground mb-3">
          No mood quiz — company policy replaces it, and the meeting fixes the city. The Discovery
          Agent picks the right business district instead, and a compliance audit runs before
          anything is approved.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Destination city</label>
          <input
            type="text"
            value={value.destinationCity}
            onChange={(e) => set({ destinationCity: e.target.value })}
            placeholder="Where's the meeting?"
            className={input}
            maxLength={40}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Purpose</label>
          <input
            type="text"
            value={value.purpose}
            onChange={(e) => set({ purpose: e.target.value })}
            placeholder="e.g. Client QBR"
            className={input}
            maxLength={60}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Hotel cap / night</label>
          <input
            type="number"
            min={1000}
            step={500}
            value={value.hotelCapPerNightINR}
            onChange={(e) => set({ hotelCapPerNightINR: Math.max(1000, Number(e.target.value) || 1000) })}
            className={`${input} font-mono`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Per diem / day</label>
          <input
            type="number"
            min={500}
            step={250}
            value={value.perDiemINR}
            onChange={(e) => set({ perDiemINR: Math.max(500, Number(e.target.value) || 500) })}
            className={`${input} font-mono`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Cabin class</label>
          <input
            type="text"
            value={value.cabinClass}
            onChange={(e) => set({ cabinClass: e.target.value })}
            placeholder="Economy"
            className={input}
            maxLength={30}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Approval needed above</label>
          <input
            type="number"
            min={0}
            step={500}
            value={value.approvalThresholdINR}
            onChange={(e) => set({ approvalThresholdINR: Math.max(0, Number(e.target.value) || 0) })}
            className={`${input} font-mono`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Cost centre</label>
        <input
          type="text"
          value={value.costCentre}
          onChange={(e) => set({ costCentre: e.target.value })}
          placeholder="e.g. SALES-WEST-04"
          className={`${input} font-mono`}
          maxLength={30}
        />
      </div>
    </div>
  );
}
