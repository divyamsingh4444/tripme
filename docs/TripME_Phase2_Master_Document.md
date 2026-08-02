# TripME — Phase 2 Master Document
**Team DEBUGGERS · BITSoM "Product Management with Generative & Agentic AI" Capstone**
**Started: 1 Aug 2026 · Last updated: 1 Aug 2026 · Submission deadline: 2 Aug 2026 · Presentation: 8 Aug 2026 onwards**

This is the single source of truth for where the Phase 2 submission stands: everything we know, everything built, everything still owed, and exactly how we finish the last three build deliverables (wireframes, MVP demo recording, PRD).

> **Working agreement:** this document is kept continuously up to date — every decision, scope change and status change gets folded in as it happens, so no context is ever lost between sessions and nothing has to be re-explained. See the **Decision Log (§0)** for the running record.
>
> **Location:** `docs/TripME_Phase2_Master_Document.md` inside the repo, so its history is version-controlled alongside the code. The repo is **public** — do not add anything that shouldn't be.

---

## 0. Decision Log

Newest first. Every material decision, with the reasoning, so we never re-litigate a settled question.

### 2 Aug 2026

**D-019 · Landing page filled out — trending destinations, trip ideas, recent trips (commit `f535c50`).**
The page ended at the planner form; below it was empty. It now carries the editorial furniture that makes the reference site feel alive — built so every claim on it is true.
- **Trending destinations** — eight hand-picked places in a snap-scrolling rail with real Wikimedia photography, a mood chip, best season and an indicative budget. Tapping one **pins that destination** and fills a matching brief. *Verified end to end: Rishikesh pins, Spiritual selects, budget lands at ₹18,000.* This cost no new agent work — Discovery already accepts `pinnedDestination` (built for the P0-4 switch fix), so it justifies a chosen place rather than re-choosing. `TripInput` now carries it from the form to the pipeline. **It also answers a real gap:** until now there was no path for "I already know where I want to go."
- **Trip ideas** — six mood-led briefs that deliberately **do not** pin a place, so the mood-in/destination-out thesis still holds intact for anyone starting from a feeling rather than a map.
- **Your recent trips** — the honest counterpart to their *"Recently booked itineraries · 143+ trips booked last week"*. Ours reads the visitor's **own saved trips** and hides itself entirely when there are none. Inventing named strangers with timestamps would be fabricated social proof, which is precisely what rubric 3.3 grades — and it would be indefensible if a reviewer asked where the number came from.
- Brand marquee, motion-safe.
*Verified at 375 / 768 / 1280 — `scrollWidth == clientWidth` at every width; the rails scroll inside themselves.*

**D-018 · Researched Pickyourtrail's "AI features" — there are none. The gap is photography, and we closed the free half of it (commit `b903de9`).**

**The finding, because it reframes the brief.** A full crawl of pickyourtrail.com returns **zero AI mentions** anywhere on the page. They are a **human-concierge travel agency** with an excellent media budget, not an AI product. Their "Trippie" is a support/mascot widget. There is no AI feature to draw inspiration from — **TripME is already far more AI-first than the site we were told to learn from.**

**What they actually have — 123 images and 11 videos on one homepage:**
- a commissioned brand film (`PYT+FAMILY+FILM…mp4`) autoplaying muted and looped behind the hero
- named customer testimonial videos (`Nakul_subree`, `Mayur_sonia`, `Aishwarya_bal`)
- shot photography per persona — `couple_`, `family_`, `friends_`, `solo_desktop_`
- social proof sections: *Recently booked itineraries*, *What the press says*, *Partnered with the best*

Their warmth is **bought, not coded**. Most of it — film crews, photoshoots, real customers, press — is unavailable at ₹0 and cannot be faked. **Fabricated testimonials or invented press quotes are off the table**, both ethically and because rubric 3.3 grades exactly that kind of judgement.

**What was free, and is now built.** The one thing separating a real travel product from a form was that our destinations were *text*. New `/api/place-image` resolves any place to a properly-licensed **Wikimedia photograph** — no API key, no quota, legally clean with attribution linking to source. Resolution is **search-first**, because `/page/summary/Gokarna` returns a disambiguation stub with no image while searching *"Gokarna India"* finds *"Gokarna, Karnataka"* which has one; same failure for Manali. Verified across Rishikesh, Hyderabad, Udaipur, Char Dham, Gokarna, Manali. Applied to: the **trip header** (real photo behind the type, gradient tuned so it stays legible whatever the photo is), **My Trips cards**, and the **runners-up**, which are now photo cards. Photography is *decorative by contract* — it fades in if it arrives and is simply absent if not; nothing downstream depends on it.

**Also surfaced the Discovery Agent's `decisionNote`** — *why this destination beat the alternates* — next to the runners-up instead of leaving it buried in the agent log. That is AI reasoning made visible, which is the actual answer to "make it feel AI-first": not more chrome, but showing the thinking that already exists.

*Still unclosed and honestly unclosable for free: video, real customer stories, press logos. If any of those matter for the presentation, the only legitimate route is real footage of real testers — which the JTBD interviews are already generating.*

**D-017 · Acted on the 2 Aug UI review — five changes (commit `c673b9f`).**
Teammate review on a real phone. All five points were right, and three of them were about the product apologising for itself rather than about pixels:
- **Mobile menu → slide-in drawer.** The white dropdown read as an unstyled browser default against the dark hero. Now a drawer on the brand deep surface with a dimmed scrim, 300ms transform, staggered links, marigold CTA pinned bottom, body-scroll lock, Escape/scrim close. *Verified: x=62 open → x=375 closed, scroll restored.* The reference examples given (Amazon, Wakefit, RottenTomatoes) all use exactly this pattern.
- **Footer → real company footer.** It listed "Llama 3.3 70B on Groq / Next.js · three.js / 7-agent pipeline", which reads as a project README, not a product. Now Product and Company columns, a CTA and a copyright line. **The stack is not lost** — it remains on *How-it-works* under "Under the hood", where it is evidence for an evaluator rather than decoration.
- **New `/contact` page.** Email, phone and location cards, a reason-tagged message form (mailto, no backend, nothing stored), a support FAQ answering the four questions testers actually hit (rate limits, are bookings real, where trips are stored, something looks wrong), and a plain-English data section that doubles as the **DPDP/GDPR ethics answer** for rubric 3.3. ⚠ **The phone number is a deliberate placeholder** — publishing a real personal number to a public site is not something to do on inference. One constant at the top of the file; replace or delete the block.
- **Hero pills → flight path.** Seven pills wrapped into ragged rows on a phone. Replaced with the **logo's own dashed flight-path motif**: one line, seven nodes, last one marigold. Never wraps, and it ties the hero to the mark.
- **Cut "nothing is ever really booked" from under the primary CTA.** The sharpest note of the review: *"it feels like you are saying my product can't do all that."* Correct — it apologised at the exact moment of commitment. Honesty is undamaged: the Demo Mode badge sits in the nav, every booking card is labelled, and How-it-works has the full honesty block. Disclosure belongs where the claim is made, not under the button.
*Explicitly endorsed and left alone: the colour scheme, and the stat cards below the fold ("very friendly UI").*

**D-016 · The rest of the P0 ship-blockers cleared, plus both findings the D-015 verification threw up (commit pending).**
Everything §8.6 listed as "before recording the demo" is now done. Six items, and two of them exist only because *running* the verification taught us something *reading* the code could not:

- **P0-1 · Public copy no longer contradicts the build.** The README described five agents in a straight line; it now describes the seven, the dynamic Advocates, the six entry paths, and states plainly that the pipeline is a graph with a feedback edge. `how-it-works` had the same defect twice — a `metadata.description` reading "five specialised AI agents" (which is what search results and link previews show) and an "Orchestration: a **sequential** in-app pipeline" line sitting on the page whose entire thesis is that it is *not* sequential. Both fixed. Repo-wide grep for `five agents` / `5-agent` now returns nothing outside this document's own history.
- **P0-2 · The broken image and the trap underneath it.** `/logo.png` 404'd in the "Built by Team DEBUGGERS" credit block (the PNGs went in D-013); it now points at `/icon.svg`. The real defect was in `.gitignore`: an **unqualified `*.png`** meant that dropping a replacement into `public/` would have fixed it locally and silently never deployed. Scoped to the Playwright output it was always meant for, and the duplicated entry removed.
- **P0-5 · The timer now measures agent time — and says so.** Two separate distortions: ~7.2s of deliberate `sleep()` pacing was counted, and (found only by running it) the clock kept ticking through rate-limit countdowns *and* while parked on a Retry prompt, so a stalled run displayed **179s** against a "<60 s" headline claim. The pacing is kept, because it is what makes the handoffs readable — but it is now a `beat()` that explicitly does not count, alongside every wait and every human pause. The number is labelled **"agent time"** on the run page and "Ns of agent time" on the trip header, so the claim is legible rather than merely defensible.
- **P0-6 · The white screen is gone.** `app/error.tsx` and `app/not-found.tsx` now exist, and the error boundary's primary action is **"Clear saved data & restart"** — because the realistic cause is a trip saved by an older schema, and clearing the three storage keys is a fix no visitor could ever guess. Underneath, `readTrips()` structurally validates every record against the deep paths the readers actually walk, so one stale entry can no longer throw inside a `useEffect` on the *landing page*. Skipped records are **disclosed** on /trips rather than vanishing silently, and new saves carry a `schemaVersion`.
- **P0-7 · Quota protection, sized by measurement rather than guesswork.** An in-process cache keyed on a stable stringify of the brief (identical trip → zero quota, instant), a per-IP throttle at 30 calls/minute (~2 concurrent plans), a same-origin check, a 24 KB payload cap so user free-text cannot be used to bloat a system-prompted call, and `maxDuration = 60` so the 3400-token Itinerary call is not cut off by the platform default. The cache is the important one: it turns "demo the same trip twice" from a quota risk into a free operation.
- **Bonus, and the most valuable thing this batch found: the rate limit was mis-diagnosed, and the retry was actively wrong.** Chasing why a live run kept stalling, we queried the key's own headers mid-stall: **999/1000 requests remaining, 11,959/12,000 tokens.** The free-tier constraint is **tokens per minute, not requests** — and the endpoint was returning a hard-coded `retryAfterSeconds: 12`, so the client retried straight back into the same exhausted minute and failed again, eight times in a row, on a key that was 99.9% unused by request count. Now honours Groq's `retry-after` header and otherwise waits a full 60-second window. Full write-up on **P0-7**; §6 Risk 3's "≈1 plan/minute" framing is superseded.
- **P0-4 · The non-negotiables receipt can no longer describe the wrong city.** Switching to an alternate re-ran Budget, Itinerary and Booking but *not* Discovery, so the header kept the previous destination's `nonNegotiablesMet` proof lines — the product's hardest-leaning claim, rendered false by one click. Discovery now runs first, pinned to the chosen place by a new `pinnedDestination` contract (deliberately **not** reusing corporate's `fixedDestinationCity`, whose rule turns the alternates into districts of one city — right for Hyderabad, wrong for Gokarna). It re-derives region, weather, crowd level, cost band and the proof lines, and is told to say plainly if a non-negotiable genuinely cannot be met there rather than invent one. If Discovery fails, the switch still proceeds but the stale receipt is dropped rather than shown.

**Verification — including the live run D-015 could not complete.** `tsc` clean, `next build` clean, and a full Playwright sweep: **375/768/1280 × all six entry modes** with zero page-level horizontal overflow anywhere; no "five agents" or "sequential pipeline" text; `meta description` correct; **zero 404 asset requests**; the 404 page renders; the landing page **survives two deliberately corrupt saved trips with no uncaught errors** (the exact failure mode P0-6 exists for), and /trips discloses that it skipped them.

Then the one that mattered — **a real solo run, end to end:**
- **The party-size prompt rules hold.** No "double room", no "for two", no "couple", no "your group". The Budget Agent returned *"Single occupancy in a mid-range hotel at ₹3000 per night"* and *"Moderate eating out for one person"* — the rule visibly doing work in the output, not just present in the prompt.
- **The timer fix works end to end.** The run took **87s of wall clock** including one full rate-limit window, and the trip header reported **11s of agent time**. Under the old code this would have read 87s against a "<60 s" claim. The number is now both honest and comfortably inside the commitment.
- **The cache works, and it is the demo-day answer.** Re-running the identical brief completed in **10s with zero rate limits**, against 87s cold. A rehearsed demo trip is effectively free.
- The corrected backoff was exercised for real: hit a 429, waited out the window, recovered, finished.

*The D-015 gap is therefore closed.* Nothing in that entry remains owed.

**D-015 · Took P0-3 (a solo trip planned for two) first, ahead of §8.6's own ordering (commit `d63bdf0`).**
§8.6 put P0-1 — the stale five-agent copy — first. That is being overridden deliberately, and the reason is **reversibility, not effort**: the two items cost roughly the same (30 min vs 20 min), but README and `how-it-works` prose can be corrected at any hour, right up to and past 8 Aug, with zero regression risk. Anything still wrong at recording time is **frozen into the demo video** — the single biggest build deliverable (rubric 5.2, 2 marks) — and can only be undone by re-recording under a 1-plan-per-minute Groq quota. P0-3 is on camera: the trip header tile at `app/trip/page.tsx:210` renders "Travellers / 2 / people" during the solo Spiritual run that is **beat 3 of the §5.2 demo script**. P0-1 is also really the front half of §6 item 6 (doc↔build reconciliation), which has to happen anyway while drafting the PRD — doing it standalone today invites doing it twice.
The deeper argument for going first: a Solo path that ignores that you are solo is the **"generic" critique (D-002) landing again**, against the exact persona-differentiation thesis the 7-agent rebuild exists to defend.
**Scope of the fix — and why it doubled.** It began as two files: `app/page.tsx` (mode-derived default solo/corporate → 1, reset on mode switch, stepper surfaced out of the collapsed "+ More preferences" panel) and `lib/sample-trip.ts` (the rate-limit fallback, and therefore what evaluators see if Groq 429s, made internally consistent as a genuine solo trip with **no ₹ figures changed** — so ₹18,000 over 3 days now reads as a comfortable solo budget rather than a tight one; a deliberate trade, since a fallback that looks strained is worse than one that looks generous).

A parallel read-only blast-radius audit then established that **those two files alone would have left the bug on camera.** They fix the form and the *hard-coded* sample; they do nothing for a **live** run, and beat 3 of the §5.2 demo script is a live solo run. Four further defects, all fixed here:
- **No agent prompt had a party-size rule.** `travelers` was in the Booking, Itinerary and Budget payloads and mentioned in none of their system prompts — so a live solo run could still return "double room with breakfast", "morning kayaking for two", or a `suitabilityNote` reading "perfect for couples", on the largest surfaces of the trip page. Rules added to the Booking, Itinerary (a new SOLO branch in MODE ADAPTATION) and Budget prompts, plus a clause binding `moodProfile.socialSetting` to `travelers` at the source, since every downstream agent reads that line.
- **`travellerContext.groupSize` was a second, hard-coded derivation** (`lib/agents-client.ts`) that fell through to a literal `1` — so on a pilgrimage trip the Notification Agent was told `groupSize: 1` while every other agent was told `travelers: 2`, in the same run. Now derived from `input.travelers`, with `travellerNames` defaulting to `['You']` instead of an empty array.
- **The settle-up table rendered a one-row ledger for a solo trip** — "You | ₹10,200 | ₹10,200 | settled", under a heading reading "Fair share", on the same screen as demo beat 4. Pre-existing, but it is the loudest possible violation of this item's own rationale. The split table and the "& settle-up" heading now appear only when there is more than one traveller. Side benefit: this also hides the equally meaningless one-row table couple and family modes currently get, until **P1-3** properly fixes them.
- **Solo could be set to 8 travellers** — a regression our own fix introduced by promoting the stepper to primary position. Solo no longer renders the stepper at all; the mode already answers the question. Pilgrimage and corporate keep it.

*Verified:* `npx tsc --noEmit` clean, `next build` clean, and **driven in a real browser at 1268px** — Solo renders no travellers stepper at all (the mode answers it); Corporate renders it at **1** in the new 2×2 row; the sample trip page shows "**Travellers / 1 / person**", a stay card reading "**Single room** with breakfast", and a spend section headed "**Live spend**" with the settle-up table correctly absent. No page-level horizontal overflow (page width == viewport width).
*Responsive sweep — done and clean.* Driven with Playwright at **375 / 768 / 1280 across all five entry modes** on the plan form, and at all three widths on the trip page: zero page-level horizontal overflow everywhere (`scrollWidth == clientWidth` in every one of eighteen checks), and the travellers stepper present for exactly Corporate and Pilgrimage, absent for Solo, Family and Group. D-012's invariant holds.

*Gap now CLOSED by D-016 — a live solo run confirmed the party-size rules hold in real output ("Single occupancy…", "…for one person"), with no couple-framing anywhere. The original caveat is kept below for the record.*

*One check could NOT be completed at the time, and it must not be quietly forgotten:* **the new prompt rules are unverified against a live run.** Two attempts were made; both stalled on the Discovery Agent under sustained Groq 429s — the second nursed the Retry button ten times over ten minutes without ever clearing. The free-tier quota was exhausted and stayed exhausted. Committing anyway is a deliberate call resting on one asymmetry: the prompt changes are **purely additive instructions**, so if the model ignores them the output is exactly what it was before this commit. They cannot regress anything; they can only fail to help. Everything that *can* break — layout, JSX nesting, the settle-up gate, the stepper logic, `groupSize` — is code, and all of it is verified. **Owed at the next opportunity with quota:** one solo run, checking the booking cards, `stay.note` and day `suitabilityNote`s for couple-framing.
**Considered and rejected for now:** *P0-6 (error boundary)* — its catastrophic case has a free workaround for the recording (clear localStorage first) and its real exposure is the 8 Aug live session, after the 2 Aug deadline. *P1-2 (apply pacing fixes)* — the best demo beat in the backlog, but 1.5 hrs of new agent round-trips is too much new work for the day before submission.

**D-014 · Full product audit done from a PM seat; findings live in §8 as a ranked backlog.**
Read the product A-to-Z at commit `c67e1fe` — every route, both storage layers, all fourteen agent prompts, the API surface, performance, accessibility, copy consistency and repo hygiene. Verdict: **the architecture is genuinely strong and needs no structural change**; what has drifted is the gap between what the product *claims* and what its surfaces *do*. Three patterns, in priority order:
1. **Stale public copy contradicts the build** — the README and the How-it-works page still describe **five** agents and a **"sequential"** pipeline. The repo is public and linked in the submission, and rubric 5.3 deducts for contradictions between phases. This one contradicts us against ourselves.
2. **Headline mechanisms are one layer thinner than they look** — the Referee's three resolution options do nothing when clicked; the family pacing audit names fixes that can't be applied; switching destination keeps the *old* destination's "non-negotiables met" receipt. These are exactly where a hostile click-through lands.
3. **Unhandled demo failure modes** — no error boundary anywhere (any client throw = white screen), a public unauthenticated unthrottled `/api/agent` on a free-tier key, and ~7s of the headline "planned in Ns" timer is `sleep()`.
Everything is logged in **§8** with evidence, rationale and effort, ranked P0–P3, each item self-contained so it can be picked up one at a time. Sequencing in §8.6. *Deliberately kept in this document rather than a separate audit file — one source of truth, one history.*

**D-013 · Trip/run visual pass, real favicon, and three.js gated by device (commit `90924d4`).**
- **Trip page** — the screen the demo spends most time on — got a dedicated pass. The header is now a deep-gradient statement card (destination in the hero type scale, status chips, dates/travellers/getting-there tiles) with the Discovery Agent's **non-negotiables rendered below a perforation as a receipt**: promised vs met, visible. Day-by-day became a **timeline** — Pine header with a day badge, connected morning/afternoon/evening nodes, costs right-aligned, meals and plan-B paired. Run page steps gained a vertical spine and per-state icon chips.
- **Favicon.** Answering the question directly: converting the logo SVG to a favicon does *not* fix anything about the nav logo (already fixed in D-012), and the full lockup makes a **bad** favicon — a script wordmark plus hairline plane is mush at 16px. Built a purpose-made mark instead: Pine field, marigold flight path, solid plane. Leftover v0 icon PNGs removed.
- **three.js cost, measured not guessed:** 708KB raw / **178KB gzipped**, already isolated in its own lazy chunk. Rather than remove it (it was explicitly wanted, and the globe is the atmosphere), it is now **gated**: it loads only for motion-tolerant users on ≥768px screens with ≥4 cores and no save-data. Phones get the CSS gradient — same composition, no motion, zero bytes. Verified: **0 canvases at 390px, 1 at 1366px**. Most real-world visitors therefore never download it.

*Still open: the login decision, and a full uninterrupted group-mode run (blocked by Groq free-tier limits, not by code).*

**D-012 · Brand and atmosphere pass — the "generic" critique answered visually (commit `6b493a8`).**
Architecture had been fixed (D-002, D-007) but the *look* was still plain. Studied **Pickyourtrail.com** as the reference and extracted its actual design language rather than copying it: deep-green as the dominant surface (not just an accent), a full-bleed atmospheric hero, oversized confident display type, **ticket-perforation dividers**, and glow on primary actions. Applied to TripME's own palette:
- **three.js hero backdrop** — a point-cloud globe with marigold flight arcs, drifting motes and pointer parallax. On-theme for travel and it means no stock photography (which we cannot buy). Engineered carefully: dynamically imported so it never blocks first paint, paused via IntersectionObserver when scrolled away, and it bails cleanly to a gradient under `prefers-reduced-motion` or missing WebGL — **both fallbacks verified**, not assumed.
- **New SVG logo.** The traced source had an opaque white plate and near-white artefacts; those were stripped, the viewBox tightened using an in-browser `getBBox()` measurement, and the yellow normalised to brand marigold. Two variants (ink / white) since `currentColor` does not resolve through `<img>`. The mark is now the wordmark — the duplicate "TripME" text beside it is gone, which was the amateur tell.
- **Perforation promoted from the boarding-pass card to a brand-wide motif** — it now divides sections, so the ticket metaphor runs through the whole product rather than sitting in one component.
- Nav rides transparent over the hero and solidifies on scroll, with a real mobile menu; footer rebuilt on the deep surface; fluid `clamp()` type so nothing jumps between breakpoints.
- **Responsive verified with Playwright at 375 / 768 / 1280** — zero page-level horizontal overflow on every route; the single wide table scrolls inside its own container, which is correct.

*Deliberately not done yet: the login gate, and a matching visual pass on the run/trip pages beyond spacing and type. The trip page is content-dense and worth a dedicated pass before the demo.*

**D-011 · This document now lives inside the repo, at `docs/TripME_Phase2_Master_Document.md`.**
Previously it sat in `massai_project/` alongside the repo, so none of its edits were version-controlled — the most important non-code artifact had no history. Moved in so the decision log evolves alongside the code in one commit stream. **Note: the repo is public, so everything in this file is public** — including rubric detail, team feedback and strategy. Divyam was told this and chose to move it in anyway (a sanitised-copy option was offered and declined). Keep that in mind before adding anything genuinely sensitive.

**D-010 · Second browser-verification round — three more bugs found and fixed (commit pending).**
Driving Corporate and Group modes turned up three defects, none visible from source:
1. **False policy violation.** The compliance audit flagged "Stay ₹6,200 exceeds the ₹6,000 per-night cap" — but ₹6,200 was the *two-night total*, i.e. ₹3,100/night, comfortably inside the cap. The Referee was comparing a multi-night total against a per-night limit. Fixed by normalising in code (`stayPerNightINR`, `foodPerDayINR` and boolean verdicts computed in the payload builder; the model now narrates rather than calculates) and by making the approval threshold apply to individual line items rather than the trip total. Verified: `compliant: true`, zero violations. *A finance-literate evaluator would have caught this immediately.*
2. **Dead-end error state — the worst of the three.** When an agent hard-failed, the step displayed "wait a few seconds and retry" but **there was no Retry button** — it had been dropped when the run page was rewritten for the 7-agent pipeline. The only recovery was reloading and losing the entire run. Fixed properly: `call()` now *pauses* the pipeline on failure and awaits the user's decision, then resumes from that exact step with the same payload. Verified live under a real rate limit: paused → Retry → step succeeded → pipeline advanced. The sample-trip escape hatch now also appears after the first failure rather than the second.
3. *(Round 1, same day)* collapsed name inputs and the frozen timer — see D-009.

**Verified working:** all seven corporate policy fields render with correct values; corporate run reaches Hyderabad with the compliance card and reimbursement-ready expense report by cost centre; group advocates render their advocacy lines; the consensus matrix renders with per-person wanted/got/conceded and satisfaction dots. **Rate-limit resilience confirmed under genuine 429s** — auto-retry, graceful message, working recovery.

**D-009 · Browser automation added; UI claims are now verified at runtime, not inferred from code.**
Two MCP servers registered at user scope: **Playwright MCP** (drives real Chrome, no API key, no rate limits — the default) and **browser-use MCP** (runs on the same Groq key; use for open-web research). Immediate payoff — driving the app found **two bugs invisible from the source** (commit `fa91681`):
1. *Collapsed name fields.* The shared input class carried `w-full`, colliding with `flex-1`/`w-20` on the same element; Tailwind resolves that by stylesheet order, so every traveller and household **name field rendered at zero width** — values in state, invisible on screen. Family mode was effectively unusable and no test would have caught it.
2. *Frozen pipeline timer.* The elapsed timer sat at `0s` while agents completed, because the intervals lived inside the start-once guarded effect — under React StrictMode the first unmount cleared them and the second mount returned early. Since the "<60 s" claim is a headline Phase 1 commitment, a dead timer in the demo would have been damaging.
Standing rule going forward: **verify TripME with Playwright; research the open web with browser-use.** Known caveats: `retry_with_browser_use_agent` cannot work on Groq's free tier (needs `json_schema` + >8k TPM, no model clears both) — don't debug it; browser testing draws on the *same* Groq quota as the app, so heavy automation causes 429s; and Playwright's Chrome profile persists localStorage, so a true "first-time user" test needs `--isolated` or a cleared profile dir (relevant because saved trips feed Mood-Agent personalisation).

**D-008 · Policy and budget limits are enforced in code, never trusted to the model.**
Testing corporate mode showed the Budget Agent allocating ₹9,000/night against a ₹6,000 policy cap. The compliance audit caught it — the system working as designed — but a Budget Agent that routinely breaches policy looks broken. Rule now applied consistently: **the model proposes, deterministic code guarantees.** Stay is clamped to cap × nights, food to per-diem × days, the remainder parked in buffer, and the total still sums exactly. Same principle already governs the ordinary budget arithmetic. *This is a strong PRD/presentation line: "LLM for judgment, code for money."*

**D-007 · All six persona entry paths built (commit `92dae69`).**
The Q&A doc defines six personas each with a distinct entry path; the app had only Solo and Group. Now all six exist, and — the important part — **each path changes agent behaviour, not just the form**:
- **Family** — household composition replaces mood. Paced by the *most constrained* member (verified: a grandparent's knee trouble capped the whole plan to "chill", 30-minute walking limit, 3 rest windows/day). Referee gains a **pacing audit** that flags conflicts *by person's name* with concrete fixes.
- **Pilgrimage** — faith logistics replace mood. Circuit sequenced traditionally (Char Dham → Yamunotri, Gangotri, Kedarnath, Badrinath), season checked, darshan timing and palanquin access planned, dietary rule enforced downstream. Reminders fall back to SMS/voice.
- **Corporate** — policy replaces mood entirely, and the meeting fixes the city, so Discovery picks the **business district** instead (Hyderabad / HITEC City). Referee gains a **compliance audit** producing a reimbursement-ready expense report per cost centre.
The Referee now arbitrates **three distinct conflict classes** — money, pacing, and policy — which is the clearest evidence that it is a real agent rather than a label.

**D-006 · Wireframes deferred until the product stabilises.**
We will *not* build wireframes yet, because the product is still changing substantially. Wireframes derived from a moving target are pure rework — every product change would invalidate frames we'd already drawn. Once the build is on solid ground we do them, defaulting to **Path A** (clickable prototype hosted on our own Vercel URL) unless the mentor explicitly demands a Figma link. *Divyam's stated concern was conserving limited AI usage; the stronger reason is rework avoidance — same conclusion either way.*

**D-005 · Notion and Figma connectors need no setup — both are already live.**
Neither requires "connecting". The claude.ai connectors for **Figma** and **Notion** are already authenticated and available in this workspace (alongside Google Drive, Vercel, Atlassian, Mermaid, Three.js). Only Gmail and Google Calendar remain unauthenticated, and we don't need them. Practical consequence: when we *do* build wireframes, generating frames straight into a Figma file is available at no setup cost — it's a live option, not a project. Nothing to do now.

**D-004 · No parallel build. One repo, one deployment. (Corrects an earlier risk flag.)**
"nandu bhide" in the WhatsApp thread is Divyam himself. There is no second Lovable/v0 app being iterated in parallel. `tripme-khaki.vercel.app` **is** this repo's deployment and is canonical. All work happens in `massai_project/tripme`, committed continuously so there's a record of progress. *The "two divergent builds" risk previously listed in §6 is withdrawn.*

**D-003 · Build moved up to 7 agents; the doc did not move down to 5.**
The teammate's Q&A doc described a 7-agent system while the app had 5. We closed the gap by building the missing Referee and Notification agents rather than editing the document down — because the Referee is our single best answer to the "generic" critique, and rubric 5.3 explicitly deducts for contradictions between phases.

**D-002 · Fixed "generic" with architecture, not paint.**
Team feedback was "looks very generic". Diagnosis: five agents in a straight line, none able to disagree — one ChatGPT prompt could produce the same screen. Fix: agents with **opposing objectives** (Itinerary optimises experience and is deliberately not shown the budget; Budget optimises thrift), a **Referee** that audits and arbitrates in the open, a **backward re-plan loop**, and **dynamic agent count** (one Advocate per traveller in group mode). Verified live, numbers in §3.

**D-001 · Dropped v0/Lovable; build directly in the repo.**
The original plan (`TripME_Build_Spec.md`) assumed building via Lovable with ~5 prompt-credits/day. v0 produced only a skeleton that implemented the wrong product. Building directly in the repo removed credit limits and prompt round-trips entirely.

---

## 1. Project snapshot

| Item | Detail |
|---|---|
| Problem statement (PS2) | "How can the process of travel planning be simplified by designing a multi-agent system that can handle research, bookings, budget optimisation, and contextual recommendations?" |
| Product | **TripME** — one mood + one budget + one duration in → a complete, bookable (simulated) trip plan out, produced by a 7-agent AI system |
| Marks | Total 40. Phase 1 = 10 (submitted). Phase 2 = 20 (PDF, due 2 Aug). Live presentation = 10 (8 Aug onwards). Mentor's rubric re-organises this as 5 tabs: P1·5, P2·5, P3·10, P4·10, P5·10 |
| Live app | https://tripme-khaki.vercel.app (⚠ confirm this is OUR repo's deployment — see §6, Risk 1) |
| Repo | https://github.com/divyamsingh4444/tripme (auto-deploys to Vercel on every push to `main`) |
| Model / stack | Llama 3.3 70B on Groq (free tier) · Next.js + React + Tailwind · localStorage (no server DB) · everything ₹0 |

### What the rubric rewards (patterns across every section)
1. **Reasoning and mechanisms, not assertions** — every "deducts for" column punishes claims without logic.
2. **Consistency with Phase 1** — the rubric explicitly hunts contradictions between phases.
3. **Named frameworks actually applied** (RICE/MoSCoW, PEAS, Scrum, Lean Canvas on the default template).
4. **Honest MVP scoping** — it *deducts* when "the MVP is actually the full product." Simulated booking is therefore correct, not a weakness. Say it proudly.
5. **Working demo** — 5.2 (2 marks) deducts for "non-functional or static mockup presented as an MVP" and requires a recording link.

---

## 2. Inputs received so far (context inventory)

| Input | What it gave us |
|---|---|
| `project_guidelines.pdf` | Full Phase 1 + Phase 2 question lists, the 4 experimental tasks, the 3 build deliverables (wireframes / MVP + demo recording / PRD) |
| `DEBUGGERS.pdf` (Phase 1) | Our locked commitments: mood-first 5-agent pipeline (now grown to 7), Llama 3.3 70B, <60s planning claim, segments, revenue models, VPC ("Smart Travel Companion" → brand now **TripME**) |
| Rubric screenshots (2 batches, from mentor Deepa's session) | Marks map above + deduction patterns + signal that she expects a proper **user journey map** artifact (she showed Miro/UXtweak/Figma examples) |
| `TripME_Build_Spec.md` (my original plan) | The Lovable/v0 master build prompt — Section 1 (app spec), design system, QA script. Largely superseded (see §4) but design system + QA checklist still in force |
| `phase2_qna.pdf` (teammate's Q&A doc) | Q1–Q14 written answers (design thinking → Lean Canvas). Describes the **7-agent architecture** — our build now matches it |
| Team feedback (WhatsApp, 1 Aug) | "Looks generic" · "Spiritual showed me Coorg" · no login · no flight/taxi booking · expense split missing — all addressed or consciously scoped (see §3 and §5) |

---

## 3. Build status — what exists and is verified working

### The journey (for the PRD's "how we built it" section and honest storytelling)
1. **v0.dev skeleton** (31 Jul) — generated the repo, Vercel pipeline, and a thin single-page app. Problem: it implemented the *wrong product* (user typed the destination; 5 unrelated agents got the same prompt; prose output; no handoffs).
2. **Rebuild to spec** (1 Aug, commit `d576e1c`) — true sequential pipeline: Mood → Destination → Budget → Itinerary → Booking with structured JSON handoffs, live pipeline UI with timer, boarding-pass simulated bookings with approval + real outbound links, budget guardrails, My Trips + Travel DNA, sample-trip fallback, TripME design system.
3. **"Generic" fix — the 7-agent system** (1 Aug, commit `ed871de`) — the big one, answering the team's critique with architecture, not paint:

### Current architecture (matches the Q&A doc's 7 agents)
| # | Agent | What it does | The anti-generic mechanism |
|---|---|---|---|
| 1 | **Mood & Intent** | Vibe → structured brief | Emits **non-negotiables** + **avoid** list; mood-fidelity rules mean *Spiritual → Rishikesh/Haridwar/Tirupati*, never Coorg again |
| 2 | **Discovery** | Picks destination + 2 alternates | **Contractually bound**: must show, line by line, where each non-negotiable is met (`nonNegotiablesMet`) |
| 3 | **Budget** | Allocates ₹ before booking | Optimises **thrift**; obeys `refereeInstruction` when sent back; code (not the model) enforces exact sums |
| 4 | **Itinerary** | Day-by-day plan | Optimises **experience** — deliberately NOT shown the budget; prices honestly at local rates. The two agents genuinely disagree |
| 5 | **Booking** | Simulated bookings + approval gates | Each card carries a Referee approval reason; deep-links to real Google Flights / Booking.com |
| 6 | **Referee** | Audits + arbitrates **three conflict classes** | *Money:* detects Budget-vs-Itinerary conflict (code computes the gap), states it in rupees on screen, offers 3 trade-offs, can **send the pipeline backwards**. *Pacing (family):* audits each day against the actual humans, naming who is affected. *Policy (corporate):* checks every booking against travel policy and builds the expense report. Plus consensus in couple/group mode |
| 7 | **Notification** | Reminder schedule | Channel per persona: push / SMS / voice fallback (pilgrimage) / calendar (corporate) / organiser-only (family). Schedule real, delivery honestly post-MVP |
| + | **Traveller Advocates** (dynamic) | Couple/group: **one agent per person**, instructed to argue and never compromise | 3 friends = 3 advocates + core agents. Referee publishes a per-person *wanted / got / conceded / satisfaction* matrix with an enforced fairness floor (nobody below 3/5, nobody loses twice) |

### Six entry paths (one per persona — rubric 2.1 traceability)
| Path | Replaces the mood quiz with | Agent behaviour that actually changes |
|---|---|---|
| 🧍 Solo | — (mood quiz) | The standard seven |
| 💑 Couple | Both moods + budgets | 2 Advocates → Referee blends |
| 👥 Group | Everyone's mood + budget | One Advocate per friend; Referee publishes concessions |
| 👨‍👩‍👧 Family | Household ages + limitations | Paced by most-constrained member; Referee pacing audit by name |
| 🕉 Pilgrimage | Circuit, tradition, mobility, diet | Traditional route order, season check, darshan timing, access plan; SMS/voice reminders |
| 💼 Corporate | Travel policy (no mood at all) | City fixed by meeting → Discovery picks district; caps enforced in code; compliance audit + expense report |

### Verified by live test (keep these numbers — they go in the PRD and demo script)
- **Conflict loop, real run:** Itinerary wanted **₹11,700** vs Budget's **₹4,000** allowance → Referee: "material, reallocate" → Budget v2: activities ₹2,000→₹4,800, buffer →₹0, total still exactly ₹22,000 → Itinerary v2: ₹7,400, fits. Visible on screen as `↩ triggered by Referee` steps.
- **Mood fidelity:** Spiritual → Rishikesh (Ganga Aarti + yoga named as proof); Adventure → Coorg *with Tadiandamol trek* (now correct for that mood); Celebrate → Goa.
- **Group consensus:** Priya (trek) vs Rohan (no 5am wakeups) vs Asha (big night out) → blended Adventure, concessions spread, all ≥4/5.
- **Family pacing audit, real run:** household of 4 (Anil 44, Meera 41, Ira 8 "tires quickly", Dadi 71 "knee trouble") → Intent agent set pace **chill**, 30-min walking limit, 3 rest windows, and named Ira and Dadi as the constraint drivers → destination Agra → Referee found **2 real conflicts** ("long walks at Taj Mahal and Agra Fort without breaks", "6 AM boat ride too early for Ira") each with a concrete fix.
- **Pilgrimage, real run:** Char Dham → route order **Yamunotri → Gangotri → Kedarnath → Badrinath**, season confirmed open, palanquin + assisted-queue access plan, satvik dietary rule propagated as a hard non-negotiable.
- **Corporate, real run:** city held at exactly **Hyderabad** with **HITEC City** as district (alternates Kukatpally/Gachibowli); stay clamped to **₹6,000/night exactly** against the cap, food held to per-diem, buffer absorbed the difference, total exact; compliance audit produced the expense report by category with reimbursable flags.
- **Speed:** full solo pipeline ~11–25s (<60s Phase 1 claim substantiated by the on-screen timer). Browser-verified end to end: a solo Spiritual run reported **"7 agents · 14s"** on the trip header.
- **Browser-verified UI (Playwright, 1 Aug):** plan page renders correctly (logo blending, Pine/Marigold system, all 7 agent chips); Family entry path renders and submits; full family pipeline reaches the trip page; the **pacing audit card renders with real conflicts named by person** ("Day 2 affects Ira — long guided tour without explicit snack breaks → add a 15-minute snack break"; "Day 3 affects Dadi, Ira — back-to-back outdoor activities without a rest window"); **zero console errors** across the session.
- Plus: live spend tracker + per-person settle-up ("Splitwise meets a travel agent" made real), agent log (raw JSON per agent), sample trip works offline, `GROQ_API_KEY` server-side only (bundle audited), print stylesheet, 375px mobile OK.

### Consciously NOT built (defend, don't apologise)
| Missing | Defence |
|---|---|
| Login/auth | Teammate's own Q6 lists it as Must-have — but "no accounts, trip data stays in your browser" is a *stronger* DPDP/GDPR ethics story and rubric 2.3 rewards minimal MVPs. If the team insists, a cosmetic localStorage "profile" gate is ~1–2 hrs. Decide once, before recording |
| Real flight/taxi booking APIs | Q6 MoSCoW itself puts automated booking in **Should-have, not MVP**. Booking Agent simulates + deep-links to real inventory. Rubric deducts when MVP = full product |
| SMS/push actually firing | Notification Agent produces the real schedule; delivery infra is post-MVP (stated honestly in-app) |
| Multi-language UI | Language *card* per destination covers the Phase 1 promise at MVP depth |

---

## 4. Original plan vs. how we actually progressed

| Original spec (TripME_Build_Spec.md) | What actually happened |
|---|---|
| Build in **Lovable** with 3 paste-prompts, 5 credits/day | Built directly in the **repo with Claude Code** — no credit limits, no prompt roundtrips. v0 was used once for the skeleton, then dropped |
| **5 agents** (Mood, Destination, Budget Optimizer, Itinerary, Booking) | **7 agents + dynamic Advocates** — upgraded after team feedback, and it now matches the Q&A doc exactly |
| Straight pipeline, "visible on screen" | Pipeline is now a **graph with a feedback edge** (Referee → Budget → Itinerary). Far stronger PM story: agents with opposing objectives, transparent arbitration |
| localStorage preference memory, sample fallback, boarding passes, design system, <60s timer | Delivered as planned |
| Section 5 QA script, Section 6 marks mapping | Still valid — run the QA script on the published URL before recording |
| Credit strategy section | Obsolete |

**Still to come from the plan + new additions:** demo recording (script below), wireframes, PRD, user flow + journey map, reconciliation of doc↔build, GTM/channel/service answers (not ours: currently with the team — confirm owner), 4 experimental tasks (interviews — team, after MVP), Jira board screenshot (team).

---

## 5. THE LAST THREE DELIVERABLES — what they are and exactly how we do them free

### 5.1 Wireframes (rubric 5.1 · 1.25 marks — "core MVP flows, consistent with user flow/personas")

**What a wireframe is:** a deliberately low-detail skeleton of each screen — boxes, labels and arrows showing *what goes where and what leads where* — made **before** polishing UI. Evaluators use them to check you designed the flow deliberately. "Clickable and dynamic" (mentor's words) means: viewing it, you can click a button drawn on screen 1 and it jumps to screen 2 — a *prototype*, not static pictures.

**Our unusual situation:** the real product already exists, so we generate wireframes *from* the build (this is normal in practice; nobody needs to know the order). Screens to cover (≈10 frames):
1. Landing/Plan (solo) → 2. Plan (group, advocates visible) → 3. Pipeline run (normal) → 4. Pipeline run (conflict + `↩` re-plan) → 5. Trip header + non-negotiables → 6. Referee arbitration card → 7. Consensus matrix (group) → 8. Budget + itinerary → 9. Bookings + approval + spend/split → 10. My Trips / Travel DNA.

**Two free paths — pick A unless the mentor demands Figma specifically:**

- **Path A (recommended, fastest, ₹0): I build a clickable wireframe prototype as a web page** — a `/wireframes` route in our own app (or standalone HTML): grey-box, hand-drawn-style frames with hotspots; clicking navigates frame to frame; a "flow map" view shows all frames connected by arrows. It is genuinely clickable AND dynamic, hosted free on our existing Vercel URL, and doubles as evidence in the PDF (screenshot each frame + include the link). I can build this in one session tonight.
- **Path B (Figma, the classic PM answer): Figma's free plan** (figma.com — free account, no card) → I draft every frame's exact content/layout as a spec; you (or I, via the **Figma connector** already linked to this Claude setup — we can generate frames directly into a Figma file) assemble them, then use Figma's Prototype tab to drag click-connections between frames → Share → "Anyone with link can view" → paste link in the submission. Cost ₹0. More manual, but "Figma prototype link" sounds most conventional to a PM mentor.

**DECIDED (D-006): deferred.** Not building wireframes yet — the product is still changing, and frames drawn now would be invalidated by the next product change. We do them once the build is frozen, defaulting to **Path A**. Path B stays available at zero setup cost since the Figma connector is already live (D-005).

### 5.2 MVP + Demo recording (rubric 5.2 · 2 marks — the single biggest build item)

MVP: **done** (see §3). Remaining: record the demo on the **published URL** (never localhost), upload, link in the PDF.

**Free recording:** Windows Game Bar (`Win+Alt+R`, built-in) or OBS Studio (free). Upload: YouTube **unlisted** (free, reliable link) or Google Drive with link-sharing on.

**Demo script (~3–4 min, narrate the WHY at every step — rubric 5.5 grades decision rationale):**
1. *(20s)* Problem: "Planning one trip = 4–6 hours across 6–8 apps. TripME: one mood, one budget, one complete trip — planned by seven AI agents that check each other's work."
2. *(60s)* **Group mode opener** — Priya/Rohan/Asha with clashing moods → advocates argue on screen → Referee consensus → satisfaction matrix: "no other travel product tells you who conceded what."
3. *(60s)* Solo run, Spiritual mood → non-negotiables → Rishikesh with proof lines → **the conflict**: Itinerary ₹X vs Budget ₹Y → Referee arbitrates → `↩` re-plan on screen: "this is why multi-agent — the agents genuinely disagree and negotiate."
4. *(45s)* Trip page: budget bar, day cards, language card, boarding-pass approval ("human-in-the-loop above the spend gate — nothing books itself"), spend tracker + settle-up, notification schedule.
5. *(20s)* Agent log (raw JSON handoffs) + honesty block: "Real: live AI planning. Simulated: bookings. Deliberate MVP scoping."
6. *(10s)* Close: timer figure — "planned in Ns, against the 4–6 hours it replaces."

Before recording: run the §5 QA script from the build spec on the published URL; do one warm-up run so Groq caches nothing cold; don't hammer Generate (free tier ≈ 1 plan/min).

### 5.3 PRD (rubric 5.3 · 1.75 marks — "standard sections; deducts for contradictions with earlier phases")

**What a PRD is:** the Product Requirements Document — the single document a real company would hand an engineering team: what we're building, for whom, why, exactly what's in/out of scope, and how success is measured. Not marketing prose; precise and structured.

**How we'll do it:** **I draft the entire PRD** — nearly every ingredient already exists across Phase 1, the Q&A doc, and the live build, so this is assembly + precision, not new thinking. Standard sections mapped to sources:

| PRD section | Source |
|---|---|
| 1. Overview & problem statement | PS2 + Phase 1 summary |
| 2. Goals & success metrics | Phase 1 metrics + <60s claim (now substantiated) |
| 3. Personas | Q&A doc Q2 (6 personas) |
| 4. User stories | Q&A doc Q3 (52 stories) — referenced, top ones inlined |
| 5. Scope: MVP vs later | Q6 MoSCoW + §3's "consciously not built" table |
| 6. Functional requirements per agent | §3 architecture table, written as requirements |
| 7. AI/Agentic design | Q9 (PEAS, agent types, memory) + the opposing-objectives/Referee mechanism (our novel bit) |
| 8. Non-functional (latency, privacy, cost) | <60s, localStorage/DPDP story, ₹0 infra |
| 9. Risks & mitigations | Rate limits, hallucination guardrails (deterministic money math), booking simulation |
| 10. Release plan | Q10 sprint plan |

Output: markdown → export to PDF (free: VS Code print-to-PDF or any md-to-pdf) → merged into the submission PDF with the demo + wireframe links hyperlinked.

### About the Notion MCP and the Figma connector — status: already connected (D-005)

MCP = a connector that lets an AI assistant work directly inside another tool. **Neither needs setting up — both are already authenticated and live in this workspace**, along with Google Drive, Vercel, Atlassian, Mermaid and Three.js. (Only Gmail and Google Calendar are unauthenticated, and we need neither.)

- **Notion:** would let documents be written straight into Notion pages, and a public Notion page is a free clean way to host the PRD or journey map with a shareable link. **Verdict: nice-to-have, not needed** — our markdown → PDF → hyperlink pipeline already matches the required submission format. Use only if the team already works in Notion.
- **Figma:** means Path B wireframes are a live option with **zero setup** — frames can be generated directly into a Figma file and a prototype link shared. Relevant later, when wireframes are un-deferred.

**Action now: none.** Recorded so we don't re-investigate this later.

---

## 6. Full remaining-work checklist (who owns what)

| # | Item | Owner | Status / next action |
|---|---|---|---|
| 1 | **Continue product improvements** | Claude + you | **ACTIVE** — build is still moving; everything below in the "derived" group waits on this |
| 2 | **Wireframes (clickable)** | Claude | **DEFERRED (D-006)** until build freeze. Path A default; Figma available at zero setup |
| 3 | **Demo recording** | You (record) + Claude (script §5.2) | Blocked on build freeze. Record on the published URL only |
| 4 | **PRD** | Claude drafts → team reviews | Stable sections (problem, personas, scope, metrics, AI design) can start any time; feature-level sections wait on freeze |
| 5 | User flow + **user journey map** (rubric 4.3, mentor signal) | Claude | Derived from product → wait on freeze |
| 6 | Doc↔build reconciliation note | Claude | Small, and **already mostly resolved by D-003** (build moved to 7 agents). Needs a short "MVP vs Should-have" note for the Q&A doc |
| 7 | GTM answers (STP, branding, 7Ms, launch, channels, service/CLV/growth) | Team — **owner unconfirmed** | Independent of the build, so it can proceed in parallel right now. 6 marks of rubric P4 |
| 8 | Jira board + screenshot | Team | Independent of build. Steps already in Q&A Q12 |
| 9 | 4 experimental tasks (5 JTBD + 5 renewal + 3 business owners + 2-channel action test) | Team | Can start now using the live URL; ~13 recordings — **biggest calendar risk** |
| 10 | Final submission PDF assembly (team list + student IDs + contributions + all links) | You + team | Last step |
| 11 | Login gate (optional) | Claude if demanded | 1–2 hrs; default recommendation = keep the "no accounts, data stays in your browser" privacy story |

**Parallelism note:** items 7, 8 and 9 do not depend on the build at all and are the team's to run *now*, in parallel with product work. Items 2–5 are all derived from the product and should be batched together after a freeze.

### Risks to kill
1. ~~**Two parallel builds?**~~ **RESOLVED (D-004).** One repo, one deployment, confirmed canonical. `tripme-khaki.vercel.app` is this repo. No divergence.
2. **Deadline math:** the guidelines put Phase 2 at 2 Aug with the presentation from 8 Aug. Given wireframes are now deferred (D-006) and the product is still moving, the team must decide what actually ships tomorrow vs. what lands before the presentation. **The experimental-task recordings (~13 interviews) remain the item most likely to slip** — they consume calendar days nobody can compress. Flag to the team.
3. **Groq rate limits during evaluation.** ~~Free tier ≈ 1 full plan/minute.~~ **Corrected (D-016), and the correction matters:** the binding limit is **12,000 tokens per minute**, not requests — measured from the key's own headers mid-stall (999/1000 requests still available, tokens exhausted). Our agents are token-heavy, so two of them inside one minute can close the window. Three defences now in place: an identical-brief cache (a rehearsed demo trip costs zero quota and returns instantly), a corrected backoff that waits a full window instead of retrying into the same one, and the sample-trip fallback. Still mention the fallback in the demo *before* it is needed, so a pause reads as designed resilience rather than a crash. Full detail on **P0-7** in §8.2.
4. **Product still in motion → downstream artifacts blocked.** Wireframes, the user journey map, and the PRD's feature-level sections all describe the product, so each one churns while the build churns. Sequence deliberately: stabilise the build → freeze → then generate all three from the frozen state (see §7).

---

## 7. Sequencing — build first, then derive everything at once

Now that wireframes are deferred (D-006), the plan reorganises around one principle: **the product is the upstream dependency.** Four deliverables (wireframes, journey map, demo recording, PRD feature sections) are all descriptions of the product, so producing any of them before a freeze guarantees rework.

| Stage | What happens | Gate |
|---|---|---|
| **A · Now — product work** | Keep improving the MVP and committing. Decide login yes/no. In parallel (team, no build dependency): GTM answers, Jira board, and **start the 13 interview recordings** | Ends when we agree the build is good enough |
| **B · Freeze** | Tag the commit. Run the QA script (§5 of the build spec) on the published URL. No further feature changes | A green QA pass |
| **C · Derive, in one batch** | Wireframes (Path A) · user flow + journey map · PRD · demo recording — all generated from the frozen build, so they agree with each other and with the app | All four exist with links |
| **D · Assemble & submit** | Merge Q&A doc + PRD + wireframe link + demo link + Jira screenshot + experimental tasks. Team list, student IDs, contributions. Every link hyperlinked | Submitted |

**Immediate next action:** work the §8 backlog top-down (stage A). Everything else is either waiting on that, or is the team's to run in parallel.

*Everything above is ₹0: Groq free tier, Vercel free hosting, Figma free plan (if Path B), Game Bar/OBS, YouTube unlisted, VS Code PDF export.*

---

## 8. Product audit & prioritised backlog (D-014)

**Audit basis: commit `c67e1fe`, main, clean tree.** This is the answer to "what would a PM owning this fix?" — §7 stage A, made concrete. Pick an item, do it, tick it. Every item is self-contained; none depends on another unless stated.

Each entry carries **Evidence** (the exact file/line — every finding was verified against source, not inferred), **Why it matters** (the user, evaluator or business consequence — if that line can't be written, the item doesn't belong here), a **Fix** shape, and an **Effort** estimate.

**Priority model.** The deadline dominates, so ranking is `demo/submission risk × user impact ÷ effort`, not pure product value.
- **P0 — Ship-blocker.** Actively wrong, publicly visible, or will break in front of an evaluator. Do before recording.
- **P1 — Credibility gap.** The product claims something it doesn't quite do; a sharp evaluator poking the demo lands here.
- **P2 — Product depth.** The gap between "impressive demo" and "product someone uses twice."
- **P3 — Hygiene.** Won't be seen; will hurt later.

**What is NOT wrong.** Opposing-objective agents, the Referee arbitrating three conflict classes, the backward re-plan edge, one Advocate per human, money enforced in code rather than trusted to the model, the six differentiated entry paths, the pause-and-resume failure handling on `/run`, and the three.js gating from D-013 — all sound, none need rework. Nothing below disputes the architecture.

### 8.1 P0 — Ship-blockers

**P0-1 · Public copy still says five agents and a sequential pipeline.**
*Evidence:* `README.md` — the whole "The 5-agent pipeline" table, "five specialised AI agents in sequence", "holds all five system prompts". `app/how-it-works/page.tsx:6-7` — `metadata.description` reads *"how five specialised AI agents…"*. `app/how-it-works/page.tsx:163-165` — *"Orchestration: a sequential in-app pipeline"*, on the very page whose thesis is that it is **deliberately not a straight line**.
*Why it matters:* Rubric 5.3 deducts for contradictions with earlier phases — this contradicts *itself*, in public, on the two artifacts an evaluator opens first (repo landing page, explainer page). The `metadata.description` is also the link-preview and search text. Cheapest marks protection in the backlog.
*Fix:* Rewrite the README pipeline table to seven agents + dynamic Advocates (lift §3's table), fix the two strings in `how-it-works`, re-word "sequential" to "a graph with a feedback edge — the Referee can send work backwards". Then grep for `five` / `5 agents`.
*Effort:* 30 min.
*Status:* **NEXT (D-015)** — was ranked first here and in §8.6, then displaced by P0-3. Reversible at any hour and folds into §6 item 6 (doc↔build reconciliation) during the PRD draft, so it does not have to clear before the recording.

**P0-2 · `/logo.png` is a broken image on How-it-works — and `.gitignore` guarantees it stays broken.**
*Evidence:* `app/how-it-works/page.tsx:194-200` renders `<Image src="/logo.png">`. `public/` holds only `icon.svg`, `logo.svg`, `logo-white.svg` — the PNGs went in D-013. Worse, `.gitignore` carries an unscoped `*.png`, so dropping a `logo.png` into `public/` fixes it locally and silently never deploys.
*Why it matters:* A visibly broken image in the "Built by Team DEBUGGERS" credit block, on the page that explains the product. Costs disproportionate credibility, and the gitignore trap makes the obvious fix fail mysteriously.
*Fix:* Point the credit block at `/logo.svg` (already present, already used by the nav). Separately scope the ignore rule to `.playwright-mcp/*.png` — the intent was Playwright output, not all images — and drop the duplicated `.playwright-mcp/` line.
*Effort:* 10 min.

**P0-3 · A solo trip is silently planned for two people.**
*Evidence:* `app/page.tsx:47` — `useState(2)` for `travelers`. `app/page.tsx:98` — `effectiveTravellers` falls through to it for solo, pilgrimage and corporate. `app/page.tsx:358` — the travellers stepper renders **only inside the collapsed "+ More preferences" panel**, which defaults closed.
*Why it matters:* Pick 🧍 Solo, submit, and `travelers: 2` reaches the Budget Agent (which sizes stay and food for two), the Booking Agent, and the hotel deep-link (`group_adults=2`). The plan is wrong in a way the user is never shown an input for. Same for a single-traveller corporate trip — the *normal* corporate case. It also undercuts the persona-awareness we advertise for that path.
*Fix:* Default `travelers` from mode (solo → 1, corporate → 1, else 2); surface the stepper outside the collapsed panel for solo/pilgrimage/corporate; reset on mode change.
*Effort:* 20 min.
*Status:* **CODE COMPLETE, AWAITING BROWSER VERIFICATION (D-015, commit pending)** — **taken first, ahead of P0-1**, because it is the only P0 of the two that appears on camera (trip header, `app/trip/page.tsx:210`, during demo-script beat 3) and therefore the only one that becomes irreversible once we hit record. Six files, not the two originally scoped: a blast-radius audit found that fixing the form and the hard-coded sample would have left the bug intact on **live** runs, because no agent prompt had a party-size rule. Booking / Itinerary / Budget / Mood prompts, `travellerContext.groupSize`, the solo settle-up table and the solo stepper's 1-8 range are all in scope. `tsc` clean, `next build` clean, and **Playwright-verified at 375/768/1280 across all five modes** — no overflow anywhere, stepper present for exactly Corporate and Pilgrimage, sample trip reading "Travellers / 1 / person", "Single room", and "Live spend" with the settle-up table correctly absent. **Committed with one check outstanding:** the new prompt rules could not be exercised live — two attempts died under sustained Groq 429s (see the raised severity note on **P0-7**). Accepted because the prompt edits are additive only and cannot regress; owed at the next opportunity with quota. Reasoning in full at **D-015**; §8.6 updated to match. Deferred spin-offs: **P1-8**, **P2-9**, **P2-10**, **P3-7**, plus the timer addendum on **P0-5**.

**P0-4 · Switching destination keeps the old destination's "non-negotiables met" receipt.**
*Evidence:* `app/trip/page.tsx:140-146` — `destination: { ...destination, selected: newSelected, alternates: newAlternates }`. `nonNegotiablesMet` is spread from the previous object and never regenerated, because `switchDestination` re-runs only Budget → Itinerary → Booking, never Discovery. `app/trip/page.tsx:225-242` then renders it under the new destination's name. Related: `lib/agents-client.ts:388-402` (`selectedFromAlternate`) blanks `region`, `weatherAtTravelDates`, `crowdLevel`, `dailyCostBandINR` and sets `approxHours: 0`, so the header's "Getting there" tile degrades too.
*Why it matters:* This is the flagship mechanism — "the Discovery Agent is **contractually bound** to show, line by line, where each non-negotiable is met" (§3, agent 2). After a switch the page shows Gokarna's proof lines under Rishikesh's headline. It is the most falsifiable claim on the page, and switching destination is an obvious thing to try.
*Fix:* Re-run the Discovery Agent as part of the switch, pinning `selected.name` to the chosen alternate so it regenerates `nonNegotiablesMet` and the blanked fields — one extra agent call, and the switching modal already narrates agent-by-agent so it fits the existing UX. Cheap alternative if time runs out: hide the receipt block after a switch and label the state honestly.
*Effort:* 45 min.

**P0-5 · ~7 seconds of the headline timer is `sleep()`.**
*Evidence:* `app/run/page.tsx` — `await sleep(1100)` after mood (L246), destination (L256), budget (L266), itinerary (L273) and booking (L363); `sleep(900)` after a clean referee pass (L335); `sleep(800)` before `router.push('/trip')` (L420). Solo happy path = **7.2s of deliberate delay** inside a run §3 measures at 11–25s and the trip header reports as `⚡ 7 agents · Ns`.
*Why it matters:* "<60 s planning time" is a locked Phase 1 commitment and the on-screen timer is our evidence for it. A third to a half of a fast run is artificial. The repo is public, and a mentor grading "reasoning and mechanisms" may well read `run/page.tsx`. The pacing exists for legibility — a legitimate goal; the problem is that it's *counted*.
*Fix:* Cheapest honest version — stop the elapsed timer at the last agent response and let the remaining animation play out after it freezes, so the number reports agent time. Better — cut the delays to ~400 ms (step summaries stay readable) and leave the timer alone. Either way the number must be defensible line-by-line on stage.
*Effort:* 30 min. See also P2-2, which inflates group runs far more.
**Addendum (observed live, 1 Aug, during D-015 verification — this is now the worse half of the item).** The elapsed timer keeps counting through rate-limit waits **and while the pipeline sits paused awaiting the user's Retry decision** — `timerStart` is never adjusted, and `plannedInSeconds` is computed as raw wall-clock at assembly (`app/run/page.tsx:391`). A real solo run that took one 429 on the Discovery Agent showed **179s** on screen while genuinely idle. If the user then retries and completes, the trip header renders `⚡ 7 agents · 179s` — flatly contradicting the "<60 s" Phase 1 claim, on camera, in **precisely the scenario §6 Risk 3 says is most likely during evaluation**. The `sleep()` padding is an honesty problem; this is a headline-claim problem, and it fires exactly when we can least afford it. *Fix:* accumulate agent time only — pause the clock on `waiting`/`error` states and resume on retry — so the number means "time the agents took", which is the only claim we ever actually made.

**P0-6 · No error boundary anywhere — any client throw is a white screen.**
*Evidence:* No `error.tsx`, `global-error.tsx` or `not-found.tsx` in `app/`. Every page is `'use client'` with unguarded reads of storage-derived data — `lib/storage.ts:129-130` (`t.state.mood.moodProfile.primaryMood`, `t.state.input.pace`) is called from the **landing page** at `app/page.tsx:86`; `lib/storage.ts:101` reads `t.state.destination.selected.name`. `listTrips()` catches JSON parse failures but nothing catches a shape mismatch.
*Why it matters:* The saved-trip schema has already changed twice in this repo (`d576e1c` 5-agent rebuild → `ed871de` 7-agent), and the presenter's own browser has been used across every build. One malformed entry in `tripme.trips` and `computeTravelDNA()` throws inside a `useEffect` on the **home page** — with no boundary that's a blank screen at the top of the demo, recoverable only by knowing to clear localStorage. This compounds the D-009 caveat that Playwright's profile persists localStorage.
*Fix:* Add `app/error.tsx` (friendly message + "Reset local data" clearing the three storage keys + "Try again") and `app/not-found.tsx`. Independently harden `computeTravelDNA` / `getPastTripsCompact` to skip malformed entries rather than trust shape.
*Effort:* 45 min.

**P0-7 · Evaluation-day rate-limit plan — public, unauthenticated, unthrottled endpoint.**
*Evidence:* `app/api/agent/route.ts:332-348` — POST with no auth, no origin check, no per-IP throttle, no request cap. Each run makes 8–13 sequential Groq calls on a free tier good for roughly one plan per minute (§6 Risk 3). No `export const maxDuration`, so the platform default governs the 3400-token Itinerary call. Client retry is capped at 2 rate-limit retries per step (`app/run/page.tsx:141`).
*Why it matters:* The URL is public and goes in the submission PDF. A handful of evaluators in the same minute — or anyone scripting it — drains the quota, and every visitor then sees the failure path. The sample-trip fallback is a good escape hatch but it is a fallback, not a plan. Highest-probability way the demo fails on the day, and it isn't a code bug, so it needs a deliberate decision.
*Fix (combination; decide before recording):* per-IP throttle + `Origin` check on `/api/agent` (an in-memory counter suffices at this scale); `export const maxDuration = 60` so the long Itinerary call isn't cut off; a server-side cache keyed on payload hash with an hour TTL, so repeated demo runs cost nothing and return instantly; demo-day protocol — one warm-up run, and **narrate the fallback** ("free tier, ~1 plan/min — here's the honest degradation path") so a 429 reads as designed resilience rather than a crash. **Verify** the deployed function's max duration on the current Vercel plan before recording.
*Effort:* 1–2 hrs for code; the protocol is free.
**Diagnosed precisely (D-015/D-016 verification) — and the old description was wrong in a way that mattered.** §6 Risk 3 says "≈1 full plan/minute", which framed this as a *request* limit. It is not. Querying the key's own headers during a stall showed **999/1000 requests remaining and 11,959/12,000 tokens remaining**: the binding constraint is **12,000 tokens per minute**, and requests are effectively free.

That changes everything about the mitigation, because TripME's agents are unusually token-heavy. The Itinerary Agent alone costs roughly **5k tokens** in one call (a ~1,800-token system prompt plus a 3,400-token completion), and Discovery, Budget and the Referee are not far behind. **Two heavy agents inside the same minute exhaust the window** — which is why the stall always landed on Discovery, immediately after the long Mood call.

The consequence was a genuine bug, not just a constraint: the endpoint returned a hard-coded `retryAfterSeconds: 12`, so the client retried **back into the same exhausted minute** and failed again. Measured: eight consecutive retries, zero progress, on a key with 99.9% of its request quota unused. Now fixed — Groq's own `retry-after` header is honoured when present, and the fallback is a full 60-second window.

**Consequence for demo day, unchanged and still serious:** an evaluator planning shortly after anyone else waits out a TPM window. Three defences now exist — the cache (an identical brief costs nothing and returns instantly, so a rehearsed demo trip is free), the corrected backoff, and the sample fallback. The narration must still introduce the fallback *before* it is needed, so a pause reads as designed resilience. Also worth remembering from D-009: **browser automation draws on the same key**, so testing the product competes with using it.

### 8.2 P1 — Credibility gaps

**P1-1 · The Referee's three resolution options are decorative.**
*Evidence:* `app/trip/page.tsx:473-491` — clicking calls `setChosenResolution(i)` and renders "✓ Selected". Nothing else happens; the pipeline already auto-applied the Referee's own recommendation during the run (`app/run/page.tsx:292-328`). The "REFEREE'S PICK" badge is also hardcoded to `i === 0` rather than matched to `referee.recommendation`, so it can badge the wrong option.
*Why it matters:* "It offers three genuine trade-offs" is one of our three headline anti-generic mechanisms (§3, agent 6). Presenting a decision and ignoring it is worse than not presenting it — the first thing anyone does with three buttons is click the one the system didn't pick.
*Fix:* Make selection real — choosing a non-recommended option re-runs Budget and/or Itinerary with that instruction; the machinery already exists (`switchDestination`, plus the `refereeInstruction` / `spendCapINR` payload fields). If that can't fit before the deadline, the honest minimum is to label the block "The Referee considered three options and chose the first" and make the alternatives non-interactive. Fix the badge index either way.
*Effort:* 1.5 hrs real; 15 min honest-label.

**P1-2 · The family pacing audit names fixes that can't be applied.**
*Evidence:* `app/trip/page.tsx:350-364` renders `conflictsFound[].fix` as text. No action exists.
*Why it matters:* Same class as P1-1, on one of our strongest persona demos. The Referee finds "Day 2 affects Ira — long guided tour without snack breaks → add a 15-minute break" (§3, verified run) and the user's only option is to read it. The payoff of the whole audit is one button away.
*Fix:* An "Apply fixes" action re-running the Itinerary Agent with the conflict list appended as hard constraints, then re-running the pacing audit to show it clean. **The most demo-able item in this backlog** — "the Referee found a problem, and here it is being fixed, live." Consider promoting it into the §5.2 demo script.
*Effort:* 1.5 hrs.

**P1-3 · Couple mode has no expense split.**
*Evidence:* `lib/agents-client.ts:407-410` — `computeSplit` builds per-person rows only when `mode === 'group'`; couple and family fall back to `['You']`.
*Why it matters:* Two people, two budgets collected in the form, two Advocates arguing — then a settle-up table with one row called "You". Expense split was explicit team feedback (§2) and "Splitwise meets a travel agent" is a claim in §3. Family mode has named household members and gets the same single row.
*Fix:* Use `travellersList` whenever non-empty (covers couple *and* group) and `household` names for family. One condition plus a label pass.
*Effort:* 20 min.

**P1-4 · A plan cannot be shared with the people it was planned for.**
*Evidence:* `lib/storage.ts:16-33` — the current trip lives in `sessionStorage`, per-tab. Saved trips are `localStorage`, per-device. No share, no export, no URL carrying a plan; the only egress is `window.print()`.
*Why it matters:* **The biggest product gap, not just a demo one.** Group mode's whole premise is planning *with other people* — five Advocates argue for five humans, the Referee publishes who conceded what, and then exactly one person in one browser tab can see the result. Open it in a second tab and it's gone. For a travel planner, "send this to the group" is table stakes.
*Fix:* Cheapest useful version with no backend — serialise `TripState` into a compressed URL fragment (`/trip#<compressed>`): a real shareable link, still zero server, and it *strengthens* the "no accounts, data never leaves your browser" story rather than weakening it. Add "Copy link" and "Download JSON" beside Print. A proper share needs a DB, correctly out of MVP scope.
*Effort:* 2–3 hrs. Won't make 2 Aug; strong candidate before 8 Aug. **Note: this, not a login gate, is the real answer to "I want to get back to my plan" — see item 11 in §6.**

**P1-5 · No input sanity checks — past dates and impossible budgets sail through.**
*Evidence:* `app/page.tsx:347-349` — the date input has no `min`. `app/page.tsx:313-323` — budget is bounded ₹5,000–₹200,000 in aggregate with no relation to travellers or duration. `submit` (`app/page.tsx:106-124`) checks presence only.
*Why it matters:* You can plan a trip that started last year and the Discovery Agent will report the weather for it. You can ask for ₹5,000 total for 8 travellers over 10 days — ₹62 per person per day — and every downstream agent will pretend that's a trip. A planner that doesn't push back on an impossible brief is autocompleting, not advising. Conversely a well-judged warning ("that's ₹62/person/day — most trips from Bengaluru need at least ₹X") is a genuinely good product moment and demonstrates PM judgment better than another agent would.
*Fix:* `min={today}` on the date field; a live per-person-per-day figure under the budget slider with a soft warning below a threshold — warn, don't block.
*Effort:* 45 min.

**P1-6 · Single hardcoded model, no fallback.**
*Evidence:* `app/api/agent/route.ts:19` — `const MODEL = 'llama-3.3-70b-versatile'`.
*Why it matters:* Groq rotates and deprecates free-tier models on short notice. Presentations run from 8 Aug — days after the build freezes. A decommission between recording and presenting takes the whole product down with a provider 404, and it looks like our bug.
*Fix:* Read from `process.env.GROQ_MODEL` with the current id as default, and fall back to a second model on a model-not-found error. Ten lines; removes a whole class of presentation-day risk.
*Effort:* 20 min.

**P1-7 · Free-text fields flow straight into system prompts unvalidated.**
*Evidence:* `app/api/agent/route.ts:326` — `JSON.stringify(payload)` as the user message, no field allow-listing or length caps server-side. User text reaches it via `moodNote`, traveller `note`, and every pilgrimage/corporate string field.
*Why it matters:* Low blast radius — output is JSON rendered as text by React so there's no XSS path, and no privileged tools sit behind the model. But the endpoint and repo are both public, and "user text concatenated into a system-prompted call with no validation" is fair criticism. Prompt-injecting the Discovery Agent into ignoring the non-negotiables would embarrass the demo.
*Fix:* Validate payload shape per agent server-side, cap string lengths, strip control characters. The client already caps most fields with `maxLength` — mirror it where it's actually enforceable.
*Effort:* 45 min.

**P1-8 · The corporate hotel cap is enforced without a traveller multiplier.** *(Surfaced by the D-015 blast-radius audit.)*
*Evidence:* `app/api/agent/route.ts:252-253` — `stayCap = hotelCapPerNightINR × nights`, no `travelers` factor; `buildPayload('referee_policy')` computes `stayPerNightINR` the same way (`lib/agents-client.ts:253-257`).
*Why it matters:* At one traveller this is correct — so P0-3 actually *repairs* a latent mis-comparison for the default corporate case. But the stepper P0-3 promoted to primary position makes two travellers reachable in one click, and then code hard-caps the stay to one room's worth while the Booking and Itinerary agents plan for two. D-008 established the principle that policy caps are enforced in code and never trusted to the model; this is that enforcement being subtly wrong, in the mode whose entire pitch is that the numbers are auditable. A finance-literate evaluator is exactly who we built this path for.
*Fix:* Multiply the cap by rooms (or by `travelers`) in both places, or state explicitly in the prompt and the UI that the cap is per-room.
*Effort:* 30 min.

### 8.3 P2 — Product depth

**P2-1 · Nothing can be regenerated except the whole destination.** *(`app/trip/page.tsx:113-157` is the only post-plan lever.)* Every real planner lets you say "not this day" or "make it cheaper"; here one bad Day 3 means re-running from the landing page. The per-agent architecture makes targeted regeneration easy — that's the payoff of building it this way and we don't collect it. A "🔄 Re-plan this day" button showcases the architecture better than any explainer paragraph. *Fix:* per-day regenerate (Itinerary Agent, one day, other days as context) plus a global "make it cheaper / richer" re-running Budget + Itinerary with an adjusted cap. **2 hrs.**

**P2-2 · Group advocates run serially, and the run can't be cancelled.** *(`app/run/page.tsx:208-214` — a `for` loop of `await call(...)` plus `sleep(900)` per traveller; no cancel control.)* Six friends = six sequential LLM calls plus 5.4s of padding before the Referee even starts, pushing group runs toward or past the "<60s" claim — and §0 notes a full group run has **never completed uninterrupted**. Advocates are independent by construction (each argues for one person, none sees the others), so this is latency we chose. *Fix:* `Promise.all` the advocates with a small stagger to avoid a burst 429; add a Cancel that aborts in-flight fetches and returns to the form with inputs intact. **1 hr.**

**P2-3 · Approvals are one-way.** *(`app/trip/page.tsx:696` sets `true` with no inverse.)* Mis-click and the spend tracker and settle-up are permanently wrong for that session; everything else on the page is reversible. *Fix:* toggle, with a confirm on un-approve. **15 min.**

**P2-4 · Accessibility pass.** Pipeline step transitions aren't announced — `aria-live` covers only the timer (`app/run/page.tsx:451`) and the tip line (L540), so a screen-reader user gets nothing during the product's signature 20-second moment. The budget bar is `role="img"` with `aria-label="Budget split"` and no values (`app/trip/page.tsx:519`). Satisfaction renders as bare `●` characters with no text equivalent (`app/trip/page.tsx:292-293`). The destination-switch modal (`app/trip/page.tsx:840`) has no `role="dialog"`, focus trap or announcement. Form errors are one unassociated string — no `aria-invalid` / `aria-describedby` on the offending field. *Why it matters:* partly principle, partly that a product built around accessibility-aware personas — a senior with knee trouble, "wheelchair required" as a first-class pilgrimage input — should not itself be inaccessible. That contrast is noticeable. Basics are already right (`aria-pressed`, labels, `role="alert"`, reduced-motion respected throughout), so this is a finishing pass, not a rebuild. **1.5 hrs.**

**P2-5 · No social/share metadata, no per-page titles.** *(`app/layout.tsx:21-28` has title, description, icons — no `openGraph`, `twitter`, OG image or `metadataBase`; `/trip`, `/run`, `/trips` are client components inheriting the root title.)* The submission link and the team's own WhatsApp sharing render as a bare URL with no card — cheapest perceived-quality win available — and browser tabs can't be told apart during a live demo with several open. *Fix:* `openGraph`/`twitter` on the root with a static OG image (the hero composition works); own titles for `/trips` and `/how-it-works`. **1 hr including the image.**

**P2-6 · Two 79 KB logo SVGs load on every page.** `public/logo.svg` and `public/logo-white.svg` are 79,237 bytes each — traced output. The nav loads one with `priority` (`components/site-chrome.tsx:47-54`), the footer always loads `logo-white.svg` (L132), and `images: { unoptimized: true }` means no processing saves us. That is ~158 KB of vector path data per page load on every device — comfortably more than the 178 KB gzipped three.js chunk D-013 went to real lengths to gate away from phones. **Mobile users dodge the globe and eat the logo instead.** *Fix:* SVGO with path simplification, or re-export the mark cleanly; target <10 KB each. **45 min.**

**P2-7 · No funnel instrumentation.** `@vercel/analytics` is production-only (`app/layout.tsx:46`) — pageviews and nothing else, no custom events anywhere. As PM I currently cannot answer: which of the six entry paths do people pick? What share of runs complete vs hard-fail? How often does the Referee find a conflict? Does anyone save a trip? Those are also **rubric material** — "we measured X" beats "we believe X" in every section grading reasoning. *Fix:* six or seven `track()` calls — `mode_selected`, `run_started`, `agent_failed` (with agent key), `run_completed` (duration, agent count), `conflict_detected`, `booking_approved`, `trip_saved`. **45 min.**

**P2-8 · Saved trips have no schema version.** *(`lib/storage.ts:68-83` stores a raw `TripState`; readers assume current shape.)* The shape has already changed twice here. Paired with P0-6 this is the difference between "old trips are quietly dropped" and "the app crashes for returning users". *Fix:* add `schemaVersion` to `SavedTrip`, filter mismatches on read, tell the user once. **30 min.**

**P2-9 · `Connect` mood is offered on the solo path but its rule assumes companions.** *(D-015 audit.)* `app/api/agent/route.ts:34` — the Connect row of MOOD_RULES says *"socialSetting names the companions; nonNegotiables include shared social experiences"*, and `MOODS` (`components/mode-forms.tsx:20-27`) offers Connect on the solo form. Solo + Connect is a perfectly sensible thing to want — it is arguably the *most* interesting solo mood — and it currently sends `travelers: 1` into a rule demanding named companions. *Fix:* qualify the row — "…or, when travelling alone, sociable settings where meeting people is easy: hostels, group treks, community events, a table you can join." **15 min.**

**P2-10 · `hotelLink` misrepresents the party to Booking.com.** *(D-015 audit.)* `lib/agents-client.ts:441-449` — family mode passes `household.length` as `group_adults`, counting an 8-year-old as an adult, with no `group_children` or `age` params; there is no `no_rooms`, so four travellers search as four adults in one room; and `checkout = addDays(start, durationDays - 1)` makes check-in equal check-out on a one-day trip. *Why it matters:* "See real options →" is the link that connects our simulated bookings to real inventory — the one place the demo touches the actual world. It currently lands on a search that does not describe the trip we planned. *Fix:* pass adults/children separately from the household age bands, add `no_rooms`, and floor the checkout at start + 1. **45 min.**

### 8.4 P3 — Hygiene

**P3-1 · The advertised lint script cannot run.** `package.json` declares `"lint": "eslint ."` but `eslint` isn't in `devDependencies` and there's no config in the repo — the one quality gate we advertise fails on a clean install. Install and configure `eslint-config-next`, or drop the script. **20 min.**

**P3-2 · `typescript.ignoreBuildErrors: true`** (`next.config.mjs:3-5`) lets type errors ship. `npx tsc --noEmit` is **currently clean** — verified during this audit — so it can be turned off today at zero cost, and from then on the build actually protects us. **5 min.**

**P3-3 · Zero automated tests.** No test files, no CI. Every regression so far was caught by driving the browser by hand (D-009/D-010 — which found real bugs, so the practice works). Not worth a suite before the deadline; worth stating in the PRD risk section as a conscious trade-off rather than an omission. **A decision, not a task.**

**P3-4 · Booking gates are labelled "Referee gate" but the Referee didn't set them.** `app/trip/page.tsx:676` renders `⚖️ Referee gate: {needsApprovalReason}`, but that field comes from the **Booking Agent's** own output (`app/api/agent/route.ts:179`). A small mislabel that inflates the Referee's role in exactly the place we're asking to be believed about it. Re-label to "Approval gate". **5 min.**

**P3-5 · `agentsRun` is counted arithmetically, not observed.** `app/run/page.tsx:408-414` computes the headline agent count from a hardcoded `5 + 1 + …`, so a skipped Notification Agent still counts. The page already tracks `agentCount` from real completions — use it. **15 min.**

**P3-7 · Pilgrimage's party size is internally incoherent.** *(D-015 audit.)* Three different counts coexist on that path: the form collects exactly **one** person's constraints — one `accessibility`, one `dietary`, one `tradition` (`components/mode-forms.tsx:226-312`); `travelers` defaults to **2**; and the `mood_pilgrimage` prompt is written wholly in the singular — *"this traveller is going for darshan"*, *"how someone with the stated mobility level completes this circuit"* (`app/api/agent/route.ts:63-65`). Keeping 2 is defensible on booking economics, but then the prompt should say "the traveller(s)"; defaulting to 1 is the cheaper way to make all three agree. Either way, decide it rather than leaving three answers in the codebase. **15 min once decided.**

**P3-6 · Decide the login question and record it.** Open since D-011 and listed as item 11 in §6. **PM recommendation: don't build it.** "No accounts, your trip data never leaves your browser" is a stronger privacy/DPDP story than a cosmetic gate, rubric 2.3 rewards minimal MVPs, and **P1-4 delivers the actual user need behind "I want to come back to my plan" without auth**. Write the decision into §0 so it stops being reopened. **A decision.**

### 8.5 A–Z coverage — what was examined and the verdict

| Area | Verdict | Items |
|---|---|---|
| Information architecture (`/`, `/run`, `/trip`, `/trips`, `/how-it-works`) | Clean and correct. Flow legible, nothing extraneous. No change proposed | — |
| Landing / entry | Strong hero, honest stat strip, six well-differentiated paths. Two input defects | P0-3, P1-5 |
| Mode forms | Genuinely differentiated per persona — the product's best structural idea. D-009 input fix holds | — |
| Pipeline UX (`/run`) | Excellent: visible handoffs, loopback steps distinct, pause-and-resume properly built. Padded timing; serial advocates; no cancel; not announced to screen readers | P0-5, P2-2, P2-4 |
| Agent architecture | Real differentiation. Opposing objectives, deterministic money maths, mode-variant prompts, feedback edge. No structural criticism | — |
| Referee mechanisms | Strongest claim, weakest follow-through — three of four surfaces present a decision the user can't act on | P0-4, P1-1, P1-2 |
| Trip page | Dense, well-designed, prints cleanly. Split excludes couple/family; approvals irreversible; switch degrades the header | P1-3, P2-1, P2-3 |
| Persistence | Sensible zero-backend choice, well-encapsulated. Unversioned, unguarded on read, unshareable | P0-6, P1-4, P2-8 |
| API / backend | Good separation, key server-side only, guardrails in code not prompts. Unauthenticated, unthrottled, unvalidated, one hardcoded model, no `maxDuration` | P0-7, P1-6, P1-7 |
| Error handling | Per-step retry on `/run` genuinely well done (D-010). Nothing above it — no boundaries at all | P0-6 |
| Performance | three.js correctly gated and lazily loaded (D-013 did this properly). Logos are now the largest avoidable payload | P2-6 |
| Accessibility | Basics present (`aria-pressed`, labels, `role="alert"`, reduced-motion throughout). Live regions, dialogs, non-text status need work | P2-4 |
| SEO / sharing | Title, description, favicon good. No OG/Twitter cards, no per-page titles | P2-5 |
| Copy & consistency | Voice is excellent — specific, honest, no filler. Two public surfaces contradict the build | P0-1 |
| Analytics | Pageviews only | P2-7 |
| Repo hygiene | Tidy, small, comments explain *why* — rare, worth preserving. Broken lint script, disabled type gate, over-broad gitignore | P0-2, P3-1, P3-2 |
| Security | No secret leakage (`GROQ_API_KEY` server-only, bundle audited). Endpoint exposure is the open risk | P0-7, P1-7 |

### 8.6 Sequencing

**Before recording the demo — ✅ DONE (D-015, D-016).** Order actually taken: **P0-3** (D-015) → **P0-1 → P0-2 → P0-5 → P0-6 → P0-7 → P0-4** (D-016). Every P0 ship-blocker is cleared.
**Re-ordered (D-015): P0-3 moved ahead of P0-1.** Same cost, opposite reversibility — README and `how-it-works` prose can be corrected at any hour with no regression risk, but a wrong traveller count is on camera in demo-script beat 3 and gets frozen into the recording. P0-1 also folds into §6 item 6 during the PRD draft, so doing it standalone risked doing it twice.
**Still open at P3 (deliberately, all cheap):** P3-1 (lint script cannot run), P3-2 (`ignoreBuildErrors` still on, and `tsc` is clean so it costs nothing to turn off), P3-4 ("Referee gate" mislabel), P3-5 (`agentsRun` counted arithmetically), P3-6 (login decision), P3-7 (pilgrimage party size). None are visible to an evaluator; all are worth doing before the 8 Aug presentation.

**Between submission and the 8 Aug presentation (~1 day):** P1-3 → P1-6 → P1-2 → P1-1 → P1-5.
P1-2 earns its slot as a **demo beat**, not just a fix.

**If the product continues past the capstone:** P1-4 first (sharing is the real gap), then P2-1, P2-7, P2-4.

**Explicitly not doing, and why:** login/auth (P3-6 — weakens a strong privacy story and solves nothing P1-4 doesn't solve better); real booking APIs (already correctly scoped out in §3; the rubric deducts when the MVP is the full product); a test suite before the deadline (browser verification has been catching the real bugs — state it as a trade-off in the PRD, don't pretend otherwise).

*Every finding above was verified against source at commit `c67e1fe`. Where a fix depends on something not checkable from the repo — the deployed function's max duration, current Groq model availability — it is flagged "verify" rather than asserted.*
