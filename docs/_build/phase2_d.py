"""Phase 2 submission — sections 20 to 31.

Sections 20 to 24 absorb the standalone companion document
(TripME_Phase2_Channel_UserFlow_UserJourney_MVP.docx) so there is one
submission rather than two overlapping ones. The persona name has been
reconciled to the team's canonical set — the companion doc called the
unplanned tripper "Ananya"; she is Prajakta everywhere now.
"""

from docxkit import bullets, callout, h1, h2, h3, page_break, para, placeholder, table


def build(doc):
    # ------------------------------------------------------------------ 20
    page_break(doc)
    h1(doc, '20 · Channel strategy')
    callout(doc, 'Answer in one line:',
            'TripME is **digital-first, owned-and-operated, single-channel by design in Phase 1** — a responsive web '
            'application — with a deliberately sequenced path to omnichannel rather than a simultaneous one.')

    h2(doc, '20.1 Online or offline?')
    para(doc,
         '**Online, without an offline component.** This is a design decision with a cost, not a default. The value '
         'the product creates — reconciling several travellers\' preferences, allocating a budget in code, arbitrating '
         'conflicts and re-pricing on every change — is computational. It cannot be delivered across a counter, and '
         'an offline presence would add cost without adding capability.')
    para(doc,
         '**What that excludes, stated plainly:** travellers who prefer a human agent, travellers with low digital '
         'fluency, and cash-first customers. Pilgrimage travellers — one of our six personas — are '
         'disproportionately represented in those groups. This is the strongest argument for a later assisted '
         'channel, and it is why partner-assisted access appears on the roadmap rather than being dismissed.')

    h2(doc, '20.2 Owned or franchised?')
    para(doc,
         '**Owned and operated, entirely.** No franchising, no white-labelling, no reseller layer in Phase 1.')
    table(doc, ['Reason', 'Detail'],
          [['The product is the channel',
            'There is nothing for a franchisee to operate — no territory, no inventory, no local fulfilment.'],
           ['Quality control during validation',
            'Every agent output is a direct expression of the brand promise. Intermediaries would obscure exactly the '
            'signal Phase 1 exists to collect.'],
           ['Nothing is stable enough to license',
            'Franchising means licensing a proven system. Ours is still being validated; licensing it now would be '
            'selling a hypothesis.'],
           ['Marginal cost is near zero',
            'The classic reason to franchise — capital and local presence for physical expansion — does not apply to '
            'software that scales without either.']],
          widths=[1.9, 4.7])
    para(doc,
         '**Where partnership does apply,** and it is a different thing from franchising: supply-side partnerships '
         'with heritage stays, experience operators and transport providers, plus distribution partnerships with '
         'corporate travel desks in the B2B motion. Those are integrations and agreements, not franchises of the '
         'brand.')

    h2(doc, '20.3 Single-channel or omnichannel?')
    para(doc,
         '**Single-channel now; omnichannel by sequence, not by simultaneity.** A four-to-five person team building '
         'three channels at once builds three mediocre ones. The order below is chosen so that each channel is only '
         'opened when the product genuinely benefits from it.')
    table(doc,
          ['Stage', 'Channel', 'Trigger to open it'],
          [['Now', 'Responsive web app (the whole product)', 'Live'],
           ['Next', 'Email', 'Live in a limited form — "email me this trip" is built; scheduled reminder delivery is '
                              'the next increment'],
           ['Then', 'Progressive Web App / installable mobile',
            'When repeat usage justifies an installed surface — reminders belong on a phone, not a browser tab'],
           ['Then', 'WhatsApp or SMS reminders',
            'When reminder engagement is proven in-app first. Building a delivery channel before knowing the message '
            'is wanted is the wrong order'],
           ['Later', 'Native apps', 'When retention justifies the cost of two more codebases'],
           ['Later', 'Assisted / partner-desk access', 'To reach the travellers Section 20.1 excludes']],
          widths=[0.75, 2.6, 3.25])

    h2(doc, '20.4 Channel parity — what is deliberately not identical')
    para(doc,
         'Parity is often stated as a goal. It should not be. Planning a seven-agent trip on a 5-inch screen and '
         'receiving a reminder on the same screen are different jobs, and forcing feature parity across surfaces '
         'produces a worse product on both.')
    table(doc, ['Surface', 'Job it does', 'What it deliberately omits'],
          [['Web (desktop)', 'Planning, comparing, arbitration review, overriding, confirming',
            'Nothing — this is the full product'],
           ['Web (mobile)', 'The same full flow, in a single column with the assistant collapsed to a bubble',
            'Nothing functionally; density and side-by-side comparison are reduced'],
           ['Email', 'Carrying a confirmed plan out of the product and into an inbox',
            'No planning, no overriding — read-only by intent'],
           ['Reminders (in-app)', 'Time-anchored nudges against a confirmed trip',
            'No agent interaction; a reminder is not a place to re-plan']],
          widths=[1.3, 2.9, 2.4])
    para(doc, 'What **is** held constant across every surface: the plan itself, the money, the reasoning trail, and '
              'the language the traveller chose. Those are the trust surface; layout is not.')

    # ------------------------------------------------------------------ 21
    page_break(doc)
    h1(doc, '21 · User flow')
    para(doc,
         'The flow below is what the deployed product does, screen by screen. Gates are marked, because the single '
         'most useful thing this diagram communicates is which steps are optional and which are locked.')

    h2(doc, '21.1 The primary flow')
    table(doc,
          ['#', 'Step', 'Screen / component', 'Gate'],
          [
              ['1', 'Land, understand the proposition, or open a sample plan', 'Landing page', '—'],
              ['2', 'Choose a travel path — solo, couple, group, family, pilgrimage or corporate', 'Planner entry',
               '—'],
              ['3', 'Give the brief — origin, dates, budget, party, mood', 'Planner form',
               'Validated client-side'],
              ['4', 'Watch the pipeline run, agent by agent, with live status', 'Agent stream', '—'],
              ['5', 'Read the plan — destination and evidence, budget split, day-by-day, bookings, arbitration',
               'Trip page', '—'],
              ['6', 'See the four remaining steps and where you are', 'Progress stepper', '—'],
              ['7', 'Adjust — swap destination, transport, stay, or edit any day', 'Options and itinerary editor',
               'Optional; re-prices everything'],
              ['8', 'Approve each booking above the threshold', 'Booking cards',
               '**Gate** — changing an amount revokes its approval'],
              ['9', 'Sign in with Google, or continue as a test user', 'Sign-in page',
               '**Gate** — required only to confirm or save'],
              ['10', 'Confirm the trip', 'Confirm panel', '**Gate** — needs step 8 complete and step 9 signed in'],
              ['11', 'Opt in to reminders, per trip', 'Confirm panel', 'Off by default; explicit opt-in'],
              ['12', 'Receive reminders in-app; optionally email the plan to yourself', 'Bell menu · email action',
               'Needs step 11'],
              ['13', 'Return to a saved trip later', 'My trips', 'Needs step 9'],
          ], widths=[0.3, 2.2, 2.3, 1.8], font=9)

    h2(doc, '21.2 Branches and escape hatches')
    bullets(doc, [
        '**Sample trips** — four complete plans open instantly with no brief and no model call. This is the '
        'zero-friction entry for a first-time visitor and the guaranteed-working path if quota is exhausted.',
        '**Out-of-scope destination** — named at the form, carried through the pipeline as an explicit field, and '
        'answered by Discovery opening with why it substituted. Never silently swapped.',
        '**Agent failure** — the pipeline fails over across three models. If a stage still fails, the page says which '
        'agent and why, and the rest of the plan survives.',
        '**Global assistant** — reachable on every page, draggable anywhere, answers product questions and offers '
        'pre-made questions that fill the input rather than firing immediately.',
        '**Leaving without signing in** — everything up to step 8 works signed out. The gate is placed at commitment, '
        'not at entry, because requiring an account before showing value is the most common way products lose their '
        'first session.',
    ])

    h2(doc, '21.3 Flow diagram')
    placeholder(doc, 'User-flow diagram rendered from the table above (Figma or Whimsical, exported as PNG).',
                'The table is the source of truth; the diagram is its visual form.')

    # ------------------------------------------------------------------ 22
    page_break(doc)
    h1(doc, '22 · User journey')
    para(doc,
         'The flow above is what the traveller does. The journey below is what it feels like — and where it still '
         'goes wrong. Traced with **Prajakta**, the unplanned tripper, because she is the primary launch persona.')
    table(doc,
          ['Stage', 'Doing', 'Thinking', 'Feeling', 'Friction — and what we did'],
          [
              ['Trigger', 'A long weekend appears on the calendar', '"I should go somewhere"', 'Restless, hopeful',
               'None. This is the strongest moment of intent and the product must be reachable in one search.'],
              ['Discovery', 'Lands on TripME, sees a sample plan open instantly',
               '"So I don\'t have to know where I\'m going?"', 'Curious, slightly sceptical',
               '**Was:** mood-first entry read as a broken form. **Fixed:** a finished plan is shown before anything '
               'is asked.'],
              ['Brief', 'Picks the solo path; gives origin, dates, budget and a mood',
               '"This is fewer questions than I expected"', 'Willing',
               '**Was:** origin silently defaulted to Bengaluru and leaked into reminders. **Fixed** — no assumed '
               'origin anywhere.'],
              ['Generation', 'Watches seven agents work, each reporting as it finishes',
               '"It\'s actually reasoning, not just autocompleting"', 'Engaged',
               'Waiting is the risk. Mitigated by streaming per-agent status rather than one spinner.'],
              ['First read', 'Reads the destination rationale, the budget split and the arbitration',
               '"It explained why — and it disagreed with itself"', 'Impressed, then evaluative',
               'The Referee is the moment the product stops looking like a chatbot. It is placed above the fold on '
               'the trip page for that reason.'],
              ['Adjust', 'Swaps the stay, edits day two',
               '"Good — it isn\'t telling me this is final"', 'In control',
               '**Was:** approvals survived a price change, so people approved ₹8,000 and confirmed ₹14,000. '
               '**Fixed** — changing an amount revokes its approval.'],
              ['Commit', 'Approves the bookings, signs in, confirms',
               '"Why am I signing in now?"', 'Mild friction, understood',
               '**Was:** the gate chain was invisible and the product looked unchanged. **Fixed** — a four-step '
               'stepper states the sequence from the moment a plan exists.'],
              ['Reminders', 'Opts in; gets departure, check-in and daily nudges',
               '"It remembers so I don\'t have to"', 'Reassured',
               '**Was:** reminders could name a hotel the traveller had rejected. **Fixed** — confirming rebuilds the '
               'schedule from the accepted choices.'],
              ['Trip', 'Follows the plan; taps through to real booking sites',
               '"I still have to book this myself"', 'Slight let-down',
               '**Open and honest gap.** Bookings are simulated; deep links are real. Labelled in the product, not '
               'only in this document.'],
              ['Return', 'Opens My Trips to plan the next one',
               '"Faster this time"', 'Habitual',
               'Preferences persist locally. Cross-device continuity needs server-side trips, which is a deliberate '
               'privacy trade-off, not an oversight.'],
          ], widths=[0.85, 1.4, 1.4, 0.95, 2.0], font=8.5)

    h2(doc, '22.1 The emotional curve, and where it dips')
    para(doc,
         'The curve rises through generation and first read, peaks at arbitration, holds through adjustment and '
         'commitment — and **dips once, at the moment of actual booking**. That dip is a scope decision rather than a '
         'design failure, and naming it precisely is more useful than smoothing it over: the product plans the whole '
         'trip and then hands the traveller to someone else to pay. Closing it is the first item of post-MVP scope '
         '(Section 8).')

    # ------------------------------------------------------------------ 23
    page_break(doc)
    h1(doc, '23 · Experimental Task 2 — two channels tested')
    para(doc,
         'Two channels were tested against the same objective — reaching the launch personas and converting attention '
         'into a completed plan.')

    h2(doc, 'Channel A — the owned product surface (in-product sample trips)')
    table(doc, ['Dimension', 'Result'],
          [['Hypothesis', 'A finished plan shown before any input is requested converts better than a form.'],
           ['Method', 'Four complete sample trips, openable in one click from the landing page, requiring no brief '
                      'and no model call.'],
           ['Cost', 'Zero marginal cost; entirely owned.'],
           ['What we learned', 'Showing beats explaining. This directly resolved the "mood-first entry looks broken" '
                               'risk, and it doubles as the quota-proof demo path.'],
           ['Verdict', '**Keep and lead with it.** This is the primary launch channel.']],
          widths=[1.5, 5.1])

    h2(doc, 'Channel B — third-party community distribution')
    table(doc, ['Dimension', 'Result'],
          [['Hypothesis', 'Travel micro-communities will engage with a mood-first planner more readily than a '
                          'broadcast audience will.'],
           ['Method', 'Five to ten communities mapped where the two launch personas already gather; qualitative '
                      'testing of message framing before any product link was posted.'],
           ['Cost', 'Time only; no spend.'],
           ['What we learned', 'Framing matters more than reach — "you don\'t need to know where you\'re going" '
                               'outperformed feature-led framing. Communities reject product links but accept a '
                               'demonstrated result.'],
           ['Verdict', '**Keep, but sequence it after the beta cohort**, so posts carry a working product rather '
                       'than a waitlist.']],
          widths=[1.5, 5.1])

    h2(doc, 'Comparison and decision')
    table(doc, ['', 'Channel A — owned product', 'Channel B — community'],
          [['Control', 'Total', 'None — moderator-dependent'],
           ['Cost', 'Zero', 'Zero, but time-expensive'],
           ['Scalability', 'Scales with traffic', 'Caps out per community'],
           ['Signal quality', 'High — real product behaviour', 'High but small-n'],
           ['Speed to result', 'Immediate', 'Days per community']],
          widths=[1.6, 2.5, 2.5])
    callout(doc, 'Decision:',
            'lead with **A**, use **B** as the amplifier once the beta cohort exists. Paid channels were evaluated '
            'and **rejected for Phase 1** — with no acquisition line in the cost structure, testing a channel we '
            'cannot fund would produce a result we could not act on.')

    h2(doc, 'Prior experimental context')
    para(doc,
         'The team\'s earlier InsurePrep channel test is retained as methodological evidence — it is where the '
         'compare-two-channels-on-one-objective method was learned. It is explicitly **not** TripME data, and is not '
         'presented as such.')

    # ------------------------------------------------------------------ 24
    page_break(doc)
    h1(doc, '24 · Renewal interviews')
    h2(doc, '24.1 The five renewal interviews conducted')
    para(doc,
         'Five renewal interviews were conducted on **Netflix**, chosen because it is a subscription product with a '
         'genuine, recurring, conscious renewal decision — which is precisely what TripME does not yet have, and '
         'therefore the right place to learn the method.')
    table(doc, ['Artefact', 'Link'],
          [['Renewal interview recordings (5)',
            'https://drive.google.com/drive/folders/1vnoTW2Min9qvPWU9s9as7inWcCv4chEA']],
          widths=[2.1, 4.5])
    h3(doc, 'What transferred to TripME')
    bullets(doc, [
        'Renewal decisions are made on **remembered value**, not on total value received — people renew on what they '
        'used recently, not on what they used most. This is the argument for a post-trip prompt at peak satisfaction '
        'rather than at renewal time.',
        'The decision is **passive until something disturbs it** — a price change, a gap in usage, a better '
        'alternative surfacing. For TripME, the equivalent disturbance is a trip planned without us, which means the '
        'window to matter is before the next trip is conceived, not after.',
        'Interviewees could rarely name what they would lose by cancelling. A product whose value cannot be '
        'articulated by its own users has a positioning problem, not a retention problem — which is why "can you '
        'explain what the Referee did" is one of our launch metrics.',
    ])

    h2(doc, '24.2 The TripME renewal script')
    para(doc,
         'Renewal is the honest word for what matters here, but it has to be reframed: travel is episodic and there '
         'is no subscription, so the question is not "will they resubscribe" but **"will they come back for the next '
         'trip instead of reverting to six apps?"** The script below adapts the Netflix method to that.')
    table(doc, ['#', 'Question'],
          [['1', 'Since you planned that trip with TripME, have you planned another trip? What did you use?'],
           ['2', 'If you did not come back — what happened? Walk me through what you did instead.'],
           ['3', 'What did you actually use from the plan during the trip, and what did you ignore?'],
           ['4', 'Did the budget hold? If it did not, where did it break?'],
           ['5', 'Did you tell anyone about it? What did you say?'],
           ['6', 'What would have to be true for this to be the first thing you open next time?'],
           ['7', 'What is the one thing that would stop you coming back?']],
          widths=[0.4, 6.2])
    h2(doc, 'How the answers feed back')
    bullets(doc, [
        'Question 2 separates the three failure modes — forgot, did not trust it, or did not need it — which point to '
        'three different fixes: reminders, transparency, and positioning respectively.',
        'Question 3 is the most valuable, because what people ignore reveals which agent is producing output nobody '
        'reads.',
        'Question 4 validates or falsifies the entire deterministic-money design.',
    ])
    placeholder(doc, 'Renewal interview responses — to be collected from the private beta cohort after their first '
                     'completed trip.', 'Scheduled for Phase 1, Week 8 onward.')

    # ------------------------------------------------------------------ 25
    page_break(doc)
    h1(doc, '25 · Customer service strategy')
    para(doc,
         'The strategy starts from an unusual position: **the product is designed so that most support tickets never '
         'need to exist.** Every failure state explains itself in place, every agent decision shows its reasoning, '
         'and the global assistant answers product questions on every page. Support is the fallback, not the front '
         'door.')

    h2(doc, '25.1 Tiers')
    table(doc,
          ['Tier', 'Channel', 'Handles', 'Target response'],
          [['0 — Self-serve', 'In-product: the global assistant, the progress stepper, inline failure messages, the '
                              'raw agent log', 'Why did it suggest this · what happens next · why is this locked',
            'Instant'],
           ['1 — Async', 'Email via the contact page', 'Account and sign-in, plan quality complaints, bugs',
            '24 hours'],
           ['2 — Escalation', 'Named team owner', 'Money discrepancies, data or privacy requests, repeated agent '
                                                  'failure', '4 hours'],
           ['3 — Post-monetisation', 'Live chat during Indian business hours', 'Payment and booking failures',
            'Not staffed in Phase 1 — flagged rather than promised']],
          widths=[1.15, 1.9, 2.55, 1.0], font=9)

    h2(doc, '25.2 Principles')
    bullets(doc, [
        '**Never make a person ask why.** If an agent made a call, the reason is on the page already.',
        '**Fail loudly and specifically.** "This agent hit a snag" was a real defect — it told the traveller nothing '
        'and was replaced with the actual cause and the actual next step.',
        '**Never hide a limitation behind support.** Simulated bookings and the India-only scope are stated in the '
        'product, so they never arrive as a surprise ticket.',
        '**Every escalation becomes a product change.** A repeated ticket is a design defect, and the sprint '
        'retrospective is where it is treated as one.',
    ])

    h2(doc, '25.3 What we do not do')
    para(doc,
         'No chatbot pretending to be a person, no ticket deflection targets, and no support channel we cannot '
         'staff. Advertising 24/7 live chat that a five-person team cannot answer is worse than advertising nothing.')

    # ------------------------------------------------------------------ 26
    page_break(doc)
    h1(doc, '26 · Customer lifetime value and renewal')
    callout(doc, 'Stated honestly:',
            'TripME has **no revenue today**, so every figure below is a model with named assumptions, not a '
            'measurement. It is included because the structure of the model drives product decisions even before any '
            'money moves.')

    h2(doc, '26.1 The CLV structure')
    table(doc, ['Term', 'Definition for TripME', 'Phase 1 status'],
          [['Trips per user per year', 'Domestic trips planned through TripME', 'To be measured — the single most '
                                                                               'important input'],
           ['Take rate per trip', 'Booking commission once real booking exists', 'Modelled only'],
           ['Attach rate', 'Share of confirmed plans that convert to booked plans', 'Not measurable until booking '
                                                                                   'ships'],
           ['Retention (annual)', 'Users returning for a second trip within twelve months', 'To be measured from the '
                                                                                           'beta cohort'],
           ['Gross margin', 'Revenue less inference and provider cost', 'Inference cost is currently zero '
                            '(free tier); this will not survive scale']],
          widths=[1.5, 3.1, 2.0])
    para(doc, '**CLV = (trips per year × take rate per trip × gross margin) × expected years retained.** With '
              'three of five inputs unmeasured, publishing a rupee figure would be false precision. What the '
              'structure does tell us is where to push.')

    h2(doc, '26.2 What the model implies for the product')
    bullets(doc, [
        '**Trips per year dominates.** Travel is episodic and low-frequency, so a product that is only opened once a '
        'year has a weak CLV regardless of take rate. This is the argument for reminders, saved trips and cross-trip '
        'preference memory — they exist to raise frequency, not to add surface area.',
        '**Group trips multiply the numerator.** One organiser plans for five, and each of those five is a potential '
        'planner. That is why groups are the first secondary segment despite being harder to build for.',
        '**Retention is cheaper than acquisition here.** With no paid budget, the only affordable growth is a second '
        'trip from someone already acquired.',
    ])

    h2(doc, '26.3 Renewal levers, ranked')
    table(doc, ['Lever', 'Mechanism', 'Built?'],
          [['Reminders', 'Time-anchored, opt-in, and tied to a real trip', 'Yes'],
           ['Saved trips', 'A returning traveller starts from their own history', 'Yes'],
           ['Preference memory', 'The second brief is shorter than the first', 'Yes'],
           ['Post-trip prompt', 'Ask for the next trip at the moment satisfaction peaks', 'No — scoped'],
           ['Group virality', 'Each co-traveller inherits the plan and can fork it', 'No — scoped'],
           ['Pro tier', 'Group splitting and cross-trip analytics', 'No — post-monetisation']],
          widths=[1.5, 4.1, 1.0])

    # ------------------------------------------------------------------ 27
    page_break(doc)
    h1(doc, '27 · Growth hacks and growth loops')
    para(doc,
         'A growth hack is a one-off tactic; a growth loop is a mechanism where the output of one user\'s usage '
         'becomes the input to acquiring the next. Loops are what we are designing for — hacks are listed separately '
         'and honestly labelled as tactics.')

    h2(doc, '27.1 Loops')
    table(doc,
          ['Loop', 'How it turns over', 'Status'],
          [
              ['Group-invite loop',
               'An organiser plans a group trip → each co-traveller receives the plan → each becomes a planner for '
               'their next trip → they organise a group. Each turn adds four to six users for one acquisition.',
               'Designed; the invite mechanism is post-MVP'],
              ['Plan-share loop',
               'A completed plan is inherently shareable — it is a finished artefact, not a link to a form. Shared '
               'plans open as read-only samples, which is exactly the zero-friction entry that already converts best.',
               'Half built — sample plans and email-me-this-trip exist; public share links do not'],
              ['Content loop',
               'Real generated plans for Indian destinations become indexable itinerary pages → organic search '
               'traffic → new planners → more plans. Content that the product produces as a by-product of being '
               'used.', 'Designed; needs server-side plans, which conflicts with the current privacy stance and must '
                        'be resolved with explicit opt-in'],
              ['Reminder loop',
               'Reminders bring a traveller back during the trip → in-trip presence makes the post-trip prompt land → '
               'the post-trip prompt starts the next plan.', 'Half built — reminders live; the post-trip prompt is '
                                                             'scoped'],
          ], widths=[1.3, 4.0, 1.3], font=9)

    h2(doc, '27.2 Tactics')
    bullets(doc, [
        '**Ask for exactly one referral, at the moment a plan completes** — the peak of perceived value, and the only '
        'moment the ask is not an interruption.',
        '**Zero-friction sample plans** as the top-of-funnel — already the highest-converting surface we have.',
        '**Seed the mapped micro-communities with results, not links** — validated in Section 23.',
        '**Waitlist-first launch day**, so the earliest users arrive with a reason to share.',
        '**"Planned with TripME" attribution** on shared plans — passive attribution rather than a growth gimmick.',
    ])

    h2(doc, '27.3 Growth tactics we have ruled out')
    para(doc,
         'Fake scarcity counters, urgency framing on prices, forced sign-in before value, mandatory referral to '
         'unlock features, and inflated social proof. Two of these were considered and rejected during the build. The '
         'ethics section commits us to this, and a growth section that quietly contradicts it would make both '
         'worthless.')

    # ------------------------------------------------------------------ 28
    page_break(doc)
    h1(doc, '28 · Analysing a business customer support journey')
    para(doc,
         'A structured teardown of a comparable travel product\'s support journey, used to derive the strategy in '
         'Section 25.')
    table(doc,
          ['Stage', 'What to record', 'What TripME does differently'],
          [['Trigger', 'What went wrong and how the customer noticed',
            'Most of our failure states surface themselves in place before the customer has to notice'],
           ['Finding help', 'How many clicks to a human; whether a bot blocks the path',
            'The assistant is on every page and never pretends to be a person'],
           ['First response', 'Time, and whether it addressed the actual question',
            'Tier 1 target is 24 hours, with a named owner rather than a queue'],
           ['Resolution', 'Number of handoffs; whether context had to be repeated',
            'Repeating context is the exact failure the product was built to eliminate; it would be indefensible in '
            'our own support'],
           ['Follow-up', 'Whether the root cause was fixed or the ticket merely closed',
            'Every escalation is reviewed in the sprint retrospective as a design defect']],
          widths=[1.0, 2.6, 3.0])
    placeholder(doc, 'The completed teardown of the chosen company — screenshots of each stage, timestamps, and the '
                     'transcript.',
                'The framework above is the deliverable structure; the team supplies the observed company data.')

    # ------------------------------------------------------------------ 29
    page_break(doc)
    h1(doc, '29 · Wireframes and design')
    para(doc,
         'The product is built and deployed, so the highest-fidelity design artefact available is the live '
         'application itself. Wireframes are supplied for the screens that carry the argument.')
    table(doc, ['Screen', 'What it must show'],
          [['Landing', 'Mood-first proposition; sample plans openable in one click'],
           ['Planner entry', 'Six travel paths as first-class choices, not a dropdown'],
           ['Brief form', 'Origin, dates, budget, party, mood — no assumed defaults'],
           ['Agent stream', 'Seven agents reporting individually, with per-agent failure states'],
           ['Trip page', 'Destination evidence · budget split · day-by-day · bookings with gates · arbitration · '
                         'the four-step stepper'],
           ['Options and editor', 'Real alternatives with images; every change re-prices the trip'],
           ['Confirm panel', 'The gate chain, the opt-in reminder switch, and email-me-this-trip'],
           ['Reminders', 'The bell menu with grouped, time-anchored reminders'],
           ['Sign-in', 'Google, plus the test-user path, with the privacy position stated'],
           ['My trips', 'Saved trips with status, and no duplicates']],
          widths=[1.6, 5.0])
    callout(doc, 'Delivered:',
            '**TripME_Wireframes_and_Screens.docx**, submitted alongside this document. It covers 22 screens across '
            '42 images, every one captured from the live deployment rather than drawn — including one plan generated '
            'live during the capture session, in which the Referee rejected the Itinerary Agent\'s work and sent it '
            'back to the Budget Agent. It also carries the implemented design system and an index mapping each claim '
            'in this submission to the screen that evidences it.')

    # ------------------------------------------------------------------ 30
    page_break(doc)
    h1(doc, '30 · MVP demonstration')
    para(doc, 'The MVP is live and can be evaluated directly rather than only described.')
    table(doc, ['Artefact', 'Location'],
          [['Live product', 'https://tripme-khaki.vercel.app'],
           ['Source code', 'https://github.com/divyamsingh4444/tripme'],
           ['Sample plans (no sign-in, no quota)', '/samples — four complete trips'],
           ['Agent architecture in-product', '/how-it-works']],
          widths=[2.1, 4.5])

    h2(doc, 'Suggested demonstration sequence')
    bullets(doc, [
        'Open a sample plan — a complete trip with no input at all.',
        'Run a live brief on the solo path with a mood and a budget, and watch the seven agents report in turn.',
        'Read the destination evidence and the budget allocation.',
        'Open the arbitration section — this is where the product stops resembling a single prompt.',
        'Change the stay, and show the total re-price and the approval revoke.',
        'Approve, sign in, confirm, opt in to reminders, and open the bell.',
        'Ask the global assistant a question from a different page.',
        'Switch the language and show the agent output translated.',
    ], numbered=True)
    placeholder(doc, 'Recorded MVP demonstration video (screen capture with narration, 5–8 minutes).',
                'Follow the sequence above; it is ordered to build the argument, not to tour the UI.')

    # ------------------------------------------------------------------ 31
    page_break(doc)
    h1(doc, '31 · Appendix — reconciliation registers')
    h2(doc, '31.1 Corrections to the earlier Phase 2 drafts')
    para(doc,
         'This document supersedes the earlier Phase 2 draft, the standalone channel/flow/journey companion document '
         'and the Moodmap launch-strategy document. Every material correction is listed below, so a reader comparing '
         'versions can see what changed and why. Nothing has been quietly altered.')
    table(doc,
          ['#', 'Earlier claim', 'Corrected to', 'Why'],
          [
              ['1', 'PRD described "Smart Travel Companion" with five agents — Scout, Closer, Money Optimizer, '
                    'Recommender, Referee', 'PRD rewritten for TripME\'s seven agents', 'It described a different '
               'product; only the Referee name survived'],
              ['2', 'MVP covers solo and couple paths only', 'All six paths are built and demonstrable',
               'The demo would have contradicted the document — the most dangerous class of error here'],
              ['3', 'Referee and Notification agents excluded from MVP', 'Both are built and in the MVP',
               'Same reason; the Referee is the product\'s central differentiator'],
              ['4', 'Accessibility: "English only, with a text-size toggle"',
               'Seven languages including translated agent output; no text-size toggle yet',
               'Both halves were wrong, in opposite directions'],
              ['5', 'Stack: LangGraph, Node, Python, vector DB, AWS/GCP, microservices',
               'Next.js on Vercel, Groq inference, browser-local storage, no vector DB',
               'The claimed stack was the funded version, presented as the built one'],
              ['6', 'A single model, "Llama 3.3 70B"', 'Three models with per-agent failover',
               'Failover is a real engineering answer to a real constraint and understating it loses credit'],
              ['7', '"India and global destinations"', 'India only, enforced in the pipeline',
               'Scope is enforced in code; claiming global would fail on first test'],
              ['8', 'Expense splitting excluded from MVP', 'Built', 'Understated'],
              ['9', 'PEAS: Booking Agent "executes reservations"', 'Simulates bookings; deep links are real',
               'Overstated capability — the correction protects the demo'],
              ['10', 'Six agents in the architecture section, seven elsewhere', 'Seven everywhere',
               'Internal inconsistency'],
              ['11', 'Corporate persona goals duplicated the pilgrimage persona\'s', 'Rewritten from the built '
                                                                                    'corporate path', 'Copy-paste error'],
              ['12', 'Launch strategy written for "Moodmap" with personas Priya, Arjun and Meera',
               'Rewritten for TripME with the canonical six personas',
               'Wrong product name and a conflicting persona set'],
              ['13', 'Companion document named the unplanned tripper "Ananya"', 'Prajakta, everywhere',
               'One canonical persona set across all documents'],
              ['14', 'Roughly twelve questions left unanswered', 'All answered', 'Completeness'],
          ], widths=[0.3, 2.3, 2.1, 1.9], font=8.5)

    h2(doc, '31.2 Phase 1 commitments versus what was built')
    para(doc,
         'Phase 1 made specific commitments. Some were met, some were exceeded, and some were revised on evidence. '
         'Revising a commitment because the build taught you something is the correct outcome of an iterative '
         'process; revising one silently is not. Every divergence is below.')
    table(doc,
          ['Phase 1 commitment', 'What was built', 'Verdict'],
          [
              ['A mood-first multi-agent pipeline', 'Seven agents with typed handoffs, a backward edge and dynamic '
                                                    'per-traveller Advocates', '**Met and exceeded** — the backward '
               'edge and Advocates were not in the Phase 1 design'],
              ['Planning in under 60 seconds',
               'Met, and instrumented. The product measures its own agent time and prints it on every trip page: 34s '
               'on a stored sample, 58s on a live run that the Referee sent back for re-planning (nine agent calls '
               'rather than seven)',
               '**Met, with the definition stated.** The counter measures agent time — it excludes queueing for '
               'free-tier quota and the deliberate pauses that make each handoff readable, and the product says so on '
               'screen rather than quietly counting the favourable number. Wall-clock on a congested free tier can '
               'exceed this; the claim is about the agents, not the queue'],
              ['Six customer segments',
               'All six are built as first-class paths; two are targeted for acquisition at launch',
               '**Met in product, narrowed in go-to-market** — deliberately, and stated in Section 16.2'],
              ['Four revenue models',
               'All four are retained in the Lean Canvas; none is implemented',
               '**Deferred by scope.** Phase 1 is validation-first; no pricing exists in this release'],
              ['End-to-end trip lifecycle including booking',
               'Planning, pricing, arbitration, approval, confirmation and reminders are built; booking is simulated '
               'with real deep links',
               '**Partially met.** The single largest known gap, labelled in the product and first on the post-MVP '
               'list'],
              ['India-forward cultural depth', 'India-only scope enforced in the pipeline; English plus six Indian '
                                               'languages, including translated agent output; heritage-weighted '
                                               'discovery',
               '**Met and exceeded** — multilingual support was not a Phase 1 commitment'],
              ['Transparent, explainable recommendations',
               'Per-non-negotiable evidence, arbitration stated in rupees, and the raw agent log on every trip page',
               '**Met and exceeded**'],
          ], widths=[1.9, 2.5, 2.2], font=8.5)

    h2(doc, '31.3 Known gaps, stated rather than hidden')
    table(doc, ['Gap', 'Status'],
          [['Real booking execution', 'Deliberately out of MVP scope; simulated and labelled as such'],
           ['Scheduled email and WhatsApp reminder delivery', 'In-app reminders and on-demand email are live; '
                                                              'scheduled delivery is the next increment'],
           ['Voice input and large-text mode', 'Owed before any pilgrimage acquisition'],
           ['Cross-device trip continuity', 'A consequence of the local-only privacy stance; needs explicit opt-in to '
                                            'resolve'],
           ['Wireframes and demo recording', 'Placeholders above; the live product stands in the interim'],
           ['Regional-coverage bias audit', 'Rules are in place; the standing audit is owed']],
          widths=[2.4, 4.2])
    para(doc,
         'A submission that lists its own gaps is more useful than one that does not, because every gap here is '
         'either a scope decision with a reason or a scheduled item with an owner.', italic=True)
