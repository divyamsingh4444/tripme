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
    hadHistory: false,
    input: {
      mood: 'Relax',
      moodNote: 'Slow mornings, sea breeze, no alarms',
      budgetTotalINR: 18000,
      durationDays: 3,
      originCity: 'Bengaluru',
      startDate,
      travelers: 2,
      foodPref: 'Anything',
      pace: 'Chill',
    },
    mood: {
      moodProfile: {
        primaryMood: 'Relax',
        energyLevel: 'low',
        pace: 'chill',
        socialSetting: 'couple / close friends',
      },
      travelIntent:
        'A slow, salt-air weekend where the loudest sound is the tide and the only plan is having none.',
      destinationParameters: {
        settingTypes: ['beach', 'nature'],
        climatePreference: 'warm coastal',
        maxOneWayTravelHours: 12,
        crowdTolerance: 'low',
        experienceThemes: ['beach lounging', 'sunset walks', 'café hopping', 'light water activities'],
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
        travelFromOrigin: { mode: 'overnight sleeper bus', approxHours: 9 },
        weatherAtTravelDates: 'Warm and mostly clear, 24–32°C, calm seas',
        crowdLevel: 'low–moderate',
        dailyCostBandINR: '₹1,800–₹2,800/day',
      },
      alternates: [
        { name: 'Varkala', oneLineReason: 'Same cliff-and-beach calm, slightly longer journey from Bengaluru.' },
        { name: 'Pondicherry', oneLineReason: 'Relaxed cafés and sea promenade with a French-quarter twist.' },
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
          note: 'Round-trip AC sleeper bus for two, plus local autos between beaches.',
        },
        stay: {
          amountINR: 6000,
          pct: 33,
          tier: 'beach-side guesthouse',
          note: 'Two nights in a clean double room a short walk from Kudle Beach.',
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
          swapIfNeeded: 'If the sun is harsh, swap the walk for board games at a cliff café.',
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
    booking: {
      simulated: true,
      bookings: [
        {
          type: 'transport',
          title: 'Bengaluru → Gokarna overnight sleeper bus',
          detail: 'AC sleeper, round trip for 2 travellers (generic operator)',
          dates: 'Departure eve of Day 1 · return night of Day 3',
          amountINR: 3800,
          budgetCategory: 'transport',
        },
        {
          type: 'stay',
          title: '2 nights · beach-side guesthouse (sample property)',
          detail: 'Double room with breakfast, 4-minute walk to Kudle Beach',
          dates: 'Day 1 – Day 3',
          amountINR: 5600,
          budgetCategory: 'stay',
        },
        {
          type: 'activity',
          title: 'Morning kayaking session for two',
          detail: 'One-hour guided paddle on calm water, gear included',
          dates: 'Day 2, 7:30 AM',
          amountINR: 800,
          budgetCategory: 'activities',
        },
      ],
      totalCommittedINR: 10200,
      remainingBudgetINR: 7800,
      bookingNote: 'Demo mode — no real reservations made.',
    },
  };
}
