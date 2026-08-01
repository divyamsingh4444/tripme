/** Shared TripME types — agent output schemas and trip state. */

export type MoodKey = 'Relax' | 'Adventure' | 'Explore' | 'Connect' | 'Spiritual' | 'Celebrate';
export type FoodPref = 'Veg' | 'Non-veg' | 'Anything';
export type Pace = 'Chill' | 'Balanced' | 'Packed';

export interface TripInput {
  mood: MoodKey;
  moodNote: string;
  budgetTotalINR: number;
  durationDays: number;
  originCity: string;
  startDate: string; // YYYY-MM-DD
  travelers: number;
  foodPref: FoodPref;
  pace: Pace;
}

/* ---- Agent 1: Mood ---- */
export interface MoodOutput {
  moodProfile: {
    primaryMood: string;
    energyLevel: 'low' | 'medium' | 'high';
    pace: 'chill' | 'balanced' | 'packed';
    socialSetting: string;
  };
  travelIntent: string;
  destinationParameters: {
    settingTypes: string[];
    climatePreference: string;
    maxOneWayTravelHours: number;
    crowdTolerance: 'low' | 'medium' | 'high';
    experienceThemes: string[];
  };
  personalizationNote: string;
}

/* ---- Agent 2: Destination ---- */
export interface SelectedDestination {
  name: string;
  region: string;
  country: string;
  whyMatched: string;
  travelFromOrigin: { mode: string; approxHours: number };
  weatherAtTravelDates: string;
  crowdLevel: string;
  dailyCostBandINR: string;
}

export interface DestinationOutput {
  selected: SelectedDestination;
  alternates: { name: string; oneLineReason: string }[];
  decisionNote: string;
}

/* ---- Agent 3: Budget Optimizer ---- */
export interface BudgetCategory {
  amountINR: number;
  pct: number;
  note: string;
  tier?: string;
}

export interface BudgetOutput {
  currency: 'INR';
  totalINR: number;
  allocation: {
    transport: BudgetCategory;
    stay: BudgetCategory;
    food: BudgetCategory;
    activities: BudgetCategory;
    buffer: BudgetCategory;
  };
  perDaySpendINR: number;
  savingTips: string[];
}

/* ---- Agent 4: Itinerary ---- */
export interface ItinerarySlot {
  activity: string;
  area: string;
  approxCostINR: number;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  morning: ItinerarySlot;
  afternoon: ItinerarySlot;
  evening: ItinerarySlot;
  meals: string;
  swapIfNeeded: string;
}

export interface ItineraryOutput {
  days: ItineraryDay[];
  languageCard: {
    language: string;
    phrases: { english: string; local: string; phonetic: string }[];
  };
  packingTips: string[];
}

/* ---- Agent 5: Booking (simulated) ---- */
export interface BookingItem {
  type: 'transport' | 'stay' | 'activity';
  title: string;
  detail: string;
  dates: string;
  amountINR: number;
  budgetCategory: string;
}

export interface BookingOutput {
  simulated: true;
  bookings: BookingItem[];
  totalCommittedINR: number;
  remainingBudgetINR: number;
  bookingNote: string;
}

/* ---- Assembled trip ---- */
export interface TripState {
  input: TripInput;
  mood: MoodOutput;
  destination: DestinationOutput;
  budget: BudgetOutput;
  itinerary: ItineraryOutput;
  booking: BookingOutput;
  plannedInSeconds: number;
  hadHistory: boolean;
  isSample?: boolean;
  createdAt: number;
}

export interface SavedTrip {
  id: string;
  savedAt: number;
  state: TripState;
}

export type AgentKey = 'mood' | 'destination' | 'budget' | 'itinerary' | 'booking';

export interface AgentApiResponse {
  ok: boolean;
  data?: object;
  error?: 'parse_failed' | 'rate_limited' | 'server_error' | 'missing_key';
  retryAfterSeconds?: number;
}
