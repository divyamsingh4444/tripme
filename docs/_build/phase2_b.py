"""Phase 2 submission — sections 4 to 9."""

from docxkit import bullets, callout, h1, h2, h3, page_break, para, placeholder, table


def build(doc):
    # ------------------------------------------------------------------ 4
    page_break(doc)
    h1(doc, '4 · Will you handle design and development internally or outsource?')
    callout(doc, 'Decision:',
            'hybrid — **build the agent orchestration and the experience in-house, outsource commoditised '
            'infrastructure.** The test applied to every row was: does building this ourselves create defensibility, '
            'or does it only consume a lean team\'s time?')
    table(doc,
          ['Component', 'Build / Outsource', 'Why'],
          [
              ['Seven-agent orchestration and the typed handoffs between them', 'Build',
               'This is the entire differentiation. A pipeline where agents can reject each other\'s work cannot be '
               'bought off the shelf.'],
              ['Referee arbitration, group-consensus and the fairness floor', 'Build',
               'No library reconciles five people\'s moods into one plan, or audits an itinerary against a household.'],
              ['Money guardrails — allocation, approval gates, policy caps', 'Build',
               'Correctness here is the product\'s credibility. It is enforced in our own code rather than trusted to '
               'a model.'],
              ['LLM inference', 'Outsource (hosted API)',
               'Hosting or training models is not our competency. We consume them over an API and route per agent.'],
              ['Real place and photography data', 'Outsource (free public APIs)',
               'OpenStreetMap, Nominatim and Wikipedia already hold this, openly licensed. Rebuilding it would be absurd.'],
              ['Flight, hotel and transport inventory', 'Outsource (adapter layer)',
               'Direct provider relationships take years. Integrate via Amadeus/Travelport, Uber/Ola and IRCTC behind '
               'one internal adapter so no agent depends on a specific vendor.'],
              ['Front end and experience design', 'Build',
               'Central to how the product feels, and it has to iterate in lockstep with agent behaviour.'],
              ['Authentication', 'Outsource (Auth.js + Google)',
               'Identity is solved and security-critical. We hold no passwords and never see one.'],
              ['Payment processing', 'Outsource',
               'PCI scope and fraud liability are disproportionate for a lean team. Razorpay or Stripe when payments exist.'],
              ['Notification delivery infrastructure', 'Outsource (managed)',
               'Push and SMS gateways are mature. We own the scheduling logic; we should not own the pipes.'],
              ['Customer support tooling', 'Outsource initially',
               'Freshdesk or Zendesk until volume justifies anything else.'],
          ], widths=[1.7, 1.35, 3.55])

    para(doc,
         '**Rationale.** A team of four or five has to concentrate engineering effort where defensibility is created: '
         'the orchestration, the arbitration logic and the experience that makes seven agents feel like one product. '
         'Payments, identity, model hosting, provider APIs and delivery pipes are already solved and, in several '
         'cases, regulated. Building them would burn the scarce resource — time — for zero differentiation and real '
         'compliance risk.')

    # ------------------------------------------------------------------ 5
    page_break(doc)
    h1(doc, '5 · What are the tech capabilities in your team, and how did they shape the tech choices?')
    para(doc,
         'This section is written twice on purpose: **what was actually built**, and **what a funded version would '
         'use**. Conflating the two is how a capstone ends up claiming infrastructure it does not have.')

    h2(doc, '5.1 What is actually running today')
    table(doc,
          ['Layer', 'What we used', 'Why this, for this team'],
          [
              ['Front end', 'Next.js (App Router), React, Tailwind CSS, three.js',
               'Existing React familiarity, no upskilling cost, and server and client in one codebase for a lean team.'],
              ['Agent orchestration', 'Typed handoffs between server API routes, orchestrated client-side, with a '
                                      'deterministic audit that decides when the Referee fires',
               'The pipeline is a graph with a feedback edge. We wrote it directly because we needed exact control of '
               'what each agent is and is not shown — the Itinerary Agent never sees the budget, and that is the '
               'whole design.'],
              ['Models', 'Groq — llama-3.3-70b-versatile, openai/gpt-oss-120b, llama-3.1-8b-instant, with per-agent '
                         'failover chains',
               'Each agent runs on the model that suits its job. Any model refusing hands the work to the next, so a '
               'busy free tier no longer ends a plan.'],
              ['Money and policy logic', 'Plain TypeScript, server- and client-side',
               'The model proposes; code guarantees. Allocations sum exactly, caps are clamped, approval gates are '
               're-derived whenever an amount changes.'],
              ['Storage', 'Browser localStorage and sessionStorage; Supabase only for accounts, and only if configured',
               'Trips never leave the device. This is a deliberate privacy position, not an absence of a database.'],
              ['Identity', 'Auth.js with Google OAuth, plus a password-less demo account',
               'Optional by design: planning needs no account. The product degrades to full function without it.'],
              ['Real-world data', 'OpenStreetMap, Nominatim, Wikipedia/Wikimedia',
               'Free, keyless and openly licensed — real hotels, attractions and photographs without a commercial '
               'agreement.'],
              ['Email', 'Resend, optional',
               'Sends a trip on demand. Scheduled email would require storing itineraries server-side, which the '
               'privacy position forbids.'],
              ['Hosting and CI/CD', 'Vercel, deploying on every push to main',
               'No dedicated infrastructure engineer; managed hosting removes that need entirely.'],
          ], widths=[1.15, 2.3, 3.15])

    callout(doc, 'Total infrastructure cost:',
            '**zero.** Every service above is used inside a free tier. That constraint drove real engineering — the '
            'three-model failover exists because a single model\'s daily token allowance was not enough to plan ten '
            'trips a day.')

    h2(doc, '5.2 What a funded version would add, and why it is not here')
    table(doc,
          ['Layer', 'Choice at scale', 'Why it is not in the build'],
          [
              ['Orchestration', 'LangGraph or an equivalent graph runtime',
               'Valuable at scale for retries, checkpointing and observability across long-running agent graphs. Our '
               'pipeline is seven nodes with one feedback edge — direct code is simpler to reason about and easier to '
               'demonstrate.'],
              ['Storage', 'Vector store for preference memory, relational store for transactions',
               'Both are required the moment trips leave the device or payments exist. Neither is true today, so '
               'adding them would be infrastructure without a user.'],
              ['Delivery', 'FCM/APNs push, SMS and voice gateways',
               'The Notification Agent already chooses these channels per persona. Delivering on them needs a push '
               'server and telephony — real infrastructure, honestly out of scope.'],
              ['Architecture', 'Service-leaning, event-driven for notifications',
               'Justified once scheduling must survive a closed browser.'],
          ], widths=[1.15, 2.0, 3.45])

    # ------------------------------------------------------------------ 6
    page_break(doc)
    h1(doc, '6 · What features will the MVP of your product have?')

    h2(doc, '6.1 The hypothesis the MVP exists to test')
    callout(doc, 'Core hypothesis:',
            'a mood-first, single-app experience that combines discovery, itinerary building and **upfront budget '
            'certainty**, in which the reasoning is visible and the trade-offs are arbitrated in front of the user, '
            'will be preferred over today\'s fragmented multi-app process.')

    h2(doc, '6.2 One line')
    para(doc,
         '**One mood, one budget, one duration in — one complete, arguable, committable trip out, planned by seven '
         'agents that can disagree with each other in front of you.**')

    h2(doc, '6.3 The MVP feature set — built, deployed and verified')
    table(doc,
          ['#', 'Feature', 'What it actually does', 'Why it is in the MVP'],
          [
              ['1', 'Mood-first brief', 'Mood, budget, duration, origin city and dates. The traveller never types a '
                                        'destination.',
               'This is the differentiator. Without it TripME is another OTA.'],
              ['2', 'Six entry paths', 'Solo, Couple, Group, Family, Pilgrimage, Corporate — each changing what the '
                                       'agents do, not just the form.',
               'Persona traceability, and three of them prove the architecture generalises beyond mood.'],
              ['3', 'Seven-agent pipeline', 'Structured JSON handoffs, each agent shown only what it needs.',
               'The core loop. Visible live on the run page as it happens.'],
              ['4', 'The Referee and its backward edge', 'Audits Itinerary against Budget, states the gap in rupees, '
                                                         'offers trade-offs and can send the plan back to be re-done.',
               'This is what makes it a system rather than a sequence. Removing it collapses the hypothesis.'],
              ['5', 'Traveller Advocates', 'One agent per person in couple and group mode, plus a published '
                                           'who-conceded-what matrix with a fairness floor.',
               'The group coordinator\'s pain is the sharpest in the research.'],
              ['6', 'Budget allocation with guarantees', 'Split across transport, stay, food, activities and buffer; '
                                                         'arithmetic enforced in code.',
               'The budget-certainty half of the hypothesis.'],
              ['7', 'Day-by-day itinerary', 'Plan, swap suggestions, a local phrase card and packing tips.',
               'Completes planning — otherwise a traveller has a suggestion, not a plan.'],
              ['8', 'Simulated bookings with approval gates', 'Priced cards, each behind explicit approval, with deep '
                                                              'links to real inventory.',
               'Tests intent-to-book without building fragile provider integrations.'],
              ['9', 'Traveller override', 'Change how you travel there and back, how you get around, where you stay, '
                                          'and any activity. Every change re-priced in code.',
               'The agents make the first call; the traveller makes the last one.'],
              ['10', 'Real places', 'Hotels and attractions from OpenStreetMap with Wikipedia photography, mappable '
                                    'and linkable.',
               'A traveller cannot act on a hotel that does not exist.'],
              ['11', 'Approve → confirm → save', 'An enforced order, with approvals invalidated whenever an amount '
                                                 'changes.',
               'Consent to spend is consent to a specific number.'],
              ['12', 'Opt-in reminders and an in-app notification centre', 'Departure, check-in, each activity and '
                                                                          'every day, in a bell on every page.',
               'Retention, and the "during the trip" third of the lifecycle.'],
              ['13', 'Saved trips and Travel DNA', 'History that feeds the next plan\'s personalisation.',
               'Tests whether the system feels like it learns you.'],
              ['14', 'Seven Indian languages', 'Including translation of what the agents wrote, not only the interface.',
               'Accessibility as inclusion. Directly serves the pilgrimage and family personas.'],
              ['15', 'Product assistant on every page', 'Answers about the product and your own trips, mostly without '
                                                        'calling a model.',
               'Support at zero marginal cost, and it cannot invent a feature we do not have.'],
              ['16', 'Optional sign-in', 'Google or a one-tap demo account; needed only to confirm or save.',
               'Value before the auth wall.'],
              ['17', 'Four sample trips', 'Complete plans that open instantly and need no AI quota.',
               'Makes the product demonstrable even when the free tier is exhausted.'],
              ['18', 'Group settle-up and corporate expense report', 'Who owes whom; reimbursement-ready by cost centre.',
               'The "after the trip" third, for the two personas who feel it most.'],
          ], widths=[0.3, 1.35, 2.35, 2.6], font=9)

    h2(doc, '6.4 Why the MVP is broader than first scoped — the honest version')
    para(doc,
         'An earlier draft of this submission scoped the MVP at **Solo and Couple only**, deliberately excluding the '
         'Referee, the Notification Agent and four personas. That was defensible on paper. Building it proved it '
         'wrong on two counts, and the reversal is recorded here rather than hidden.')
    bullets(doc, [
        '**The Referee is not an add-on.** Without an agent that can reject another agent\'s work, the pipeline is a '
        'sequence of prompts. The core hypothesis is explicitly about arbitration being visible — an MVP that '
        'excludes it cannot test the hypothesis it exists to test.',
        '**The persona paths were far cheaper than estimated.** Because the Mood & Intent Agent already emitted a '
        'structured brief, a new path is a new brief plus a Referee variant, not a new pipeline. Family, Pilgrimage '
        'and Corporate cost roughly a sprint between them, not a sprint each. RICE effort estimates made before '
        'building were simply wrong, and the honest response was to re-score rather than defend the original line.',
    ])
    callout(doc, 'What this does not mean:',
            'the MVP is still not the full product. Real bookings, live prices, push delivery to a closed app, '
            'cross-device sync and travel outside India are all deliberately absent — see 6.5. The line moved; it '
            'did not disappear.')

    h2(doc, '6.5 Deliberately not in the MVP — with the defence for each')
    table(doc,
          ['Excluded', 'Why that is the right call'],
          [
              ['Real bookings and payments',
               'Every booking is simulated and labelled. Building real transactions would make the MVP the full '
               'product, and would put PCI scope and refund liability in front of validation. Each card deep-links to '
               'Google Flights or Booking.com so a traveller can still act.'],
              ['Live prices',
               'Real fares and nightly rates come from paid inventory APIs. Every figure in the product is marked '
               '"est.". Printing an invented number beside a real hotel\'s name would read as a quote, and that is '
               'the one genuinely dishonest thing available to us.'],
              ['Push to a closed app, SMS and voice delivery',
               'Needs a push server and telephony. The agent still chooses those channels for low-connectivity '
               'pilgrimage routes and shows the schedule; delivery is labelled post-MVP in the product itself.'],
              ['Trips syncing across devices',
               'Trips live in the browser and are never uploaded. Signing in does not move them. This is a privacy '
               'position stated on the sign-in page, not an oversight.'],
              ['Travel outside India',
               'Prices, languages and local knowledge are all Indian. Out-of-scope requests are caught at the form '
               'and the Discovery Agent explains the substitution rather than making it silently.'],
              ['Voice input and large-text mode',
               'Specified for the pilgrimage persona and genuinely owed. Seven-language support shipped instead, '
               'because it serves more of that persona\'s difficulty per unit of effort.'],
              ['Automatic expense capture from real transactions',
               'The settle-up view is derived from approved bookings, not from a bank feed. Real capture requires '
               'real bookings, which are out of scope above.'],
          ], widths=[1.75, 4.85])

    h2(doc, '6.6 How we will know the MVP worked')
    table(doc,
          ['Metric', 'What it tests', 'Target'],
          [
              ['Plan completion rate', 'Whether the mood-first brief is answerable at all', '> 70% of started briefs '
                                                                                           'reach a finished plan'],
              ['Agent time to plan', 'The Phase 1 under-60-second claim', 'Median under 60s for solo and couple'],
              ['Referee visibility', 'Whether arbitration is noticed and understood', '> 50% of testers can describe '
                                                                                      'what the Referee did'],
              ['Override rate', 'Whether people treat the plan as theirs to change', '> 30% change at least one thing'],
              ['Confirm rate', 'Intent to actually go', '> 25% of finished plans confirmed'],
              ['Return within 30 days', 'Whether it is a tool or a toy', '> 20%'],
          ], widths=[1.5, 3.1, 2.0])

    # ------------------------------------------------------------------ 7
    page_break(doc)
    h1(doc, '7 · How would you prioritise the features for your product?')
    para(doc,
         'Three lenses had to agree before anything entered the build: **RICE** for a ranked list, **MoSCoW** to make '
         'that ranking speakable in a planning conversation, and a **Value versus Complexity quadrant** as a '
         'sanity check against our own optimism.')

    h2(doc, '7.1 Why RICE first')
    para(doc,
         'Our agents have wildly different build costs. A text-only mood quiz and a multi-provider booking engine can '
         'sound equally important in a workshop. RICE forces the comparison: **Reach** (how many target users touch '
         'it per cycle), **Impact** (how much it moves the core hypothesis, 0.25–3), **Confidence** (how sure we are, '
         'grounded in the JTBD interviews where possible) and **Effort** (person-weeks including orchestration, not '
         'just interface).')

    h2(doc, '7.2 The scores, and what shipped')
    table(doc,
          ['Feature', 'RICE', 'Quadrant', 'MoSCoW', 'Shipped?'],
          [
              ['Mood/intent input, all six paths', 'Very high', 'Quick win', 'Must', 'Yes'],
              ['Destination matching with visible reasoning', 'High', 'Quick win', 'Must', 'Yes'],
              ['Budget allocation with code-enforced arithmetic', 'Very high', 'Quick win', 'Must', 'Yes'],
              ['Day-by-day itinerary', 'High', 'Quick win', 'Must', 'Yes'],
              ['Simulated booking with approval gates + deep links', 'Very high', 'Quick win', 'Must', 'Yes'],
              ['Referee — money arbitration and backward edge', 'High (re-scored)', 'Quick win (re-scored)', 'Must',
               'Yes'],
              ['Traveller Advocates and consensus', 'Medium-high (re-scored)', 'Quick win (re-scored)', 'Must', 'Yes'],
              ['Family, Pilgrimage, Corporate paths', 'Medium (re-scored up)', 'Quick win (re-scored)', 'Must', 'Yes'],
              ['Traveller override and re-pricing', 'High', 'Quick win', 'Must', 'Yes'],
              ['Real places from open data', 'Medium', 'Quick win', 'Should', 'Yes'],
              ['Notification Agent and in-app reminders', 'Medium', 'Quick win', 'Should', 'Yes'],
              ['Multilingual (7 languages)', 'Medium', 'Quick win', 'Should', 'Yes'],
              ['Group settle-up / corporate expense report', 'Medium', 'Quick win', 'Should', 'Yes'],
              ['Automated multi-provider booking execution', 'Medium', 'Strategic bet', 'Could', 'No'],
              ['Live spend capture from real transactions', 'Medium', 'Strategic bet', 'Could', 'No'],
              ['Voice input and large-text mode', 'Medium', 'Strategic bet', 'Should', 'No'],
              ['Preference graph (long-term memory)', 'Medium', 'Strategic bet', 'Could', 'No'],
              ['Push/SMS/voice delivery infrastructure', 'Medium', 'Strategic bet', 'Could', 'No'],
              ['Early-bird dynamic pricing', 'Low', 'Fill-in', 'Could', 'No'],
              ['International destinations', 'Low', 'Money pit (for now)', 'Won\'t', 'No'],
          ], widths=[2.5, 1.15, 1.15, 0.75, 0.65], font=9)

    h2(doc, '7.3 Why the quadrant earned its place')
    para(doc,
         'RICE and MoSCoW can both be gamed by optimistic Reach and Impact estimates — and ours were. Plotting the '
         'same features on Value against Complexity is what exposed it.')
    table(doc,
          ['Quadrant', 'Meaning', 'Rule'],
          [['Quick win — high value, low/medium complexity', 'Cheap and moves the hypothesis', 'Always in the MVP'],
           ['Strategic bet — high value, high complexity', 'Worth doing, too expensive to validate with',
            'Should/Could, after validation'],
           ['Fill-in — low value, low complexity', 'Cheap, moves nothing', 'Only with spare capacity'],
           ['Money pit — low value, high complexity', 'Expensive and moves nothing', 'Actively avoided']],
          widths=[2.35, 2.35, 1.9])

    callout(doc, 'The re-scoring, stated plainly:',
            'the Referee, the Advocates and three persona paths were originally scored as Strategic Bets and excluded. '
            'Building the pipeline showed their **Effort had been badly over-estimated** — once the Mood Agent emits a '
            'structured brief, a persona path is a new brief and a Referee variant, not a new pipeline — while the '
            'Referee\'s **Impact had been under-estimated**, because the hypothesis is about visible arbitration. '
            'They moved to Quick Win and into the MVP. We changed the scores rather than defending them, which is the '
            'point of scoring at all.')

    # ------------------------------------------------------------------ 8
    page_break(doc)
    h1(doc, '8 · How would you test your product and features prior to deployment?')
    para(doc,
         'Testing has to cover two unrelated failure modes: **ordinary software defects** (a broken control, a failed '
         'request) and **AI failure modes** (a hallucinated recommendation, a silently bad financial decision). '
         'This section separates what we actually did from what a funded pipeline would add.')

    h2(doc, '8.1 What we actually ran')
    table(doc,
          ['Practice', 'How it worked here', 'A defect it actually caught'],
          [
              ['Browser-verified QA against the live build',
               'Every change exercised in a real browser across breakpoints before release, not only unit-checked.',
               'A reminder toast covering the Save trip control on a 390px screen; the assistant panel running off '
               'the bottom of short windows so its input could not be reached.'],
              ['Agent-contract testing',
               'Each agent\'s output checked against its schema and its behavioural contract with real payloads.',
               'A scope rule that could never fire, because Discovery is handed structured parameters and never sees '
               'the traveller\'s words — the rule was a comment, not a safeguard.'],
              ['Deterministic assertions on money',
               'Allocations must sum exactly; caps clamp; approval gates re-derive on every change.',
               'A ₹3,000 booking still displaying "above ₹3,000 spend gate"; approvals staying ticked after the '
               'traveller switched to a more expensive hotel.'],
              ['Failure-path testing',
               'Malformed storage, offline, empty states and exhausted quota deliberately induced.',
               'A malformed saved trip crashing the trip page instead of falling back to "No trip loaded".'],
              ['Cross-persona regression',
               'All six entry paths re-run after any change to a shared agent.',
               'The Pilgrimage brief being rejected outright by one model while two others could have answered it.'],
              ['Accessibility pass',
               'Keyboard reachability, accessible names, and horizontal overflow at 390px.',
               'The assistant openable only by pointer — unreachable from a keyboard; the mood note field with a '
               'placeholder and no accessible name.'],
              ['External tester guide',
               'A twelve-scenario guide circulated to people outside the team, with a "please don\'t report these" '
               'list to keep signal high.',
               'Reported: a plan saved six times from one action; reminders naming a hotel the traveller had rejected.'],
          ], widths=[1.35, 2.4, 2.85], font=9)

    callout(doc, 'The most useful testing lesson:',
            'the defects that mattered were **not** wrong AI output. They were sequencing and visibility failures — '
            'consent that survived the thing it consented to, and features that could not be discovered until after '
            'they had been used. Generic QA would not have looked for either.')

    h2(doc, '8.2 The deployment pipeline at scale')
    para(doc,
         'Every change would move through **Development → Testing → Staging → UAT → Production**, alongside two '
         'standing environments: a **sandbox** where agents run against synthetic scenarios with no risk of touching '
         'real money, and a **performance environment** measuring pipeline latency under concurrent load, since a '
         'seven-agent chain is inherently slower than a single call and latency is a stated product claim.')

    h2(doc, '8.3 Agent-specific testing')
    bullets(doc, [
        '**Offline evaluation** — a fixed regression suite of input/output pairs per agent, re-run before every '
        'prompt or model change, so that improving one scenario cannot silently break ten.',
        '**Observability** — structured logging of every agent decision and handoff, so a wrong plan can be traced to '
        'the agent that introduced the error. The product already ships this: the agent log on every trip page shows '
        'the raw JSON each agent produced.',
        '**Online evaluation** — plan latency against the under-60-second target and completion rate, watched for '
        'data drift (prices, seasons) and concept drift (how people describe moods).',
    ])

    h2(doc, '8.4 Managing hallucination and reasoning risk')
    bullets(doc, [
        '**Grounding over generation** — Discovery is bound by explicit mood-fidelity rules and must show where each '
        'non-negotiable is met; hotels and attractions come from OpenStreetMap rather than from the model\'s memory. '
        'This is the single largest lever against invented recommendations.',
        '**Code, not consensus, for money** — rather than sampling a model repeatedly and hoping the numbers agree, '
        'the arithmetic is simply not the model\'s job. Allocations, totals, caps and approval thresholds are '
        'computed deterministically. A model cannot hallucinate a figure it is never asked for.',
        '**Human-in-the-loop above a threshold** — no booking is committed without explicit approval, and changing '
        'the amount revokes the approval.',
        '**Scope enforcement** — a request we cannot serve is named and redirected, never silently substituted.',
    ])

    h2(doc, '8.5 Usability and accessibility testing')
    bullets(doc, [
        'A/B testing the mood-first entry against a conventional destination search, to test rather than assume that '
        'mood-first outperforms the status quo.',
        'WCAG/POUR checks embedded from the wireframe stage rather than retrofitted.',
        'Moderated sessions with five to eight users across the personas before UAT closes, specifically to catch '
        'confusion that automated tests cannot — for example a user not understanding why a destination was chosen '
        'even though the reasoning is on screen.',
    ])
    placeholder(doc, 'Moderated usability session notes (5–8 participants).',
                'Not yet run; schedule before the presentation if time allows.')

    # ------------------------------------------------------------------ 9
    page_break(doc)
    h1(doc, '9 · How will you integrate AI / GenAI and Agentic AI?')
    callout(doc, 'The distinction we hold to:',
            'TripME is not "AI-infused". It is **agentic** — the AI layer does not produce text for a human to act '
            'on, it takes state-changing actions: allocating a budget, rejecting another agent\'s work, preparing '
            'bookings, scheduling reminders. Remove the agent layer and there is no product left.')

    h2(doc, '9.1 Foundation')
    bullets(doc, [
        '**Language reasoning** — three hosted models on Groq, assigned per agent and chained for failover. Model '
        'hosting is deliberately outsourced.',
        '**Structured output** — every agent returns validated JSON against a declared schema, which is what makes a '
        'handoff a contract rather than a conversation.',
        '**Retrieval** — real place data from OpenStreetMap and Wikipedia, so recommendations can be grounded in '
        'somewhere that exists.',
        '**Deterministic layer** — the money, the approval gates and the conflict audit are code. The Referee is '
        '*triggered* by a computed conflict, not by a model noticing one.',
    ])

    h2(doc, '9.2 The seven agents as PEAS')
    table(doc,
          ['Agent', 'Performance measure', 'Environment', 'Actuators', 'Sensors'],
          [
              ['Mood & Intent', 'Fidelity of captured intent; does the mood survive into the brief',
               'The traveller\'s brief and their trip history', 'Writes structured intent and non-negotiables',
               'Mood, budget, dates, party composition, past trips'],
              ['Discovery', 'Match relevance; every non-negotiable evidenced',
               'Destination knowledge, season, the India scope boundary', 'Selects destination and two alternates',
               'Structured intent, origin, dates, budget'],
              ['Budget', 'Allocation realism; exact arithmetic', 'The trip\'s total and the Referee\'s instruction',
               'Writes the category allocation', 'Destination cost band, duration, party size, policy caps'],
              ['Itinerary', 'Plan coherence and pacing fit', 'Destination, mood profile, household constraints',
               'Writes the day-by-day schedule', 'Destination, pace, food preference — deliberately NOT the budget'],
              ['Booking', 'Bookings that fit the allocation and the party',
               'The allocation and the itinerary highlights', 'Prepares simulated bookings with approval reasons',
               'Allocation, party size, origin, dates'],
              ['Referee', 'Conflict-resolution accuracy; nothing silently overruled',
               'Cross-agent state and the deterministic audit',
               'States the conflict, offers trade-offs, sends work back to Budget',
               'Itinerary cost versus allowance, household ages, policy caps, advocate positions'],
              ['Notification', 'Schedule usefulness and on-time delivery',
               'The confirmed bookings and the traveller\'s channels', 'Writes the reminder schedule',
               'Booking times, itinerary days, persona channel preference'],
              ['Traveller Advocate (n per group)', 'Faithful representation of one person',
               'That traveller\'s stated mood, budget and dealbreaker', 'Argues a position into the consensus',
               'One person\'s brief and the group context'],
          ], widths=[1.1, 1.5, 1.4, 1.35, 1.55], font=8.5)

    callout(doc, 'Correction from the earlier draft:',
            'the Booking Agent\'s actuator previously read "executes reservations". It does not. It **prepares '
            'simulated bookings behind approval gates**, and the product labels them Demo Mode. Claiming execution in '
            'a document while the demo shows simulation is exactly the contradiction this submission exists to avoid.')

    h2(doc, '9.3 Agent types — not every agent reasons the same way')
    bullets(doc, [
        '**Goal-based** — Mood & Intent and Discovery act toward a defined goal state without weighing competing '
        'objectives.',
        '**Utility-based** — Budget and Itinerary optimise across genuinely competing goals: cost against experience, '
        'pacing against coverage. They are given opposing objectives on purpose.',
        '**Utility-based with explicit arbitration** — the Referee. It does not optimise silently; it surfaces the '
        'trade-off and hands the decision back.',
        '**Model-based reflex** — Notification reacts predictably to time anchors rather than deliberating.',
        '**Learning agent** — the preference graph, explicitly post-MVP, because it needs longitudinal data we do not '
        'yet have. Travel DNA is its deliberately simple precursor.',
    ])

    h2(doc, '9.4 Memory architecture')
    table(doc,
          ['Type', 'What it holds', 'Where it lives today'],
          [['Short-term', 'The plan being assembled during one run', 'In-session pipeline context'],
           ['Episodic', 'This traveller\'s past trips and choices', 'Browser storage — Travel DNA'],
           ['Semantic', 'General travel knowledge and real place data', 'Model parameters plus OpenStreetMap/Wikipedia'],
           ['Long-term', 'A cross-trip preference graph', 'Post-MVP — requires storage the privacy position forbids today']],
          widths=[1.1, 3.0, 2.5])

    h2(doc, '9.5 Where autonomy is deliberately constrained')
    para(doc,
         'Autonomy is calibrated to the stakes of the decision, and the constraints are real rather than rhetorical:')
    bullets(doc, [
        'No booking is committed without explicit human approval, and **changing the amount revokes the approval** — '
        'consent is to a number, not to a line item.',
        'Confirming a trip is a separate act from approving its bookings, and reminders are a third, separately '
        'opted-into act. Each escalation is chosen, not inherited.',
        'The model never computes money. It proposes; code decides.',
        'The product will not silently substitute a destination it cannot serve.',
    ])
    para(doc,
         '**The design philosophy across all seven agents: as much autonomy as the stakes of the decision can safely '
         'support, and no more.**')
