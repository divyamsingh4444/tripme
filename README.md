# TripME — One mood. One budget. One complete trip.

AI multi-agent travel planner. **BITSoM Capstone (Product Management with Generative & Agentic AI) · Team DEBUGGERS · Phase 2 MVP.**

One input — mood + budget + duration — triggers five specialised AI agents in sequence. Each agent hands a structured JSON brief to the next, carrying context from emotional intent all the way to (simulated) bookings.

## The 5-agent pipeline

| # | Agent | Job |
|---|-------|-----|
| 1 | ✨ Mood Agent | Turns the traveller's vibe into structured travel parameters |
| 2 | 🗺️ Destination Agent | Picks the best-fit destination (+2 alternates) for mood, month & budget |
| 3 | 💰 Budget Optimizer | Allocates the full budget across transport / stay / food / activities / buffer — before any booking |
| 4 | 📅 Itinerary Agent | Day-by-day plan with costs, meals, plan-B swaps and a local language card |
| 5 | 🎫 Booking Agent | Prepares simulated bookings within the allocation, each waiting for explicit user approval |

Open the **Agent log** on any trip page to see the raw JSON each agent produced.

## Honesty block

- **Real:** live AI planning — every plan is generated fresh by **Llama 3.3 70B on Groq** (JSON mode, per-agent prompts and temperatures). Budget arithmetic is enforced deterministically server-side.
- **Simulated:** bookings. Cards are demo artefacts with reference codes and a visible "Demo Mode" label; each links out to real Google Flights / Booking.com searches for that exact trip.
- **Private by design:** no accounts, no server database. Saved trips live in the browser (localStorage) and feed the Mood Agent's personalisation on the next plan.

## Stack

Next.js (App Router) · React · Tailwind CSS v4 · Groq API (`llama-3.3-70b-versatile`) · Vercel

## Run locally

```bash
pnpm install
echo "GROQ_API_KEY=gsk_your_key" > .env.local   # free key: console.groq.com/keys
pnpm dev
```

Without a key the app still works via **"See a sample trip"** (bundled offline sample); live planning requires the key.

## Architecture notes

- `app/api/agent/route.ts` — single backend endpoint `POST { agent, payload }`; holds all five system prompts, parses/retries JSON, maps rate limits, and applies money guardrails. `GROQ_API_KEY` never reaches the client.
- `lib/agents-client.ts` — the handoff map: builds each agent's payload from the previous agents' outputs.
- `app/run/page.tsx` — live pipeline UI: per-agent status, elapsed timer, auto-retry on rate limits, sample fallback after repeated failures.
- Switching to an alternate destination re-runs only agents 3–5; the mood profile carries over.
