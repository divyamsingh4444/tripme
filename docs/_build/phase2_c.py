"""Phase 2 submission — sections 10 to 19."""

from docxkit import bullets, callout, h1, h2, h3, page_break, para, placeholder, table


def build(doc):
    # ------------------------------------------------------------------ 10
    page_break(doc)
    h1(doc, '10 · Experimental Task 1 — JTBD interviews (5 conducted)')
    para(doc, '**Opening line used:** "I\'m researching how people actually plan trips — there are no right answers, '
              'I just want to hear your real experience."')
    para(doc, 'The script below is reproduced exactly as it was administered.', italic=True, size=9.5)

    table(doc,
          ['#', 'JTBD stage', 'Questions asked'],
          [
              ['1', 'Trigger (first thought)',
               'Think of the last trip you planned. What was the very first moment you thought "I need to plan a '
               'trip"? What was going on in your life right then?'],
              ['2', 'Passive looking',
               'Before you actively started planning, were you just casually noticing things — ads, friends\' photos, '
               'deals?'],
              ['3', 'Active looking',
               'When did you start actively researching? Walk me through what you did first. How many different apps '
               'or websites did you end up using?'],
              ['4', 'Deciding — push',
               'What was frustrating enough about the old way that made you want something different?'],
              ['5', 'Deciding — pull', 'What made a particular app, site, or method attractive to you?'],
              ['6', 'Deciding — anxiety', 'What worried you during the process — money, safety, wasting time?'],
              ['7', 'Deciding — habit',
               'Was there anything you kept doing out of habit, even if it wasn\'t the best way?'],
              ['8', 'Consumption',
               'Once you\'d booked things, how did you keep track of your plan and your spending? Did you ever lose '
               'track of what you\'d already booked or spent?'],
              ['9', 'Satisfaction / regret',
               'Looking back, what worked well? What would you never do again? Was there a moment you thought "this '
               'shouldn\'t be this hard"?'],
              ['10', 'Wrap-up',
               'If someone built the perfect tool for planning your next trip, what would it do for you?'],
          ], widths=[0.3, 1.3, 5.0])

    h2(doc, 'Evidence')
    table(doc, ['Artefact', 'Link'],
          [['Interview recordings',
            'https://drive.google.com/drive/folders/1yiCTZ4YJTHeOnPm_pLVV9-shvfJw44-k'],
           ['Collection form', 'https://forms.gle/3ZgW7KTDZnFQMbcdA'],
           ['Response sheet',
            'https://docs.google.com/spreadsheets/d/1aB4qdZWV1mrz3TsJ7M8LPNKvAvWIgDmHMDUcRljwx80']],
          widths=[1.7, 4.9])

    h2(doc, 'What the interviews changed in the product')
    para(doc, 'Recording the findings matters less than recording what moved because of them:')
    table(doc,
          ['Finding', 'Consequence in the build'],
          [['Every participant used multiple tools and re-entered the same context',
            'The single brief carries end to end; no agent asks again for something already given.'],
           ['Tracking spend was consistently described as the worst part, and always happened after the fact',
            'The budget is allocated before anything is booked and re-priced on every change, rather than reconciled '
            'afterwards.'],
           ['Group trips broke down at agreement, not at booking',
            'One Advocate per person and a published concession matrix with a fairness floor — the product shows who '
            'gave up what.'],
           ['Participants distrusted recommendations they could not interrogate',
            'Discovery must evidence every non-negotiable, the Referee states conflicts in rupees, and the raw agent '
            'log is on every trip page.']],
          widths=[2.9, 3.7])

    # ------------------------------------------------------------------ 11
    page_break(doc)
    h1(doc, '11 · Sample project plan')
    para(doc,
         'The plan is sequenced by the pipeline\'s real data dependencies rather than by calendar convenience: you '
         'cannot test Discovery without Mood & Intent feeding it structured intent, and you cannot test Booking '
         'without an Itinerary to book from.')

    table(doc,
          ['Phase', 'Milestone', 'Status'],
          [
              ['Initiation', 'Problem statement finalised, six personas validated against Phase 1', 'Complete'],
              ['Planning', '61-story backlog groomed in Jira, six sprints scheduled, Definition of Done agreed',
               'Complete'],
              ['Sprint 1 — Foundation',
               'Landing and planner, entry-path architecture, design system, deployment pipeline', 'Complete'],
              ['Sprint 2 — Mood & Intent', 'Quiz flows per persona, four Intent variants, preference memory',
               'Complete'],
              ['Sprint 3 — Discovery', 'Destination matching, mood-fidelity rules, non-negotiable evidencing, '
                                       'India scope enforcement', 'Complete'],
              ['Sprint 4 — Budget', 'Allocation logic, deterministic arithmetic, policy caps', 'Complete'],
              ['Sprint 5 — Itinerary & Booking', 'Day-by-day plan, simulated bookings, approval gates, deep links',
               'Complete'],
              ['Sprint 6 — Referee & Notification',
               'Three conflict classes, the backward edge, Advocates and consensus, reminder schedule', 'Complete'],
              ['Sprint 7 — Traveller control (added)',
               'Options and override, real places, approve/confirm/save sequencing, in-app reminders, sign-in, '
               'multilingual', 'Complete'],
              ['Monitoring & controlling',
               'Stand-ups, sprint reviews with a live demo, retrospectives, decision log maintained continuously',
               'Ongoing'],
              ['Closing — Release 0.1.1', 'MVP demo recorded, PRD finalised, wireframes delivered, transition to UAT',
               'In progress'],
          ], widths=[1.75, 3.75, 1.1])

    h2(doc, 'Why this sequencing')
    bullets(doc, [
        '**Sprint 4 checkpoint** — Mood → Discovery → Budget functional end to end. The earliest point the core '
        'hypothesis can be validated internally, before the full MVP exists.',
        '**Sprint 6 checkpoint** — the full pipeline is demonstrable including arbitration, which is the first moment '
        'the product is distinguishable from a single long prompt.',
        '**Sprint 7 was added, not planned.** Building the pipeline made it obvious that a plan the traveller cannot '
        'change is a demo rather than a product. Adding it is the plan reacting to evidence, which is the point of '
        'working in sprints.',
    ])

    h2(doc, 'Capacity buffer and ownership')
    para(doc,
         'Roughly 20% of each sprint is reserved for unforeseen work rather than committing full estimated velocity. '
         'A lean team without an explicit buffer either misses every sprint goal or quietly cuts testing. Every phase '
         'has a named owner group rather than "the team", because ambiguous ownership across four or five people with '
         'different skill concentrations is a real risk rather than a formality.')

    # ------------------------------------------------------------------ 12
    page_break(doc)
    h1(doc, '12 · What methodology will you use, and why?')
    callout(doc, 'Answer:',
            '**Agile** as the approach, **Scrum** as the methodology for the build, transitioning to **Kanban** for '
            'post-launch maintenance — all run in **Jira**.')
    para(doc, 'These three terms are often used interchangeably and are not the same thing:')
    bullets(doc, [
        '**Agile** is the philosophy — iterative delivery, adapting as you learn, small increments over a big-bang '
        'release. It is a mindset, not something you do directly.',
        '**Scrum** is the methodology that implements it — sprints, stand-ups, reviews, retrospectives, and defined '
        'roles.',
        '**Jira** is the tool where the backlog, sprints and board actually live. It supports both Scrum and Kanban '
        'boards, which is why the post-launch switch is a change of board type rather than of tooling.',
    ])

    h2(doc, 'Why Scrum over Waterfall')
    para(doc,
         'Waterfall suits fixed requirements. Ours were not fixed, and we can prove it: the MVP scope changed '
         'mid-build when the Referee turned out to be load-bearing rather than optional, and again when persona paths '
         'proved far cheaper than estimated. Waterfall would have locked in assumptions about agent behaviour before '
         'any of them had been tested.')

    h2(doc, 'Why Scrum over Kanban for the build')
    bullets(doc, [
        '**Sequential dependencies** — Booking cannot be built before an Itinerary exists to book from. Sprint goals '
        'enforce that sequencing; continuous flow does not.',
        '**Fixed scope for a fixed window** — the Must-have list from Section 7 is a commitment, which is what sprint '
        'commitment models are for.',
    ])

    h2(doc, 'Why switch to Kanban after launch')
    para(doc,
         'Post-launch work is reactive: bug triage, support escalations, small tuning. Forcing that into two-week '
         'sprints means padding with filler or breaking commitments every time something urgent lands. This is '
         'matching the methodology to the phase, not indecision between two.')

    h2(doc, 'Roles and ceremonies')
    table(doc, ['Role', 'Responsibility'],
          [['Product Owner', 'Owns and prioritises the 61-story backlog; makes the RICE and MoSCoW scope calls'],
           ['Scrum Master', 'Facilitates ceremonies and removes blockers; explicitly not a task-assigner'],
           ['Development team', 'Collectively owns sprint delivery and self-organises around the sprint goal']],
          widths=[1.5, 5.1])
    para(doc,
         '**Sprint Planning → Daily Stand-up (15 min) → Sprint Review (a live demo, which also satisfies the Phase 2 '
         'presentation requirement) → Retrospective**, every sprint without exception. Skipping retrospectives is the '
         'most common way a small team quietly loses the adaptability Scrum is supposed to provide.')

    # ------------------------------------------------------------------ 13
    page_break(doc)
    h1(doc, '13 · Jira board')
    para(doc,
         'The 61-story backlog is groomed into six sprints in Jira, tagged by agent (Mood & Intent, Discovery, '
         'Budget, Itinerary, Booking, Referee, Notification) and by discipline (Platform, Backend, Data, '
         'Integrations, Security, QA). QA stories are distributed one per sprint rather than batched at the end.')
    placeholder(doc, 'Jira board screenshots — backlog by sprint (6 images) and the active Scrum board (1 image).',
                'Already captured by the team; paste them here at full width.')
    table(doc, ['Sprint', 'Focus', 'Stories'],
          [['Sprint 1', 'Platform foundation, auth gate, language and accessibility controls, security', '9'],
           ['Sprint 2', 'Mood & Intent Agent across personas, preference memory, localisation', '9'],
           ['Sprint 3', 'Discovery Agent, adapter layer, regional-bias validation', '7'],
           ['Sprint 4', 'Budget Agent, allocation and splits, transactional data, encryption at rest', '9'],
           ['Sprint 5', 'Itinerary and Booking Agents, provider adapters, load and fallback testing', '11'],
           ['Sprint 6', 'Referee and Notification Agents, scheduling, regression suite, moderated UAT', '16']],
          widths=[0.9, 4.7, 1.0])

    # ------------------------------------------------------------------ 14
    page_break(doc)
    h1(doc, '14 · Ethical considerations')
    para(doc,
         'Each risk below is tied to a specific agent\'s specific behaviour, because that is the level at which a '
         'risk is real and mitigable. Generic "AI can be biased" statements are not actionable.')
    table(doc,
          ['Risk', 'Why it is specific to TripME', 'Mitigation — and whether it is live'],
          [
              ['Privacy versus personalisation',
               'Mood, budget and location are genuinely sensitive, and the Mood and Budget agents depend on them.',
               '**Live.** Trips never leave the device. An account holds a name, email and picture — never a trip. '
               'Stated on the sign-in page and the privacy section, not buried.'],
              ['Bias in recommendations',
               'If Discovery leans on popularity, smaller Indian heritage towns lose to metros purely because more '
               'has been written about them.',
               '**Partly live.** Mood-fidelity rules force category fit over popularity, and real places come from '
               'open map data rather than model memory. A standing audit of regional coverage is owed.'],
              ['Silent substitution',
               'A traveller asking for somewhere we cannot serve could simply be given somewhere else.',
               '**Live.** Out-of-scope requests are named at the form, and Discovery must open its reasoning by '
               'explaining the swap. Never silently substituted.'],
              ['Financial accountability',
               'An agent preparing spend is qualitatively different from a chatbot giving advice.',
               '**Live.** Approval gates above a threshold, approvals revoked when amounts change, and money computed '
               'in code rather than by a model.'],
              ['Dark patterns in pricing',
               'An urgency-styled "lock now, save 20%" banner sits on the line between incentive and manipulation.',
               '**Not applicable yet** — no pricing exists. Committed in advance: genuine verifiable discounts only, '
               'a penalty-free dismissal, and no fake scarcity counters.'],
              ['Accessibility as exclusion',
               'Excluding low-digital-fluency or differently-abled travellers from a product aimed partly at '
               'pilgrimage travellers is exclusion, not a rough edge.',
               '**Partly live.** Seven languages including translated agent output; keyboard reachability and '
               'accessible names fixed in QA. Voice input and large-text mode are owed and scoped.'],
              ['Engagement manipulation via notifications',
               'It would be easy to tune reminders to maximise app opens rather than to serve the trip.',
               '**Live.** Reminders are time-anchored to real events only, off by default, opt-in per trip, and '
               'switchable off in one click.'],
          ], widths=[1.3, 2.5, 2.8], font=9)

    h2(doc, 'How this is operationalised rather than stated')
    para(doc, 'Three standing questions at every sprint review:')
    bullets(doc, [
        'Who benefits and who could be harmed by this specific agent decision this sprint?',
        'Is the reasoning transparent enough that a user could challenge it — could they ask "why did you suggest '
        'this?" and get a real answer?',
        'Could we defend this design publicly if a journalist or regulator called it a dark pattern?',
    ], numbered=True)
    para(doc, 'If a feature cannot survive the third question, it is redesigned until it can.')

    # ------------------------------------------------------------------ 15
    page_break(doc)
    h1(doc, '15 · Lean Canvas')
    table(doc,
          ['Block', 'Content'],
          [
              ['Problem',
               'Travellers use six to eight disconnected apps for discovery, booking, local logistics and expense '
               'tracking. Budget overruns are normal, group trips are hard to coordinate, and no app holds a single '
               'source of truth for planned versus actual spend.'],
              ['Existing alternatives',
               'OTAs (MakeMyTrip, Booking.com); inspiration platforms (Instagram, blogs); itinerary tools '
               '(Wanderlog); expense tools (Splitwise, spreadsheets); traditional travel agents.'],
              ['Customer segments',
               'Solo travellers, couples, groups of friends, families, pilgrimage travellers and corporate '
               'travellers. Beachhead: solo and couple travellers in Tier-1 India who feel planning friction most '
               'sharply.'],
              ['Early adopters',
               'Frequent short-trip planners; group organisers who currently run WhatsApp polls and Splitwise; '
               'budget-conscious travellers juggling several booking apps.'],
              ['Unique value proposition',
               'One app to plan, price and commit to an entire trip — where the agents show their reasoning, argue '
               'with each other in front of you, and the budget is enforced rather than estimated.'],
              ['Solution',
               'A seven-agent pipeline with typed handoffs and a backward edge: mood-first intent capture, '
               'destination discovery with evidence, budget allocation enforced in code, day-by-day itinerary, '
               'simulated bookings behind approval gates, arbitration across three conflict classes, and reminders.'],
              ['Unfair advantage',
               'The arbitration layer and the trip-state schema. Anyone can call a language model; reconciling five '
               'travellers\' moods into one plan, then defending it against a budget in public, is the part that is '
               'hard to copy. Plus an India-forward cultural depth that global products treat as a long tail.'],
              ['Key metrics',
               'Plan completion rate, agent time to plan, override rate, confirm rate, 30-day return, and — post-'
               'monetisation — booking conversion and average booking value.'],
              ['Channels',
               'Owned web product and content; community seeding in travel groups; referral built into the moment a '
               'plan completes; partnerships with heritage and experience providers. Detailed in Section 20.'],
              ['Cost structure',
               'Engineering and design; model inference; provider API integration; payment processing; support '
               'tooling; acquisition. Today: zero — every dependency runs inside a free tier.'],
              ['Revenue structure',
               'Booking commission; freemium-to-Pro for group splitting and cross-trip analytics; affiliate '
               'placements for curated experiences; early-bird whole-plan lock-in; corporate travel tier.'],
          ], widths=[1.35, 5.25])
    callout(doc, 'Correction from the earlier canvas:',
            'the Unfair Advantage previously read "Direct-to-Engine Binding: proprietary pathway bypassing manual '
            'intent translation barriers." That is not a claim anyone can evaluate. It has been replaced with the '
            'thing that is actually hard to copy and which we can demonstrate on screen.')

    # ------------------------------------------------------------------ 16
    page_break(doc)
    h1(doc, '16 · STP — Segmentation, Targeting, Positioning')

    h2(doc, '16.1 Segmentation')
    table(doc,
          ['Basis', 'Segments'],
          [['Behavioural — planning style', 'Unplanned trippers · frequent optimisers · group organisers · household '
                                            'planners · calendar-bound pilgrims · policy-bound business travellers'],
           ['Need-based', 'Decision support (where do I even go) · coordination (whose trip is this) · cost certainty '
                          '(what will this actually cost) · compliance (will this be reimbursed)'],
           ['Demographic', '22–35 urban professionals; 35–50 household planners; 55+ pilgrimage travellers; B2B '
                           'corporate travel desks'],
           ['Geographic', 'Tier-1 and Tier-2 Indian cities, planning domestic travel'],
           ['Psychographic', 'Experience-led rather than deal-led; mistrustful of opaque recommendations; already pay '
                             'in time rather than money']],
          widths=[1.5, 5.1])

    h2(doc, '16.2 Targeting')
    para(doc,
         'The product supports six paths. **Acquisition targets two of them first** — and the distinction between '
         '"what the product supports" and "who we go after" is the whole point of this section.')
    table(doc,
          ['Segment', 'Priority', 'Why'],
          [['Unplanned tripper (Solo)', 'Primary',
            'The purest test of mood-first: someone with no destination in mind. Fast decision loop, easiest to '
            'acquire, quickest feedback.'],
           ['Couple', 'Primary',
            'Introduces genuine multi-person arbitration at the smallest possible scale — two Advocates, not five.'],
           ['Group organiser', 'Secondary (month 3+)',
            'Highest pain and inherently viral, since a group trip brings four more users. Deferred only because the '
            'coordination loop needs the core validated first.'],
           ['Family', 'Secondary (month 3+)', 'Seasonal demand around school holidays; strong retention once trusted.'],
           ['Pilgrimage', 'Tertiary',
            'Genuinely underserved and strategically important for India-forward positioning, but requires voice and '
            'large-text work before acquisition spend is honest.'],
           ['Corporate', 'Tertiary (B2B motion)',
            'Different buyer, different sales cycle, different compliance bar. A separate motion, not a campaign.']],
          widths=[1.5, 1.2, 3.9])
    callout(doc, 'Deliberate restraint:',
            'no acquisition is built for pilgrimage or corporate in Phase 1. They remain documented, supported '
            'personas on the roadmap — not launch targets. Marketing a path we have not yet made accessible would be '
            'the dishonest kind of growth.')

    h2(doc, '16.3 Positioning')
    callout(doc, 'Positioning statement:',
            '**For** Indian travellers who lose hours to fragmented planning and never quite know what a trip will '
            'cost, **TripME** is a trip operating system **that** turns one mood and one budget into a complete, '
            'costed, committable plan — **unlike** OTAs that assume you already know where you are going, or '
            'itinerary tools that ignore money entirely — **because** seven specialised agents plan it, argue about '
            'it in front of you, and are held to your budget in code rather than by estimate.')
    table(doc,
          ['Competitor', 'Their position', 'Our wedge'],
          [['MakeMyTrip / Booking.com', 'Inventory and price', 'They start where you already know the answer; we '
                                                               'start at the question.'],
           ['Google Travel / Skyscanner', 'Speed of search', 'Search returns options; we return a decision, with '
                                                             'reasoning attached.'],
           ['Wanderlog / TripIt', 'Organising a plan you have', 'We produce the plan and hold it to a budget.'],
           ['Splitwise', 'Settling up afterwards', 'We split what was actually approved, during the trip.'],
           ['ChatGPT and general assistants', 'A plausible itinerary in prose',
            'One model with no memory of your budget, no arbitration, no bookings and no accountability. Ours '
            'disagree with each other and the money is enforced in code.']],
          widths=[1.6, 1.9, 3.1])

    # ------------------------------------------------------------------ 17
    page_break(doc)
    h1(doc, '17 · Branding the product')
    table(doc,
          ['Element', 'Decision', 'Reasoning'],
          [
              ['Name', 'TripME',
               'Reads as both "trip me" (do this for me) and "trip, me" (it is mine). Short, pronounceable across '
               'Indian languages, and available.'],
              ['Tagline', 'One mood. One budget. One complete trip.',
               'States the input and the output in seven words, and implicitly attacks fragmentation without naming a '
               'competitor.'],
              ['Positioning line', 'A trip operating system, not a booking app.',
               'Used with evaluators, partners and investors rather than on the landing page — it is a category claim '
               'and needs the product behind it.'],
              ['Palette', 'Pine (#14453D) as the ground, Marigold (#FFB52E) as the accent, on a soft off-white',
               'Pine is calm and considered rather than the saturated blues OTAs default to; marigold is warm, '
               'unmistakably Indian, and reserved almost entirely for the primary action.'],
              ['Typography', 'Bricolage Grotesque for display, Inter for text, IBM Plex Mono for figures',
               'A characterful display face gives the brand a voice; monospaced numerals matter because this product '
               'asks people to trust its arithmetic.'],
              ['Logo', 'Handwritten wordmark with a paper-plane ascender',
               'Handwritten because the product is personal rather than transactional. A simplified mark is used at '
               'favicon size, where the script is illegible.'],
              ['Voice', 'Warm, plain, and specific. Never salesy; never apologetic.',
               'The product routinely tells the traveller what it cannot do. That only builds trust if the same voice '
               'is confident about what it can.'],
              ['Motion', 'Restrained. A three.js globe on capable devices, disabled elsewhere.',
               'Atmosphere should not cost a traveller their battery or their data.'],
          ], widths=[1.1, 2.3, 3.2])
    h2(doc, 'Brand promises, and how each is kept')
    table(doc, ['Promise', 'How the product keeps it'],
          [['We will show our reasoning', 'Non-negotiables evidenced line by line; the Referee states conflicts in '
                                          'rupees; the raw agent log is on every trip page.'],
           ['We will not overstate', 'Bookings are labelled simulated; prices are marked estimates; undeliverable '
                                     'channels are named as post-MVP.'],
           ['Your trip is yours', 'Every agent decision is overridable, and changing anything re-prices the trip.'],
           ['We will not keep what we do not need', 'Trips never leave the device; an account holds only what Google '
                                                    'returns.']],
          widths=[1.9, 4.7])

    # ------------------------------------------------------------------ 18
    page_break(doc)
    h1(doc, '18 · The 7Ms')
    table(doc,
          ['M', 'Detail'],
          [
              ['Market',
               'Indian domestic travel. Beachhead: solo travellers and couples in Tier-1 cities, expanding to groups '
               'and families by month three, with pilgrimage and corporate as later, separately-served motions. The '
               'pain addressed is fragmentation across planning, booking, local logistics and money.'],
              ['Mission',
               'One app for the whole trip lifecycle — mood-first planning, transparent budgeting, and a plan you can '
               'actually commit to. Near-term, everything serves one question: do travellers prefer an integrated, '
               'reasoning-visible system to a fragmented one?'],
              ['Message',
               'Narrative: TripME is a trip operating system, not a booking app. Four pillars — mood-first '
               'personalisation; India-forward cultural depth; budget certainty; end-to-end lifecycle coverage. '
               'Proof over claim: show one real mood becoming one real itinerary.'],
              ['Media',
               'Owned: the product itself, an SEO content hub on Indian heritage travel, and email. Earned: community '
               'seeding in travel groups, referral at the moment a plan completes, PR in tech and travel outlets. '
               'Paid: not in Phase 1 — there is no acquisition budget, and saying so is more useful than pretending.'],
              ['Money',
               'Phase 1 runs at zero marginal cost by design. Monetisation, in order of expected contribution: '
               'booking commission; freemium-to-Pro for group splitting and cross-trip analytics; affiliate '
               'placements for curated experiences; early-bird whole-plan lock-in; a corporate tier.'],
              ['Measurement',
               'Acquisition — visits and plan starts. Activation — plan completion rate (the single most important '
               'number in Phase 1). Engagement — override rate and confirm rate. Retention — 30-day return and trips '
               'per user. Trust — the proportion of testers who can explain what the Referee did. Revenue — deferred, '
               'and deliberately not measured yet.'],
              ['Management',
               'A four-to-five person team with named phase owners. Weekly syncs; a continuously maintained decision '
               'log so no choice has to be re-litigated; sprint reviews doubling as stakeholder demos; retrospectives '
               'without exception.'],
          ], widths=[1.0, 5.6])

    # ------------------------------------------------------------------ 19
    page_break(doc)
    h1(doc, '19 · How will you launch the product? End-to-end launch strategy')
    callout(doc, 'Launch objective:',
            'Phase 1 is **validation-first, not revenue-first**. The launch exists to answer one question: will '
            'travellers give a mood and a budget, and find the resulting plan good enough to act on? There is no '
            'monetisation in this phase by design.')
    para(doc, '**Primary success criteria:** plan completion rate · session-to-plan conversion · mood utilisation '
              '(are people using the mood entry or abandoning it) · override rate · 30-day return · NPS from the beta '
              'cohort. Every activity below exists to move those numbers.')

    h2(doc, '19.1 Launch philosophy — narrow before wide')
    para(doc,
         'Six personas are supported. **Only two are targeted at launch**: unplanned trippers and couples. This is '
         'sequencing, not oversight — both are individual users with fast decision loops, both are where mood-first '
         'is most differentiated, and neither requires the voice, large-text or policy work that pilgrimage and '
         'corporate acquisition would honestly need first.')

    h2(doc, '19.2 Phase 0 — Pre-launch (runs parallel to the build)')
    bullets(doc, [
        '**Product track:** finish the pipeline, the override layer and the reminder system; run the accessibility '
        'and failure-path passes; record the demo.',
        '**Go-to-market track, in parallel rather than after:** finalise brand and tagline (done); stand up a waitlist '
        'page led by the value proposition; seed a light content presence around the *feeling* of spontaneous travel '
        'with no product mentions yet; draft beta recruitment copy aimed at the two launch personas; and map five to '
        'ten micro-communities where they already gather — map them, do not post yet.',
        '**Exit criteria:** end-to-end pipeline working on the live URL, and a waitlist with real signups.',
    ])

    h2(doc, '19.3 Phase 1 — Private beta')
    bullets(doc, [
        '**Goal:** 50–100 real users from the two launch personas, generating usage data before anyone outside the '
        'team sees the product.',
        '**Recruitment:** waitlist first (owned, free), then personal invitations in the mapped communities — a '
        '50-person cohort does not need a broadcast channel. Ask each beta user for exactly one referral *after* they '
        'complete a plan, so growth stays proportional to real usage rather than to hype.',
        '**Framing:** "help us build this", not "free trial of a finished product". That sets the right expectation '
        'for simulated bookings.',
        '**Non-negotiable:** the analytics dashboard ships **before** the first beta user lands. A launch cannot be '
        'measured retroactively.',
        '**Cohort composition:** recruit the two segments in a fixed ratio (60/40) rather than first-come-first-'
        'served, or the cohort silently becomes all frequent travellers.',
    ])

    h2(doc, '19.4 Phase 2 — Public beta launch (single staged day)')
    table(doc, ['When', 'What'],
          [['Morning', 'Waitlist and private beta notified first — they get access to the public version and are '
                       'asked to share.'],
           ['Midday', 'Public content goes live in the channels seeded in Phase 0, leading with one real mood '
                      'becoming one real itinerary — shown, not described.'],
           ['Afternoon', 'The waitlist gate is removed; anyone can plan.']],
          widths=[1.1, 5.5])
    para(doc, '**Messaging hierarchy for the day.** Hook: *you don\'t need to know where you\'re going — you need to '
              'know how you want to feel.* Proof: one real plan, including the moment the Referee disagrees with the '
              'budget. Ask: try it, then tell us whether the plan was actually useful — which ties every piece of '
              'launch content back to the completion metric.')
    para(doc, '**Channels ranked for a zero-budget team:** owned (waitlist, existing following) → earned (beta '
              'referrals, organic community posts) → community (the mapped groups, now with a live product) → paid '
              '(**none planned**; there is no acquisition line in the cost structure, and that should be flagged '
              'explicitly rather than assumed).')
    para(doc, '**Exit criteria:** live beta monitored daily for 72 hours for agent failure patterns — vague mood '
              'input, no destination match, quota exhaustion.')

    h2(doc, '19.5 Phase 3 — Post-launch validation')
    bullets(doc, [
        '**Monday** — pull the metrics dashboard. **Wednesday** — read every survey response and interview note. '
        '**Friday** — queue exactly one prioritised fix or experiment for the next sprint.',
        '**Decision gate at week 16**, once the cohort has produced a full 30-day return cycle: if completion and '
        'return clear the agreed threshold, greenlight the next scope — real booking execution, voice and large-text '
        'accessibility, and the corporate motion. If not, diagnose *which* stage is leaking — brief abandonment, '
        'plan-generated-but-unused, or no return — because those three failure modes point to three different fixes, '
        'not one.',
    ])

    h2(doc, '19.6 Risks and mitigations')
    table(doc, ['Risk', 'Mitigation'],
          [['Mood-first entry reads as broken rather than novel — there is no destination field',
            'Onboarding shows rather than explains: a finished sample plan opens instantly, before any input is '
            'requested. Already built.'],
           ['A bad first plan becomes someone\'s only impression',
            'Mood-fidelity rules, deterministic money, and four zero-quota samples as a guaranteed-good fallback.'],
           ['Free-tier quota exhausted mid-demo',
            'Three-model failover, an identical-brief cache, and sample trips that need no quota at all. Already '
            'built and verified with the primary model fully spent.'],
           ['Growth stalls once the waitlist is exhausted, with no paid budget',
            'The referral ask is built into the product moment — immediately after a completed plan — rather than '
            'left to marketing.'],
           ['The team measures signups instead of validation',
            'The five launch metrics are agreed in advance and the dashboard ships before the first user.']],
          widths=[2.6, 4.0])

    h2(doc, '19.7 What this launch deliberately does not do')
    bullets(doc, [
        'No paid marketing spend — it is not in the cost structure.',
        'No corporate or B2B motion — a different buyer and sales cycle entirely.',
        'No pilgrimage acquisition until voice and large-text support exist.',
        'No booking or revenue push — deferred by scope.',
    ])
    para(doc,
         'Naming these out loud matters: it shows the launch is scoped to what the product can actually do, rather '
         'than marketing the full vision prematurely.')
