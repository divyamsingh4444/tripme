"""TripME screen reference — the wireframe deliverable.

These are not mockups. TripME is built and deployed, so the highest-fidelity
design artefact available is the product itself: every image in this document
is a screenshot captured from the live application, and the capture session is
recorded in the method note so the evidence is reproducible rather than
asserted.

Each screen carries a purpose line and a "what to look at" list, because a
screenshot on its own shows what the screen contains but not what it is FOR —
and the second is what a reviewer is actually assessing.
"""

import struct
from pathlib import Path

from docx.shared import Inches, Pt
from docxkit import (FLAG, INK, PINE, SLATE, bullets, callout, h1, h2, new_doc,
                     page_break, para, placeholder, save, table)

SHOTS = Path('docs/wireframes/screens')

MAX_W = 6.6      # inches — column width inside the margins
MAX_H = 7.4      # inches — leaves room for the heading block above


def _px(name):
    w, h = struct.unpack('>II', (SHOTS / name).read_bytes()[16:24])
    return w, h


def shot(doc, name, caption=''):
    """Place an image scaled to fit both the column width and the page height."""
    w, h = _px(name)
    width = min(MAX_W, MAX_H * (w / h))
    doc.add_picture(str(SHOTS / name), width=Inches(width))
    doc.paragraphs[-1].alignment = 1  # centre
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(caption or name)
    r.font.size = Pt(8)
    r.font.italic = True
    r.font.color.rgb = SLATE
    p.alignment = 1


def sliced(stem, caption):
    """A full-page capture is unreadable when squeezed to fit one page, so tall
    ones are cut into full-width segments that are actually legible."""
    parts = sorted(SHOTS.glob(f'{stem}-p*.png'), key=lambda p: int(p.stem.rsplit('p', 1)[1]))
    return [(p.name, f'{caption} — {i + 1} of {len(parts)}') for i, p in enumerate(parts)]


def screen(doc, number, title, purpose, look_at, images, new_page=True):
    if new_page:
        page_break(doc)
    h1(doc, f'{number} · {title}')
    para(doc, purpose)
    if look_at:
        para(doc, '**What to look at**', space_after=2)
        bullets(doc, look_at)
    for name, cap in images:
        shot(doc, name, cap)


def build():
    doc = new_doc(
        'TripME — Screen Reference & Wireframes',
        'Release 0.1.1 · MVP',
        'Team DEBUGGERS · Captured from the live product, not mocked up',
    )

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, 'Method — why these are screenshots, not drawings')
    para(doc,
         'A wireframe is normally a proposal: this is what we intend to build. TripME is already built and deployed, '
         'so a drawing of it would be a less accurate artefact than the thing itself — and it would carry the risk '
         'that the drawing and the product disagree. Every image in this document was therefore captured from the '
         'running application.')
    table(doc, ['Capture parameter', 'Value'],
          [['Source', 'https://tripme-khaki.vercel.app — the live deployment, not a local build'],
           ['Captured', '6 August 2026'],
           ['Desktop viewport', '1440 × 900 CSS pixels, captured at device resolution'],
           ['Mobile viewport', '390 × 844 CSS pixels — the narrowest mainstream phone'],
           ['Account', 'The built-in test-user path, so every gated screen is reachable by a reviewer'],
           ['Data', 'Two of the four zero-quota sample plans, plus one genuinely live plan generated during capture']],
          widths=[1.7, 4.9])
    callout(doc, 'One capture was deliberately live.',
            'Screens 12 to 14 were produced by running a real brief — solo, relax, ₹25,000, three days, departing '
            'from Pune — through the actual seven-agent pipeline during this capture session. Nothing in them is '
            'staged, which is why the Referee\'s intervention in screen 13 is a real event rather than an '
            'illustration.')

    h2(doc, 'How to read each screen')
    para(doc,
         'Every screen below has a **purpose** line — the job that screen does — and a **what to look at** list '
         'pointing at the specific detail that matters for evaluation. Several of those details exist because '
         'something went wrong first; where that is the case it is said plainly, because a design decision with a '
         'cause is stronger evidence than one without.')

    # ------------------------------------------------------------------
    screen(doc, 1, 'Landing — the mood-first proposition',
           'The first screen has one job: make it obvious that TripME does not need you to know where you are going. '
           'Every competitor opens with a destination field; this one opens with a feeling and a budget.',
           ['The seven-agent pipeline is shown as a strip along the bottom — the architecture is a selling point, not '
            'an implementation detail hidden from the user.',
            'Two entry points, deliberately unequal: **Start planning** for intent, **See a sample trip** for the '
            'much larger group who arrive sceptical and will not fill in a form to find out whether it works.',
            'The three claims below the fold are all measurable, and one of them — planning time — is measured live '
            'in the product and shown on every trip page.'],
           [('01-landing-hero.png', 'Landing — above the fold, 1440 × 900')]
           + sliced('02-landing-full', 'Landing — full page'))

    screen(doc, 2, 'Planner — six travel paths as first-class choices',
           'Who is travelling changes which questions are worth asking, so the path is chosen before the brief. '
           'These are six genuinely different intent flows, not one form with a dropdown.',
           ['Family, Pilgrimage and Corporate **skip the mood quiz entirely** — for them the intent is already known, '
            'and asking anyway would be a survey rather than a conversation.',
            'The **From** field is empty, with a "Your city" placeholder. It previously pre-filled "Bengaluru", which '
            'leaked through the Booking Agent into the reminders of travellers who had chosen somewhere else. Nothing '
            'about the traveller is now assumed.',
            'Budget is a slider with a typed value beside it — a range for people who are exploring, an exact figure '
            'for people who already know.'],
           [('05-planner-form.png', 'Path selection and mood capture'),
            ('06-planner-form-lower.png', 'Budget, duration, origin and start date')])

    screen(doc, 3, 'Sample plans — the zero-friction entry',
           'Four complete plans that open instantly, with no brief, no account and no model call. This is the answer '
           'to a real risk: an entry point with no destination field can read as broken rather than novel.',
           ['Each sample is chosen to demonstrate a different part of the system — the core plan, group arbitration, '
            'a family pacing audit, and corporate policy enforcement.',
            'They require no quota at all, which makes them the guaranteed-working path during a demonstration.',
            'Photography is real and properly licensed, sourced from Wikimedia Commons rather than stock imagery.'],
           [('07-sample-chooser.png', 'The sample chooser — four plans, four different capabilities')])

    screen(doc, 4, 'Trip page — the plan, and why it is this plan',
           'The single most important screen in the product. It has to carry a destination, a rationale, a budget, '
           'three days of itinerary, simulated bookings and an arbitration record without becoming a wall.',
           ['The header states **how many agents ran and how long they took** — the product measures its own '
            'performance claim rather than asserting it in marketing.',
            'The Discovery Agent\'s reasoning is immediately below the fold, with "It also considered these" — the '
            'rejected alternatives are visible, which is what makes the choice interrogable.',
            'The right rail is a persistent summary: status, dates, origin, budget and a live approved/committed/'
            'unspent breakdown that updates as the traveller acts.'],
           [('09-trip-header.png', 'Trip header — destination, brief summary and agent metrics')]
           + sliced('08-trip-full', 'Trip page — full page'))

    screen(doc, 5, 'Arbitration — the Referee stating a conflict in rupees',
           'This is the screen that separates a multi-agent system from a single long prompt. Two agents produced '
           'incompatible outputs, and rather than silently reconciling them, the product shows the disagreement and '
           'the options for settling it.',
           ['The conflict is quantified — ₹4,500 of planned activity against a ₹4,450 allowance — not described '
            'vaguely as a "tension".',
            'Three resolutions are offered with their consequences spelled out, so the traveller chooses rather than '
            'being told.',
            'The Referee grades its own finding as **minor** and says so: *"At ₹50 this is rounding, not a real '
            'conflict."* An arbitrator that escalated everything equally would be noise.'],
           [('10-trip-arbitration.png', 'Referee output on a solo plan, with the budget allocation below')])

    screen(doc, 6, 'Group arbitration — Advocates and the concession matrix',
           'On a group trip the product instantiates one Advocate agent per traveller, each arguing for one person. '
           'The Referee then publishes exactly who conceded what — which is the part of group travel that actually '
           'breaks down.',
           ['A five-column matrix: **wanted, got, conceded, and a satisfaction score per person**. Nobody has to take '
            'the plan on trust.',
            'The fairness floor is visible in the closing line — *"Nobody conceded twice."* Without it, arbitration '
            'converges on whoever asked for least.',
            'The trade is explained causally: Priya\'s trek won the best weather window, so Rohan absorbed the early '
            'start and was compensated with both free afternoons.'],
           [('23-referee-advocates.png', 'Three Advocates arbitrated into one plan')])

    screen(doc, 7, 'Bookings — approval gates and honest labelling',
           'Every item of spend above a threshold requires explicit approval, and every item is labelled as '
           'simulated. This is the screen where the product is most tempted to overstate itself, and most '
           'deliberately does not.',
           ['**DEMO MODE — NO REAL RESERVATION** on every booking, in the product itself and not only in the '
            'documentation.',
            'Each gate states its reason — "Above ₹3,000 spend gate", "Weather-dependent slot" — so the gate is a '
            'rule, not an obstacle.',
            'Changing an amount **revokes its approval**. Before this was fixed, a traveller could approve ₹8,000 and '
            'confirm ₹14,000; approvals now expire when the thing they approved changes.',
            '"See real options" links out to genuine providers — the deep links are real even though the bookings '
            'are not.'],
           [('12-trip-bookings.png', 'Three bookings, each gated and each labelled')])

    screen(doc, 8, 'Alternatives — the traveller overruling the agents',
           'The agents make the first call, not the last one. Transport, local travel, stay and every individual day '
           'can be changed, and the money recomputes in code rather than by asking a model again.',
           ['Options carry honest trade-offs rather than marketing — "Cheapest, but arrives at 4am", "Meters are '
            'often refused — agree the fare first".',
            'Prices are marked **est.** with the reason stated: live rates are behind paid inventory APIs this '
            'project does not use.',
            'Hotels are real listings pulled from OpenStreetMap, with map and website links. Photographs appear where '
            'a properly-licensed one exists — for a small guesthouse none does, so the product shows a map pin rather '
            'than a stock photograph of somewhere else.'],
           [('14-trip-options.png', 'Transport and local travel, with trade-offs stated'),
            ('15-trip-options-stays.png', 'Real OpenStreetMap listings near the destination')])

    screen(doc, 9, 'Progress — making the gate chain visible',
           'This component exists because of a specific failure. Confirm, reminders and email were all built and '
           'deployed, and none of them was visible, because each only appears once the previous step is complete. A '
           'gate that hides what is behind it is indistinguishable from a feature that was never built.',
           ['Four steps, stated from the moment a plan exists: **Adjust → Approve → Confirm → Reminders**, with the '
            'current one highlighted.',
            'Each step says what unlocks it — "Unlocks once the bookings are approved" — so nothing is mysteriously '
            'greyed out.',
            'The order is explained rather than imposed: confirming builds the reminder schedule from the bookings '
            'actually agreed to.'],
           [('13-trip-stepper.png', 'The stepper, the alternatives entry point and the confirm gate')])

    screen(doc, 10, 'Sign in — placed at commitment, not at entry',
           'Planning works entirely signed out. An account is required only to confirm or save a trip, because a '
           'confirmed trip and its reminders have to belong to someone.',
           ['**Continue as a test user** — a password-less path so any reviewer can reach every gated feature. The '
            'Google consent screen is still in testing, and rather than hide that, the page says so.',
            'The privacy position is stated on the page and not buried in a policy: trips stay in the browser, the '
            'account holds only what Google returns, and signing in does not move trips between devices.',
            '"Plan a trip without signing in" is offered as an explicit exit — the gate is honest about being '
            'optional.'],
           [('16-signin.png', 'Sign-in, with the test-user path and the privacy position')])

    screen(doc, 11, 'Confirmed — reminders opt in, per trip',
           'Confirming locks the plan. Reminders are then offered — off by default, on per trip, and switchable off '
           'in one click.',
           ['The schedule is built from the bookings **actually approved**. Before this was fixed, reminders could '
            'name a hotel the traveller had rejected.',
            'Reminders are time-anchored to real events — departure, check-in, each activity — never to engagement '
            'targets.',
            'The delivery limitation is stated where the feature is, not in a footnote: reminders appear in the bell '
            'while TripME is open; a closed-app push needs infrastructure this demo does not have.',
            'The status chip changes DRAFT PLAN → CONFIRMED, and the action bar changes from "Sign in to save" to '
            '"Save trip".'],
           [('19-confirmed-reminders.png', 'Confirmed, five reminders on, with the email option'),
            ('20-reminders-bell.png', 'The bell — grouped, time-anchored reminders')])

    screen(doc, 12, 'The agent pipeline running live',
           'Captured during a genuinely live run rather than staged. Seven agents execute in sequence, each reporting '
           'as it completes, with the brief pinned alongside so the traveller can see what the agents were given.',
           ['Each agent reports **what it decided**, not merely that it finished — "Picked Kerala Backwaters (+2 '
            'alternates)", "Allocated ₹25,000 · ₹2,667/day".',
            'The clock is honest about what it measures: agent time only, excluding free-tier queueing and the '
            'deliberate pauses that make each handoff readable.',
            'The brief shows **FROM: Pune** throughout — the origin fix verified again on production, from a city '
            'the prompts never mention.'],
           [('26-agent-stream.png', 'The first agent completes, four seconds in')])

    screen(doc, 13, 'The backward edge — the Referee sending work back',
           'The most important screen in this document. Most "multi-agent" systems are a chain: each step hands '
           'forward and nothing is ever reconsidered. Here the Referee audited the Itinerary Agent against the Budget '
           'Agent, found a ₹5,000 overrun, and sent the brief backwards.',
           ['**Referee Agent · budget audit** flags the conflict — ₹10,000 of planned activity against a ₹5,000 '
            'allocation.',
            '**Budget Agent · re-planning**, tagged *triggered by Referee* — activities re-allocated from ₹2,000 to '
            '₹7,000.',
            '**Itinerary Agent · revised to fit**, also triggered by the Referee — the affected steps re-run.',
            'This is why the architecture is a graph rather than a pipeline, and it happened unprompted during '
            'capture.'],
           [('27-agent-stream-midway.png', 'The Referee rejects, and two agents re-run')])

    screen(doc, 14, 'The finished live plan',
           'The result of the run above: a real destination, chosen for a real brief, with the re-planning recorded '
           'in the header.',
           ['**9 agents · 58s of agent time · Re-planned by Referee** — nine calls rather than seven, because two '
            'agents ran twice after the Referee rejected the first attempt.',
            'The rationale quotes the traveller\'s own words back — "soothing, gentle escape", "calm waters and '
            'greenery" — evidencing the match rather than asserting it.',
            'Transport reads "train and taxi **from Pune**", carrying the origin correctly all the way to the '
            'output.'],
           [('28-live-plan-result.png', 'Kerala Backwaters — generated live during this capture session')])

    screen(doc, 15, 'Corporate — policy enforced, not suggested',
           'The corporate path replaces mood with policy. Caps are enforced in code and the Referee adds a compliance '
           'audit.',
           ['A **Policy compliance** panel with an explicit compliant/breach verdict.',
            'The city is fixed by the meeting, so the Discovery Agent chooses the district rather than the '
            'destination — the same agent doing a different job.',
            'The plan is built to produce a reimbursement-ready expense report by cost centre.'],
           [('25-corporate-policy.png', 'Corporate path — policy compliance panel')])

    screen(doc, 16, 'Group settle-up — splitting inside the plan',
           'Planned against actually-approved spend, per traveller, updating as each booking is approved. This was '
           'listed in an earlier draft as *not* in the MVP; it is built.',
           ['"No separate app" is the point — splitting happens against the plan that was approved, not reconstructed '
            'afterwards from receipts.',
            'Planned, approved-so-far and still-unspent are shown separately, because they answer three different '
            'questions.'],
           [('24-settle-up.png', 'Live spend and settle-up on a three-person trip')])

    screen(doc, 17, 'The global assistant',
           'Reachable on every page, draggable both collapsed and open, and aware of the trip currently being viewed.',
           ['The greeting is context-aware — it names the trip on screen and offers to explain the product itself.',
            'Pre-made questions **fill the input** rather than firing immediately, so the traveller can edit before '
            'asking.',
            'It is explicitly positioned to answer "what is real and what is simulated" — the assistant is part of '
            'the honesty surface, not a sales channel.'],
           [('22-assistant.png', 'The assistant, open, on the My Trips page')])

    screen(doc, 18, 'My Trips',
           'Saved trips with their status. One card per trip.',
           ['A single card for a single trip. An earlier defect minted a new identifier on every save, so one trip '
            'saved six times produced six cards; saving now updates in place.',
            'Status is on the card — Confirmed, and the mood it was planned for.'],
           [('21-my-trips.png', 'My Trips — one confirmed trip, no duplicates')])

    screen(doc, 19, 'Seven languages, including what the agents wrote',
           'The interface, the itinerary, the budget notes and the Referee\'s reasoning are all translated. Most '
           'multilingual products translate the buttons and leave the content in English.',
           ['The Referee\'s re-planning narrative is translated **with the figures preserved** — ₹2,000 → ₹7,000 '
            'survives intact, including the strikethrough.',
            'Currency, dates and percentages are deliberately left in their original form rather than converted to '
            'another numeral system.',
            'Translation runs after generation completes, so the agents reason in one language and the traveller '
            'reads in another.'],
           [('33-hindi-complete.png', 'A live-generated plan, fully translated into Hindi')])

    screen(doc, 20, 'Responsive — the full flow at 390px',
           'Not a reduced product. Every function available on desktop is available on a 390-pixel phone; what '
           'changes is density, not capability.',
           ['Single column, hamburger navigation, and the assistant collapsed to a bubble.',
            'The action bar stays pinned, and drops "Print" — the one action that genuinely does not belong on a '
            'phone.',
            'The agent metrics chips wrap rather than truncate, so nothing is lost.'],
           [('29-mobile-trip.png', 'Trip page at 390 × 844'),
            ('30-mobile-landing.png', 'Landing at 390 × 844')])

    screen(doc, 21, 'How it works — the architecture, stated publicly',
           'A full page explaining the seven agents, the six paths, what is real and what is simulated. Most products '
           'hide this; here it is a trust surface.',
           ['A **What\'s real, what\'s simulated** panel that separates real, estimated, simulated and '
            'partly-delivered — the same honesty the documentation claims, visible to any user.',
            '"India, and only India" is stated as a scope decision with a reason, not hidden until a user hits it.',
            'The seven agents are described by what they do, including the Referee\'s ability to send the brief back '
            'to the Budget Agent.'],
           sliced('03-how-it-works', 'How it works — full page'))

    screen(doc, 22, 'Contact',
           'A supporting page, held to the same standard as the product pages.',
           ['Consistent with the rest of the product in voice and layout — supporting pages are a common place for a '
            'brand to fall apart.'],
           sliced('31-contact', 'Contact — full page'))

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, 'Screen index and evaluation mapping')
    para(doc,
         'Which screen evidences which claim. This exists so a reviewer can check a specific assertion in the '
         'submission against a specific image rather than taking the narrative on trust.')
    table(doc,
          ['Claim made in the submission', 'Evidenced by'],
          [['Seven specialised agents, not one prompt', 'Screens 12, 13, 14, 21'],
           ['The architecture is a graph — agents can reject each other\'s work', 'Screen 13 (live capture)'],
           ['Arbitration is visible and quantified in rupees', 'Screens 5, 6'],
           ['One Advocate per traveller, with a published fairness floor', 'Screen 6'],
           ['Money is deterministic and re-prices on every change', 'Screens 5, 7, 8, 16'],
           ['Approvals are revoked when the amount changes', 'Screen 7'],
           ['Bookings are simulated and labelled as such', 'Screens 7, 21'],
           ['Mood-first entry with no assumed origin', 'Screens 1, 2, 12'],
           ['All six travel paths are built', 'Screens 2, 6, 15'],
           ['Expense splitting is built', 'Screen 16'],
           ['The Notification Agent is built; reminders are opt-in per trip', 'Screen 11'],
           ['Authentication gates commitment, not planning', 'Screens 9, 10'],
           ['Seven languages including agent-generated output', 'Screen 19'],
           ['Real places from open map data', 'Screen 8'],
           ['Responsive to 390px', 'Screen 20'],
           ['India-only scope, stated rather than hidden', 'Screen 21'],
           ['Zero-quota demonstration path', 'Screen 3']],
          widths=[4.4, 2.2])

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, 'Observed during capture — limitations and rough edges')
    para(doc,
         'Recorded because a screen reference that only shows the product at its best is a brochure. Everything '
         'below was observed in this capture session on the live deployment.')
    table(doc,
          ['Observation', 'Assessment'],
          [
              ['Whole-page translation of a large live plan took roughly 100 seconds to complete, with a persistent '
               '"Translating…" indicator while it ran.',
               '**Real limitation, correct behaviour.** Translation is chunked and the free tier\'s per-minute token '
               'limit throttles it. The output is correct when it lands and figures are preserved. It is slow, not '
               'broken — but it is slow enough that a demonstration should switch language before opening a plan, '
               'not after.'],
              ['A few translated strings are awkward — "Live spend" becomes a literal rendering closer to "alive '
               'spend".',
               '**Minor quality issue.** The glossary in the translation prompt covers agent and product terms; a '
               'handful of UI idioms are not yet in it.'],
              ['Individual small hotels show a map pin rather than a photograph.',
               '**Correct behaviour, not a defect.** Wikimedia has a properly-licensed photograph of Gokarna but none '
               'of a particular guesthouse in it. The alternative — a stock photograph of somewhere else — would be '
               'a small dishonesty on a page whose whole argument is that it does not overstate.'],
              ['Reaching the confirm step requires signing in and approving every booking first.',
               '**Deliberate, and the reason the stepper in screen 9 exists.** It is worth knowing before a live '
               'demonstration, since the confirm and reminder features are invisible until the chain is walked.'],
              ['The Google consent screen is still in testing, so only listed accounts can sign in with Google.',
               '**Known and mitigated** by the test-user path, but it must be published before any external '
               'demonstration where reviewers use their own accounts.'],
          ], widths=[2.7, 3.9], font=9)

    # ------------------------------------------------------------------
    page_break(doc)
    h1(doc, 'Design system')
    para(doc, 'The values below are implemented in the product, not proposed.')
    table(doc, ['Token', 'Value', 'Role'],
          [['Pine', '#14453D', 'Primary — headers, primary buttons, the dark ground of the hero'],
           ['Marigold', '#FFB52E', 'Accent — reserved almost entirely for the single primary action on a screen'],
           ['Off-white', '#EFF3F1', 'Page ground'],
           ['Card', '#FFFFFF', 'Surfaces, at a 24–32px radius'],
           ['Flag', '#B4361E', 'Warnings, simulated-booking labels, destructive actions'],
           ['Display face', 'Bricolage Grotesque', 'Headings — gives the brand a voice'],
           ['Text face', 'Inter', 'Body'],
           ['Numeric face', 'IBM Plex Mono', 'All money and metrics — this product asks people to trust its '
                                             'arithmetic, so figures are monospaced and aligned']],
          widths=[1.2, 1.5, 3.9])
    para(doc,
         'Layout: a 1440px content frame with a persistent right rail on the trip page, collapsing to a single '
         'column below 1024px. Motion is restrained — a three.js globe on the hero for capable devices, disabled '
         'elsewhere, because atmosphere should not cost a traveller their battery.')

    placeholder(doc, 'Figma component sheet, if the team wants a separate design-system artefact.',
                'Optional — the values above are the implemented source of truth, and this document supersedes the '
                'wireframe placeholder in the Phase 2 submission, Section 29.')

    save(doc, 'docs/TripME_Wireframes_and_Screens.docx')


if __name__ == '__main__':
    build()
