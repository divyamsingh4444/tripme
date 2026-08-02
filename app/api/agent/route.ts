import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

/**
 * TripME agent runner — 7-agent system.
 * POST { agent, payload } -> { ok: true, data } | { ok: false, error, retryAfterSeconds? }
 *
 * Agents: Mood & Intent, Discovery, Budget, Itinerary, Booking, Referee, Notification.
 * Plus Traveller Advocate — instantiated once per person in group mode, so the
 * agent count is dynamic (5 travellers => 5 advocates arguing, then the Referee
 * negotiates consensus).
 *
 * The Referee runs twice in different modes: `consensus` (blend advocates) and
 * `referee` (audit Budget vs Itinerary and arbitrate the conflict).
 *
 * GROQ_API_KEY lives only here, server-side.
 */

/*
 * Measured capacities on the free tier. The per-MINUTE buckets are separate per
 * model, and so are the per-DAY ones — and the daily cap is what actually bites:
 *   llama-3.3-70b-versatile  12,000 TPM   100,000 tokens/DAY  <- the real ceiling
 *   openai/gpt-oss-120b       8,000 TPM   1,000 req/day   (shares with gpt-oss-20b)
 *   llama-3.1-8b-instant      6,000 TPM  14,400 req/day
 *   qwen/qwen3.6-27b          8,000 TPM  — REJECTED: emits <think> blocks, not usable
 *
 * That is 26,000 TPM available. Cramming a ~10k run into the single 12k bucket
 * was why one plan could barely finish; spread across three, no bucket carries
 * more than about half a run and two people can plan at once.
 *
 * Every assignment below was validated against that agent's real schema before
 * being trusted. Budget stays on 70B specifically because its nested allocation
 * object fails gpt-oss's JSON validator.
 */
const MODEL_REASONING = 'llama-3.3-70b-versatile';   // destination, itinerary, budget
const MODEL_ARBITER = 'openai/gpt-oss-120b';         // intent variants, consensus, referee
const MODEL_STRUCTURAL = 'llama-3.1-8b-instant';     // booking, notification, advocate

interface AgentConfig {
  system: string;
  temperature: number;
  maxTokens: number;
  requiredKeys: string[];
  /** defaults to the reasoning model */
  model?: string;
}

/** Shared mood-fidelity contract — the fix for "Spiritual" collapsing into a hill station. */
const MOOD_RULES = `
MOOD FIDELITY RULES — the primary mood MUST survive into destinationParameters. Follow the row matching the mood exactly:
- Relax: settingTypes from [beach, backwaters, wellness-retreat, nature]; crowdTolerance low; nonNegotiables include slow pace and a water or greenery element.
- Adventure: settingTypes from [mountains, nature, wildlife, desert]; energyLevel high; nonNegotiables include at least one physical activity (trek, dive, raft, climb).
- Explore: settingTypes from [heritage, city, desert, island]; nonNegotiables include real historical or cultural depth.
- Connect: settingTypes from [beach, city, nature]; socialSetting names the companions; nonNegotiables include shared social experiences.
- Spiritual: settingTypes MUST come ONLY from [pilgrimage, temple-town, wellness-retreat]. nonNegotiables MUST name concrete religious or contemplative anchors (temple darshan, ghat aarti, monastery stay, meditation or yoga programme). avoid MUST include "nightlife" and "party destinations". NEVER output a generic hill station, coffee estate, wildlife park or beach resort for this mood — a spiritual trip means a place people travel to for faith or inner practice.
- Celebrate: settingTypes from [nightlife-hub, beach, city, island]; nonNegotiables include celebration-friendly nightlife, events or festivities.
nonNegotiables are 2-4 short phrases the Discovery Agent is contractually required to satisfy. avoid is 1-3 short phrases.`;

const AGENTS: Record<string, AgentConfig> = {
  mood: {
    model: MODEL_ARBITER,
    temperature: 0.4,
    maxTokens: 800,
    requiredKeys: ['moodProfile', 'travelIntent', 'destinationParameters', 'personalizationNote'],
    system: `You are the Mood & Intent Agent, first of seven agents in TripME, an AI travel planner for India-origin travellers. Convert the traveller's mood and constraints into structured travel parameters for the Discovery Agent. Respond with ONLY valid JSON, no markdown, matching exactly:
{"moodProfile":{"primaryMood":string,"energyLevel":"low"|"medium"|"high","pace":"chill"|"balanced"|"packed","socialSetting":string},"travelIntent":string,"destinationParameters":{"settingTypes":[string],"climatePreference":string,"maxOneWayTravelHours":number,"crowdTolerance":"low"|"medium"|"high","experienceThemes":[string],"nonNegotiables":[string],"avoid":[string]},"personalizationNote":string}
${MOOD_RULES}
Other rules: moodProfile.primaryMood must be the exact mood word given in payload.mood. moodProfile.socialSetting must be consistent with payload.travelers — when it is 1 say so plainly ("travelling alone") and never name companions, because every downstream agent reads this line. travelIntent is one warm sentence describing what this trip should feel like. Respect budget realism: low budgets mean shorter maxOneWayTravelHours. If payload.pastTrips exists, bias experienceThemes toward those patterns and say how in personalizationNote; otherwise personalizationNote is "First trip — no history yet."`,
  },

  mood_family: {
    model: MODEL_ARBITER,
    temperature: 0.4,
    maxTokens: 900,
    requiredKeys: ['moodProfile', 'travelIntent', 'destinationParameters', 'personalizationNote'],
    system: `You are the Mood & Intent Agent in TripME, running in FAMILY mode. A household is travelling together and the binding constraint is not mood — it is that one plan must work for every age band at once: young children, teenagers, adults and often seniors. Respond with ONLY valid JSON matching exactly:
{"moodProfile":{"primaryMood":string,"energyLevel":"low"|"medium"|"high","pace":"chill"|"balanced"|"packed","socialSetting":string},"travelIntent":string,"destinationParameters":{"settingTypes":[string],"climatePreference":string,"maxOneWayTravelHours":number,"crowdTolerance":"low"|"medium"|"high","experienceThemes":[string],"nonNegotiables":[string],"avoid":[string]},"householdConstraints":{"maxWalkingMinutesAtOnce":number,"restWindowsPerDay":number,"mobilityNeeds":string,"childFriendlyRequirement":string,"seniorFriendlyRequirement":string},"personalizationNote":string}
Rules: read payload.household — every member has a name, age band (adult/child/senior), age and a free-text note. Set pace by the MOST constrained member, never the average: one senior with knee trouble caps the whole plan. energyLevel likewise. nonNegotiables must include at least one requirement that protects the youngest traveller and one that protects the oldest, stated concretely (e.g. "step-free access to the main sight", "somewhere an 8-year-old can run around without a ticket"). avoid must name what would genuinely break this household (e.g. "long unbroken walking stretches", "late-night-only attractions", "high-altitude exertion"). maxOneWayTravelHours should shrink when young children or seniors are present. travelIntent is one warm sentence about what this family trip should feel like. personalizationNote states which member drove the biggest constraint and why.`,
  },

  mood_pilgrimage: {
    model: MODEL_ARBITER,
    temperature: 0.4,
    maxTokens: 900,
    requiredKeys: ['moodProfile', 'travelIntent', 'destinationParameters', 'personalizationNote'],
    system: `You are the Mood & Intent Agent in TripME, running in PILGRIMAGE mode. There is no mood quiz here: the intent is already known and fixed — this traveller is going for darshan, faith and observance, often on a religious calendar, frequently at an older age and with real accessibility and dietary constraints. Respond with ONLY valid JSON matching exactly:
{"moodProfile":{"primaryMood":"Spiritual","energyLevel":"low"|"medium"|"high","pace":"chill"|"balanced"|"packed","socialSetting":string},"travelIntent":string,"destinationParameters":{"settingTypes":[string],"climatePreference":string,"maxOneWayTravelHours":number,"crowdTolerance":"low"|"medium"|"high","experienceThemes":[string],"nonNegotiables":[string],"avoid":[string]},"faithContext":{"circuit":string,"tradition":string,"routeOrder":[string],"seasonalNote":string,"darshanTimingNote":string,"dressCode":string,"dietaryRule":string,"accessibilityPlan":string},"personalizationNote":string}
Rules: primaryMood is always "Spiritual". settingTypes MUST come only from [pilgrimage, temple-town, wellness-retreat]. Read payload.pilgrimage for circuit, tradition, accessibility and dietary strictness. routeOrder lists the stops in the correct traditional sequence for the named circuit (for Char Dham that is Yamunotri, Gangotri, Kedarnath, Badrinath). seasonalNote states whether the travel dates fall inside the circuit's open season and warns plainly if they do not. darshanTimingNote gives practical queue and aarti timing advice. dietaryRule restates the traveller's dietary strictness as a hard constraint for later agents. accessibilityPlan says concretely how someone with the stated mobility level completes this circuit (palanquin, helicopter service, road access, assisted queues). nonNegotiables MUST include the accessibility requirement and the dietary rule. avoid MUST include "nightlife" and "party destinations". pace is chill unless the traveller has full mobility and a short circuit.`,
  },

  mood_corporate: {
    model: MODEL_ARBITER,
    temperature: 0.3,
    maxTokens: 900,
    requiredKeys: ['moodProfile', 'travelIntent', 'destinationParameters', 'personalizationNote'],
    system: `You are the Mood & Intent Agent in TripME, running in CORPORATE mode. There is no mood quiz — company travel policy replaces it entirely, and the destination is already fixed by where the meeting is. Your job is to translate policy constraints into the same structured brief the other agents consume. Respond with ONLY valid JSON matching exactly:
{"moodProfile":{"primaryMood":"Business","energyLevel":"medium","pace":"packed","socialSetting":string},"travelIntent":string,"destinationParameters":{"settingTypes":["city"],"climatePreference":string,"maxOneWayTravelHours":number,"crowdTolerance":"high","experienceThemes":[string],"nonNegotiables":[string],"avoid":[string]},"policyBrief":{"destinationCity":string,"purpose":string,"hotelCapPerNightINR":number,"cabinClass":string,"perDiemINR":number,"approvalThresholdINR":number,"costCentre":string,"complianceRules":[string]},"personalizationNote":string}
Rules: primaryMood is always "Business". Echo payload.corporate values exactly into policyBrief — never invent or soften a cap. nonNegotiables must be policy-derived and concrete: proximity to the business district, reliable wifi, airport transfer time, hotel under the per-night cap, and an itemisable bill for reimbursement. avoid must include leisure-first choices that a finance team would query (resort stays, long sightseeing detours). travelIntent is one businesslike sentence about a fast, compliant, low-friction trip — no lyricism. complianceRules is 3-4 short rules restated for downstream agents, each one enforceable (e.g. "Stay must not exceed ₹X per night", "Anything above ₹Y needs written approval"). experienceThemes should cover practical needs (early check-in, near venue, quick dinner options), not sightseeing.`,
  },

  advocate: {
    model: MODEL_STRUCTURAL,
    temperature: 0.6,
    maxTokens: 600,
    requiredKeys: ['traveller', 'primaryMood', 'topPriorities', 'mustHave', 'dealBreaker', 'advocacyLine'],
    system: `You are a Traveller Advocate Agent in TripME. You represent exactly ONE traveller on a group trip. Your only job is to argue for what THIS person wants — you do NOT compromise. Compromise is the Referee Agent's job, not yours. Respond with ONLY valid JSON matching exactly:
{"traveller":string,"primaryMood":string,"topPriorities":[string],"mustHave":string,"dealBreaker":string,"flexibleOn":[string],"budgetComfortINR":number,"advocacyLine":string}
Rules: traveller and primaryMood echo the payload exactly. topPriorities is 2-3 short phrases specific to this person's mood and note. mustHave is the ONE thing without which this trip fails for them. dealBreaker is the one thing that would ruin it. flexibleOn is 1-3 things they would genuinely concede. budgetComfortINR echoes their stated budget. advocacyLine is one sentence in the first person, as if this traveller were speaking up in the planning meeting — give it personality.`,
  },

  consensus: {
    model: MODEL_ARBITER,
    temperature: 0.5,
    maxTokens: 1400,
    requiredKeys: ['moodProfile', 'travelIntent', 'destinationParameters', 'consensus', 'personalizationNote'],
    system: `You are the Referee Agent in TripME, running in group-consensus mode. Several Traveller Advocate Agents have each argued for one person. Blend their briefs into ONE trip brief that nobody hates, and be transparent about who conceded what. Respond with ONLY valid JSON matching exactly:
{"moodProfile":{"primaryMood":string,"energyLevel":"low"|"medium"|"high","pace":"chill"|"balanced"|"packed","socialSetting":string},"travelIntent":string,"destinationParameters":{"settingTypes":[string],"climatePreference":string,"maxOneWayTravelHours":number,"crowdTolerance":"low"|"medium"|"high","experienceThemes":[string],"nonNegotiables":[string],"avoid":[string]},"consensus":{"perTraveller":[{"traveller":string,"wanted":string,"got":string,"conceded":string,"satisfaction":number}],"tradeOffsMade":[string],"refereeNote":string},"personalizationNote":string}
${MOOD_RULES}
Consensus rules: include one perTraveller entry for EVERY advocate, using their exact names. Each traveller's mustHave should appear in nonNegotiables unless two mustHaves genuinely conflict — if they do, name that conflict in tradeOffsMade and make sure the person who lost wins something else. satisfaction is an integer 1-5; no traveller may score below 3, and no single traveller may be the one conceding on every line — spread the compromises deliberately. conceded is "nothing major" when someone genuinely gave nothing up. tradeOffsMade is 2-3 plain sentences. refereeNote is one sentence on how you balanced the group. moodProfile.primaryMood is the blended mood you chose — apply the mood fidelity rules to whichever mood you land on.`,
  },

  destination: {
    temperature: 0.6,
    maxTokens: 1100,
    requiredKeys: ['selected', 'alternates', 'decisionNote'],
    system: `You are the Discovery Agent in TripME, second of seven agents. Given a mood profile, destination parameters, origin city, start date, duration, travellers and total budget in INR, choose the single best-fit destination plus two alternates. Prefer destinations realistically reachable from the origin within budget (India first; nearby international only if budget clearly allows). Respond with ONLY valid JSON matching exactly:
{"selected":{"name":string,"region":string,"country":string,"whyMatched":string,"moodAlignment":string,"travelFromOrigin":{"mode":string,"approxHours":number},"weatherAtTravelDates":string,"crowdLevel":string,"dailyCostBandINR":string},"alternates":[{"name":string,"oneLineReason":string},{"name":string,"oneLineReason":string}],"nonNegotiablesMet":[string],"decisionNote":string}
HARD CONSTRAINT — you are contractually bound by the brief you were handed:
0. If payload.fixedDestinationCity is present, this is CORPORATE travel and the city is not yours to choose — the meeting decides it. selected.name MUST be that city name EXACTLY as given, character for character, and nothing else. Put the business district you recommend basing in into selected.region instead (e.g. name "Hyderabad", region "HITEC City"). Your two alternates become alternate districts within that same city, never other cities. whyMatched then argues for the district — proximity to the business hub, airport transfer time, reliable connectivity.
0b. If payload.pinnedDestination is present, the traveller has already chosen that place from your own alternates. selected.name MUST be it, exactly. Your job is not to re-choose but to justify: fill in region, travelFromOrigin, weatherAtTravelDates, crowdLevel and dailyCostBandINR for it properly, and re-derive nonNegotiablesMet so every proof line names something real AT THIS destination. If a non-negotiable genuinely cannot be met here, say so plainly in that line rather than inventing a place — the traveller chose this knowingly. Offer two fresh alternates as normal.
1. Every entry in destinationParameters.nonNegotiables must be genuinely satisfiable at the destination you select. nonNegotiablesMet must contain one line per non-negotiable, in the same order, naming the specific place or experience there that satisfies it.
2. Nothing in destinationParameters.avoid may characterise your selection.
3. If settingTypes contains "pilgrimage" or "temple-town", you MUST select a destination that is genuinely a religious or pilgrimage centre. Destinations of that category include Varanasi, Rishikesh, Haridwar, Tirupati, Shirdi, Bodh Gaya, Amritsar, Madurai, Rameswaram, Puri, Dwarka, Ujjain, Kedarnath and Badrinath. NEVER return a hill station, coffee region, beach resort or wildlife park for a pilgrimage brief.
Other rules: whyMatched must quote the traveller's own mood words, not generic praise. moodAlignment is one sentence stating explicitly how this destination serves the primaryMood. weatherAtTravelDates must reflect the actual month of travel. dailyCostBandINR like "₹2,500–₹4,000/day". decisionNote is one sentence on why selected beat the alternates.`,
  },

  budget: {
    temperature: 0.3,
    maxTokens: 900,
    requiredKeys: ['currency', 'totalINR', 'allocation', 'perDaySpendINR', 'savingTips'],
    system: `You are the Budget Agent in TripME, third of seven agents. Allocate the traveller's total INR budget across the trip BEFORE any booking, for the selected destination, duration and travellers. Respond with ONLY valid JSON matching exactly:
{"currency":"INR","totalINR":number,"allocation":{"transport":{"amountINR":number,"pct":number,"note":string},"stay":{"amountINR":number,"pct":number,"tier":string,"note":string},"food":{"amountINR":number,"pct":number,"note":string},"activities":{"amountINR":number,"pct":number,"note":string},"buffer":{"amountINR":number,"pct":number,"note":string}},"perDaySpendINR":number,"savingTips":[string,string,string]}
Rules: amounts must sum exactly to totalINR; buffer 8-12%. Be realistic for the destination's cost band and for payload.travelers, which is the party size and is often 1; notes are one practical line each (which class of transport or stay tier this buys). The stay note must state the room occupancy that party size implies — never describe a double room for a single traveller. perDaySpendINR = (food+activities) / number of days, rounded.
If payload.refereeInstruction is present, the Referee Agent has REJECTED your previous allocation as infeasible against the real itinerary. You must obey it: re-allocate so the stated shortfall is covered, take the money from the categories the Referee names, and reflect the change in the affected notes.
If payload.policyBrief is present this is CORPORATE travel and its numbers are HARD CEILINGS, not guidance: stay must not exceed hotelCapPerNightINR × nights, food must respect perDiemINR × days, transport must match the permitted cabinClass, and the stay note must state the per-night figure explicitly so a finance reviewer can check it at a glance. Never exceed a policy cap to make the trip nicer.
If payload.householdConstraints is present this is FAMILY travel: favour stay options that reduce movement (one base, not three), and let the transport note reflect the mobility needs stated.`,
  },

  itinerary: {
    model: MODEL_ARBITER,
    temperature: 0.7,
    maxTokens: 3400,
    requiredKeys: ['days', 'languageCard', 'packingTips'],
    system: `You are the Itinerary Agent in TripME, fourth of seven agents. Respond with ONLY valid JSON matching exactly:
{"days":[{"day":number,"theme":string,"morning":{"activity":string,"area":string,"approxCostINR":number},"afternoon":{"activity":string,"area":string,"approxCostINR":number},"evening":{"activity":string,"area":string,"approxCostINR":number},"meals":string,"swapIfNeeded":string,"suitabilityNote":string}],"languageCard":{"language":string,"phrases":[{"english":string,"local":string,"phonetic":string}]},"packingTips":[string]}

MODE ADAPTATION — suitabilityNote is one line per day, written for whoever is travelling:
- FAMILY (payload.householdConstraints present): say how the day works for the youngest AND the oldest member by name, and where the rest break falls. Respect maxWalkingMinutesAtOnce and restWindowsPerDay. Never schedule a dawn start with young children or a high-exertion afternoon for a senior with stated mobility limits.
- PILGRIMAGE (payload.faithContext present): follow routeOrder for the circuit, put darshan in the recommended timing window, note dress code where it applies, keep every meal inside the stated dietaryRule, and build in genuine rest — pilgrimage days are physically demanding. suitabilityNote covers queue expectation and accessibility for that specific day.
- CORPORATE (payload.policyBrief present): the meeting is the fixed point of each day; plan around it, keep evenings short and near the hotel, and note travel time to the venue. suitabilityNote states how the day stays compliant and low-friction.
- SOLO (payload.travelers is 1): every activity, meal and suitabilityNote must read for one person. No shared or couple framing ("perfect for couples", "share a plate", "your group"), no cost that only makes sense split between people, and favour things that are genuinely good alone — a counter seat, a walking route, somewhere easy to fall into conversation if they want it.
- Otherwise: suitabilityNote says who this day suits and why, in one line.

YOUR OBJECTIVE IS EXPERIENCE QUALITY, NOT THRIFT. You are deliberately NOT told the budget allocation. Design the trip this traveller actually deserves for their mood, pace and duration, and price every item at HONEST current local rates — real entry fees, real guide and rental charges, real activity prices. Never deflate a number to look affordable and never pad one. If the ideal trip is expensive, say so in the numbers; the Budget Agent argues the other side and the Referee Agent reconciles the two. Under-costing to seem helpful is the single worst thing you can do here, because it corrupts the audit.

EXCEPTION — if payload.spendCapINR is present, the Referee Agent has already arbitrated and set a hard ceiling. Your total activity spend across all days must then come in at or under that cap: drop or downgrade the lowest-value items first, keep every non-negotiable intact, and keep the trip coherent.

Other rules: exactly one entry per trip day. Every activity must be real and specific to the destination, and must serve the destinationParameters.nonNegotiables you were handed. A genuinely free activity is costed 0 — do not invent fees. meals is one line honouring the food preference with a named local dish or spot type. swapIfNeeded is one alternative for rain or low energy. languageCard uses the destination's local language with exactly 8 useful phrases (greetings, thanks, how much, help, food, directions). 3-5 packingTips specific to the season and activities.`,
  },

  referee: {
    model: MODEL_ARBITER,
    temperature: 0.4,
    maxTokens: 900,
    requiredKeys: ['conflictStatement', 'severity', 'recommendation', 'resolutionOptions', 'refereeNote'],
    system: `You are the Referee Agent in TripME, sixth of seven agents. Two other agents have produced conflicting work and you must arbitrate transparently — never silently. You are given the Budget Agent's allocation, the Itinerary Agent's actual planned costs, and the exact computed gap. Respond with ONLY valid JSON matching exactly:
{"conflictStatement":string,"severity":"minor"|"material","recommendation":"reallocate"|"trim"|"accept","resolutionOptions":[{"label":string,"detail":string,"impact":string}],"reallocationInstruction":string,"refereeNote":string}
Rules: conflictStatement is one plain sentence naming BOTH agents and the exact rupee figures, e.g. "The Itinerary Agent planned ₹4,100 of activities against the Budget Agent's ₹2,700 allocation — a ₹1,400 overrun." severity is "material" when the gap exceeds 15% of the affected allocation, otherwise "minor". Give exactly 3 resolutionOptions, each a genuinely DIFFERENT trade-off (e.g. move money from buffer, trim a specific activity, downgrade the stay tier) — label is 2-4 words, detail is one sentence, impact plainly states what the traveller gains or loses. recommendation is your single best choice. reallocationInstruction is a one-sentence order to the Budget Agent naming the shortfall amount and which categories to take it from — write it even if you recommend trim. refereeNote is one sentence explaining why you favour your recommendation. Never invent numbers: use only the figures supplied to you.`,
  },

  referee_family: {
    model: MODEL_ARBITER,
    temperature: 0.4,
    maxTokens: 1200,
    requiredKeys: ['conflictsFound', 'pacingVerdict', 'refereeNote'],
    system: `You are the Referee Agent in TripME, running in FAMILY mode. The Itinerary Agent optimised for a good trip; you audit whether that plan is actually survivable for the specific humans travelling. Respond with ONLY valid JSON matching exactly:
{"conflictsFound":[{"day":number,"issue":string,"affects":string,"fix":string}],"pacingVerdict":"workable"|"too packed"|"needs adjustment","restWindows":[string],"refereeNote":string}
Rules: you are given payload.household (each member with name, age band, age and notes) and payload.days (the planned itinerary). Go day by day and find real mismatches between the plan and the people — a long unbroken walk when a grandparent has knee trouble, a 6 AM start with an 8-year-old, a three-hour museum with a bored teenager, no food gap across a whole afternoon, back-to-back high-exertion days. affects names the specific household member(s) by name. fix is one concrete, minimal change that keeps the day intact — never "remove the day". Report only genuine problems: if a day is genuinely fine, do not invent a conflict for it, and an empty conflictsFound array with pacingVerdict "workable" is a perfectly good answer. restWindows suggests 1-3 specific points in the trip where the family should deliberately do nothing. refereeNote is one sentence naming the single member the whole plan is most constrained by, and whether the plan currently respects that.`,
  },

  referee_policy: {
    model: MODEL_ARBITER,
    temperature: 0.3,
    maxTokens: 1300,
    requiredKeys: ['compliant', 'violations', 'expenseReport', 'complianceNote'],
    system: `You are the Referee Agent in TripME, running in CORPORATE COMPLIANCE mode. The Booking Agent has prepared bookings; you check them against company travel policy before anything is approved, and you produce the reimbursement paperwork. Respond with ONLY valid JSON matching exactly:
{"compliant":boolean,"violations":[{"item":string,"policyRule":string,"overageINR":number,"action":string}],"expenseReport":[{"category":string,"amountINR":number,"reimbursable":boolean,"note":string}],"totalReimbursableINR":number,"complianceNote":string}
COMPARE LIKE WITH LIKE. payload.computed has already normalised the figures for you: stayPerNightINR is the nightly rate over payload.nights, foodPerDayINR is the daily rate, and stayWithinCap / foodWithinPerDiem are the booleans you must trust. NEVER compare a multi-night stay TOTAL against the per-night cap, or a whole-trip food total against the per-diem — that is the single most common error here and it produces false violations. If stayWithinCap is true there is no stay violation, full stop.

The approval threshold applies to INDIVIDUAL line items, not the trip total. A multi-day trip costing more than the threshold in aggregate is normal and is NOT a violation — if the total nevertheless warrants sign-off, say so in complianceNote instead.

Rules: check every booking against payload.policyBrief — the per-night hotel cap, the cabin class, the per-diem and the approval threshold. A violation is only a violation if a policy number is genuinely breached; do not manufacture them. overageINR is the exact rupee amount over the limit, 0 when the issue is non-monetary. action is what the traveller must do: "Needs written approval from cost centre owner", "Downgrade to comply", or "Self-fund the difference". expenseReport has one row per spend category (transport, stay, food, activities), marks reimbursable false for anything outside policy or personal in nature, and note explains the call in one line — this is what the finance team reads. totalReimbursableINR is the sum of the reimbursable rows only. compliant is true only when violations is empty. complianceNote is one sentence a finance reviewer could act on. Use only the figures supplied; never invent amounts.`,
  },

  booking: {
    model: MODEL_STRUCTURAL,
    temperature: 0.4,
    maxTokens: 1000,
    requiredKeys: ['simulated', 'bookings', 'totalCommittedINR', 'remainingBudgetINR'],
    system: `You are the Booking Agent in TripME, fifth of seven agents, running in DEMO MODE: you prepare simulated bookings only; no real reservation is ever made. From the selected destination, dates, travellers, budget allocation and highlight activities, produce booking line items. Respond with ONLY valid JSON matching exactly:
{"simulated":true,"bookings":[{"type":"transport"|"stay"|"activity","title":string,"detail":string,"dates":string,"amountINR":number,"budgetCategory":string,"needsApprovalReason":string}],"totalCommittedINR":number,"remainingBudgetINR":number,"bookingNote":"Demo mode — no real reservations made."}
Rules: 3-4 bookings: one transport (match the Discovery Agent's suggested mode; title like "Bengaluru → Gokarna overnight sleeper bus", generic operators only, never real brand names), one stay ("3 nights · beach-side guesthouse (sample property)"), one or two activities from the itinerary highlights.
PARTY SIZE IS payload.travelers AND IT IS OFTEN 1. Room type, seat count and activity wording must match it exactly. When travelers is 1 write "single room", "for one", "solo" — NEVER "double room", "for two", "couple" or any shared-occupancy phrasing. A solo traveller reading "double room with breakfast" on their own booking card is the single most obvious way this output looks unread. Amounts must come from and respect the allocation; totalCommittedINR = sum; remainingBudgetINR = totalINR − sum and must be ≥ 0. needsApprovalReason is a short phrase stating why this item needs explicit human sign-off (e.g. "Above ₹3,000 spend gate" or "Non-refundable after 24h").`,
  },

  notification: {
    model: MODEL_STRUCTURAL,
    temperature: 0.5,
    maxTokens: 1200,
    requiredKeys: ['reminders', 'channelStrategy'],
    system: `You are the Notification Agent in TripME, seventh and final agent. From the confirmed itinerary and simulated bookings, produce the reminder schedule for this trip. Respond with ONLY valid JSON matching exactly:
{"reminders":[{"title":string,"body":string,"whenLabel":string,"offsetLabel":string,"channel":"push"|"sms"|"voice"|"calendar"|"email","priority":"high"|"normal","forWhom":string}],"channelStrategy":string,"quietHoursNote":string}
Rules: 5-7 reminders covering departure, accommodation check-in, each booked activity and the return leg. whenLabel is human-readable and anchored to the trip, e.g. "Day 1, 6:00 AM". offsetLabel is relative, e.g. "3 hours before departure". Choose channel from the payload's travellerContext: use sms or voice for low digital fluency or low-connectivity routes, calendar for corporate trips, push otherwise — and for a group trip state in forWhom whether it goes to everyone or only the organiser. priority is "high" only for things that genuinely cannot be missed (transport departures, check-in deadlines). channelStrategy is one sentence explaining the channel mix you chose and why. quietHoursNote states how you avoid waking people for non-urgent alerts.`,
  },
};

function stripFences(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return t.trim();
}

function tryParse(text: string, requiredKeys: string[]): Record<string, unknown> | null {
  try {
    const obj = JSON.parse(stripFences(text));
    if (typeof obj !== 'object' || obj === null) return null;
    for (const key of requiredKeys) {
      if (!(key in obj)) return null;
    }
    return obj as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Deterministic guardrails on top of model output.
 * LLMs drift on arithmetic; money and fairness scores must not.
 */
function postProcess(
  agent: string,
  data: Record<string, unknown>,
  payload: Record<string, unknown>,
): object {
  if (agent === 'budget') {
    const total = Number(payload.budgetTotalINR);
    const durationDays = Math.max(1, Number(payload.durationDays) || 1);
    const alloc = data.allocation as Record<string, { amountINR: number; pct: number }> | undefined;
    if (!alloc || !Number.isFinite(total)) return data;
    const keys = ['transport', 'stay', 'food', 'activities', 'buffer'];
    for (const k of keys) {
      if (!alloc[k]) return data;
      alloc[k].amountINR = Math.max(0, Math.round(Number(alloc[k].amountINR) || 0));
    }
    let sum = keys.reduce((s, k) => s + alloc[k].amountINR, 0);
    alloc.buffer.amountINR += total - sum;
    if (alloc.buffer.amountINR < 0) {
      const largest = keys
        .filter((k) => k !== 'buffer')
        .sort((a, b) => alloc[b].amountINR - alloc[a].amountINR)[0];
      alloc[largest].amountINR += alloc.buffer.amountINR;
      alloc.buffer.amountINR = 0;
    }
    sum = keys.reduce((s, k) => s + alloc[k].amountINR, 0);

    /*
     * Corporate policy caps are contractual, not advisory. The model routinely
     * over-allocates the stay; code enforces the ceiling and parks the
     * difference in buffer so the total stays exact.
     */
    const policy = payload.policyBrief as
      | { hotelCapPerNightINR?: number; perDiemINR?: number }
      | undefined;
    if (policy) {
      const nights = Math.max(1, durationDays - 1);
      const stayCap = Number(policy.hotelCapPerNightINR) * nights;
      if (Number.isFinite(stayCap) && stayCap > 0 && alloc.stay.amountINR > stayCap) {
        const excess = alloc.stay.amountINR - stayCap;
        alloc.stay.amountINR = stayCap;
        alloc.buffer.amountINR += excess;
        const cat = alloc.stay as unknown as { note: string };
        cat.note = `Capped at policy limit — ₹${Number(policy.hotelCapPerNightINR).toLocaleString('en-IN')}/night × ${nights} ${nights === 1 ? 'night' : 'nights'}.`;
      }
      const foodCap = Number(policy.perDiemINR) * durationDays;
      if (Number.isFinite(foodCap) && foodCap > 0 && alloc.food.amountINR > foodCap) {
        const excess = alloc.food.amountINR - foodCap;
        alloc.food.amountINR = foodCap;
        alloc.buffer.amountINR += excess;
        const cat = alloc.food as unknown as { note: string };
        cat.note = `Held to the per-diem — ₹${Number(policy.perDiemINR).toLocaleString('en-IN')}/day × ${durationDays} days.`;
      }
      sum = keys.reduce((s, k) => s + alloc[k].amountINR, 0);
    }

    for (const k of keys) alloc[k].pct = Math.round((alloc[k].amountINR / total) * 100);
    data.totalINR = sum;
    data.perDaySpendINR = Math.round(
      (alloc.food.amountINR + alloc.activities.amountINR) / durationDays,
    );
  }

  if (agent === 'booking') {
    const total = Number(payload.totalINR);
    let items = (data.bookings as { amountINR: number }[] | undefined) ?? [];
    items = items.filter((b) => b && Number.isFinite(Number(b.amountINR)));
    items.forEach((b) => (b.amountINR = Math.max(0, Math.round(Number(b.amountINR)))));
    if (Number.isFinite(total)) {
      while (items.length > 1 && items.reduce((s, b) => s + b.amountINR, 0) > total) items.pop();
    }
    const committed = items.reduce((s, b) => s + b.amountINR, 0);
    data.bookings = items;
    data.totalCommittedINR = committed;
    data.remainingBudgetINR = Number.isFinite(total) ? Math.max(0, total - committed) : 0;
    data.simulated = true;
    data.bookingNote = 'Demo mode — no real reservations made.';
  }

  if (agent === 'consensus') {
    // Fairness floor: the Referee promises nobody scores below 3.
    const c = data.consensus as { perTraveller?: { satisfaction: number }[] } | undefined;
    if (c?.perTraveller) {
      c.perTraveller.forEach((p) => {
        const s = Math.round(Number(p.satisfaction) || 0);
        p.satisfaction = Math.min(5, Math.max(3, s));
      });
    }
  }

  return data;
}

let groq: Groq | null = null;
function getGroq(): Groq {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

/*
 * ---- quota protection ----
 *
 * Measured, not assumed: after roughly two live runs the Groq free tier stopped
 * answering for over ten minutes. Each run costs 8-13 calls, so two people
 * planning at once is already over budget — and this endpoint is public and
 * unauthenticated on a URL that goes in the submission. Three cheap defences,
 * all in-process (no dependencies, no infrastructure, survives a cold start by
 * simply starting empty):
 *
 *   1. Cache identical briefs. Demoing the same trip twice then costs nothing
 *      and returns instantly — the single biggest win available.
 *   2. Throttle per IP, so one runaway client cannot drain the key for everyone.
 *   3. Same-origin check, so the endpoint is not trivially scriptable.
 */

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 200;
const cache = new Map<string, { at: number; data: object }>();

function cacheKey(agent: string, payload: object): string {
  // Stable stringify: key order must not change the identity of a brief.
  const stable = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(stable);
    if (v && typeof v === 'object') {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, val]) => [k, stable(val)]),
      );
    }
    return v;
  };
  return `${agent}:${JSON.stringify(stable(payload))}`;
}

function cacheGet(key: string): object | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  // Refresh recency so the eviction below drops genuinely cold entries.
  cache.delete(key);
  cache.set(key, hit);
  return hit.data;
}

function cacheSet(key: string, data: object): void {
  cache.set(key, { at: Date.now(), data });
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

const RATE_WINDOW_MS = 60 * 1000;
/*
 * Abuse guard, NOT a capacity limit — the provider buckets already do that job.
 * It was set to 30 when a plan was ~8 calls; a group plan is now 13+, so two
 * plans in a minute tripped our own limiter and the UI reported it as the
 * provider's free-tier limit. That was doubly wrong: the message was false, and
 * waiting for quota to refill could never clear it.
 */
const RATE_MAX_CALLS = 90;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_MAX_CALLS;
}

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

/** The Itinerary Agent runs to 3400 tokens; the platform default can be shorter. */
export const maxDuration = 60;

/**
 * The fallback chain each agent walks when a model is out of quota.
 *
 * Primary is whichever model suits the job; the rest are escape routes. This
 * exists because the binding constraint turned out to be TOKENS PER DAY, not
 * per minute — llama-3.3-70b allows 100,000/day, which at ~10k a plan is about
 * ten plans and then nothing until tomorrow. Groq does not expose the daily
 * figure in response headers; it only appears in the 429 body, so it cannot be
 * checked before a call, only reacted to.
 *
 * Every agent has been validated on every model in its chain. The nested-schema
 * agents (destination, budget) fail gpt-oss's strict JSON validator, so
 * fallback attempts drop `response_format` and lean on the fence-stripping
 * parser and retry that already exist — verified to produce valid output.
 */
const CHAIN_REASONING = [MODEL_REASONING, MODEL_ARBITER, MODEL_STRUCTURAL];
const CHAIN_ARBITER = [MODEL_ARBITER, MODEL_REASONING, MODEL_STRUCTURAL];
const CHAIN_STRUCTURAL = [MODEL_STRUCTURAL, MODEL_ARBITER, MODEL_REASONING];
/*
 * Discovery and Budget emit deeply nested objects, and gpt-oss truncates or
 * malforms them often enough that it is the wrong second choice — observed live
 * on a real run, where budget fell 70B -> gpt-oss (parse failed) -> 8b (fine).
 * Ordering the small model ahead of it skips a wasted call.
 */
const CHAIN_NESTED = [MODEL_REASONING, MODEL_STRUCTURAL, MODEL_ARBITER];

/*
 * The persona variants of the Mood agent carry an extra nested object on top of
 * destinationParameters — faithContext, householdConstraints, policy — and that
 * is one level more than gpt-oss's JSON validator will accept. Measured: the
 * Pilgrimage variant is rejected outright there and answers cleanly elsewhere.
 * They also run first and set the direction of the whole plan, so they are
 * worth the reasoning model's scarce daily budget.
 */
const NESTED_SCHEMA_AGENTS = new Set([
  'destination',
  'budget',
  'mood_family',
  'mood_pilgrimage',
  'mood_corporate',
]);

function chainFor(agent: string, config: AgentConfig): string[] {
  if (NESTED_SCHEMA_AGENTS.has(agent)) return CHAIN_NESTED;
  const primary = config.model ?? MODEL_REASONING;
  if (primary === MODEL_ARBITER) return CHAIN_ARBITER;
  if (primary === MODEL_STRUCTURAL) return CHAIN_STRUCTURAL;
  return CHAIN_REASONING;
}

/**
 * Should the chain move on to the next model?
 *
 * 429 is quota. 400 is the provider's own JSON validator rejecting what the
 * model produced — which is a property of THAT model, not of the request, and
 * is exactly what the Pilgrimage agent hit in production: gpt-oss cannot
 * validate its nested schema, the 400 escaped the loop, and the traveller was
 * told "this agent hit a snag" while two models that could have answered went
 * untried. Any provider-side refusal now means try the next model.
 */
function shouldFailOver(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 429 || status === 400 || status === 413 || status === 422 || status === 503;
}

function isRateLimit(err: unknown): boolean {
  return (err as { status?: number })?.status === 429;
}

async function callModel(
  config: AgentConfig,
  payload: object,
  strict: boolean,
  model: string,
  jsonMode: boolean,
): Promise<string> {
  const system =
    (strict ? config.system + '\nReturn ONLY valid JSON matching the schema. No prose.' : config.system) +
    (jsonMode ? '' : '\nReturn ONLY the JSON object. No markdown fences, no prose.');
  const res = await getGroq().chat.completions.create({
    model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify(payload) },
    ],
  });
  return res.choices[0]?.message?.content ?? '';
}

export async function POST(request: NextRequest) {
  let body: { agent?: string; payload?: object };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 400 });
  }

  const agentKey = body.agent ?? '';
  const config = AGENTS[agentKey];
  if (!config || typeof body.payload !== 'object' || body.payload === null) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 400 });
  }

  /*
   * Cap the brief before it reaches a system-prompted call. Every field here is
   * user-typed free text (mood notes, traveller notes, circuit, dietary rule,
   * cost centre), and the client's maxLength attributes are not enforcement.
   */
  const serialised = JSON.stringify(body.payload);
  if (serialised.length > 24_000) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 413 });
  }

  // Same-origin only: this endpoint spends a shared, rate-limited quota.
  const origin = request.headers.get('origin');
  if (origin) {
    const host = request.headers.get('host');
    let sameHost = false;
    try {
      sameHost = new URL(origin).host === host;
    } catch {
      sameHost = false;
    }
    if (!sameHost) {
      return NextResponse.json({ ok: false, error: 'server_error' }, { status: 403 });
    }
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ ok: false, error: 'missing_key' }, { status: 503 });
  }

  // An identical brief is the same plan — serve it free rather than re-buying it.
  const key = cacheKey(agentKey, body.payload);
  const cached = cacheGet(key);
  if (cached) {
    return NextResponse.json({ ok: true, data: cached, cached: true });
  }

  if (throttled(clientIp(request))) {
    // Deliberately NOT 'rate_limited' — that code means the provider, and
    // conflating the two sends people waiting for a refill that is irrelevant.
    return NextResponse.json(
      { ok: false, error: 'too_many_requests', retryAfterSeconds: 20 },
      { status: 429 },
    );
  }

  /*
   * Walk the chain. A model that is out of quota is skipped immediately rather
   * than waited on — another model's budget is untouched, so there is nothing
   * to gain by stalling. Only when every model is exhausted do we report a rate
   * limit to the client.
   */
  const chain = chainFor(agentKey, config);
  let lastRateLimit: unknown = null;

  try {
    let data: Record<string, unknown> | null = null;

    for (let i = 0; i < chain.length && !data; i++) {
      const model = chain[i];
      // Only the primary gets strict JSON mode; fallbacks rely on the parser,
      // because the nested-schema agents fail gpt-oss's validator outright.
      const jsonMode = i === 0;
      try {
        let raw = await callModel(config, body.payload, false, model, jsonMode);
        data = tryParse(raw, config.requiredKeys);
        if (!data) {
          raw = await callModel(config, body.payload, true, model, jsonMode);
          data = tryParse(raw, config.requiredKeys);
        }
        if (!data) {
          console.error(`[TripME] ${agentKey}: parse failed on ${model}`);
          continue; // a different model may well parse cleanly
        }
        if (i > 0) console.warn(`[TripME] ${agentKey}: served by fallback ${model}`);
      } catch (err) {
        if (shouldFailOver(err)) {
          if (isRateLimit(err)) lastRateLimit = err;
          const status = (err as { status?: number })?.status;
          console.warn(`[TripME] ${agentKey}: ${model} refused (${status}), trying next`);
          continue;
        }
        throw err;
      }
    }

    if (!data) {
      if (lastRateLimit) throw lastRateLimit; // every model exhausted
      console.error(`[TripME] ${agentKey}: no model produced valid output`);
      return NextResponse.json(
        { ok: false, error: 'parse_failed', detail: `${chain.length} models tried` },
        { status: 502 },
      );
    }
    const processed = postProcess(agentKey, data, body.payload as Record<string, unknown>);
    cacheSet(key, processed);
    return NextResponse.json({ ok: true, data: processed });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      /*
       * The binding free-tier limit is tokens-per-minute, not requests: 12k TPM
       * against an Itinerary call that alone costs ~5k (1.8k prompt + 3.4k
       * completion). Two heavy agents in one minute exhaust the window. The old
       * fixed 12s therefore retried straight back into the same exhausted
       * minute and failed again — measured: eight consecutive retries, no
       * progress. Honour Groq's own retry-after when it sends one, and
       * otherwise wait out a full window.
       */
      const headers = (err as { headers?: Record<string, string> })?.headers;
      const advertised = Number(headers?.['retry-after']);
      const retryAfterSeconds =
        Number.isFinite(advertised) && advertised > 0 ? Math.ceil(advertised) : 60;
      return NextResponse.json(
        { ok: false, error: 'rate_limited', retryAfterSeconds },
        { status: 429 },
      );
    }
    console.error(`[TripME] ${agentKey}: model call failed`, err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 502 });
  }
}
