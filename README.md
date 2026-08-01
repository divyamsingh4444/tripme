# TripME — One mood. One budget. One complete trip.

AI multi-agent travel planner. **BITSoM Capstone (Product Management with Generative & Agentic AI) · Team DEBUGGERS · Phase 2 MVP.**

One input — mood + budget + duration — triggers seven specialised AI agents. Each hands a structured JSON brief to the next, carrying context from emotional intent all the way to (simulated) bookings.

It is deliberately **not a straight line**. The Referee Agent audits the Itinerary Agent's real costs against the Budget Agent's allocation and, when they conflict, says so on screen and sends the brief *backwards* for a re-plan. Agents that can reject each other's work are what separate a multi-agent system from one long prompt.

## The 7-agent pipeline

| # | Agent | Job | The mechanism that makes it more than a label |
|---|-------|-----|---|
| 1 | ✨ Mood & Intent | Turns the traveller's vibe into structured travel parameters | Emits **non-negotiables** and an **avoid** list that bind the next agent |
| 2 | 🗺️ Discovery | Picks the best-fit destination (+2 alternates) | **Contractually bound** — must show, line by line, where each non-negotiable is met |
| 3 | 💰 Budget | Allocates the full budget across transport / stay / food / activities / buffer, before any booking | Optimises **thrift**; obeys the Referee when sent back. Code, not the model, enforces exact sums and policy caps |
| 4 | 📅 Itinerary | Day-by-day plan with costs, meals, plan-B swaps and a local language card | Optimises **experience** — deliberately *not* shown the budget, and told to price honestly. The two agents genuinely disagree |
| 5 | 🎫 Booking | Prepares simulated bookings within the allocation, each waiting for explicit approval | Every card carries an approval gate and deep-links to real inventory |
| 6 | ⚖️ Referee | Audits and arbitrates **three conflict classes** | *Money:* states the Budget-vs-Itinerary gap in rupees and can re-plan backwards. *Pacing (family):* audits each day against the actual humans, by name. *Policy (corporate):* checks bookings against travel policy and builds the expense report. Plus consensus in couple/group mode |
| 7 | 🔔 Notification | Reminder schedule from the confirmed bookings | Channel per persona — push, SMS/voice fallback, calendar sync, organiser-only |
| + | 🙋 Traveller Advocates *(dynamic)* | Couple/group: **one agent per person**, instructed to argue and never compromise | Three friends = three advocates. The Referee publishes a per-person *wanted / got / conceded / satisfaction* matrix with an enforced fairness floor |

Open the **Agent log** on any trip page to see the raw JSON each agent produced.

## Six entry paths, one agent core

Three of the six skip the mood quiz entirely, because for those travellers the intent is already known — and each path changes what the agents *do*, not just what the form looks like.

| Path | Asks instead | How the agents change |
|---|---|---|
| 🧍 Solo | Mood quiz | The standard seven |
| 💑 Couple | Both moods + budgets | 2 Advocates → Referee blends them |
| 👥 Group | Everyone's mood + budget | One Advocate per friend; Referee publishes the concessions |
| 👨‍👩‍👧 Family | Household ages + limitations | Paced by the *most constrained* member; Referee adds a pacing audit, flagging conflicts by name |
| 🕉 Pilgrimage | Circuit, tradition, mobility, diet | Route sequenced traditionally, season checked, darshan timing planned; reminders fall back to SMS/voice |
| 💼 Corporate | Travel policy — no mood at all | The meeting fixes the city, so Discovery picks the district; caps enforced in code; Referee adds a compliance audit and expense report |

## Honesty block

- **Real:** live AI planning — every plan is generated fresh by **Llama 3.3 70B on Groq** (JSON mode, per-agent prompts and temperatures). Budget arithmetic and policy caps are enforced deterministically server-side: the model proposes, code guarantees.
- **Simulated:** bookings. Cards are demo artefacts with reference codes and a visible "Demo Mode" label; each links out to real Google Flights / Booking.com searches for that exact trip.
- **Private by design:** no accounts, no server database. Saved trips live in the browser (localStorage) and feed the Mood Agent's personalisation on the next plan.

## Stack

Next.js (App Router) · React · Tailwind CSS v4 · three.js · Groq API (`llama-3.3-70b-versatile`) · Vercel

## Run locally

```bash
pnpm install
echo "GROQ_API_KEY=gsk_your_key" > .env.local   # free key: console.groq.com/keys
pnpm dev
```

Without a key the app still works via **"See a sample trip"** (bundled offline sample); live planning requires the key.

> Groq's free tier is roughly one plan per minute, and each run makes 8–13 calls. Identical briefs are served from an in-process cache, so demoing the same trip twice costs no quota.

## Architecture notes

- `app/api/agent/route.ts` — single backend endpoint `POST { agent, payload }`; holds every agent system prompt, parses/retries JSON, maps rate limits, throttles abuse, caches identical briefs, and applies money and policy guardrails. `GROQ_API_KEY` never reaches the client.
- `lib/agents-client.ts` — the handoff map: builds each agent's payload from the previous agents' outputs, and owns the deterministic Budget-vs-Itinerary audit that triggers the Referee.
- `app/run/page.tsx` — live pipeline UI: per-agent status, elapsed timer, auto-retry on rate limits, pause-and-resume on hard failure, sample fallback.
- Switching to an alternate destination re-runs Discovery (so the non-negotiables receipt matches the new place), then Budget, Itinerary and Booking; the mood profile carries over.
