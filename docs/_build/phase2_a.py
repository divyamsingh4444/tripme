"""Phase 2 submission — sections 0 to 9."""

from docxkit import bullets, callout, h1, h2, h3, page_break, para, placeholder, table

LIVE_URL = 'https://tripme-khaki.vercel.app'
REPO_URL = 'https://github.com/divyamsingh4444/tripme'


def build(doc):
    # ------------------------------------------------------------------ 0
    page_break(doc)
    h1(doc, '0 · Submission index, and how this document was produced')

    para(doc,
         'This document answers every question in the Phase 2 guidelines in the order they are asked. '
         'Two things about how it was written matter for reading it.')

    para(doc,
         '**It was written backwards from a working product.** TripME is built, deployed and usable at the link '
         'below. Every claim about what the product does was checked against the running application rather than '
         'against an intention. Where the product does less than the vision, the document says so and defends the '
         'scope; where it does more than an earlier draft assumed, the document has been corrected to match.')

    para(doc,
         '**It reconciles the Phase 1 submission with what was actually built.** Phase 1 committed us to a '
         'mood-first multi-agent pipeline, an under-60-second planning claim, six customer segments and four '
         'revenue models. Appendix 31.2 records every place the build diverged from those commitments and why, '
         'alongside every correction made to the earlier drafts. Nothing was quietly changed.')

    h2(doc, 'Submission links')
    table(doc,
          ['Artefact', 'Link', 'Status'],
          [
              ['Live product', LIVE_URL, 'Live'],
              ['Source code', REPO_URL, 'Public'],
              ['MVP demo recording', '[ TO BE INSERTED — unlisted YouTube link ]', 'Owed'],
              ['Wireframes (clickable)', '[ TO BE INSERTED — Figma share link ]', 'Owed'],
              ['Product Requirements Document', 'TripME_PRD.docx — submitted alongside this document', 'Complete'],
              ['JTBD interviews (5)',
               'https://drive.google.com/drive/folders/1yiCTZ4YJTHeOnPm_pLVV9-shvfJw44-k', 'Complete'],
              ['JTBD raw responses (form)', 'https://forms.gle/3ZgW7KTDZnFQMbcdA', 'Complete'],
              ['JTBD response sheet',
               'https://docs.google.com/spreadsheets/d/1aB4qdZWV1mrz3TsJ7M8LPNKvAvWIgDmHMDUcRljwx80', 'Complete'],
              ['Renewal interviews (5, Netflix)',
               'https://drive.google.com/drive/folders/1vnoTW2Min9qvPWU9s9as7inWcCv4chEA', 'Complete'],
              ['Jira board', 'Screenshots in Section 13', 'Complete'],
              ['Tester feedback guide', 'docs/TESTING_GUIDE.md in the repository', 'Complete'],
          ], widths=[2.1, 3.6, 0.9])

    placeholder(doc, 'Team member names, student IDs and individual contribution statement.',
                'Required by the submission checklist; insert before the cover page is finalised.')

    # ------------------------------------------------------------------ 1
    page_break(doc)
    h1(doc, '1 · Outline the design thinking process')

    h2(doc, 'Stage 1 — Empathise')
    para(doc,
         'We began with a landscape scan of what an Indian traveller actually opens when they plan a trip, and what '
         'each of those apps still forces them to do somewhere else.')
    table(doc,
          ['Category', 'Apps', 'What they do well', 'What they force the user to do anyway'],
          [
              ['Flight/hotel booking', 'MakeMyTrip, Expedia, Booking.com', 'Large inventory, price comparison',
               'Research the destination somewhere else first'],
              ['Search/discovery', 'Google Travel, Skyscanner', 'Fast price search',
               'No personalisation, no continuity into booking'],
              ['Itinerary/planning', 'Wanderlog, TripIt', 'Organises a plan you already have',
               'Will not help you decide where to go, or what it should cost'],
              ['Reviews/culture', 'TripAdvisor', 'Rich local recommendations', 'Disconnected from booking and budget'],
              ['Food/experiences', 'Zomato, EazyDiner', 'Good in-city discovery', 'A separate app once you land'],
              ['Local transport', 'Uber, Ola, IRCTC', 'Functional point solutions', 'Another app, login and payment'],
              ['Expense tracking', 'Splitwise, spreadsheets', 'Manual splitting',
               'Every cost re-entered by hand, disconnected from the booking'],
          ], widths=[1.1, 1.5, 1.5, 2.5])

    callout(doc, 'Core empathy finding:',
            'the traveller does not have a booking problem or a planning problem in isolation. They have a '
            '**fragmentation problem across the whole trip lifecycle** — before (research), during (bookings, local '
            'discovery, transport) and after (what was actually spent, by whom). No app in the market spans all three.')

    para(doc, 'Needs observed across the six segments carried forward from Phase 1:')
    bullets(doc, [
        '**Unplanned tripper** — speed, and one decision-ready plan instead of eight tabs.',
        '**Frequent optimiser** — a system that remembers preferences across trips rather than starting cold.',
        '**Group coordinator** — shared visibility of who is paying for what, not a WhatsApp poll and a Splitwise link.',
        '**Cultural/heritage traveller** — Indian depth surfaced during planning, not discovered after landing.',
        '**Budget-conscious traveller** — knowing, before booking anything, how the money divides across transport, '
        'stay, food, activities and buffer.',
        '**Household and policy travellers** — a family with mixed ages, or an employee inside a travel policy, where '
        'the binding constraint is not mood at all.',
    ])

    h2(doc, 'Stage 2 — Define')
    callout(doc, 'Point of view:',
            'Travellers need **one system that plans a whole trip and holds the money honest**, because today '
            'planning, booking, local discovery and expense tracking each live in a different app — forcing the same '
            'trip context to be re-entered five or six times, and leaving no single source of truth for what a trip '
            'actually costs.')
    para(doc, '**How Might We questions**')
    bullets(doc, [
        'How might we take someone from "I want to travel" to a complete, costed, committable plan without leaving '
        'one app?',
        'How might we surface India\'s cultural and heritage depth as the subject rather than as one row in a global '
        'list?',
        'How might we make budget certainty a promise before the trip and a reality during it?',
        'How might we design one experience that adapts to a solo tripper, a couple, a group, a household, a '
        'pilgrim and a corporate traveller without six separate products?',
        'How might we make the reasoning visible enough that a traveller trusts it more than comparing five apps '
        'themselves?',
    ], numbered=True)

    h2(doc, 'Stage 3 — Ideate')
    para(doc,
         '**TripME is a trip operating system, not a booking app.** No existing product spans planning, discovery and '
         'money in one place: Splitwise books nothing, MakeMyTrip tracks nothing against a plan, Wanderlog handles no '
         'money, TripAdvisor does neither.')

    h3(doc, 'SCAMPER')
    bullets(doc, [
        '**Combine** — planning, booking, local discovery and expense tracking into one pipeline.',
        '**Adapt** — the mood-first pattern from wellness products, applied to travel discovery.',
        '**Eliminate** — the second app during a trip: local transport, food and activities are planned inline.',
        '**Reverse** — instead of the traveller reconciling spend after the trip, the system holds planned-versus-'
        'committed spend live, and re-prices the moment anything changes.',
    ])

    h3(doc, 'ERRC grid')
    table(doc, ['Eliminate', 'Reduce', 'Raise', 'Create'],
          [['App-switching between booking, discovery and expense tools',
            'Manual re-entry of the same trip context',
            'Transparency of the reasoning behind every recommendation',
            'A budget that is enforced in code and re-priced on every change'],
           ['Generic destination lists that under-represent India',
            'Time spent reconciling group costs by hand',
            'India-forward cultural depth as the default, not an option',
            'Agents that can reject each other\'s work in front of the user']],
          widths=[1.65, 1.65, 1.65, 1.65])

    h3(doc, 'The architecture the ideation produced')
    para(doc,
         'Phase 1 proposed five agents. Ideation and the build together took that to **seven, plus a dynamic '
         'Advocate per traveller**. The seventh is not padding: the Referee is the agent that turns a sequence into a '
         'system, because it can send work backwards.')
    bullets(doc, [
        '**Mood & Intent Agent** — converts feeling and constraints into a structured brief. Four variants: standard, '
        'household, pilgrimage and policy.',
        '**Discovery Agent** — chooses the destination and two alternates, and must show where each non-negotiable is met.',
        '**Budget Agent** — allocates the whole budget before anything is booked.',
        '**Itinerary Agent** — plans the days at honest local prices, and is deliberately never shown the budget.',
        '**Booking Agent** — prepares simulated bookings inside the allocation, each behind an approval gate.',
        '**Referee Agent** — audits Itinerary against Budget and arbitrates three conflict classes: money, family '
        'pacing and corporate policy. It can send the brief back to be re-planned.',
        '**Notification Agent** — builds the reminder schedule and chooses a channel per persona.',
        '**Traveller Advocate (dynamic)** — one instance per person in couple and group mode, instructed to argue for '
        'that person and never compromise.',
    ])

    h3(doc, 'Monetisation ideation')
    bullets(doc, [
        '**Booking commission** on transport, stays and activities booked through the product.',
        '**Early-bird plan lock-in** — a discount for committing to a whole plan rather than a single component. '
        'Novel because it prices the plan, not the room.',
        '**Freemium / Pro** — group expense splitting, unlimited alternates and cross-trip spend analytics above a '
        'free tier.',
        '**Affiliate and partner placements** — curated Indian heritage and experience partners, surfaced '
        'contextually rather than as advertising.',
        '**Referral incentives** tied to group trips, since a group trip brings its own new users.',
    ])
    callout(doc, 'Scope note:',
            'none of these are implemented. TripME takes no payment and makes no reservation. They are recorded here '
            'as the business model the product is designed to support, not as shipped features.')

    h2(doc, 'Stage 4 — Prototype')
    para(doc,
         'We did not stop at low-fidelity screens. The prototype is a **working, deployed, publicly reachable '
         'application** — which is why the wireframes in Section 30 are drawn from the built flow rather than ahead of '
         'it. That order is unusual and worth stating plainly: the flow was validated by building it, and the '
         'wireframes document the flow that survived.')

    h2(doc, 'Stage 5 — Test')
    para(doc,
         'Testing ran on three tracks, all of which produced changes to the product rather than notes: five JTBD '
         'interviews (Section 10), continuous browser-verified QA against the live build (Section 8), and a tester '
         'guide circulated to people outside the team (repository, docs/TESTING_GUIDE.md).')
    callout(doc, 'What testing actually changed:',
            'the single largest reversal was scope. The MVP was originally drawn at Solo and Couple only. Building it '
            'showed the Referee was not an optional add-on — without it, the product is a sequence of prompts and the '
            'core hypothesis cannot be tested at all. Section 7 records that decision and its consequences honestly.')

    # ------------------------------------------------------------------ 2
    page_break(doc)
    h1(doc, '2 · User personas')
    para(doc,
         'Six personas, each of which changes what the agents do rather than only what the form asks. Every one of '
         'them is a working entry path in the product today.')

    personas = [
        ('Persona 1 — Solo traveller', [
            ('Name', 'Prajakta Shinde, 27, Product Marketer, Bengaluru'),
            ('Behaviour', 'Travels alone at short notice; dislikes research; plans on her phone between meetings'),
            ('Goals', 'One complete, committable plan quickly; safety-aware suggestions; to know exactly what it cost'),
            ('Frustrations', 'Every OTA assumes she already knows where she is going; solo safety is factored in nowhere'),
            ('Entry path', 'Mode select → Solo → mood quiz'),
            ('Notification need', 'Standard push; she is the sole point of contact for every reminder'),
            ('Quote', '"I don\'t want to plan a trip. I want a trip — and I want to know what it cost me."'),
        ]),
        ('Persona 2 — Couple', [
            ('Name', 'Karan & Tejaswi, late 20s, Mumbai'),
            ('Behaviour', 'Two or three trips a year together; want a plan that balances both'),
            ('Goals', 'One itinerary blending two moods; a shared, transparent view of spend, since costs are split'),
            ('Frustrations', 'Apps optimise for one traveller; splitting afterwards is manual'),
            ('Entry path', 'Mode select → Couple → both moods and budgets → two Advocates → Referee blends them'),
            ('Notification need', 'The same booking alerting both people'),
            ('Quote', '"He wants a trek, I want a spa day. We need a plan, not a compromise fight."'),
        ]),
        ('Persona 3 — Group of friends', [
            ('Name', 'Mrunal Tupe, 26, organising for five'),
            ('Behaviour', 'Reconciles preferences over WhatsApp; settles up in Splitwise afterwards'),
            ('Goals', 'One consensus plan without endless debate; splitting tied to what was actually booked'),
            ('Frustrations', 'Decision fatigue, late vetoes, awkward settling-up'),
            ('Entry path', 'Mode select → Group → each member submits mood and budget → one Advocate each → Referee '
                           'publishes who conceded what'),
            ('Notification need', 'Group-wide reminders plus individual balance alerts'),
            ('Quote', '"By the time we agree on a hotel, half the group has lost interest — and we still have to work '
                      'out who owes who."'),
        ]),
        ('Persona 4 — Family', [
            ('Name', 'The Sharma family — two adults (40s), children aged 8 and 13, often a grandparent'),
            ('Behaviour', 'Plans around school holidays; needs child-friendly pacing and senior accessibility'),
            ('Goals', 'An itinerary that works for every age band at once, and one household budget'),
            ('Frustrations', 'Products optimise for a single traveller, not a household with mixed needs'),
            ('Entry path', 'Mode select → Family → household profiles (adult/child/senior) drive pacing and the '
                           'Referee\'s pacing audit'),
            ('Notification need', 'One organiser receives everything; other adults optional'),
            ('Quote', '"I need a plan that works for an 8-year-old, a 13-year-old and my mother-in-law at the same time."'),
        ]),
        ('Persona 5 — Pilgrimage', [
            ('Name', 'Shaila & Sumit Joshi, 60s, Nashik, planning Char Dham'),
            ('Behaviour', 'Travels on a religious calendar; prioritises accessible transport, verified stays and diet'),
            ('Goals', 'A trustworthy plan with minimal digital friction and no ambiguity about cost'),
            ('Frustrations', 'Apps assume high digital fluency; darshan timing and route order are served by nobody'),
            ('Entry path', 'Mode select → Pilgrimage → circuit, tradition, mobility and dietary rule instead of a mood quiz'),
            ('Notification need', 'SMS or voice fallback, given lower digital fluency and low-connectivity routes'),
            ('Quote', '"I don\'t want to compare twenty websites. I want someone to tell me the right way to go, safely."'),
        ]),
        ('Persona 6 — Corporate', [
            ('Name', 'Karan Mehta, 34, Sales Manager, Mumbai (B2B segment)'),
            ('Behaviour', 'Travels eight or more times a year; policy-constrained budget; needs speed and compliance'),
            ('Goals', 'A compliant plan fast, within caps, with the expense report assembling itself — no inspiration '
                      'required'),
            ('Frustrations', 'Preference data fragmented across apps; manual expense reconciliation after every trip'),
            ('Entry path', 'Mode select → Corporate → travel policy applied instead of a mood quiz; the meeting fixes '
                           'the city'),
            ('Notification need', 'Calendar-integrated reminders and reimbursement deadlines'),
            ('Quote', '"I don\'t need inspiration. I need it fast, within policy, and I need the expense report to '
                      'build itself."'),
        ]),
    ]
    for title, rows in personas:
        h3(doc, title)
        table(doc, ['Attribute', 'Detail'], rows, widths=[1.35, 5.25])

    callout(doc, 'Correction from the earlier draft:',
            'Persona 6\'s goals previously repeated Persona 5\'s wording ("large-text/voice support"). A corporate '
            'traveller does not want large text; they want policy compliance and an expense report that builds '
            'itself. Corrected above, and the product behaves accordingly.')

    # ------------------------------------------------------------------ 3
    page_break(doc)
    h1(doc, '3 · User stories')
    para(doc,
         'Written as **As a / I want / So that**, grouped by agent, covering all seven agents and all six personas. '
         'The full backlog is 61 stories — 30 user-facing, 22 development and 9 QA — and is Jira-ready as '
         '**tripme_release_0.1.1_sprint_backlog.csv**. Stories marked ✔ are implemented and verifiable in the live '
         'product.')

    story_groups = [
        ('Mood & Intent Agent', [
            ('✔', 'As a solo, couple or family traveller, I want to describe how I want to feel rather than pick a '
                  'destination, so that recommendations match my intent and not generic inventory.'),
            ('✔', 'As a group member, I want to submit my own mood and budget independently, so that the plan reflects '
                  'everyone and not whoever filled the form first.'),
            ('✔', 'As a corporate traveller, I want to skip the mood quiz and have travel policy applied '
                  'automatically, so that I get a compliant plan without irrelevant questions.'),
            ('✔', 'As a returning user, I want the system to remember my past preferences, so that I do not re-explain '
                  'myself every trip.'),
            ('○', 'As a pilgrimage traveller with lower digital fluency, I want to answer by voice in my language, so '
                  'that a form-heavy interface does not block me.'),
        ]),
        ('Discovery Agent', [
            ('✔', 'As an unplanned tripper, I want destinations filtered by mood, budget, season and dates, so that I '
                  'do not waste time on unrealistic options.'),
            ('✔', 'As a culturally-driven traveller, I want Indian heritage and pilgrimage destinations treated with '
                  'real depth, so that I am not offered a generic hill station for a spiritual brief.'),
            ('✔', 'As a user, I want to see, line by line, where each of my non-negotiables is met, so that I trust '
                  'the choice instead of treating it as a black box.'),
            ('✔', 'As a user who asked for somewhere we cannot plan, I want to be told so and offered the nearest '
                  'thing we can, so that I am never quietly given something else.'),
        ]),
        ('Budget Agent', [
            ('✔', 'As a budget-conscious traveller, I want my spend allocated across transport, stay, food, activities '
                  'and buffer before anything is booked, so that I do not overspend mid-trip.'),
            ('✔', 'As any traveller, I want the totals to update the moment I change something, so that I always know '
                  'where I stand.'),
            ('✔', 'As a couple or group member, I want a settle-up view tied to what was approved, so that I do not '
                  'reconcile by hand afterwards.'),
            ('✔', 'As a corporate traveller, I want a reimbursement-ready expense report by cost centre, so that I do '
                  'not rebuild it by hand.'),
        ]),
        ('Itinerary Agent', [
            ('✔', 'As a user, I want a day-by-day plan with food, culture and local transport already in it, so that I '
                  'never open a second app mid-trip.'),
            ('✔', 'As a family traveller, I want pacing set by the most constrained person, so that the plan is not '
                  'over-packed for anyone.'),
            ('✔', 'As a user, I want to swap or clear any item in the plan, so that I can adjust without starting over.'),
        ]),
        ('Booking Agent', [
            ('✔', 'As a user, I want every booking prepared inside the allocation with a visible amount, so that '
                  'nothing is committed I did not see.'),
            ('✔', 'As a cautious user, I want explicit approval required above a spend threshold, so that I keep '
                  'control of high-stakes spending.'),
            ('○', 'As a user, I want the booking completed inside the app, so that I never visit another site.'),
            ('○', 'As an early planner, I want to lock an early-bird price for the whole plan.'),
        ]),
        ('Referee Agent', [
            ('✔', 'As a traveller, I want the conflict between what the trip costs and what I can spend stated in '
                  'rupees on screen, so that the trade-off is mine to make.'),
            ('✔', 'As a group or couple, I want to see who conceded what, so that the compromise is transparent '
                  'rather than silent.'),
            ('✔', 'As a family, I want the plan audited against the actual people travelling, so that a problem is '
                  'named before the trip rather than discovered on day two.'),
            ('✔', 'As a corporate traveller, I want every booking checked against policy, so that a breach is caught '
                  'before I submit the claim.'),
        ]),
        ('Notification Agent', [
            ('✔', 'As a traveller, I want to be reminded before every booked event, so that I am never caught out by '
                  'a schedule I forgot.'),
            ('✔', 'As someone with several saved trips, I want reminders only for the trip I choose, so that a '
                  'cancelled plan does not keep nagging me.'),
            ('○', 'As a pilgrimage traveller, I want reminders by SMS or voice call as a fallback.'),
            ('○', 'As a corporate traveller, I want reminders synced to my work calendar.'),
        ]),
    ]
    for group, stories in story_groups:
        h3(doc, group)
        table(doc, ['Built', 'Story'], [[m, s] for m, s in stories], widths=[0.6, 6.0])

    para(doc, '**✔ implemented and verifiable in the live product   ·   ○ specified, on the roadmap, not built**',
         italic=True, size=9.5)

    h3(doc, 'Development and QA stories')
    para(doc,
         'Twenty-two development stories cover agent orchestration with typed handoffs, provider integration behind '
         'an adapter layer, storage, notification scheduling, multilingual infrastructure and security. Nine QA '
         'stories are distributed one per sprint rather than batched at the end, closing with a cross-agent '
         'regression pass and moderated UAT with five to eight real users.')
