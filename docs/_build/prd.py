"""TripME Product Requirements Document.

This replaces the earlier PRD, which described a different product entirely
("Smart Travel Companion", five agents named Scout / Closer / Money Optimizer /
Recommender / Referee). Only the Referee survived into the real build. This one
is written backwards from the deployed application: every requirement below is
either implemented, or explicitly marked as not implemented.
"""

from docxkit import bullets, callout, h1, h2, h3, new_doc, page_break, para, placeholder, save, table


def build():
    doc = new_doc(
        'TripME — Product Requirements Document',
        'Release 0.1.1 · MVP',
        'Team DEBUGGERS · Derived from the deployed product at tripme-khaki.vercel.app',
    )

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '1 · Document control')
    table(doc, ['Field', 'Value'],
          [['Product', 'TripME — an agentic trip operating system for Indian domestic travel'],
           ['Release', '0.1.1 (MVP)'],
           ['Status', 'Built and deployed; under evaluation'],
           ['Owner', 'Team DEBUGGERS'],
           ['Live product', 'https://tripme-khaki.vercel.app'],
           ['Source', 'https://github.com/divyamsingh4444/tripme'],
           ['Supersedes', 'The Phase 2 PRD for "Smart Travel Companion" — a different product with a different agent '
                          'set']],
          widths=[1.5, 5.1])
    callout(doc, 'How to read this document:',
            'requirements are written in the present tense only where the behaviour exists in the deployed product. '
            'Anything not yet built is in Section 11 and marked as such. Nothing is described as working that does '
            'not work.')

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '2 · Problem and opportunity')
    h2(doc, '2.1 The problem')
    para(doc,
         'Planning a trip in India requires six to eight disconnected tools: one for inspiration, two or three for '
         'booking, one for local logistics, one for splitting costs and, invariably, a spreadsheet. Context is '
         're-entered at every boundary. Budget is estimated before the trip and reconciled after it, never enforced '
         'during it. Group trips fail at agreement rather than at booking. And every recommendation arrives without '
         'reasoning, so it cannot be interrogated or trusted.')
    h2(doc, '2.2 Evidence')
    para(doc,
         'Five JTBD interviews (Section 10 of the Phase 2 submission). Every participant used multiple tools and '
         're-entered the same context; every participant described expense tracking as the worst part and did it '
         'retrospectively; group participants described agreement, not booking, as the breaking point; and '
         'participants consistently distrusted recommendations they could not interrogate.')
    h2(doc, '2.3 The opportunity')
    para(doc,
         'Not a better search box. A system that takes one brief — origin, dates, budget, party and mood — and '
         'returns a complete, costed, arguable, committable plan, where the reasoning is visible and the money is '
         'enforced in code rather than estimated by a model.')

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '3 · Goals and non-goals')
    h2(doc, '3.1 Goals')
    bullets(doc, [
        'Take a traveller from "I want to go somewhere" to a confirmed, costed plan in a single session.',
        'Make every agent decision visible, evidenced and overridable.',
        'Hold the plan to the stated budget deterministically, and re-price on every change.',
        'Reconcile multiple travellers\' preferences into one plan, and publish who conceded what.',
        'Serve all six travel contexts — solo, couple, group, family, pilgrimage and corporate — as first-class paths.',
        'Work in the traveller\'s language, including agent-generated output.',
    ])
    h2(doc, '3.2 Non-goals for this release')
    bullets(doc, [
        '**Executing real bookings or taking payment.** Bookings are simulated; deep links to real providers are '
        'real.',
        '**International destinations.** India-only, enforced in the pipeline rather than merely stated.',
        '**Storing trips on a server.** Trips live in the browser. This is a privacy position with a known cost — no '
        'cross-device continuity.',
        '**Native mobile applications.** Responsive web only.',
        '**Monetisation of any kind.** No pricing exists in this release.',
    ])

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '4 · Users')
    table(doc,
          ['Persona', 'Context', 'Primary job', 'Priority'],
          [['Prajakta — the unplanned tripper', 'Solo, spontaneous, no destination in mind',
            'Tell me where to go based on how I want to feel', 'Launch'],
           ['Couple', 'Two travellers, two sets of preferences',
            'Settle our disagreement without one of us always losing', 'Launch'],
           ['Group organiser', 'Four to six friends, one reluctant coordinator',
            'Get us to agree, and split the cost fairly', 'Month 3+'],
           ['Family planner', 'Mixed ages, pace and access constraints',
            'A plan that works for a child and a grandparent on the same day', 'Month 3+'],
           ['Pilgrimage traveller', 'Calendar-bound, ritual-bound, often lower digital fluency',
            'Respect the timings and the constraints', 'Roadmap'],
           ['Corporate traveller', 'Policy caps, receipts, reimbursement',
            'Stay inside policy without doing the arithmetic myself', 'Roadmap (B2B)']],
          widths=[1.6, 1.8, 2.3, 0.9], font=9)

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '5 · The agent architecture')
    para(doc,
         'Seven agents run as a directed pipeline with typed handoffs and one backward edge. Agents are separated '
         'where their objectives genuinely conflict — a single agent optimising for both mood fidelity and budget '
         'compliance would silently trade one against the other, and the traveller would never see the trade.')
    table(doc,
          ['#', 'Agent', 'Consumes', 'Produces', 'Key rules'],
          [
              ['1', 'Mood & Intent', 'The raw brief and the chosen travel path',
               'Structured intent — mood, pace, non-negotiables, party composition',
               'Path-specific quizzes; never invents a preference the traveller did not express'],
              ['2', 'Discovery', 'Structured intent, origin, dates, out-of-scope flag',
               'A ranked destination with per-non-negotiable evidence',
               'Mood fidelity outranks popularity; India-only; must open by explaining any substitution'],
              ['3', 'Budget', 'Destination, party, duration, stated budget',
               'A category allocation and per-traveller split',
               'Arithmetic is computed in code, never by the model; policy caps honoured on the corporate path'],
              ['4', 'Itinerary', 'Destination, allocation, pace, constraints', 'A day-by-day plan with real places',
               'Places resolved against open map data rather than model memory'],
              ['5', 'Booking', 'Itinerary and allocation', 'Simulated bookings with approval gates and deep links',
               'Every item above the threshold requires explicit approval; a price change revokes its approval'],
              ['6', 'Referee', 'Everything above, plus one Advocate per traveller',
               'Conflicts stated in rupees, concessions, and a consensus plan',
               'Three conflict classes — budget, mood, logistics; a fairness floor prevents one traveller conceding '
               'everything; may send the plan back upstream'],
              ['7', 'Notification', 'The confirmed plan and accepted choices',
               'A time-anchored reminder schedule',
               'Built from accepted choices only; off unless the traveller opts in per trip'],
          ], widths=[0.25, 1.15, 1.55, 1.75, 1.9], font=8.5)

    h2(doc, '5.1 The backward edge')
    para(doc,
         'The Referee can return the plan to Budget or Itinerary when no consensus is reachable within the current '
         'allocation. This is what makes the system a graph rather than a chain, and it is the difference between '
         'agents that hand off and agents that negotiate.')

    h2(doc, '5.2 Traveller Advocates')
    para(doc,
         'On multi-traveller paths, one Advocate is instantiated per traveller, arguing that traveller\'s stated '
         'preferences. The count is dynamic — a group of five produces five Advocates. The Referee arbitrates between '
         'them and publishes the concession matrix, so the plan can be defended to the person who gave something up.')

    h2(doc, '5.3 Model strategy')
    table(doc, ['Model', 'Role'],
          [['llama-3.3-70b-versatile', 'Reasoning-heavy agents — Discovery, Referee'],
           ['openai/gpt-oss-120b', 'Arbitration and long-context work'],
           ['llama-3.1-8b-instant', 'Structural and short-form work']],
          widths=[2.4, 4.2])
    para(doc,
         'Every agent has an ordered chain of all three. On a 429, 400, 413, 422 or 503, the agent fails over to the '
         'next model rather than failing the plan. This exists because the free tier\'s binding constraint is tokens '
         'per day, and because one model returns a 400 on a nested schema another accepts — a failure mode that took '
         'down an agent in production before the chain was in place.')

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '6 · Functional requirements')
    para(doc, 'Every requirement below is implemented in the deployed product.')
    table(doc,
          ['ID', 'Requirement', 'Acceptance criterion'],
          [
              ['FR-01', 'Six travel paths as first-class entry points',
               'Each path presents its own intent capture; none is a variant of another'],
              ['FR-02', 'A brief with no assumed defaults',
               'Origin, dates, budget, party and mood are all traveller-supplied; no origin city is pre-filled or '
               'implied anywhere downstream'],
              ['FR-03', 'Live per-agent progress',
               'Each agent reports individually as it completes; a single agent failing does not blank the plan'],
              ['FR-04', 'Evidenced destination selection',
               'Every non-negotiable is answered explicitly in the destination rationale'],
              ['FR-05', 'Deterministic budget arithmetic',
               'Totals, splits and re-prices are computed in code; no total ever originates from a model'],
              ['FR-06', 'Day-by-day itinerary with real places',
               'Places resolve to real locations with images where available'],
              ['FR-07', 'Approval gates on spend',
               'Items above the threshold cannot be confirmed unapproved; changing an amount revokes prior approval'],
              ['FR-08', 'Alternatives and override',
               'Destination, transport, stay and any day can be changed; the trip re-prices on every change'],
              ['FR-09', 'Visible arbitration',
               'Conflicts are stated in rupees with named concessions and a fairness floor'],
              ['FR-10', 'Progress signposting',
               'A four-step stepper (Adjust → Approve → Confirm → Reminders) states the sequence from the moment a '
               'plan exists'],
              ['FR-11', 'Authentication gate at commitment',
               'Planning works signed out; confirming and saving require sign-in via Google or the test-user path'],
              ['FR-12', 'Trip confirmation',
               'Confirming locks the plan and rebuilds the reminder schedule from the accepted choices'],
              ['FR-13', 'Opt-in reminders, per trip',
               'Off by default; enabled per trip; grouped and time-anchored in the bell menu'],
              ['FR-14', 'Email the plan on demand',
               'A confirmed plan can be emailed to the signed-in address'],
              ['FR-15', 'Saved trips without duplicates',
               'Re-saving the same trip updates it rather than creating a second copy'],
              ['FR-16', 'Global assistant',
               'Available on every page, draggable both collapsed and open, with pre-made questions that fill the '
               'input rather than firing'],
              ['FR-17', 'Multilingual throughout',
               'Seven languages, including agent-generated output, translated after generation completes'],
              ['FR-18', 'Zero-quota sample plans',
               'Four complete plans open with no brief, no sign-in and no model call'],
              ['FR-19', 'Explicit scope handling',
               'An out-of-scope destination is named at the form, carried as an explicit field, and explained by '
               'Discovery — never silently substituted'],
              ['FR-20', 'Graceful degradation',
               'Missing auth configuration, exhausted quota or a failed agent each produce a specific, actionable '
               'message rather than a generic error'],
          ], widths=[0.55, 2.35, 3.7], font=9)

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '7 · Non-functional requirements')
    table(doc,
          ['Area', 'Requirement', 'Status'],
          [['Performance', 'A full seven-agent plan completes within a single attentive session; per-agent status is '
                           'streamed so waiting is legible', 'Met'],
           ['Resilience', 'No single model outage or quota exhaustion can prevent a plan being produced',
            'Met — three-model failover, verified with the primary model fully exhausted'],
           ['Correctness of money', 'No monetary figure is produced by a language model', 'Met'],
           ['Privacy', 'Trip data never leaves the device; an account stores only name, email and picture', 'Met'],
           ['Security', 'No API key is reachable from client code; all model calls are server-side', 'Met'],
           ['Accessibility', 'Keyboard reachable, accessible names on controls, seven languages',
            'Partly met — voice input and large-text mode outstanding'],
           ['Responsiveness', 'Full functionality from 390px upward', 'Met'],
           ['Cost', 'Zero marginal cost per plan at current volume', 'Met — every dependency is on a free tier']],
          widths=[1.2, 3.6, 1.8], font=9)

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '8 · Technical design')
    table(doc, ['Layer', 'Choice', 'Why'],
          [['Framework', 'Next.js App Router with TypeScript',
            'Server routes and UI in one deployable; keys stay server-side by construction'],
           ['Hosting', 'Vercel', 'Zero-config deploys on push; free tier sufficient at this volume'],
           ['Inference', 'Groq, three models with per-agent failover chains',
            'Fast inference on a free tier; the chain converts a quota limit into a slowdown rather than an outage'],
           ['Places data', 'OpenStreetMap / Overpass, Nominatim, Wikipedia',
            'Real, free and keyless — and crucially, not model memory, so places actually exist'],
           ['Auth', 'Auth.js v5 with Google OAuth, plus a password-less demo provider',
            'The demo provider means an evaluator without a listed Google account can still reach every gated feature'],
           ['Persistence', 'Browser storage for trips; Supabase for accounts only',
            'The privacy position, implemented rather than asserted'],
           ['Email', 'Resend, on demand', 'Sandbox delivery until a domain is verified — a known, stated limitation'],
           ['Styling', 'Tailwind CSS v4 with a fixed design system', 'One source of truth for the brand tokens']],
          widths=[1.1, 2.2, 3.3], font=9)
    h2(doc, '8.1 Design principle')
    callout(doc, 'The governing rule:',
            '**a language model for judgment, code for money.** Anything a model gets subtly wrong and a user cannot '
            'detect — arithmetic, totals, splits, thresholds — is computed deterministically. Anything requiring '
            'taste, inference or negotiation is the model\'s job.')

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '9 · Success metrics')
    table(doc, ['Metric', 'Why it matters', 'Phase 1 target'],
          [['Plan completion rate', 'The single validation metric — did the brief become a plan they read',
            'Baseline to be set from the beta cohort'],
           ['Mood utilisation', 'Whether the differentiating entry point is used or bypassed', 'Majority of briefs'],
           ['Override rate', 'Engagement with the plan rather than passive acceptance — a healthy number is not zero',
            'Measured, not targeted'],
           ['Confirm rate', 'Whether a plan was good enough to commit to', 'Baseline'],
           ['30-day return', 'The strongest early signal of real value', 'Baseline'],
           ['Referee comprehension', 'The proportion of testers who can explain what arbitration did',
            'Qualitative, from beta interviews']],
          widths=[1.5, 3.3, 1.8], font=9)

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '10 · Risks')
    table(doc, ['Risk', 'Mitigation'],
          [['Mood-first entry reads as a broken form',
            'A finished sample plan opens before any input is requested — built'],
           ['Free-tier quota exhausted during evaluation',
            'Three-model failover, identical-brief caching, and zero-quota samples — built and verified'],
           ['A traveller mistakes a simulated booking for a real one',
            'Labelled in the product at the point of interaction, not only in documentation'],
           ['An agent produces a plausible but wrong place',
            'Places resolve against open map data rather than model memory'],
           ['Regional bias toward metros in destination selection',
            'Mood-fidelity rules outrank popularity; a standing coverage audit is owed'],
           ['A privacy stance that costs cross-device continuity',
            'Accepted deliberately; revisiting requires explicit opt-in, not a silent change']],
          widths=[2.6, 4.0])

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '11 · Out of scope for this release')
    para(doc, 'Listed so that nothing here is mistaken for a defect.')
    table(doc, ['Item', 'Reason', 'When'],
          [['Real booking execution and payment', 'Requires provider contracts and a payment stack', 'Next release'],
           ['Scheduled email and WhatsApp reminder delivery',
            'In-app reminders and on-demand email ship first; delivery follows proven engagement', 'Next release'],
           ['Voice input and large-text mode', 'Owed before pilgrimage acquisition is honest', 'Next release'],
           ['Cross-device trips', 'Conflicts with the local-only privacy stance without explicit opt-in', 'Under '
                                                                                                        'review'],
           ['International destinations', 'Scope discipline; each market needs its own supply and cultural depth',
            'Post-validation'],
           ['Native mobile apps', 'Two more codebases; justified only by proven retention', 'Post-validation'],
           ['Monetisation', 'Phase 1 is validation-first by design', 'Post-validation']],
          widths=[2.2, 3.2, 1.2], font=9)

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, '12 · Open items')
    placeholder(doc, 'Recorded MVP demonstration video, following the sequence in Section 30.')
    placeholder(doc, 'Regional-coverage bias audit results.')
    placeholder(doc, 'Contact page telephone number — currently a deliberate placeholder in the deployed product.')

    save(doc, 'docs/TripME_PRD.docx')
