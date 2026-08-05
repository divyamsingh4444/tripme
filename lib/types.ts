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

/* ---- Traveller choices: options the plan offers, and what was picked ---- */

/** One priced way of reaching the destination. Amounts are for the whole party. */
export interface TransportOption {
  id: string;
  mode: string; // Flight · Train · Bus · Self-drive
  label: string; // "Guwahati → Kochi, one stop"
  durationLabel: string;
  amountINR: number;
  comfortNote: string;
  bestFor: string;
}

/** One priced place to stay. `perNightINR` is per room, not per person. */
export interface StayOption {
  id: string;
  tier: 'budget' | 'comfort' | 'premium';
  name: string;
  area: string;
  perNightINR: number;
  amenities: string[];
  note: string;
}

/**
 * Getting around once you are there.
 *
 * Separate from TransportOption because it is a different decision: that one is
 * a round trip bought once, this is a daily rate for the length of the stay.
 */
export interface LocalTransportOption {
  id: string;
  mode: string; // Auto-rickshaw · Rented scooter · Cab package · Walk & metro
  label: string;
  perDayINR: number;
  note: string;
  bestFor: string;
}

/**
 * A real, named place from OpenStreetMap — not invented by a model.
 *
 * Prices never come from here, because no free source has them. A real hotel
 * name beside a fabricated nightly rate would read as a quote, so the UI shows
 * these as places to consider and keeps the money clearly an estimate.
 */
export interface RealPlace {
  id: string;
  name: string;
  category: string;
  area?: string;
  lat: number;
  lon: number;
  image?: string;
  imageCredit?: string;
  mapUrl: string;
  website?: string;
}

/**
 * Generated on demand rather than with the plan. Most travellers never open
 * these, and a spare agent call on every run is exactly the kind of spending
 * that emptied the daily quota in the first place.
 */
export interface TripOptions {
  transport: TransportOption[];
  stays: StayOption[];
  localTransport?: LocalTransportOption[];
}

/** A single itinerary slot the traveller has changed. */
export interface SlotEdit {
  activity: string;
  approxCostINR: number;
  /** Set when the traveller cleared the slot rather than replacing it. */
  cleared?: boolean;
}

export interface TripChoices {
  transportId?: string;
  stayId?: string;
  localTransportId?: string;
  /** A real OSM hotel the traveller picked instead of a generated tier. */
  realStayId?: string;
  /** Keyed `${day}-${slot}`, e.g. "2-morning". */
  slotEdits?: Record<string, SlotEdit>;
}

/**
 * A plan is a proposal until the traveller says they are actually going.
 * Reminders only mean something after that, which is why they stay hidden
 * until it happens.
 */
export type TripStatus = 'planned' | 'confirmed';

/* ---- Assembled trip ---- */
export interface TripState {
  /**
   * Stable identity for this plan, minted once when it is created.
   *
   * Without it, saving was append-only: every later edit wrote a fresh record,
   * so one traveller's single trip appeared six times in My Trips. A plan is a
   * thing, not an event, and it needs an identity that survives being edited.
   * Absent on records written before this existed — treated as legacy.
   */
  tripId?: string;
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
  /** Travel and stay alternatives, fetched the first time they are asked for. */
  options?: TripOptions;
  /** Real nearby places from OpenStreetMap, fetched alongside the options. */
  realStays?: RealPlace[];
  realActivities?: RealPlace[];
  choices?: TripChoices;
  /** Absent on trips planned before the confirm step existed — treat as 'planned'. */
  status?: TripStatus;
  confirmedAt?: number;
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
  | 'notification'
  | 'options'
  | 'assistant';

export interface AgentApiResponse {
  ok: boolean;
  data?: object;
  error?: 'parse_failed' | 'rate_limited' | 'too_many_requests' | 'server_error' | 'missing_key';
  retryAfterSeconds?: number;
}
