/**
 * Bundled sample plan — a 3-day ₹18,000 "Relax" trip Bengaluru → Gokarna.
 * Used by "See a sample trip" and as the fallback when the live pipeline
 * fails twice. Matches every agent schema exactly. No API call involved.
 */

import type { TripState } from './types';

export function buildSampleTrip(): TripState {
  const start = new Date();
  start.setDate(start.getDate() + 21);
  const startDate = start.toISOString().slice(0, 10);

  return {
    isSample: true,
    createdAt: Date.now(),
    plannedInSeconds: 34,
    agentsRun: 7,
    hadHistory: false,
    input: {
      mode: 'solo',
      travellersList: [],
      household: [],
      mood: 'Relax',
      moodNote: 'Slow mornings, sea breeze, no alarms',
      budgetTotalINR: 18000,
      durationDays: 3,
      originCity: 'Bengaluru',
      startDate,
      travelers: 1,
      foodPref: 'Anything',
      pace: 'Chill',
    },
    mood: {
      moodProfile: {
        primaryMood: 'Relax',
        energyLevel: 'low',
        pace: 'chill',
        socialSetting: 'solo',
      },
      travelIntent:
        'A slow, salt-air weekend where the loudest sound is the tide and the only plan is having none.',
      destinationParameters: {
        settingTypes: ['beach', 'nature'],
        climatePreference: 'warm coastal',
        maxOneWayTravelHours: 12,
        crowdTolerance: 'low',
        experienceThemes: ['beach lounging', 'sunset walks', 'café hopping', 'light water activities'],
        nonNegotiables: ['slow unhurried pace', 'walkable beach access', 'sunset viewing point'],
        avoid: ['packed sightseeing schedules', 'loud party strips'],
      },
      personalizationNote: 'First trip — no history yet.',
    },
    destination: {
      selected: {
        name: 'Gokarna',
        region: 'Karnataka',
        country: 'India',
        whyMatched:
          'Gokarna is built for exactly this relax-first brief: quiet crescent beaches, cliff-top sunset points and a slow café scene — Goa energy without Goa crowds.',
        moodAlignment:
          'Relax means doing less, not seeing more — Gokarna rewards a traveller who plans one thing a day and spends the rest barefoot.',
        travelFromOrigin: { mode: 'overnight sleeper bus', approxHours: 9 },
        weatherAtTravelDates: 'Warm and mostly clear, 24–32°C, calm seas',
        crowdLevel: 'low–moderate',
        dailyCostBandINR: '₹1,800–₹2,800/day',
      },
      alternates: [
        { name: 'Varkala', oneLineReason: 'Same cliff-and-beach calm, slightly longer journey from Bengaluru.' },
        { name: 'Pondicherry', oneLineReason: 'Relaxed cafés and sea promenade with a French-quarter twist.' },
      ],
      nonNegotiablesMet: [
        'Slow unhurried pace: Kudle Beach has no ticketed sights to rush between.',
        'Walkable beach access: the guesthouse strip is a 4-minute walk from the sand.',
        'Sunset viewing point: the Kudle–Om clifftop path faces due west.',
      ],
      decisionNote:
        'Gokarna won on shortest overnight journey and the lowest-crowd beaches for the travel month.',
    },
    budget: {
      currency: 'INR',
      totalINR: 18000,
      allocation: {
        transport: {
          amountINR: 4000,
          pct: 22,
          note: 'Round-trip AC sleeper bus, plus local autos between beaches.',
        },
        stay: {
          amountINR: 6000,
          pct: 33,
          tier: 'beach-side guesthouse',
          note: 'Two nights in a clean single room a short walk from Kudle Beach.',
        },
        food: {
          amountINR: 3500,
          pct: 19,
          note: 'Beach shacks and cafés — thalis, seafood plates and smoothie bowls.',
        },
        activities: {
          amountINR: 2700,
          pct: 15,
          note: 'Kayaking session, beach-hopping boat ride and sunset point entries.',
        },
        buffer: {
          amountINR: 1800,
          pct: 10,
          note: 'Kept aside for spontaneity — an extra meal out or a longer boat ride.',
        },
      },
      perDaySpendINR: 2067,
      savingTips: [
        'Book the sleeper bus a week early — fares jump closer to weekends.',
        'Eat lunch at temple-street thali spots; save shack dining for sunsets.',
        'Walk the Kudle–Om beach trail instead of taking autos — it is the best part anyway.',
      ],
    },
    itinerary: {
      days: [
        {
          day: 1,
          theme: 'Arrive slow, unwind slower',
          morning: {
            activity: 'Arrive by overnight bus, check in and a lazy breakfast',
            area: 'Kudle Beach',
            approxCostINR: 300,
          },
          afternoon: {
            activity: 'Beach lounging and a first swim',
            area: 'Kudle Beach',
            approxCostINR: 0,
          },
          evening: {
            activity: 'Sunset walk to the southern cliff and shack dinner',
            area: 'Kudle–Om cliff path',
            approxCostINR: 700,
          },
          meals: 'Smoothie bowl breakfast; grilled-fish or veg thali dinner at a beach shack.',
          swapIfNeeded: 'If the sun is harsh, swap the walk for a book and cold coffee at a cliff café.',
        },
        {
          day: 2,
          theme: 'Gentle adventure day',
          morning: {
            activity: 'Kayaking session on calm morning water',
            area: 'Om Beach',
            approxCostINR: 900,
          },
          afternoon: {
            activity: 'Boat ride to Half Moon Beach with a picnic stop',
            area: 'Half Moon Beach',
            approxCostINR: 800,
          },
          evening: {
            activity: 'Café dinner and live acoustic music',
            area: 'Om Beach road',
            approxCostINR: 800,
          },
          meals: 'Beach-shack lunch of poha and lime soda; wood-fired pizza dinner.',
          swapIfNeeded: 'Choppy sea? Swap the boat for the Mirjan Fort half-day visit.',
        },
        {
          day: 3,
          theme: 'Old town and goodbyes',
          morning: {
            activity: 'Mahabaleshwar Temple street walk and filter coffee',
            area: 'Gokarna old town',
            approxCostINR: 200,
          },
          afternoon: {
            activity: 'Last swim and souvenir browsing',
            area: 'Gokarna Main Beach',
            approxCostINR: 300,
          },
          evening: {
            activity: 'Early dinner, board the overnight bus back',
            area: 'Bus stand',
            approxCostINR: 500,
          },
          meals: 'Temple-street veg thali lunch; light café dinner before the bus.',
          swapIfNeeded: 'Low energy? Skip old town and keep the whole day on Kudle Beach.',
        },
      ],
      languageCard: {
        language: 'Kannada',
        phrases: [
          { english: 'Hello', local: 'ನಮಸ್ಕಾರ', phonetic: 'na-mas-kaa-ra' },
          { english: 'Thank you', local: 'ಧನ್ಯವಾದ', phonetic: 'dhan-ya-vaa-da' },
          { english: 'How much?', local: 'ಎಷ್ಟು?', phonetic: 'esh-tu' },
          { english: 'Too costly!', local: 'ತುಂಬಾ ದುಬಾರಿ', phonetic: 'tum-baa du-baa-ri' },
          { english: 'Help!', local: 'ಸಹಾಯ ಮಾಡಿ', phonetic: 'sa-haa-ya maa-di' },
          { english: 'Water', local: 'ನೀರು', phonetic: 'nee-ru' },
          { english: 'Where is the beach?', local: 'ಬೀಚ್ ಎಲ್ಲಿದೆ?', phonetic: 'beach el-li-de' },
          { english: 'Very tasty', local: 'ತುಂಬಾ ರುಚಿ', phonetic: 'tum-baa ru-chi' },
        ],
      },
      packingTips: [
        'Reef-safe sunscreen and a hat — shade is scarce on the cliff walk.',
        'Flip-flops plus one pair of grippy sandals for the beach trail.',
        'A light cotton layer for the AC sleeper bus.',
        'Power bank — beach shacks are stingy with plug points.',
      ],
    },
    audit: {
      itineraryTotalINR: 4500,
      allowanceINR: 4450,
      gapINR: 50,
      hasConflict: false,
    },
    referee: {
      conflictStatement:
        'The Itinerary Agent planned ₹4,500 of activities against the Budget Agent’s ₹4,450 allowance — a ₹50 overrun.',
      severity: 'minor',
      recommendation: 'accept',
      resolutionOptions: [
        {
          label: 'Absorb into buffer',
          detail: 'Take the ₹50 from the ₹1,800 contingency buffer and change nothing else.',
          impact: 'Buffer drops to ₹1,750. Nothing on the trip changes.',
        },
        {
          label: 'Skip one shack coffee',
          detail: 'Trim a single café stop on Day 3 to close the gap exactly.',
          impact: 'You lose one filter coffee. Buffer stays untouched.',
        },
        {
          label: 'Accept the overrun',
          detail: 'A ₹50 gap on an ₹18,000 trip is inside normal price variance.',
          impact: 'No change now; a slightly tighter last day if prices move.',
        },
      ],
      reallocationInstruction:
        'Cover a ₹50 shortfall in activities by drawing from the buffer category.',
      refereeNote:
        'At ₹50 this is rounding, not a real conflict — I would not re-plan a whole budget over it.',
    },
    booking: {
      simulated: true,
      bookings: [
        {
          type: 'transport',
          title: 'Bengaluru → Gokarna overnight sleeper bus',
          detail: 'AC sleeper, round trip for 1 traveller (generic operator)',
          dates: 'Departure eve of Day 1 · return night of Day 3',
          amountINR: 3800,
          budgetCategory: 'transport',
          needsApprovalReason: 'Above ₹3,000 spend gate',
        },
        {
          type: 'stay',
          title: '2 nights · beach-side guesthouse (sample property)',
          detail: 'Single room with breakfast, 4-minute walk to Kudle Beach',
          dates: 'Day 1 – Day 3',
          amountINR: 5600,
          budgetCategory: 'stay',
          needsApprovalReason: 'Non-refundable within 48 hours of check-in',
        },
        {
          type: 'activity',
          title: 'Morning kayaking session for one',
          detail: 'One-hour guided paddle on calm water in a single kayak, gear included',
          dates: 'Day 2, 7:30 AM',
          amountINR: 800,
          budgetCategory: 'activities',
          needsApprovalReason: 'Weather-dependent slot',
        },
      ],
      totalCommittedINR: 10200,
      remainingBudgetINR: 7800,
      bookingNote: 'Demo mode — no real reservations made.',
    },
    notification: {
      reminders: [
        {
          title: 'Pack and head to the bus stand',
          body: 'Sleeper bus to Gokarna departs tonight. Keep the ticket screenshot offline.',
          whenLabel: 'Day 0, 6:00 PM',
          offsetLabel: '3 hours before departure',
          channel: 'push',
          priority: 'high',
          forWhom: 'You',
        },
        {
          title: 'Guesthouse check-in window opens',
          body: 'Early check-in is usually fine here — message ahead if the bus runs late.',
          whenLabel: 'Day 1, 8:00 AM',
          offsetLabel: 'On arrival',
          channel: 'push',
          priority: 'normal',
          forWhom: 'You',
        },
        {
          title: 'Kayaking session',
          body: 'Meet at Om Beach shack #3. Wear something you can swim in.',
          whenLabel: 'Day 2, 7:00 AM',
          offsetLabel: '30 minutes before',
          channel: 'push',
          priority: 'normal',
          forWhom: 'You',
        },
        {
          title: 'Sunset walk — golden hour starts',
          body: 'The Kudle–Om cliff path takes about 40 minutes at a slow pace.',
          whenLabel: 'Day 2, 5:30 PM',
          offsetLabel: '45 minutes before sunset',
          channel: 'push',
          priority: 'normal',
          forWhom: 'You',
        },
        {
          title: 'Return bus tonight',
          body: 'Check out by noon, then the day is yours until the 9 PM departure.',
          whenLabel: 'Day 3, 9:00 AM',
          offsetLabel: '12 hours before departure',
          channel: 'push',
          priority: 'high',
          forWhom: 'You',
        },
      ],
      channelStrategy:
        'Push only — a solo, digitally fluent traveller on a well-connected coastal route needs no SMS fallback.',
      quietHoursNote:
        'Nothing non-critical fires between 10 PM and 7 AM; the departure alert is the one exception.',
    },
  };
}
