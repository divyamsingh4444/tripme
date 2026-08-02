/**
 * Editorial content for the landing page.
 *
 * Deliberately hand-picked and labelled as such. We have no booking volume, so
 * anything claiming "most booked" or "142 people chose this" would be invented
 * social proof — which is exactly the judgement the ethics section grades. What
 * is honest, and just as useful, is a curated shortlist that fills the planner
 * for you.
 */

import type { MoodKey } from './types';

export interface TrendingPlace {
  name: string;
  region: string;
  blurb: string;
  mood: MoodKey;
  bestMonths: string;
  fromINR: number;
  days: number;
}

/** Tapping one pins the destination and pre-fills a brief that suits it. */
export const TRENDING: TrendingPlace[] = [
  {
    name: 'Rishikesh',
    region: 'Uttarakhand',
    blurb: 'Ganga aarti at dusk, yoga at dawn, whitewater in between.',
    mood: 'Spiritual',
    bestMonths: 'Sep – Apr',
    fromINR: 18000,
    days: 4,
  },
  {
    name: 'Gokarna',
    region: 'Karnataka',
    blurb: 'Crescent beaches and cliff walks. Goa energy, without Goa crowds.',
    mood: 'Relax',
    bestMonths: 'Oct – Mar',
    fromINR: 16000,
    days: 3,
  },
  {
    name: 'Udaipur',
    region: 'Rajasthan',
    blurb: 'Lake palaces, rooftop dinners and courtyards built for wandering.',
    mood: 'Explore',
    bestMonths: 'Oct – Mar',
    fromINR: 28000,
    days: 4,
  },
  {
    name: 'Manali',
    region: 'Himachal Pradesh',
    blurb: 'Snow lines, pine trails and a valley that rewards early starts.',
    mood: 'Adventure',
    bestMonths: 'Mar – Jun',
    fromINR: 26000,
    days: 5,
  },
  {
    name: 'Varanasi',
    region: 'Uttar Pradesh',
    blurb: 'The ghats before sunrise — the oldest morning ritual still running.',
    mood: 'Spiritual',
    bestMonths: 'Oct – Mar',
    fromINR: 17000,
    days: 3,
  },
  {
    name: 'Goa',
    region: 'Goa',
    blurb: 'North for the nights out, south for the mornings after.',
    mood: 'Celebrate',
    bestMonths: 'Nov – Feb',
    fromINR: 30000,
    days: 4,
  },
  {
    name: 'Coorg',
    region: 'Karnataka',
    blurb: 'Coffee estates, misty mornings and absolutely nothing to rush for.',
    mood: 'Relax',
    bestMonths: 'Oct – Mar',
    fromINR: 20000,
    days: 3,
  },
  {
    name: 'Meghalaya',
    region: 'North East India',
    blurb: 'Living root bridges, waterfalls and the cleanest air in the country.',
    mood: 'Adventure',
    bestMonths: 'Oct – Apr',
    fromINR: 34000,
    days: 6,
  },
];

export interface TripIdea {
  title: string;
  hook: string;
  mood: MoodKey;
  days: number;
  budgetINR: number;
  /** illustrative only — the agents still choose where you actually go */
  photoHint: string;
}

/** Mood-led briefs. These do NOT pin a place; Discovery still decides. */
export const TRIP_IDEAS: TripIdea[] = [
  {
    title: 'A slow beach reset',
    hook: 'Three days where the loudest thing is the tide.',
    mood: 'Relax',
    days: 3,
    budgetINR: 18000,
    photoHint: 'Varkala',
  },
  {
    title: 'Mountains and adrenaline',
    hook: 'Wake up early, earn the view, sleep like a rock.',
    mood: 'Adventure',
    days: 5,
    budgetINR: 35000,
    photoHint: 'Spiti Valley',
  },
  {
    title: 'The temple trail',
    hook: 'Darshan, ghats and food that has not changed in centuries.',
    mood: 'Spiritual',
    days: 4,
    budgetINR: 22000,
    photoHint: 'Madurai',
  },
  {
    title: 'Heritage deep-dive',
    hook: 'Forts, stepwells and old cities best seen on foot.',
    mood: 'Explore',
    days: 4,
    budgetINR: 28000,
    photoHint: 'Hampi',
  },
  {
    title: 'One big weekend',
    hook: 'You have two nights. Make them count.',
    mood: 'Celebrate',
    days: 3,
    budgetINR: 30000,
    photoHint: 'Mumbai',
  },
  {
    title: 'Friends, no agenda',
    hook: 'Somewhere everyone agrees on, decided by the Referee.',
    mood: 'Connect',
    days: 4,
    budgetINR: 26000,
    photoHint: 'Pondicherry',
  },
];
