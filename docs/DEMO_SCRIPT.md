# TripME — MVP Demo Script

**Target length:** 6–7 minutes · **Format:** screen recording with voice-over · **Resolution:** record at 1440×900 or 1920×1080, browser at 100% zoom
**Upload:** unlisted YouTube link → paste into Section 0 and Section 30 of the submission.

The script is ordered to *build an argument*, not tour the UI. The argument, in one line:
**"Seven agents that show their reasoning, argue with each other, and are held to your budget in code — and the traveller always gets the last word."**

---

## Before you press record — the pre-flight checklist

Do this 15 minutes before recording. Every item here exists because of a real failure mode.

1. **Fresh browser state.** Open DevTools → Application → Clear site data on `tripme-khaki.vercel.app`. This empties My Trips and resets the assistant, so the video starts clean.
2. **Check quota is alive.** Run one throwaway brief from any city. If agents stream normally, you're fine. If you see failover messages, still fine — that's a feature (see contingencies).
3. **Know the cache rule.** An *identical* brief returns instantly from cache — no agent drama. So: **rehearse with one brief, record with a slightly different one** (change the origin city or the vibe text). Keep the rehearsed brief as your zero-risk backup — if quota dies mid-recording, the rehearsed brief still returns instantly.
4. **Sign-in:** use **Continue as a test user** on camera. Never Google — the consent screen is in Testing and a "this app isn't verified" screen on video would be a disaster.
5. **Do NOT click "Also allow browser notifications"** during the recording — the OS permission popup looks bad on video. The in-app bell is the demo.
6. **Language tab trick.** If you want the Hindi moment (recommended — it's 15 seconds of wow): before recording, open a second tab, open a trip, switch to हिन्दी, and let translation finish (~1–2 min on free tier). On camera you just switch to that tab. Never switch language live — the "Translating…" wait kills pacing.
7. **Close every other tab, hide the bookmarks bar, turn off OS notifications** (Focus Assist on Windows).
8. **Mic check + 2 full dry runs.** The first dry run finds the stumbles; the second makes it smooth. Record on the third.

---

## The script

> Lines in quotes are what you say. Say them naturally — trim to your own voice, keep the bolded claims. [Bracketed lines] are what you do.

### 0:00 — Cold open: the proposition (30s)

[Landing page, top of page. Don't scroll yet.]

> "This is TripME — our Phase 2 MVP, live right now at tripme-khaki.vercel.app. Every travel product starts by asking *where you're going*. We think that's the wrong first question — most trips start as a feeling and a budget, not a destination. So TripME asks: **how do you want to feel, and what can you spend?** Seven AI agents do the rest — and when two of them disagree, a Referee settles it in front of you."

[Point cursor along the agent pipeline strip at the bottom of the hero.]

> "The architecture isn't hidden in a diagram — it's on the landing page. Intent, Discovery, Budget, Itinerary, Booking, Referee, Notification."

### 0:30 — Instant value: a sample plan (35s)

[Click **See a sample trip** → open **Gokarna**.]

> "Before asking anyone to fill a form, we show a finished plan. These four samples open instantly — no sign-in, no API quota, so this works even if the free tier is exhausted. Notice the header: **7 agents, 34 seconds of agent time** — the product measures its own speed claim on every plan."

[Scroll slowly once through the Gokarna page — arbitration card, budget, a day, bookings — about 10 seconds. Don't stop. You'll come back to all of it on the live plan.]

### 1:05 — The live run: seven agents, on camera (90s)

[Navigate to Plan. Choose **Solo**.]

> "Now live, end to end. I'm travelling solo. My mood is Relax —"

[Click Relax. Type a vibe: e.g. "slow mornings, water, no alarms".]

> "— and the agents will quote these words back to me later, which matters: you can check their reasoning against what you actually said."

[Set budget (e.g. ₹25,000), days (3), **type an origin city** — use a different city than your rehearsal — pick the start date.]

> "One detail we're proud of: the origin field starts **empty**. An early version defaulted to Bengaluru, and that assumption leaked all the way into people's reminders. Now nothing about the traveller is assumed."

[Click **Plan my trip**. The agent stream starts.]

> "Watch what each agent reports — not progress bars, **decisions**. Mood & Intent turned my words into a structured brief. Discovery picked a destination *and* kept two alternates. Budget allocated the full ₹25,000 — and the arithmetic here is computed in code, never by the model, because models are eloquent and bad at subtraction."

[If the Referee flags a conflict and sends work back — it did in our test runs — point at it immediately:]

> "**And this is the moment that makes it a multi-agent system.** The Referee just audited the Itinerary against the Budget, found an overrun, and sent the work *backwards* — see 'triggered by Referee'? Two agents are re-running. This is a graph with a feedback edge, not a chain of prompts."

[If the Referee doesn't fire live, skip that line — you'll show arbitration on the Manali sample at 4:45 instead.]

> "The clock counts agent time only — it's honest about excluding free-tier queueing."

### 2:35 — Reading the plan: evidence, not vibes (55s)

[The trip page loads. Point at the header chips.]

> "Nine agent calls, under a minute of agent time. Here's the plan — and here's *why* it's the plan. The Discovery Agent quotes my own brief back — 'slow mornings', 'water' — and 'It also considered these' shows what it rejected. A recommendation you can interrogate is the difference between advice and output."

[Scroll to Budget.]

> "The budget is allocated across categories *before* a single booking — and every figure you'll see from here on reconciles against this, in code."

[Scroll to Bookings.]

> "Bookings are **simulated and labelled** — 'demo mode, no real reservation', on the card itself, not in the fine print. Each one sits behind an approval gate with its reason stated. The deep links to real providers, though, are real."

### 3:30 — The traveller overrules the agents (55s)

[Scroll to "Not quite right? Change it" → click **Show me the alternatives**.]

> "The agents make the first call — never the last one. Transport options come with honest trade-offs: 'cheapest, but arrives at 4am'. These hotels are **real places from OpenStreetMap** — mappable, with their own websites. Prices are marked 'est.' and the page tells you why: live rates sit behind paid APIs this project doesn't use. Where no licensed photo of a guesthouse exists, we show a map pin instead of a fake stock photo."

[Change the stay tier or a transport option. Point at the footer total changing.]

> "I just changed the stay — watch the bottom bar: the whole trip re-priced instantly, in code. And if I'd already approved that booking, the approval would have been **revoked** — you can never approve ₹8,000 and end up confirming ₹14,000."

### 4:25 — Commit: gates that mean something (50s)

[Point at the "What happens next" stepper.]

> "Four steps, always visible: Adjust, Approve, Confirm, Reminders. Each says what unlocks it."

[Approve all bookings — narrate over the clicks:]

> "I approve each booking explicitly… and now Confirm asks me to sign in. Planning never needs an account — the gate is at *commitment*, because a confirmed trip has to belong to someone."

[Click sign in → **Continue as a test user**.]

> "There's a password-less test user so any evaluator can walk this exact path."

[Back on the trip: click **Yes — I'm going**. Then **Turn on reminders**.]

> "Confirmed. Reminders are **off by default and opt-in per trip** — we don't farm engagement. And now the bell —"

[Open the bell in the nav.]

> "— departure, check-in, every activity, time-anchored to the actual bookings I approved. If I'd rejected that hotel earlier, no reminder would ever mention it."

### 5:15 — Breadth: sixty seconds, three claims (60s)

[Open the **Manali** sample from the landing page.]

> "That was solo. Group mode is where it gets interesting: every traveller gets their own **Advocate agent**, and the Referee publishes exactly who conceded what — Priya got the trek, Rohan absorbed one early start and got both free afternoons back. There's a fairness floor: *nobody concedes twice*. And live spend splits per person as bookings are approved — no separate expense app."

[Open the **Hyderabad** sample.]

> "Corporate swaps mood for policy — caps enforced in code, a compliance verdict, and a reimbursement-ready expense report."

[Switch to your pre-translated Hindi tab.]

> "And the whole product — including what the agents themselves wrote — works in seven languages. This plan was generated in English and translated after the fact; notice every rupee figure survived untouched."

### 6:15 — Close: what's real, and what it costs (30s)

[Open **How it works**, scroll to "What's real, what's simulated".]

> "We end where most demos don't: this page ships *in the product* and says exactly what's real, what's estimated, and what's simulated. The planning is real and live. The bookings are simulated by scope. The whole thing runs at **zero marginal cost** — free-tier models with three-way failover, open map data, no paid API anywhere."

> "TripME: one mood, one budget, one complete trip — and every claim in our submission maps to a screen you can open right now at tripme-khaki.vercel.app. Thank you."

[End on the landing page or the wireframes URL on screen.]

---

## Contingency table — when something goes wrong mid-take

| What happens | What you do |
|---|---|
| Quota exhausted, agents fail | Say: *"the free tier is throttling us — which is exactly why we built three-model failover and zero-quota samples."* Re-run with your **rehearsed brief** (cached → instant) or pivot to the Gokarna sample and narrate the same beats. Honest, and it demonstrates resilience. |
| An agent shows a failover message | Don't cut. Point at it: *"that's the failover chain working — one model refused, the next picked it up."* It's a feature. |
| Referee doesn't fire on the live run | Skip the backward-edge line at 1:35; the Manali sample at 5:15 carries arbitration. Optionally add: *"in our test runs the Referee has rejected and re-run agents live — the wireframes deck has the capture."* |
| Live run is slow (queueing) | Keep narrating per-agent outputs — the stream gives you material. The clock excludes queue time; say so. |
| You fumble a line | Keep rolling. Cut in edit — record in one screen-capture file and trim; don't restart the whole take. |

## After recording

1. Trim, export 1080p.
2. Upload to YouTube as **Unlisted**.
3. Put the link in the two `[ TO BE INSERTED ]` placeholders: Section 0 (submission links table) and Section 30.
4. Watch it once at 1.5× as an evaluator would: can you hear every claim land?
