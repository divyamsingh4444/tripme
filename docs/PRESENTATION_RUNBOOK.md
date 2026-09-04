# TripME — Presentation Runbook

**Deck:** `docs/TripME_Presentation.pptx` · 6 main slides + title-break + 5 appendix slides for Q&A
**Limit:** 5 minutes hard. The script below runs ~4:45 at a normal speaking pace.

---

## Speaker plan (6 people, 5 minutes)

Six speakers in five minutes means ~50 seconds each and five handoffs — risky. Recommended: **three
presenters, three Q&A leads**. Everyone owns a domain, so every member speaks either in the
presentation or in Q&A, and handoffs stay minimal.

| Role | Slides | Suggested owner* |
|---|---|---|
| Opener — problem & solution | 1, 2, 3 | one confident opener |
| Core — the live proof | 4 | whoever knows the agent pipeline deepest |
| Closer — shipped, metrics, next | 5, 6 | one crisp closer |
| Q&A lead — tech & architecture | Appendix A1, A2 | |
| Q&A lead — testing, challenges, ethics | Appendix A3, A4 | |
| Q&A lead — GTM, metrics, prioritisation | Appendix A5 + Phase 2 doc | |

*Assign names in your team sync. Handoff lines are scripted below — say them exactly; fumbled
transitions cost more time than long sentences.

---

## The script (~4:45)

### Slide 1 — Title (0:00–0:20)

> "Good morning. We're Team DEBUGGERS, and this is **TripME** — one mood, one budget, one complete
> trip. Everything you'll see in the next five minutes is **built and live** — the QR on screen goes
> to the deployed product."

### Slide 2 — Problem (0:20–1:05)

> "Planning one Indian trip today means six to eight apps that never talk to each other. Four things
> break: the budget is a hope, not a rule — estimated before, reconciled after, never enforced
> during. Groups fail at *agreement*, not booking. Recommendations are black boxes. And you re-enter
> the same context everywhere.
>
> We didn't imagine this — five jobs-to-be-done interviews confirmed every one of these, and one
> line stuck with us: nobody trusted a recommendation they couldn't question.
>
> So our hypothesis: a mood-first, single-app experience — reasoning visible, budget certain,
> trade-offs argued in front of you — beats the fragmented process."

### Slide 3 — Solution (1:05–2:05)

> "The answer is seven specialised agents with typed handoffs. Mood and Intent turns a feeling into
> a structured brief. Discovery picks a destination and shows its evidence. Budget allocates. Itinerary
> plans the days. Booking prepares gated, simulated bookings. And then the one that matters — the
> **Referee** — audits the others and can send their work **backwards**. That backward edge is what
> makes this a system, not a sequence of prompts.
>
> Two design rules govern everything. First: **LLM for judgment, code for money** — a model never
> touches arithmetic. Second: the traveller gets the last word — change anything and the whole trip
> re-prices in code, and any approval on a changed amount is revoked.
>
> [handoff] And we can prove the backward edge is real — because we caught it on camera."

### Slide 4 — The proof (2:05–3:20) ← the money slide, take your time

> "This is a real, live run on the deployed product — solo traveller, Relax mood, twenty-five
> thousand rupees, from Pune. Watch the middle of the stream: the Referee audited the Itinerary
> Agent against the Budget Agent, found ten thousand rupees of activities against a five-thousand
> allocation — and **rejected the work**. You can see 'triggered by Referee': the Budget Agent
> re-planned, the Itinerary Agent revised to fit. Nine agent calls instead of seven, 58 seconds of
> agent time, and the finished plan carries the badge 'Re-planned by Referee'.
>
> Nothing here is staged — this happened unprompted while we were capturing screens.
>
> And in group mode this same Referee arbitrates between one Advocate agent per traveller and
> publishes exactly who conceded what, with a fairness floor we can quote: *nobody concedes twice*."

### Slide 5 — Shipped & honest (3:20–4:05)

> "The MVP is complete: eighteen features, all six travel paths, seven languages — including
> translating what the agents themselves wrote — at **zero infrastructure cost**, on free tiers with
> three-model failover.
>
> And it tells the truth about itself. Every booking is labelled 'demo — no real reservation'.
> Every price is marked as an estimate, with the reason stated. India-only isn't fine print — it's
> enforced inside the pipeline. We think honesty is a feature, and it's built in, not written down."

### Slide 6 — Outcomes & close (4:05–4:45)

> "How do we know it works? The product instruments itself — agent time prints on every plan,
> 34 to 58 seconds against our under-60 target. Our validation gates: seventy percent plan
> completion, half of testers able to explain what the Referee did, thirty percent overriding
> something — because a plan you change is a plan you own.
>
> Next, in order: launch to solo and couples only; real bookings behind the same approval gates;
> voice and large-text before we market to pilgrims; then monetise.
>
> That's TripME — one mood, one budget, one complete trip. It's live right now — scan the code, and
> we're happy to take questions."

---

## Q&A crib sheet

Evaluators were explicit: implementation, challenges, assumptions, edge cases, metrics, future.
Every answer below is true and demonstrable — most map to an appendix slide or a live screen.

### Implementation

**"How is this actually orchestrated — LangGraph?"**
No — deliberately. Seven nodes with one feedback edge is simple enough that direct code (typed
handoffs between server routes, a deterministic audit deciding when the Referee fires) is easier to
reason about and demonstrate. LangGraph-class runtimes are on the funded roadmap for retries,
checkpointing and observability at scale. *(Appendix A2)*

**"Which models, and why three?"**
Llama-3.3-70B for reasoning-heavy agents, gpt-oss-120B for arbitration, Llama-3.1-8B for structural
work — each agent runs the model that suits its job, with an ordered failover chain across all
three. The chain exists because free-tier limits are real: the binding constraint turned out to be
tokens-per-day, visible only in the 429 response body. *(A2, A3)*

**"How do you stop the model hallucinating a hotel?"**
Places are resolved against OpenStreetMap and Wikipedia — retrieval, not model memory. If no
licensed photo of a guesthouse exists we show a map pin rather than a stock photo of somewhere else.

**"Is any money computed by the model?"**
Never. Allocations, splits, re-pricing, thresholds — all deterministic TypeScript. The model
proposes; code decides. That rule exists because arithmetic is exactly the kind of error a user
cannot detect.

### Challenges faced (they will ask — lead with a real one)

1. **Quota death mid-build** — discovered tokens-per-day was the real free-tier limit; built the
   three-model failover and verified it with the primary model fully exhausted.
2. **A 400 on a nested schema** — one model rejects a schema another accepts; it took the
   Pilgrimage path down in production. Failover now covers 400/413/422/503, not just 429.
3. **A few-shot example leaked into output** — the Booking prompt contained "like Bengaluru →
   Gokarna…" and the agent was never given the origin field, so Bengaluru appeared in travellers'
   reminders regardless of what they typed. Fix: origin in the payload, no city named in any prompt.
   Verified from Guwahati — as far from Bengaluru as India allows. Lesson: any literal example in a
   prompt is a potential default.
4. **Approvals survived price changes** — approve ₹8,000, end up confirming ₹14,000. Now a changed
   amount revokes its approval: consent is to a number.
5. **Invisible features** — confirm, reminders and email were all deployed and all invisible behind
   an unsignposted gate chain. A gate that hides what's behind it is indistinguishable from a
   feature that was never built — hence the four-step stepper. *(all on Appendix A3)*

### Assumptions & decisions

**"Why simulated bookings?"** Real transactions would put PCI scope and refund liability in front
of validation, and make the MVP the full product. Every card deep-links to real inventory so intent
is still testable. It's labelled in the product, not just in the doc.

**"Why India-only?"** Prices, languages and local knowledge are all Indian — scope we can be
excellent in. It's enforced in the pipeline: an out-of-scope request is named at the form and
Discovery must explain the substitution. Never silent.

**"Why localStorage instead of a database?"** A privacy position, not an absence: trips never leave
the device; an account stores only name, email, picture. Known cost — no cross-device continuity —
accepted deliberately and stated on the sign-in page.

**"Why did the MVP grow to 18 features?"** It didn't grow by creep — Sprint 7 was added on
evidence: a plan the traveller cannot change is a demo, not a product. The re-scoring is documented
in the prioritisation section (RICE → MoSCoW → Value/Complexity, three lenses had to agree).

### Edge cases

- **Vague mood input** → the Intent agent asks the path-specific quiz; free-text vibe is optional.
- **No destination match / out-of-scope ask** → named at the form, explained by Discovery.
- **Agent fails mid-pipeline** → failover across three models; if a stage still fails, the page
  names the agent and the reason, and the rest of the plan survives.
- **Quota exhausted during this very Q&A** → four sample plans open with zero model calls. (Also
  our demo insurance.)
- **User rejects a hotel then confirms** → confirming rebuilds the reminder schedule from accepted
  choices only; reminders can never name a rejected hotel.
- **Two travellers, contradictory moods** → two Advocates; the Referee blends and publishes the
  concessions.

### Metrics & outcomes

Targets: >70% plan completion · median <60s agent time (measured on-screen: 34–58s) · >50% Referee
comprehension · >30% override · >25% confirm · >20% 30-day return. The dashboard ships **before**
the first beta user — a launch cannot be measured retroactively. Referee comprehension is our
favourite: it tests whether the differentiator is *understood*, not just present.

### Future improvements

In order: real booking execution behind the same approval gates → voice input and large-text mode
(owed before pilgrimage acquisition is honest) → live price monitoring (today a price change revokes
approval; tomorrow an agent watches prices) → cross-trip preference learning (requires revisiting
the local-only storage stance with explicit opt-in) → monetisation: commission, Pro tier, early-bird
whole-plan lock-in.

### If someone challenges the "under 60 seconds" claim

The product measures it and prints it on every plan: agent time, excluding free-tier queueing and
the deliberate pauses that make handoffs readable — and it says so on screen. 34s on samples, 58s
on a live nine-call run that included a Referee re-plan. We publish the definition with the number.

---

## Logistics checklist

- [ ] Present from the PPTX; keep `tripme-khaki.vercel.app` open in a browser tab behind it
      (sample plans loaded — zero-quota insurance if asked for a live demo)
- [ ] One rehearsed brief ready (cached → instant) in case they ask to see the pipeline run
- [ ] Do NOT sign in with Google on stage — test-user button only (consent screen still in Testing)
- [ ] Time a full run-through twice; cut from slide 5's narration if over
- [ ] Decide the three presenters and three Q&A leads **before** the day
