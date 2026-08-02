/**
 * The sample gallery.
 *
 * One sample only ever showed the solo path, so the Referee's arbitration, the
 * group consensus matrix, the family pacing audit and the corporate compliance
 * report — the four things that actually distinguish this product — were
 * invisible to anyone who never got a live run to complete. Each sample here
 * demonstrates a different one, and all of them load instantly with no quota.
 */

import { buildSampleTrip } from './sample-trip';
import type {
  BookingOutput,
  BudgetOutput,
  ItineraryDay,
  ItineraryOutput,
  TripState,
} from './types';

/* ---------- small builders so each sample stays readable ---------- */

function budget(
  totalINR: number,
  parts: { transport: number; stay: number; food: number; activities: number; buffer: number },
  notes: Record<string, string>,
  perDay: number,
  tips: string[],
): BudgetOutput {
  const pct = (n: number) => Math.round((n / totalINR) * 100);
  return {
    currency: 'INR',
    totalINR,
    allocation: {
      transport: { amountINR: parts.transport, pct: pct(parts.transport), note: notes.transport },
      stay: { amountINR: parts.stay, pct: pct(parts.stay), tier: notes.tier, note: notes.stay },
      food: { amountINR: parts.food, pct: pct(parts.food), note: notes.food },
      activities: { amountINR: parts.activities, pct: pct(parts.activities), note: notes.activities },
      buffer: { amountINR: parts.buffer, pct: pct(parts.buffer), note: notes.buffer },
    },
    perDaySpendINR: perDay,
    savingTips: tips,
  };
}

function day(
  n: number,
  theme: string,
  m: [string, string, number],
  a: [string, string, number],
  e: [string, string, number],
  meals: string,
  swap: string,
  suitability?: string,
): ItineraryDay {
  return {
    day: n,
    theme,
    morning: { activity: m[0], area: m[1], approxCostINR: m[2] },
    afternoon: { activity: a[0], area: a[1], approxCostINR: a[2] },
    evening: { activity: e[0], area: e[1], approxCostINR: e[2] },
    meals,
    swapIfNeeded: swap,
    ...(suitability ? { suitabilityNote: suitability } : {}),
  };
}

function lang(language: string, phrases: [string, string, string][]): ItineraryOutput['languageCard'] {
  return { language, phrases: phrases.map(([english, local, phonetic]) => ({ english, local, phonetic })) };
}

function booking(items: BookingOutput['bookings'], totalINR: number): BookingOutput {
  const committed = items.reduce((s, b) => s + b.amountINR, 0);
  return {
    simulated: true,
    bookings: items,
    totalCommittedINR: committed,
    remainingBudgetINR: Math.max(0, totalINR - committed),
    bookingNote: 'Demo mode — no real reservations made.',
  };
}

const startIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/* ---------- 2 · GROUP — the consensus matrix ---------- */

function groupSample(): TripState {
  const total = 60000;
  const start = startIn(28);
  return {
    isSample: true,
    createdAt: Date.now(),
    plannedInSeconds: 26,
    agentsRun: 11,
    hadHistory: false,
    input: {
      mode: 'group',
      mood: 'Adventure',
      moodNote: '',
      travellersList: [
        { name: 'Priya', mood: 'Adventure', budgetINR: 22000, note: 'I want a proper trek' },
        { name: 'Rohan', mood: 'Relax', budgetINR: 16000, note: 'please no 5am wakeups' },
        { name: 'Asha', mood: 'Celebrate', budgetINR: 22000, note: 'one big night out' },
      ],
      household: [],
      budgetTotalINR: total,
      durationDays: 4,
      originCity: 'Mumbai',
      startDate: start,
      travelers: 3,
      foodPref: 'Anything',
      pace: 'Balanced',
    },
    advocates: [
      {
        traveller: 'Priya', primaryMood: 'Adventure',
        topPriorities: ['a real trek', 'early starts', 'views worth the climb'],
        mustHave: 'At least one full-day trek',
        dealBreaker: 'A trip that never leaves the town',
        flexibleOn: ['food', 'hotel tier'],
        budgetComfortINR: 22000,
        advocacyLine: "I did not take leave to sit in a café — give me one day that genuinely tires me out.",
      },
      {
        traveller: 'Rohan', primaryMood: 'Relax',
        topPriorities: ['unscheduled afternoons', 'good coffee', 'no alarms'],
        mustHave: 'At least two afternoons with nothing planned',
        dealBreaker: '5am wake-ups on consecutive days',
        flexibleOn: ['nightlife', 'how far we travel'],
        budgetComfortINR: 16000,
        advocacyLine: "I am fine with one big day, but I am not doing three of them back to back.",
      },
      {
        traveller: 'Asha', primaryMood: 'Celebrate',
        topPriorities: ['one proper night out', 'somewhere with a view', 'good food'],
        mustHave: 'One memorable night out',
        dealBreaker: 'Being asleep by 10pm every night',
        flexibleOn: ['early mornings', 'trek difficulty'],
        budgetComfortINR: 22000,
        advocacyLine: "Plan the trek, absolutely — but one night we go out properly and nobody complains.",
      },
    ],
    consensus: {
      perTraveller: [
        { traveller: 'Priya', wanted: 'A full-day trek', got: 'Day 2 is the summit day', conceded: 'nothing major', satisfaction: 5 },
        { traveller: 'Rohan', wanted: 'Two free afternoons', got: 'Day 1 and Day 3 afternoons unscheduled', conceded: 'One 6am start on Day 2', satisfaction: 4 },
        { traveller: 'Asha', wanted: 'A big night out', got: 'Day 3 evening in Old Manali', conceded: 'The rooftop-bar specifics', satisfaction: 4 },
      ],
      tradeOffsMade: [
        "Priya's trek got the best weather window, so Rohan absorbed the single early start — and got both free afternoons in exchange.",
        "Asha's night out moved to Day 3 so nobody is climbing on a short night's sleep.",
      ],
      refereeNote: 'Rohan gave up the lie-in on one day and won the pace everywhere else. Nobody conceded twice.',
    },
    mood: {
      moodProfile: { primaryMood: 'Adventure', energyLevel: 'high', pace: 'balanced', socialSetting: 'three friends travelling together' },
      travelIntent: 'One properly hard day, two slow ones, and a night none of them will shut up about.',
      destinationParameters: {
        settingTypes: ['mountains', 'nature'],
        climatePreference: 'cool mountain air',
        maxOneWayTravelHours: 14,
        crowdTolerance: 'medium',
        experienceThemes: ['trekking', 'cafés', 'one big night'],
        nonNegotiables: ['a full-day trek', 'two unscheduled afternoons', 'one real night out'],
        avoid: ['back-to-back dawn starts', 'places that shut at 9pm'],
      },
      personalizationNote: 'First trip — no history yet.',
    },
    destination: {
      selected: {
        name: 'Manali', region: 'Himachal Pradesh', country: 'India',
        whyMatched: 'Manali is one of the few places that can hand three people with different plans a good day each — a serious trek, slow cafés, and Old Manali after dark, all within twenty minutes of one another.',
        moodAlignment: 'The trek satisfies Adventure without stranding the other two, which is exactly what a blended brief needs.',
        travelFromOrigin: { mode: 'flight to Bhuntar + road', approxHours: 5 },
        weatherAtTravelDates: 'Crisp days around 8–20°C, cold nights',
        crowdLevel: 'moderate',
        dailyCostBandINR: '₹3,500–₹5,500/day',
      },
      alternates: [
        { name: 'Kasol', oneLineReason: 'Same valley, better cafés, weaker trekking.' },
        { name: 'Rishikesh', oneLineReason: 'Rafting instead of a summit, and a much shorter journey.' },
      ],
      nonNegotiablesMet: [
        'A full-day trek: the Lamadugh trail is a genuine 12km day out of Old Manali.',
        'Two unscheduled afternoons: Day 1 and Day 3 are deliberately left open.',
        'One real night out: Old Manali stays awake far later than the rest of the valley.',
      ],
      decisionNote: 'Manali beat Kasol on the trek and Rishikesh on the nightlife — it was the only one that could satisfy all three advocates at once.',
    },
    budget: budget(60000, { transport: 20000, stay: 18000, food: 10000, activities: 6000, buffer: 6000 },
      { transport: 'Return flights to Bhuntar for three, plus valley taxis.', tier: 'mid-range guesthouse', stay: '3 nights, two rooms, walkable to Old Manali.', food: 'Cafés and one proper dinner out.', activities: 'Guided trek day plus entries.', buffer: 'Held for the night out running long.' },
      4000,
      ['Book Bhuntar flights early — the road alternative costs a full day each way.', 'Trek with a local guide rather than an agency; same trail, half the price.', 'Old Manali is cheaper than Mall Road for dinner and better anyway.'],
    ),
    itinerary: {
      days: [
        day(1, 'Arrive, acclimatise, do nothing',
          ['Land at Bhuntar and drive up the valley', 'Kullu → Manali', 1200],
          ['Deliberately unplanned — cafés and a wander', 'Old Manali', 400],
          ['Early dinner, early night before the trek', 'Old Manali', 900],
          'Trout and thukpa at a riverside café; something warm.',
          'If the drive runs late, push the wander to Day 3.',
          'Rohan gets his free afternoon on day one, before anyone is tired.'),
        day(2, 'The summit day',
          ['Lamadugh trek — the long way up', 'Old Manali trailhead', 2400],
          ['Descend slowly, late lunch on the trail', 'Lamadugh meadow', 600],
          ['Everyone sleeps. Genuinely.', 'Guesthouse', 700],
          'Packed lunch on the trail; big carb-heavy dinner after.',
          'If it snows above the treeline, the guide swaps to the Jogini Falls route.',
          'The one early start of the trip, agreed in advance by all three.'),
        day(3, 'Slow day, big night',
          ['Sleep in properly', 'Guesthouse', 0],
          ['Free afternoon — hot springs or nothing at all', 'Vashisht', 500],
          ['Old Manali, properly', 'Old Manali', 2200],
          'Long lazy breakfast; dinner wherever the night takes you.',
          'Raining? The Vashisht hot springs are better in the rain anyway.',
          "Asha's night, and nobody has to climb anything tomorrow."),
        day(4, 'Down the valley',
          ['Late checkout and a last coffee', 'Old Manali', 400],
          ['Drive down to Bhuntar', 'Kullu valley', 1200],
          ['Fly home', 'Bhuntar', 0],
          'Breakfast at the café you liked best.',
          'Flight cancelled? The Volvo to Delhi leaves at 5pm.',
          'A gentle end — nobody is running for anything.'),
      ],
      languageCard: lang('Himachali / Hindi', [
        ['Hello', 'नमस्ते', 'na-mas-te'], ['Thank you', 'धन्यवाद', 'dhan-ya-vaad'],
        ['How much?', 'कितने का है?', 'kit-ne ka hai'], ['Too expensive', 'बहुत महंगा है', 'ba-hut me-han-ga hai'],
        ['Help', 'मदद कीजिए', 'ma-dad kee-ji-ye'], ['Water', 'पानी', 'paa-nee'],
        ['Where is the trail?', 'रास्ता कहाँ है?', 'raas-ta ka-haan hai'], ['Very tasty', 'बहुत स्वादिष्ट', 'ba-hut swaa-disht'],
      ]),
      packingTips: ['Layers — the temperature swings 15°C in a day.', 'Broken-in shoes; the Lamadugh descent is all loose stone.', 'A power bank, since the guesthouse plug points are shared.'],
    },
    booking: booking([
      { type: 'transport', title: 'Mumbai → Bhuntar return, 3 travellers', detail: 'Economy, one checked bag each (generic carrier)', dates: 'Day 1 out · Day 4 back', amountINR: 19500, budgetCategory: 'transport', needsApprovalReason: 'Above ₹3,000 spend gate' },
      { type: 'stay', title: '3 nights · Old Manali guesthouse (sample property)', detail: 'Two rooms, breakfast included, 5-minute walk to the cafés', dates: 'Day 1 – Day 4', amountINR: 17400, budgetCategory: 'stay', needsApprovalReason: 'Non-refundable within 72 hours' },
      { type: 'activity', title: 'Guided Lamadugh trek for three', detail: 'Local guide, packed lunch, roughly 12km round trip', dates: 'Day 2, 6:00 AM', amountINR: 4200, budgetCategory: 'activities', needsApprovalReason: 'Weather-dependent' },
    ], 60000),
    notification: {
      reminders: [
        { title: 'Leave for the airport', body: 'Bhuntar flights are small and board early.', whenLabel: 'Day 1, 4:30 AM', offsetLabel: '3 hours before departure', channel: 'push', priority: 'high', forWhom: 'Everyone' },
        { title: 'Trek starts — meet the guide', body: 'Trailhead at Old Manali bridge. Shoes on, water filled.', whenLabel: 'Day 2, 5:45 AM', offsetLabel: '15 minutes before', channel: 'push', priority: 'high', forWhom: 'Everyone' },
        { title: 'Night out — settle up first', body: 'Split the tab as you go so nobody reconciles it later.', whenLabel: 'Day 3, 8:00 PM', offsetLabel: 'At the start of the evening', channel: 'push', priority: 'normal', forWhom: 'Everyone' },
        { title: 'Checkout is at noon', body: 'Bags down before the last coffee run.', whenLabel: 'Day 4, 10:30 AM', offsetLabel: '90 minutes before checkout', channel: 'push', priority: 'normal', forWhom: 'Priya (organiser)' },
      ],
      channelStrategy: 'Push to all three phones — everyone is digitally fluent and the valley has decent coverage.',
      quietHoursNote: 'Nothing fires between 10pm and 5am except the trek alarm, which everyone agreed to.',
    },
  };
}

/* ---------- 3 · FAMILY — the pacing audit ---------- */

function familySample(): TripState {
  const total = 55000;
  const start = startIn(35);
  return {
    isSample: true,
    createdAt: Date.now(),
    plannedInSeconds: 21,
    agentsRun: 8,
    hadHistory: false,
    input: {
      mode: 'family',
      mood: 'Explore',
      moodNote: '',
      travellersList: [],
      household: [
        { name: 'Anil', band: 'adult', age: 44, note: '' },
        { name: 'Meera', band: 'adult', age: 41, note: '' },
        { name: 'Ira', band: 'child', age: 8, note: 'tires quickly, needs snack breaks' },
        { name: 'Dadi', band: 'senior', age: 71, note: 'knee trouble — avoid long stair climbs' },
      ],
      budgetTotalINR: total,
      durationDays: 3,
      originCity: 'Delhi',
      startDate: start,
      travelers: 4,
      foodPref: 'Veg',
      pace: 'Chill',
    },
    mood: {
      moodProfile: { primaryMood: 'Explore', energyLevel: 'medium', pace: 'chill', socialSetting: 'a household of four across three generations' },
      travelIntent: 'One trip that an eight-year-old and a grandmother both come home happy from.',
      destinationParameters: {
        settingTypes: ['heritage', 'city'],
        climatePreference: 'mild and dry',
        maxOneWayTravelHours: 4,
        crowdTolerance: 'medium',
        experienceThemes: ['monuments', 'gardens', 'easy food'],
        nonNegotiables: ['step-free access to the main sights', 'somewhere Ira can run around freely', 'no more than 30 minutes walking at a stretch'],
        avoid: ['long stair climbs', 'dawn starts', 'packed back-to-back days'],
      },
      personalizationNote: "Dadi's knee and Ira's stamina set the pace together — the plan is built around the slowest comfortable speed, not the average.",
    },
    destination: {
      selected: {
        name: 'Agra', region: 'Uttar Pradesh', country: 'India',
        whyMatched: 'Agra gives a household this mixed the rare combination of world-famous sights, flat approaches, wheelchair-accessible main gates and gardens where a child can simply be a child.',
        moodAlignment: 'Explore, at a pace that does not punish the oldest or bore the youngest.',
        travelFromOrigin: { mode: 'Gatimaan Express train', approxHours: 2 },
        weatherAtTravelDates: 'Pleasant, 14–27°C, clear mornings',
        crowdLevel: 'high at the Taj, low elsewhere',
        dailyCostBandINR: '₹4,000–₹6,000/day',
      },
      alternates: [
        { name: 'Jaipur', oneLineReason: 'More to see, but the forts mean far more climbing.' },
        { name: 'Mathura', oneLineReason: 'Shorter journey and gentler, with much less for a child to do.' },
      ],
      nonNegotiablesMet: [
        'Step-free access: the Taj east gate has a ramped approach and wheelchairs on request.',
        'Room to run: Mehtab Bagh is open lawn with no ticketed route to follow.',
        'Under 30 minutes walking: every sight on this plan is a short buggy ride from the gate.',
      ],
      decisionNote: 'Agra beat Jaipur purely on accessibility — the forts there would have ruled Dadi out of half the trip.',
    },
    budget: budget(55000, { transport: 12000, stay: 20000, food: 12000, activities: 6000, buffer: 5000 },
      { transport: 'Gatimaan Express both ways for four, plus local cars.', tier: 'family room, central', stay: '2 nights, one family room close to the Taj.', food: 'Vegetarian, mostly hotel and known restaurants.', activities: 'Monument tickets for four plus guide and buggy.', buffer: 'Held for a taxi on any day the walking is too much.' },
      6000,
      ['Book the Gatimaan in advance — it is the difference between 2 hours and 4.', 'Hire the wheelchair at the gate rather than bringing one; it is free.', 'Go to the Taj at opening, not sunrise — the light is similar and the queue is half.'],
    ),
    itinerary: {
      days: [
        day(1, 'Arrive gently',
          ['Gatimaan Express from Delhi', 'Delhi → Agra', 3000],
          ['Check in, long lunch, everyone naps', 'Taj Ganj', 1600],
          ['Mehtab Bagh at sunset — flat lawns, the view across the river', 'Mehtab Bagh', 800],
          'Vegetarian thali at the hotel; light dinner after the gardens.',
          'If the train is late, Mehtab Bagh moves to Day 3 — it is a 20-minute stop.',
          "Works for Ira because Mehtab Bagh is open lawn she can run on, and for Dadi because there is nothing to climb and benches throughout."),
        day(2, 'The Taj, done the easy way',
          ['Taj Mahal at opening, east gate, buggy to the entrance', 'Taj Mahal', 2600],
          ['Back to the hotel — a real rest window until 4pm', 'Taj Ganj', 0],
          ['Agra Fort, ground level only', 'Agra Fort', 1400],
          'Breakfast before the gate opens; early dinner near the hotel.',
          'Too hot? The fort is fine at 5pm and half as busy.',
          "The rest window is the point: one big sight in the morning, nothing at all until Dadi and Ira have both slept."),
        day(3, 'Small things, then home',
          ['Marble inlay workshop — Ira gets to try it', 'Near Taj Ganj', 900],
          ['Baby Taj, which is small, quiet and step-free', 'Itmad-ud-Daulah', 700],
          ['Gatimaan back to Delhi', 'Agra → Delhi', 3000],
          'Early lunch before the train; snacks packed for the journey.',
          'Short on time? The Baby Taj is the one to drop, not the workshop.',
          'A deliberately light last day so nobody is exhausted boarding the train.'),
      ],
      languageCard: lang('Hindi / Braj', [
        ['Hello', 'नमस्ते', 'na-mas-te'], ['Thank you', 'धन्यवाद', 'dhan-ya-vaad'],
        ['How much?', 'कितने का?', 'kit-ne ka'], ['Is there a ramp?', 'रैंप है क्या?', 'ramp hai kya'],
        ['Please go slowly', 'धीरे चलिए', 'dhee-re cha-li-ye'], ['Water', 'पानी', 'paa-nee'],
        ['Pure vegetarian?', 'शुद्ध शाकाहारी?', 'shuddh shaa-kaa-haa-ree'], ['Where is the toilet?', 'शौचालय कहाँ है?', 'shau-chaa-lay ka-haan hai'],
      ]),
      packingTips: ['A folding stool — the Taj queue has nowhere to sit.', 'Snacks for Ira; the monument grounds sell almost nothing.', "Dadi's knee brace and a walking stick that folds into a bag."],
    },
    familyAudit: {
      conflictsFound: [
        { day: 2, issue: 'The Taj and Agra Fort on the same day is a lot of standing for one pair of knees.', affects: 'Dadi', fix: 'Keep the fort to the ground level only, and hold the afternoon rest window firmly rather than letting it slip.' },
        { day: 3, issue: 'A workshop and a monument before a two-hour train could tip an eight-year-old over the edge.', affects: 'Ira', fix: 'Drop the Baby Taj if the morning runs long — the workshop is the part she will remember.' },
      ],
      pacingVerdict: 'workable',
      restWindows: ['Day 1 afternoon, after lunch', 'Day 2, 11am to 4pm — the important one', 'Day 3, on the train home'],
      refereeNote: "Everything is paced around Dadi's knee, and the plan respects it — provided the Day 2 rest window is treated as fixed rather than optional.",
    },
    booking: booking([
      { type: 'transport', title: 'Delhi → Agra Gatimaan Express return, 4 travellers', detail: 'Chair car, both directions (generic operator)', dates: 'Day 1 out · Day 3 back', amountINR: 11200, budgetCategory: 'transport', needsApprovalReason: 'Above ₹3,000 spend gate' },
      { type: 'stay', title: '2 nights · family room near Taj Ganj (sample property)', detail: 'One family room, breakfast, step-free entrance and lift', dates: 'Day 1 – Day 3', amountINR: 19000, budgetCategory: 'stay', needsApprovalReason: 'Non-refundable within 48 hours' },
      { type: 'activity', title: 'Taj Mahal tickets + guide + buggy, 4 people', detail: 'East gate entry, wheelchair on request, licensed guide', dates: 'Day 2, 6:15 AM', amountINR: 4800, budgetCategory: 'activities', needsApprovalReason: 'Timed entry — cannot be moved' },
    ], 55000),
    notification: {
      reminders: [
        { title: 'Train tickets and IDs', body: 'Gatimaan checks ID. Keep Dadi\'s and the kids\' handy.', whenLabel: 'Day 1, 5:30 AM', offsetLabel: '90 minutes before departure', channel: 'push', priority: 'high', forWhom: 'Anil (organiser)' },
        { title: 'Taj entry is timed', body: 'East gate. Ask for the wheelchair at the counter — it is free.', whenLabel: 'Day 2, 5:45 AM', offsetLabel: '30 minutes before entry', channel: 'push', priority: 'high', forWhom: 'Anil (organiser)' },
        { title: 'Rest window starts now', body: 'Back to the hotel. The fort is better at 5pm anyway.', whenLabel: 'Day 2, 11:00 AM', offsetLabel: 'After the Taj', channel: 'push', priority: 'normal', forWhom: 'Anil and Meera' },
        { title: 'Train home', body: 'Leave for the station by 4pm. Snacks packed.', whenLabel: 'Day 3, 3:30 PM', offsetLabel: '2 hours before departure', channel: 'push', priority: 'high', forWhom: 'Anil (organiser)' },
      ],
      channelStrategy: 'One organiser receives everything, with the two adults copied on the rest-window nudge — a household does not need four phones buzzing at once.',
      quietHoursNote: 'Nothing before 5:30am or after 9pm; the family is travelling with a child and a senior.',
    },
  };
}

/* ---------- 4 · CORPORATE — compliance and the expense report ---------- */

function corporateSample(): TripState {
  const total = 35000;
  const start = startIn(14);
  return {
    isSample: true,
    createdAt: Date.now(),
    plannedInSeconds: 19,
    agentsRun: 8,
    hadHistory: false,
    input: {
      mode: 'corporate',
      mood: 'Explore',
      moodNote: '',
      travellersList: [],
      household: [],
      corporate: {
        destinationCity: 'Hyderabad',
        purpose: 'Client QBR',
        hotelCapPerNightINR: 6000,
        cabinClass: 'Economy',
        perDiemINR: 2000,
        approvalThresholdINR: 15000,
        costCentre: 'SALES-WEST-04',
      },
      budgetTotalINR: total,
      durationDays: 3,
      originCity: 'Mumbai',
      startDate: start,
      travelers: 1,
      foodPref: 'Anything',
      pace: 'Packed',
    },
    mood: {
      moodProfile: { primaryMood: 'Business', energyLevel: 'medium', pace: 'packed', socialSetting: 'travelling alone for work' },
      travelIntent: 'In, useful, out — and the expense report writes itself.',
      destinationParameters: {
        settingTypes: ['city'],
        climatePreference: 'warm and dry',
        maxOneWayTravelHours: 3,
        crowdTolerance: 'high',
        experienceThemes: ['near the venue', 'reliable wifi', 'quick dinners'],
        nonNegotiables: ['walking distance to HITEC City', 'hotel under ₹6,000 per night', 'itemised bill for reimbursement'],
        avoid: ['resort stays', 'sightseeing detours'],
      },
      personalizationNote: 'Policy replaced the mood quiz entirely — every constraint here came from the travel policy, not a preference.',
    },
    destination: {
      selected: {
        name: 'Hyderabad', region: 'HITEC City', country: 'India',
        whyMatched: 'The meeting fixes the city, so the decision that remained was the district — HITEC City puts the client office within a ten-minute drive and the airport within forty.',
        moodAlignment: 'Business travel optimises for proximity and predictability, not discovery.',
        travelFromOrigin: { mode: 'flight', approxHours: 1.5 },
        weatherAtTravelDates: 'Warm and dry, 22–32°C',
        crowdLevel: 'busy on weekdays',
        dailyCostBandINR: '₹4,000–₹7,000/day',
      },
      alternates: [
        { name: 'Gachibowli', oneLineReason: 'Marginally cheaper hotels, ten more minutes to the office.' },
        { name: 'Banjara Hills', oneLineReason: 'Better restaurants, materially worse morning traffic.' },
      ],
      nonNegotiablesMet: [
        'Walking distance to HITEC City: the recommended hotel is 1.2km from the client office.',
        'Under the per-night cap: ₹5,800 against a ₹6,000 policy limit.',
        'Itemised bill: business hotels in this district issue GST invoices as standard.',
      ],
      decisionNote: 'HITEC City won on the only metric that matters on a QBR trip — minutes between the hotel door and the client meeting room.',
    },
    budget: budget(35000, { transport: 11000, stay: 11600, food: 6000, activities: 2400, buffer: 4000 },
      { transport: 'Economy return, per policy, plus airport transfers.', tier: 'business hotel', stay: 'Capped at policy limit — ₹5,800/night × 2 nights.', food: 'Held to the per-diem — ₹2,000/day × 3 days.', activities: 'One client dinner, within entertainment allowance.', buffer: 'Unallocated contingency, returned if unused.' },
      2800,
      ['Book the 7am flight — it is cheaper and you still make the 10am meeting.', 'Airport cabs are metered here; pre-booked cars cost double for the same trip.', 'Keep every GST invoice — without it the line is not reimbursable.'],
    ),
    itinerary: {
      days: [
        day(1, 'Fly in, prep, early night',
          ['Mumbai → Hyderabad, 7:10am', 'Airport', 5500],
          ['Check in, then desk time before the QBR', 'HITEC City', 0],
          ['Quiet dinner near the hotel', 'HITEC City', 900],
          'Airport breakfast; a light dinner within the per-diem.',
          'Flight delayed? The QBR prep can happen from the lounge.',
          'Nothing scheduled after 8pm — the meeting is the point of the trip.'),
        day(2, 'The QBR',
          ['Client QBR, 10am–1pm', 'Client office', 0],
          ['Follow-ups and written summary from the hotel', 'HITEC City', 0],
          ['Client dinner', 'HITEC City', 2400],
          'Working lunch provided by the client; dinner claimed under entertainment.',
          'If the QBR overruns, the dinner moves an hour later — it is a five-minute drive.',
          'The whole day is built around one three-hour block, with recovery time either side.'),
        day(3, 'Wrap and fly',
          ['Written follow-ups sent before checkout', 'HITEC City', 0],
          ['Hyderabad → Mumbai, 4:30pm', 'Airport', 5500],
          ['Home', 'Mumbai', 0],
          'Hotel breakfast; airport lunch inside the per-diem.',
          'Meeting added last-minute? The 8pm flight is the fallback.',
          'Late checkout requested so the morning stays usable for work.'),
      ],
      languageCard: lang('Telugu', [
        ['Hello', 'నమస్కారం', 'na-mas-kaa-ram'], ['Thank you', 'ధన్యవాదాలు', 'dhan-ya-vaa-daa-lu'],
        ['How much?', 'ఎంత?', 'en-tha'], ['Please stop here', 'ఇక్కడ ఆపండి', 'ik-ka-da aa-pan-di'],
        ['Receipt, please', 'రసీదు ఇవ్వండి', 'ra-see-du iv-van-di'], ['Water', 'నీళ్ళు', 'neel-lu'],
        ['Where is the office?', 'ఆఫీసు ఎక్కడ?', 'aa-fee-su ek-ka-da'], ['Not spicy', 'కారం వద్దు', 'kaa-ram vad-du'],
      ]),
      packingTips: ['A spare charger for the meeting room, not just the hotel.', 'One formal change more than you think you need.', 'Paper copies of the deck — client wifi is not your problem to solve.'],
    },
    booking: booking([
      { type: 'transport', title: 'Mumbai → Hyderabad return, economy', detail: 'Cabin class per policy (generic carrier)', dates: 'Day 1 out · Day 3 back', amountINR: 11000, budgetCategory: 'transport', needsApprovalReason: 'Within policy — no approval needed' },
      { type: 'stay', title: '2 nights · business hotel, HITEC City (sample property)', detail: '₹5,800 per night, GST invoice issued at checkout', dates: 'Day 1 – Day 3', amountINR: 11600, budgetCategory: 'stay', needsApprovalReason: 'At 97% of the per-night cap' },
      { type: 'activity', title: 'Client dinner for two', detail: 'Entertainment line, itemised receipt required', dates: 'Day 2, 8:00 PM', amountINR: 2400, budgetCategory: 'activities', needsApprovalReason: 'Entertainment spend — receipt mandatory' },
    ], 35000),
    policyAudit: {
      compliant: true,
      violations: [],
      expenseReport: [
        { category: 'transport', amountINR: 11000, reimbursable: true, note: 'Economy return, matches the permitted cabin class.' },
        { category: 'stay', amountINR: 11600, reimbursable: true, note: '₹5,800/night against a ₹6,000 cap — within policy.' },
        { category: 'food', amountINR: 6000, reimbursable: true, note: '₹2,000/day against a ₹2,000 per-diem — at the limit, not over.' },
        { category: 'activities', amountINR: 2400, reimbursable: true, note: 'Client dinner, entertainment line. Itemised receipt attached.' },
      ],
      totalReimbursableINR: 31000,
      complianceNote: 'Every line sits inside policy and no single item exceeds the ₹15,000 approval threshold — this can be filed without a manager signature.',
    },
    notification: {
      reminders: [
        { title: 'Flight to Hyderabad', body: 'Web check-in done. Deck printed?', whenLabel: 'Day 1, 5:00 AM', offsetLabel: '2 hours before departure', channel: 'calendar', priority: 'high', forWhom: 'You' },
        { title: 'Client QBR', body: 'Client office, HITEC City. Leave the hotel by 9:35.', whenLabel: 'Day 2, 9:30 AM', offsetLabel: '30 minutes before', channel: 'calendar', priority: 'high', forWhom: 'You' },
        { title: 'Client dinner', body: 'Keep the itemised receipt — entertainment claims need it.', whenLabel: 'Day 2, 7:45 PM', offsetLabel: '15 minutes before', channel: 'calendar', priority: 'normal', forWhom: 'You' },
        { title: 'Expense report is ready', body: '₹31,000 reimbursable against SALES-WEST-04. Attach your receipts and file.', whenLabel: 'Day 3, 6:00 PM', offsetLabel: 'On landing', channel: 'email', priority: 'normal', forWhom: 'You' },
      ],
      channelStrategy: 'Calendar-first, because a corporate traveller lives in their work calendar and a push notification competes with everything else on the phone.',
      quietHoursNote: 'Nothing outside 5am–9pm, and nothing at all once the trip is filed.',
    },
  };
}

/* ---------- the gallery ---------- */

export interface SampleEntry {
  id: string;
  label: string;
  demonstrates: string;
  place: string;
  region: string;
  build: () => TripState;
}

export const SAMPLES: SampleEntry[] = [
  {
    id: 'gokarna',
    label: 'Solo · Relax',
    demonstrates: 'The core plan — budget split, day-by-day timeline and simulated bookings.',
    place: 'Gokarna',
    region: 'Karnataka',
    build: buildSampleTrip,
  },
  {
    id: 'manali',
    label: 'Group · 3 friends',
    demonstrates: 'One Advocate agent per person, and the Referee publishing who conceded what.',
    place: 'Manali',
    region: 'Himachal Pradesh',
    build: groupSample,
  },
  {
    id: 'agra',
    label: 'Family · 3 generations',
    demonstrates: "The Referee's pacing audit, flagging problems by name for a child and a grandparent.",
    place: 'Agra',
    region: 'Uttar Pradesh',
    build: familySample,
  },
  {
    id: 'hyderabad',
    label: 'Corporate · policy',
    demonstrates: 'Policy caps enforced, plus a reimbursement-ready expense report by cost centre.',
    place: 'Hyderabad',
    region: 'Telangana',
    build: corporateSample,
  },
];

export function buildSampleById(id: string): TripState {
  return (SAMPLES.find((s) => s.id === id) ?? SAMPLES[0]).build();
}
