/** Shared TripME types — 7-agent system + dynamic Traveller Advocates. */

export type MoodKey = 'Relax' | 'Adventure' | 'Explore' | 'Connect' | 'Spiritual' | 'Celebrate';
export type FoodPref = 'Veg' | 'Non-veg' | 'Anything';
export type Pace = 'Chill' | 'Balanced' | 'Packed';

/** One entry path per persona from the Phase 2 persona set. */
export type TripMode = 'solo' | 'couple' | 'group' | 'family' | 'pilgrimage' | 'corporate';

/** One person on a couple/group trip — each gets their own Advocate agent. */
export interface Traveller {
  name: string;
  mood: MoodKey;
  budgetINR: number;
  note: string;
}

/** Family mode: household composition drives pacing, not mood. */
export type AgeBand = 'adult' | 'child' | 'senior';

export interface HouseholdMember {
  name: string;
  band: AgeBand;
  age: number;
  note: string; // e.g. "knee trouble — avoid long stair climbs"
}

/** Pilgrimage mode: faith logistics replace the mood quiz. */
export interface PilgrimageInput {
  circuit: string; // e.g. "Char Dham", "Shirdi", "Varanasi ghats"
  tradition: string; // e.g. "Hindu / Shaiva", "Sikh", "Buddhist"
  accessibility: 'full mobility' | 'limited walking' | 'wheelchair required';
  dietary: string; // e.g. "strict satvik, no onion or garlic"
  languagePref: string;
}

/** Corporate mode: policy constraints replace the mood quiz entirely. */
export interface CorporatePolicy {
  destinationCity: string; // fixed — you travel to where the meeting is
  purpose: string;
  hotelCapPerNightINR: number;
  cabinClass: string;
  perDiemINR: number;
  approvalThresholdINR: number;
  costCentre: string;
}

export interface TripInput {
  mode: TripMode;
  mood: MoodKey; // solo mood, or the organiser's in couple/group
  moodNote: string;
  travellersList: Traveller[]; // couple / group
  household: HouseholdMember[]; // family
  pilgrimage?: PilgrimageInput; // pilgrimage
  corporate?: CorporatePolicy; // corporate
  budgetTotalINR: number;
  durationDays: number;
  originCity: string;
  startDate: string; // YYYY-MM-DD
  travelers: number;
  foodPref: FoodPref;
  pace: Pace;
  /**
   * Set when the traveller starts from a place rather than a feeling — picked
   * off Trending destinations. Discovery then justifies that choice instead of
   * making one, so the rest of the pipeline is unchanged.
   */
  pinnedDestination?: string;
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
  /** Mode-aware: who this day suits and why (age bands, darshan/access, policy). */
  suitabilityNote?: string;
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

/** Referee, family mode: audits the itinerary against who is actually travelling. */
export interface FamilyAuditOutput {
  conflictsFound: {
    day: number;
    issue: string;
    affects: string;
    fix: string;
  }[];
  pacingVerdict: 'workable' | 'too packed' | 'needs adjustment';
  restWindows: string[];
  refereeNote: string;
}

/** Referee, corporate mode: audits bookings against travel policy. */
export interface PolicyAuditOutput {
  compliant: boolean;
  violations: {
    item: string;
    policyRule: string;
    overageINR: number;
    action: string;
  }[];
  expenseReport: {
    category: string;
    amountINR: number;
    reimbursable: boolean;
    note: string;
  }[];
  totalReimbursableINR: number;
  complianceNote: string;
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
  familyAudit?: FamilyAuditOutput;
  policyAudit?: PolicyAuditOutput;
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
  /** Absent on records written before versioning; see TRIP_SCHEMA_VERSION. */
  schemaVersion?: number;
  state: TripState;
}

/** Per-person settlement, derived from approved bookings. */
export interface SplitLine {
  traveller: string;
  shareINR: number;
  paidINR: number;
  balanceINR: number;
}

/**
 * Still the 7-agent core. The Mood & Intent Agent and the Referee Agent each
 * have mode variants — same agent, different brief per persona entry path.
 */
export type AgentKey =
  | 'mood'
  | 'mood_family'
  | 'mood_pilgrimage'
  | 'mood_corporate'
  | 'advocate'
  | 'consensus'
  | 'destination'
  | 'budget'
  | 'itinerary'
  | 'referee'
  | 'referee_family'
  | 'referee_policy'
  | 'booking'
  | 'notification';

export interface AgentApiResponse {
  ok: boolean;
  data?: object;
  error?: 'parse_failed' | 'rate_limited' | 'server_error' | 'missing_key';
  retryAfterSeconds?: number;
}
