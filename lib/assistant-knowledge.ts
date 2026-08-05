/**
 * What the assistant knows about TripME without asking a model.
 *
 * The design decision worth stating: almost nothing anyone asks a product
 * chatbot is a reasoning problem. "What is this", "where are my trips", "why
 * are the bookings fake", "how do I change my hotel" are *lookups*. Sending
 * them to a language model costs quota, adds a second of latency, and — worst
 * — invites confident invention about how our own product works.
 *
 * So the knowledge lives here, written once, and the model is the fallback for
 * genuinely open questions only. Every answer below is checked against what the
 * product actually does; where the honest answer is "we don't do that", it says
 * so rather than deflecting.
 */

export interface KnowledgeEntry {
  id: string;
  /** Lowercase terms; more matches means a better fit. */
  keywords: string[];
  /** Phrases that alone are strong enough to win. */
  strong?: string[];
  answer: string;
  /** Somewhere to actually go, when the answer is "over there". */
  link?: { href: string; label: string };
  /** What someone usually wants to know next. */
  followUps?: string[];
}

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'what-is-tripme',
    strong: ['what is tripme', 'what does this do', 'what is this app', 'what is this product'],
    keywords: ['what', 'tripme', 'about', 'product', 'purpose'],
    answer:
      'TripME turns one mood, one budget and one duration into a complete trip plan — where to go, what it costs, what you do each day, and simulated bookings. Seven AI agents each do one job and hand a structured brief to the next, and when two of them disagree a Referee settles it in front of you.',
    link: { href: '/how-it-works', label: 'See how the seven agents work' },
    followUps: ['How do I plan a trip?', 'What are the seven agents?', 'Are the bookings real?'],
  },
  {
    id: 'how-to-plan',
    strong: ['how do i plan', 'how to plan', 'start a trip', 'plan a trip', 'get started', 'how do i start'],
    keywords: ['plan', 'start', 'begin', 'create', 'new trip', 'how'],
    answer:
      'On the Plan page: pick who is coming (solo, couple, group, family, pilgrimage or corporate), choose a mood, set your budget, days and starting city, then press Plan my trip. The agents take about 20–60 seconds and you watch each one work.',
    link: { href: '/', label: 'Go to the planner' },
    followUps: ['What are the six entry paths?', 'How long does planning take?'],
  },
  {
    id: 'agents',
    strong: ['seven agents', '7 agents', 'what are the agents', 'which agents'],
    keywords: ['agent', 'agents', 'pipeline', 'seven', 'referee', 'multi-agent'],
    answer:
      'Mood & Intent reads how you want to feel. Discovery picks where. Budget splits the money. Itinerary plans the days — deliberately without being shown the budget. Booking prepares simulated bookings. The Referee audits Itinerary against Budget and can send the plan backwards to be re-done. Notification builds your reminder schedule. In group mode every traveller also gets their own Advocate.',
    link: { href: '/how-it-works', label: 'The full breakdown' },
    followUps: ['What does the Referee do?', 'Why is the itinerary hidden from the budget?'],
  },
  {
    id: 'referee',
    strong: ['what does the referee do', 'what is the referee'],
    keywords: ['referee', 'conflict', 'disagree', 'arbitrate', 'audit'],
    answer:
      'The Itinerary Agent is never shown your budget, so it prices the trip honestly. The Budget Agent argues for thrift. When the two do not add up, the Referee states the gap in rupees on screen, offers real trade-offs, and can send the plan back to be re-done. It also handles pacing for families and travel-policy compliance for corporate trips.',
    followUps: ['What are the seven agents?'],
  },
  {
    id: 'bookings-real',
    strong: ['are the bookings real', 'is this real', 'do you actually book', 'real booking'],
    keywords: ['book', 'booking', 'real', 'reserve', 'payment', 'pay', 'simulated', 'demo'],
    answer:
      'No — every booking is simulated and labelled Demo Mode. Nothing is reserved and no payment is ever taken. Each booking card links out to Google Flights or Booking.com if you want to book the real thing yourself.',
    followUps: ['Are the prices real?', 'What is real in this product?'],
  },
  {
    id: 'prices-real',
    strong: ['are the prices real', 'is the price accurate', 'real prices', 'actual price'],
    keywords: ['price', 'prices', 'cost', 'estimate', 'accurate', 'rate', 'fare'],
    answer:
      'The prices are honest estimates at typical Indian market rates, not live quotes — every figure in the options panel is marked "est." for that reason. Live fares and hotel rates come from paid inventory APIs, which this project does not use. The hotels and places we show are real; the numbers beside them are ours.',
    followUps: ['Are the hotels real?', 'Are the bookings real?'],
  },
  {
    id: 'real-places',
    strong: ['are the hotels real', 'real hotels', 'where do the places come from'],
    keywords: ['hotel', 'hotels', 'places', 'attraction', 'openstreetmap', 'osm', 'real'],
    answer:
      'Yes. The hotels and attractions in the options panel are real, named places from OpenStreetMap, with photographs from Wikipedia where they exist — you can open any of them on a map or visit their website. Only the nightly rate beside them is our estimate.',
    followUps: ['How do I change my hotel?', 'Are the prices real?'],
  },
  {
    id: 'change-plan',
    strong: ['change my hotel', 'change the plan', 'change my itinerary', 'different hotel', 'change transport'],
    keywords: ['change', 'edit', 'swap', 'alternative', 'options', 'different', 'customise', 'customize'],
    answer:
      'Open your trip and scroll to "Not quite right? Change it". You can change how you travel there and back, how you get around once there, where you stay, and any activity in the day-by-day plan. Every change re-prices the trip immediately — and because the amounts move, it will ask you to approve the bookings again.',
    followUps: ['How do approvals work?', 'Can I change the destination?'],
  },
  {
    id: 'change-destination',
    strong: ['change the destination', 'different destination', 'somewhere else'],
    keywords: ['destination', 'alternate', 'alternative', 'elsewhere', 'city'],
    answer:
      'On your trip page, under the Discovery Agent’s reasoning, open "It also considered these". Picking an alternate re-runs Discovery, Budget, Itinerary and Booking for the new place — your mood profile and its non-negotiables carry across unchanged.',
    followUps: ['How do I change my hotel?'],
  },
  {
    id: 'sequence',
    strong: ['how do approvals work', 'what is the order', 'approve', 'approval'],
    keywords: ['approve', 'approval', 'confirm', 'save', 'order', 'sequence', 'steps'],
    answer:
      'The order is: adjust your plan, approve each booking, confirm the trip, and save it. Approving is consent to a specific amount, so if you change something afterwards the approvals reset and are asked for again. Confirming is what switches on your reminders, which is why it comes after approval.',
    followUps: ['What happens when I confirm?', 'How do I save a trip?'],
  },
  {
    id: 'confirm-reminders',
    strong: ['what happens when i confirm', 'how do reminders work', 'notifications'],
    keywords: ['confirm', 'reminder', 'reminders', 'notification', 'notify', 'alert', 'sms'],
    answer:
      'Confirming locks the plan and turns on the reminder schedule the Notification Agent wrote — departure, check-in, each activity and the way home. Reminders due while TripME is open appear as real browser notifications. Delivery when the app is closed, and the SMS and voice channels, need push and telephony infrastructure that this project does not have, so those are shown but marked post-MVP.',
    followUps: ['How do I save a trip?', 'Do I need an account?'],
  },
  {
    id: 'save-trips',
    strong: ['how do i save', 'where are my trips', 'saved trips', 'my trips', 'past trips'],
    keywords: ['save', 'saved', 'trips', 'history', 'my trips', 'find'],
    answer:
      'Press Save trip on any plan, and it appears under My Trips. Saved trips also build your Travel DNA, so your next plan starts from what you have liked before.',
    link: { href: '/trips', label: 'Open My Trips' },
    followUps: ['Do I need an account?', 'Where is my data stored?'],
  },
  {
    id: 'account',
    strong: ['do i need an account', 'why sign in', 'do i have to log in', 'login', 'sign in'],
    keywords: ['account', 'sign', 'login', 'log in', 'register', 'google', 'demo account'],
    answer:
      'Not to plan — planning is open to everyone. An account is only needed to confirm or save a trip, because those belong to a person. You can sign in with Google, or use the one-tap test account if Google turns you away.',
    link: { href: '/signin', label: 'Go to sign in' },
    followUps: ['Where is my data stored?', 'How do I save a trip?'],
  },
  {
    id: 'privacy',
    strong: ['where is my data', 'is my data safe', 'privacy', 'do you store my data'],
    keywords: ['data', 'privacy', 'store', 'stored', 'secure', 'gdpr', 'dpdp', 'delete'],
    answer:
      'Your trips are stored in this browser and never uploaded — which also means they do not follow you to another device. If you sign in, we hold only what Google returns: a name, an email and a picture. Never a password, because we never see one. Clearing your browser data deletes every trip permanently; we hold no copy.',
    link: { href: '/contact#privacy', label: 'Read the full privacy note' },
    followUps: ['Do I need an account?'],
  },
  {
    id: 'scope-india',
    strong: ['can i go abroad', 'international trip', 'outside india', 'foreign', 'other countries'],
    keywords: ['india', 'abroad', 'international', 'overseas', 'country', 'foreign', 'visa'],
    answer:
      'TripME plans trips within India only. Prices are in rupees, the phrase card teaches Indian languages, and the agents’ local knowledge is Indian. If you ask for somewhere outside India we will say so and suggest the closest Indian equivalent rather than quietly planning something else.',
    followUps: ['What destinations can I choose?'],
  },
  {
    id: 'languages',
    strong: ['change language', 'other languages', 'hindi', 'translate'],
    keywords: ['language', 'languages', 'hindi', 'tamil', 'translate', 'translation', 'english'],
    answer:
      'Seven languages: English, Hindi, Marathi, Bengali, Tamil, Telugu and Kannada. Use the globe in the navigation bar. It translates the whole product, including the trip the agents wrote — a fresh plan takes a moment to come through after the agents finish.',
    followUps: ['What is TripME?'],
  },
  {
    id: 'modes',
    strong: ['entry paths', 'six modes', 'family trip', 'group trip', 'corporate trip', 'pilgrimage'],
    keywords: ['solo', 'couple', 'group', 'family', 'pilgrimage', 'corporate', 'mode', 'path', 'who'],
    answer:
      'Six paths, and each genuinely changes what the agents do. Solo uses the mood quiz. Couple and Group give every traveller their own Advocate that argues for them. Family paces the trip by the most constrained member and audits it by name. Pilgrimage sequences a circuit traditionally and plans darshan timing. Corporate drops the mood quiz entirely and enforces your travel policy in code.',
    link: { href: '/how-it-works', label: 'Compare the six paths' },
    followUps: ['What are the seven agents?', 'How do I plan a trip?'],
  },
  {
    id: 'speed',
    strong: ['how long does it take', 'how fast', 'planning time'],
    keywords: ['long', 'time', 'fast', 'slow', 'speed', 'minutes', 'seconds', 'wait'],
    answer:
      'Usually 20 to 60 seconds, depending on how many agents your path runs — a group trip runs one extra agent per traveller. The clock on the run page counts agent time only, not the pauses that make each handoff readable.',
    followUps: ['Why did my plan stop halfway?'],
  },
  {
    id: 'rate-limit',
    strong: ['plan stopped', 'rate limit', 'why did it fail', 'error', 'quota'],
    keywords: ['stop', 'stopped', 'fail', 'failed', 'error', 'limit', 'quota', 'retry', 'busy'],
    answer:
      'TripME runs on a free AI tier, so a few plans a minute is the ceiling. If a step stops, press Retry — it resumes from exactly where it stopped and keeps everything already planned. Each agent also falls back across three different models, so one being busy no longer ends a plan. If it is really not co-operating, open a sample trip: those need no quota at all.',
    link: { href: '/contact#support', label: 'More troubleshooting' },
    followUps: ['What is a sample trip?'],
  },
  {
    id: 'samples',
    strong: ['sample trip', 'example trip', 'demo trip', 'show me an example'],
    keywords: ['sample', 'example', 'demo', 'try'],
    answer:
      'Four finished plans you can open instantly, no waiting and no quota: a solo Gokarna trip, a group trip to Manali with three Advocates arguing, a three-generation family trip to Agra with the pacing audit, and a corporate trip to Hyderabad with policy enforcement and an expense report. They are on the Plan page under "See a finished plan first".',
    link: { href: '/', label: 'Open a sample' },
    followUps: ['How do I plan a trip?'],
  },
  {
    id: 'budget-how',
    strong: ['how is the budget split', 'budget allocation', 'how does the budget work'],
    keywords: ['budget', 'allocation', 'split', 'money', 'spend', 'transport', 'buffer'],
    answer:
      'The Budget Agent divides your total across transport, stay, food, activities and a buffer before anything is booked. The arithmetic is then enforced in code rather than trusted to the model — the split always sums exactly to your total, and policy caps on corporate trips are clamped, not suggested.',
    followUps: ['What does the Referee do?', 'Are the prices real?'],
  },
  {
    id: 'split-expenses',
    strong: ['split the bill', 'who owes what', 'settle up', 'expense split'],
    keywords: ['split', 'owe', 'settle', 'share', 'expense', 'per person'],
    answer:
      'On a couple or group trip, the trip page shows a settle-up table: each traveller’s share, what they have paid, and who owes whom. It updates as you approve bookings.',
    followUps: ['How do approvals work?'],
  },
  {
    id: 'contact',
    strong: ['contact', 'talk to someone', 'support', 'help', 'report a bug', 'feedback'],
    keywords: ['contact', 'support', 'help', 'bug', 'feedback', 'email', 'team'],
    answer:
      'The Contact page has email, a form, and a support section with the common problems. Team DEBUGGERS built this as a BITSoM capstone project, and reports genuinely help — if something in an itinerary looks wrong, tell us what you entered.',
    link: { href: '/contact', label: 'Contact us' },
  },
];

export interface KnowledgeMatch {
  entry: KnowledgeEntry;
  score: number;
}

/**
 * Best knowledge entry for a question, or null when nothing fits well enough.
 *
 * Scoring is deliberately simple and transparent: a strong phrase wins
 * outright, otherwise it counts keyword hits. A clever matcher that
 * occasionally answers the wrong question is worse here than an honest "I don't
 * know that one" — being confidently wrong about your own product is the one
 * failure a help assistant cannot afford.
 */
export function matchKnowledge(question: string): KnowledgeEntry | null {
  const q = ` ${question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ')} `;
  let best: KnowledgeMatch | null = null;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const phrase of entry.strong ?? []) {
      if (q.includes(phrase)) score += 10;
    }
    for (const word of entry.keywords) {
      if (q.includes(` ${word} `)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }

  // Two keyword hits, or one strong phrase. Below that we would be guessing.
  return best && best.score >= 2 ? best.entry : null;
}
