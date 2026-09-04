# TripME — Q&A Preparation Document

Every answer here is grounded in the actual code and verifiable on the live product. Where an
answer can be *proved on screen*, the prompt says **Show:** — proving beats explaining.

**Three rules for answering:**
1. **Answer the question asked, in one sentence, then add one supporting detail.** Don't tour.
2. **If you can show it, show it** — the product is open in the next tab.
3. **Never bluff.** "That's on the funded roadmap — here's why we sequenced it there" is a strong
   answer. An invented capability that fails on stage is fatal.

---

## 1 · Architecture & orchestration

**Q: Walk me through what happens when I click "Plan my trip".**
The brief becomes a typed trip-state object. The client orchestrator calls `/api/agent` once per
stage: Mood & Intent → Discovery → Budget → Itinerary → Booking → Referee → Notification. Each call
sends only the slice of state that agent needs, and each agent returns validated JSON that is merged
back into the state. Between Itinerary and Referee, a **deterministic audit in code**
(`auditItineraryVsBudget`) compares the itinerary's real costs to the budget's allocation — if they
conflict, the Referee fires and can send the brief backwards to Budget, whose re-run then re-runs
Itinerary. **Show:** the run page streams each agent's decision live.

**Q: Is this LangGraph / CrewAI / AutoGen?**
No — written directly, deliberately. Seven nodes and one feedback edge is small enough that direct
code gives us exact control of what each agent is and isn't shown (the Itinerary Agent never sees
the budget total — that separation *is* the design). Graph runtimes earn their complexity at scale:
retries, checkpointing, observability across long-running graphs. That's the funded version, and we
can say precisely when we'd adopt one.

**Q: Why is the Referee triggered by code and not by a model?**
Because "is there a conflict?" is arithmetic, and arithmetic is exactly what we never delegate to a
model. Code computes the gap; the model's job is judging *how to resolve it* — absorb it into the
buffer, trim an activity, or accept the overrun — and grading its own finding ("at ₹50 this is
rounding, not a real conflict"). Detection is deterministic; resolution is judgment.

**Q: What exactly is a "typed handoff"?**
Every agent's output must match a declared JSON schema before it's accepted into trip-state. The
handoff is a contract, not a conversation — the next agent receives structured fields, never prose.
That's also why one model's schema quirk (see §10) could be caught and failed over instead of
silently corrupting the pipeline.

**Q: How do Traveller Advocates work?**
In group mode one Advocate agent is instantiated **per traveller** — five friends means five
Advocates, so agent count is dynamic. Each Advocate is explicitly instructed *not* to compromise:
"you represent exactly ONE traveller; compromise is the Referee's job, not yours." The Referee then
runs in consensus mode, blends the positions, and publishes the concession matrix with a fairness
floor — nobody concedes twice. Adversarial by design: honest compromise requires each position to be
argued at full strength first.

**Q: Why seven agents instead of one good prompt?**
Because a single agent optimising for both mood fidelity and budget compliance will silently trade
one against the other, and the traveller never sees the trade. Separation makes the trade-off
*visible and arguable* — that's the product. **Show:** the arbitration card states the conflict in
rupees with three resolutions.

---

## 2 · Models & prompting

**Q: Which models, and how were they assigned?**
Three, on Groq, assigned per agent by job:
- `llama-3.3-70b-versatile` — reasoning-heavy: Discovery, Itinerary, Budget
- `openai/gpt-oss-120b` — arbitration and long context: Intent variants, consensus, Referee
- `llama-3.1-8b-instant` — structural/short-form: Booking, Notification, Advocates, translation

Each agent also has its own **temperature** (0.3 for compliance/audit work up to 0.7 for consensus
creativity) and its own **failover chain** across all three models.

**Q: Why does translation run on the smallest model?**
Translation isn't a reasoning task, and the 8B bucket has by far the largest daily token allowance —
so translating a whole plan (several thousand tokens of Devanagari) never competes with planning for
quota. Model routing here is quota economics, not just capability.

**Q: How do you stop prompts from leaking bias?**
We learned this the hard way: the Booking prompt once contained a literal example — "like
`Bengaluru → Gokarna` overnight sleeper bus" — while the agent was never given the origin field. The
model did the only thing available and copied the example, so Bengaluru leaked into travellers'
reminders. The fix and the standing rule: no city is named in any prompt; the origin comes from the
payload; and we test from inputs the examples never mention (verified from Guwahati). **Any literal
example in a prompt is a potential default.**

**Q: How do you prevent hallucinated places?**
Retrieval, not memory: hotels and attractions come from OpenStreetMap/Overpass and Nominatim,
photographs from Wikipedia/Wikimedia — real, keyless, licensed. If no licensed photo of a small
guesthouse exists we show a map pin, not a stock photo of somewhere else. **Show:** "Real hotels
near…" cards with map and website links.

---

## 3 · Structured output & reliability

**Q: How do you force valid JSON out of the models?**
Three layers: the prompt declares the exact schema; the API call sets
`response_format: {type: 'json_object'}` (JSON mode); and the parser strips markdown fences as a
fallback. If a model refuses JSON mode entirely, the retry drops `response_format` and leans on
fence-stripping — because we discovered some models 400 on schemas others accept.

**Q: What does the failover actually catch?**
HTTP 429 (rate/quota), 400 (schema rejection), 413, 422, and 503. Originally it only caught 429 —
then gpt-oss returned 400 on a nested schema that Llama accepted, and the Pilgrimage path died in
production with an unhelpful "this agent hit a snag". Two fixes: broaden the failover, and replace
the generic error with the actual cause and next step. A failover you haven't watched fire isn't a
failover.

**Q: What's the real free-tier constraint?**
Not requests per minute — **tokens per day** (100k/day on the 70B), and it's visible only in the
429 response body, never in the rate-limit headers. That discovery drove the whole resilience
design: three per-agent chains (three separate daily buckets), an identical-brief cache (a rehearsed
demo brief costs zero quota), and four sample trips that need no model call at all.

**Q: What happens if all three models fail?**
The page names the failed agent and the reason, the rest of the plan survives, and the samples
remain a zero-quota path. Graceful degradation is a stated functional requirement (FR-20), not an
accident.

---

## 4 · Agentic-AI concepts (course mapping)

**Q: Where's the PEAS specification?**
In the Phase 2 doc — every agent has Performance / Environment / Actuators / Sensors specified.
Example: Referee — performance = conflict-resolution accuracy; environment = cross-agent state;
actuators = gates bookings, proposes alternatives, sends work backwards; sensors = multi-agent
outputs and spend thresholds.

**Q: Agent types — are these all the same kind of agent?**
No, and that's deliberate: Mood & Intent and Discovery are **goal-based**; Budget and Itinerary are
**utility-based** (they optimise across competing goals — cost vs quality, pacing vs coverage);
the Referee is utility-based **with explicit arbitration** layered on; Notification is a
**model-based reflex** agent (time trigger → alert, no deliberation). The post-MVP preference graph
is designed as a **learning agent** — out of scope because it needs longitudinal data we don't have.

**Q: What's the memory architecture?**
Four types, deliberately distinguished: **short-term** — trip-state within a session;
**episodic** — saved trips and Travel DNA in the browser, feeding the next plan's personalisation;
**semantic** — the agents' domain knowledge and our curated rules; **long-term cross-trip
learning** — designed (vector store) but post-MVP, because trips are local-only today.

**Q: Where's the human in the loop?**
At every escalation of stakes: every booking above the gate needs explicit approval; changing an
amount **revokes** its approval (consent is to a number, not a line item); confirming the trip is a
separate act from approving bookings; reminders are a third, separately opted-into act. Design rule:
*as much autonomy as the stakes can safely support, and no more.*

**Q: Is this really agentic, or AI-infused?**
Remove the agent layer and there is no product left — the agents allocate the budget, build the
plan, gate the spend, arbitrate the conflicts, and schedule the reminders. It's not a chat feature
bolted onto an app; the pipeline *is* the app. And the backward edge means agents don't just act —
they can reject each other's actions.

---

## 5 · Money & determinism

**Q: Can the model ever produce a number the user sees as a total?**
No. Allocations must sum exactly, caps are clamped, splits and re-prices are computed in
TypeScript (`lib/recompute.ts`). The model proposes items and judgments; code computes every rupee.
Rationale: arithmetic errors are exactly the class of error a user cannot detect.

**Q: How do approval gates work, precisely?**
Personal trips: any line item above **₹3,000** requires explicit approval. Corporate trips: the
policy's own threshold replaces that gate, per cost centre. Gates are *re-derived in code whenever
an amount changes* — so an approval given at ₹8,000 cannot silently survive a change to ₹14,000.
**Show:** change the stay tier and watch the approval reset.

**Q: What are the Referee's three conflict classes?**
Budget (itinerary cost vs allocation — the backward-edge trigger), mood/pacing (the family-mode
pacing audit, flagging problems by name for a child and a grandparent), and logistics/policy (the
corporate compliance audit with a reimbursable-by-row expense report).

---

## 6 · Data, privacy, security

**Q: Where is user data stored?**
Trips live in the browser — `localStorage` (`tripme.trips`, `tripme.current`) — and never leave the
device. A signed-in account stores only what Google returns: name, email, picture. Stated on the
sign-in page, not buried. Known cost, accepted deliberately: no cross-device continuity.

**Q: Where are the API keys?**
Server-side only. All model calls go through Next.js API routes; no key is reachable from client
code by construction. The public repo has no secrets — they live in Vercel env vars.

**Q: Why Auth.js + Google OAuth, and what's the test user?**
Identity is solved and security-critical — we hold no passwords and never see one. The gate sits at
*commitment* (confirm/save), never at planning. The password-less test user exists so any evaluator
can reach every gated feature — including you, right now.

**Q: DPDP / GDPR posture?**
The strongest position available: we don't collect trip data at all. What doesn't leave the device
can't be breached, subpoenaed, or sold. When server-side trips arrive (for cross-device sync), they
come with explicit opt-in — that's recorded as an open decision, not an assumption.

---

## 7 · Frontend & state

**Q: What's the stack?**
Next.js App Router + TypeScript + Tailwind v4 on Vercel, push-to-deploy on every commit to main.
Server routes and UI in one codebase — right-sized for a lean team, and it keeps keys server-side
by construction. The globe on the landing page is three.js, disabled on weak devices.

**Q: How do components stay in sync (bell, trips list, totals)?**
A single trip-state object is the source of truth; saves are **upserts** keyed by `tripId` (an
earlier defect minted a new id per save — one trip once produced six cards), and a
`tripme:trips-changed` event tells every listening component to re-read. Reminders are *derived* from
confirmed trips at read time — there's no separate reminder store to drift out of sync.

**Q: Six endpoints total — what are they?**
`/api/agent` (the pipeline), `/api/auth` (Auth.js), `/api/translate`, `/api/nearby` (OSM),
`/api/place-image` (Wikipedia, search-first with a 24h in-process cache), `/api/email-trip`
(Resend — sends only to the signed-in address; it cannot be pointed at an arbitrary email).

---

## 8 · Translation & i18n

**Q: How does seven-language support actually work?**
Two layers. A hand-written dictionary covers the chrome instantly. Everything the *agents* wrote —
itinerary, Referee ruling, tips — goes through `/api/translate` in chunks of 20 strings, on the 8B
model with the same failover chain, **after generation completes**. Agents reason in one language;
the traveller reads in another. Rules enforced in the prompt: same array length and order, ₹ amounts
and dates untouched, brand name in Latin script, a glossary so "Referee" translates as arbitrator,
not sports official.

**Q: Why is a full-page translation slow (~100s)?**
Free-tier tokens-per-minute throttling on several thousand tokens of Indic script — it's a
limitation we state rather than hide. Demo practice: switch language *before* opening a plan.

---

## 9 · Testing & QA

**Q: How do you test a non-deterministic system?**
Two failure modes, tested differently. Software defects: conventional suites plus QA stories
distributed one per sprint (not batched at the end). AI failures: per-agent offline regression
suites of input/output pairs re-run before any prompt change (a tweak that fixes one scenario can't
silently break ten); structured logging of every decision and handoff — the raw JSON agent log ships
on every trip page, so a wrong plan can be traced to the exact agent that introduced the error; and
moderated UAT with 5–8 real users. Grounding via OSM/Wikipedia handles the hallucination axis;
human approval gates handle the high-stakes axis.

**Q: What's your regression story for prompts specifically?**
Prompts are code: versioned in git, and the decision log records *why* each prompt rule exists —
several exist because of specific production incidents (the origin leak, the schema 400). A prompt
rule that depends on information the agent is never given is a comment, not a safeguard — that
lesson is written down because we made the mistake.

---

## 10 · Edge cases — "what if I…" during the demo

| If they… | What happens |
|---|---|
| Type gibberish as the vibe | Mood is a required structured choice; free text only enriches it. The Intent agent quotes back only what was actually expressed. |
| Ask for Paris | Named at the form as out-of-scope, carried as an explicit field; Discovery must open by explaining the India substitution. Never silent. |
| Change a price after approving | The approval is revoked — re-derived in code on every amount change. |
| Reject the hotel, then confirm | Confirm rebuilds the reminder schedule from accepted choices only; a rejected hotel can never appear in a reminder. |
| Kill the network mid-run | The failed agent is named with the reason; completed agents' output survives; samples remain a zero-quota path. |
| Open it on a phone | Full functionality at 390px — nothing removed except Print. |
| Refuse to sign in | Everything up to approval works signed out; the gate is at commitment, not entry. |
| Ask "is this booking real?" | The card itself says DEMO — NO REAL RESERVATION; the deep link beside it goes to real inventory. |
| Run the same brief twice | Identical-brief cache returns instantly — that's deliberate (quota), and why the demo brief differs from the rehearsal brief. |

---

## 11 · Product, metrics, business

**Q: Who do you launch to, and why not all six personas?**
Solo and couples first — fastest decision loops, where mood-first is most differentiated. Groups and
families at month 3+. Pilgrimage waits for voice/large-text (marketing a path we haven't made
accessible would be dishonest growth); corporate is a separate B2B motion, not a campaign.

**Q: How will you make money?** *(nothing is monetised today, by design)*
In expected order: booking commission (1–3% flights/hotels, 15–25% activities); freemium→Pro (group
splitting, cross-trip analytics); affiliate placements for curated heritage experiences; early-bird
whole-plan lock-in — novel because it prices the *whole plan*, not one flight; and a corporate tier.
Phase 1 is validation-first: charging before product-market fit measures willingness to pay for a
promise, not a product.

**Q: Your key metric?**
Plan completion rate — did the brief become a plan the user read. The most *interesting* one is
**Referee comprehension**: can more than half of testers explain what the arbitration did? It tests
whether the differentiator is understood, not merely present. And the dashboard ships before the
first beta user — a launch cannot be measured retroactively.

**Q: Competitors — what stops MakeMyTrip from copying this?**
The wedge isn't the mood quiz — it's the arbitration layer and the trip-state schema: reconciling
five people's moods into one defensible plan, publicly, held to a budget in code. OTAs start where
you already know the answer; we start at the question. Search returns options; we return a decision
with reasoning attached. Hardest to copy: the willingness to show disagreement — an inventory
business is structurally incentivised to hide it.

**Q: Under-60-seconds — real?**
Measured and printed on every plan by the product itself: 34s on samples, 58s on a live nine-call
run that included a Referee re-plan. The counter measures agent time and says so on screen —
excluding free-tier queueing and the deliberate readability pauses. We publish the definition with
the number.

---

## 12 · Roadmap & scaling

**Q: What breaks first at 1,000 users/day?**
Free-tier inference quota — by design, that's a paid-tier switch, not a re-architecture: the
failover chain and per-agent routing carry over unchanged. Next: in-process caches (place images)
move to a shared cache; then localStorage-only trips block cross-device sync — that's the recorded
"under review" decision requiring explicit opt-in. The 100k-concurrent-user target is honestly
flagged as unvalidated at current architecture.

**Q: What would you build next with funding?**
In order: real booking execution behind the *same* approval gates (adapter layer over
Amadeus/Travelport, Uber/Ola, IRCTC — no agent depends on a vendor); push/SMS/voice delivery (the
Notification Agent already chooses channels per persona; delivery needs infrastructure); voice +
large-text (pilgrimage accessibility); live price-monitoring agent (today a price change revokes
approval — reactive; tomorrow an agent watches); cross-trip preference learning on a vector store.

**Q: What would you do differently?**
Two things, recorded in our retro: plan for traveller override from Sprint 1 — Sprint 7 taught us a
plan you can't change is a demo, not a product; and instrument the funnel from day one.

---

## 13 · Hostile / curveball questions

**"Isn't this just ChatGPT with extra steps?"**
Ask ChatGPT to plan a trip and change one hotel: the total doesn't re-price, nothing gates the
spend, no second model audits the first, and yesterday's budget is forgotten. Our agents disagree
with each other in public and the money is enforced in code. The extra steps *are* the product —
and we can show the Referee rejecting another agent's work on the live site.

**"Did AI write your code?"**
We used AI tools as accelerators, like every modern team — and every design decision, trade-off and
failure is ours and documented: a continuously-maintained decision log records why each choice was
made, including the mistakes (the origin leak, the schema 400, the approval-revocation gap). Ask us
about any decision in the product and we can give you the why, not just the what.

**"Your bookings are fake. Isn't this vaporware?"**
Simulated *and labelled* — on each card, not in fine print. Real payments before validation would
put PCI scope and refund liability ahead of learning, and every card deep-links to real inventory
so intent-to-book is still measurable. We'd rather be honest about one gap than quietly fake five.

**"Only 5 JTBD interviews — is that valid research?"**
Five moderated JTBD interviews is standard early-discovery practice (saturation on the big themes
came fast: fragmentation, post-hoc expense tracking, group deadlock), and it was triangulated with a
landscape scan and two channel experiments. It sized the problem; the beta cohort's behavioural
metrics — not interviews — validate the solution.

**"What's genuinely novel here?"**
Three things we haven't seen together elsewhere: a *deterministically triggered* arbiter with a
backward edge (code detects, model resolves, work re-runs); per-traveller Advocate agents with a
published concession matrix and fairness floor; and honesty implemented as reusable UI components
(DEMO / est. / GATE chips) rather than disclaimers. Plus a discipline: money never touches a model.

**"Why should we believe the demo isn't cherry-picked?"**
Because you can run it yourself, right now, signed out, on your phone — and the wireframes deck maps
every claim in our submission to the screen that evidences it. We also ship the raw agent log on
every trip page. Cherry-picking is hard when the audit trail is a feature.
