/** Shared TripME types — 7-agent system + dynamic Traveller Advocates. */

export type MoodKey = 'Relax' | 'Adventure' | 'Explore' | 'Connect' | 'Spiritual' | 'Celebrate';
export type FoodPref = 'Veg' | 'Non-veg' | 'Anything';
export type Pace = 'Chill' | 'Balanced' | 'Packed';
export type TripMode = 'solo' | 'group';

/** One person on a group trip — each gets their own Advocate agent. */
export interface Traveller {
  name: string;
  mood: MoodKey;
  budgetINR: number;
  note: string;
}

export interface TripInput {
  mode: TripMode;
  mood: MoodKey; // solo mood, or the organiser's mood in group mode
  moodNote: string;
  travellersList: Traveller[]; // group mode only
  budgetTotalINR: number;
  durationDays: number;
  originCity: string;
  startDate: string; // YYYY-MM-DD
  travelers: number;
  foodPref: FoodPref;
  pace: Pace;
}

/* ---- Agent 1: Mood & Intent ---- */
export interface DestinationParameters {
  settingTypes: string[];
  climatePreference: string;
  maxOneWayTravelHours: number;
  crowdTolerance: 'low' | 'medium' | 'high';
  experienceThemes: string[];
  nonNegotiables: string[];
  avoid: string[];
}

export interface MoodProfile {
  primaryMood: string;
  energyLevel: 'low' | 'medium' | 'high';
  pace: 'chill' | 'balanced' | 'packed';
  socialSetting: string;
}

export interface MoodOutput {
  moodProfile: MoodProfile;
  travelIntent: string;
  destinationParameters: DestinationParameters;
  personalizationNote: string;
}

/* ---- Traveller Advocate (one instance per person) ---- */
export interface AdvocateOutput {
  traveller: string;
  primaryMood: string;
  topPriorities: string[];
  mustHave: string;
  dealBreaker: string;
  flexibleOn: string[];
  budgetComfortINR: number;
  advocacyLine: string;
}

/* ---- Referee: consensus mode ---- */
export interface ConsensusInfo {
  perTraveller: {
    traveller: string;
    wanted: string;
    got: string;
    conceded: string;
    satisfaction: number;
  }[];
  tradeOffsMade: string[];
  refereeNote: string;
}

export interface ConsensusOutput extends MoodOutput {
  consensus: ConsensusInfo;
}

/* ---- Agent 2: Discovery ---- */
export interface SelectedDestination {
  name: string;
  region: string;
  country: string;
  whyMatched: string;
  moodAlignment?: string;
  travelFromOrigin: { mode: string; approxHours: number };
  weatherAtTravelDates: string;
  crowdLevel: string;
  dailyCostBandINR: string;
}

export interface DestinationOutput {
  selected: SelectedDestination;
  alternates: { name: string; oneLineReason: string }[];
  nonNegotiablesMet?: string[];
  decisionNote: string;
}

/* ---- Agent 3: Budget ---- */
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

/* ---- Agent 6: Referee (audit / arbitration) ---- */
export interface RefereeOutput {
  conflictStatement: string;
  severity: 'minor' | 'material';
  recommendation: 'reallocate' | 'trim' | 'accept';
  resolutionOptions: { label: string; detail: string; impact: string }[];
  reallocationInstruction?: string;
  refereeNote: string;
}

/** What the deterministic audit found, before the Referee was asked to arbitrate. */
export interface ConflictAudit {
  itineraryTotalINR: number;
  allowanceINR: number;
  gapINR: number;
  hasConflict: boolean;
}

/* ---- Agent 5: Booking (simulated) ---- */
export interface BookingItem {
  type: 'transport' | 'stay' | 'activity';
  title: string;
  detail: string;
  dates: string;
  amountINR: number;
  budgetCategory: string;
  needsApprovalReason?: string;
}

export interface BookingOutput {
  simulated: true;
  bookings: BookingItem[];
  totalCommittedINR: number;
  remainingBudgetINR: number;
  bookingNote: string;
}

/* ---- Agent 7: Notification ---- */
export interface ReminderItem {
  title: string;
  body: string;
  whenLabel: string;
  offsetLabel: string;
  channel: 'push' | 'sms' | 'voice' | 'calendar' | 'email';
  priority: 'high' | 'normal';
  forWhom?: string;
}

export interface NotificationOutput {
  reminders: ReminderItem[];
  channelStrategy: string;
  quietHoursNote?: string;
}

/* ---- Assembled trip ---- */
export interface TripState {
  input: TripInput;
  mood: MoodOutput;
  advocates?: AdvocateOutput[];
  consensus?: ConsensusInfo;
  destination: DestinationOutput;
  budget: BudgetOutput;
  itinerary: ItineraryOutput;
  referee?: RefereeOutput;
  audit?: ConflictAudit;
  replanned?: boolean;
  budgetV1?: BudgetOutput; // pre-arbitration allocation, kept for the audit trail
  booking: BookingOutput;
  notification?: NotificationOutput;
  agentsRun: number;
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

/** Per-person settlement, derived from approved bookings. */
export interface SplitLine {
  traveller: string;
  shareINR: number;
  paidINR: number;
  balanceINR: number;
}

export type AgentKey =
  | 'mood'
  | 'advocate'
  | 'consensus'
  | 'destination'
  | 'budget'
  | 'itinerary'
  | 'referee'
  | 'booking'
  | 'notification';

export interface AgentApiResponse {
  ok: boolean;
  data?: object;
  error?: 'parse_failed' | 'rate_limited' | 'server_error' | 'missing_key';
  retryAfterSeconds?: number;
}
