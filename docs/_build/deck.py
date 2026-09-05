# -*- coding: utf-8 -*-
"""TripME — 5-minute presentation deck.

Six main slides (per the course guidance: problem, solution, features,
implementation, outcomes, close) plus an appendix for Q&A. Brand tokens from
the product; real screenshots from the live capture session, including the
backward-edge moment, which is the single strongest artefact the team owns.

Output: docs/TripME_Presentation.pptx
"""

import io

import qrcode
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Emu, Inches, Pt

PINE = RGBColor(0x14, 0x45, 0x3D)
PINE_DEEP = RGBColor(0x0E, 0x33, 0x2D)
INK = RGBColor(0x0E, 0x1F, 0x1A)
MARIGOLD = RGBColor(0xFF, 0xB5, 0x2E)
PAPER = RGBColor(0xEE, 0xF4, 0xEF)
CARD = RGBColor(0xFF, 0xFF, 0xFF)
SLATE = RGBColor(0x4E, 0x63, 0x5C)
LINE = RGBColor(0xD8, 0xDF, 0xDB)
RED = RGBColor(0xC0, 0x47, 0x2B)
FONT = 'Segoe UI'

SHOTS = 'docs/wireframes/screens/'

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]


# ------------------------------------------------------------------ helpers
def slide(bg=PAPER):
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = bg
    return s


def box(s, x, y, w, h, fill=None, line=None, radius=False):
    shp = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h))
    if radius:
        try:
            shp.adjustments[0] = 0.08
        except Exception:
            pass
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(1)
    shp.shadow.inherit = False
    return shp


def text(s, x, y, w, h, runs, size=18, color=INK, bold=False, align=PP_ALIGN.LEFT,
         leading=1.0, anchor=MSO_ANCHOR.TOP, wrap=True):
    """runs: str, or list of paragraphs; each paragraph str or list of (txt, dict)."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    if isinstance(runs, str):
        runs = [runs]
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = leading
        p.space_after = Pt(4)
        if isinstance(para, str):
            para = [(para, {})]
        for txt, kw in para:
            r = p.add_run()
            r.text = txt
            r.font.name = FONT
            r.font.size = Pt(kw.get('size', size))
            r.font.bold = kw.get('bold', bold)
            r.font.italic = kw.get('italic', False)
            r.font.color.rgb = kw.get('color', color)
    return tb


def kicker(s, txt, x=0.55, y=0.42, color=None):
    text(s, x, y, 8, 0.4, txt.upper(), size=12, bold=True,
         color=color or RGBColor(0xC5, 0x82, 0x00))


def title(s, txt, x=0.55, y=0.72, w=12.2, size=33, color=INK):
    text(s, x, y, w, 0.9, txt, size=size, bold=True, color=color)


def chip(s, x, y, txt, fill=PINE, fg=CARD, w=None, size=10.5):
    w = w or (0.24 + 0.082 * len(txt))
    c = box(s, x, y, w, 0.32, fill=fill, radius=True)
    c.adjustments[0] = 0.5
    tf = c.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = txt
    r.font.name = FONT
    r.font.size = Pt(size)
    r.font.bold = True
    r.font.color.rgb = fg
    tf.margin_top = tf.margin_bottom = 0
    return x + w


def pic(s, path, x, y, w=None, h=None, border=True):
    p = s.shapes.add_picture(SHOTS + path, Inches(x), Inches(y),
                             Inches(w) if w else None, Inches(h) if h else None)
    if border:
        p.line.color.rgb = LINE
        p.line.width = Pt(1)
    p.shadow.inherit = False
    return p


def footer(s, n):
    text(s, 0.55, 7.08, 9, 0.3, 'TripME · Team DEBUGGERS · tripme-khaki.vercel.app',
         size=9, color=SLATE)
    text(s, 12.3, 7.08, 0.6, 0.3, str(n), size=9, color=SLATE, align=PP_ALIGN.RIGHT)


# ================================================================ SLIDE 1 — title
s = slide(INK)
box(s, 0, 6.9, 13.333, 0.6, fill=PINE_DEEP)
text(s, 0.9, 1.55, 11.5, 1.2, [
    [('Trip', {'size': 66, 'bold': True, 'color': CARD}),
     ('ME', {'size': 66, 'bold': True, 'color': MARIGOLD})],
], anchor=MSO_ANCHOR.TOP)
text(s, 0.93, 2.75, 11.5, 0.7,
     'One mood. One budget. One complete trip.',
     size=27, bold=True, color=PAPER)
text(s, 0.93, 3.55, 9.2, 0.9,
     'Seven AI agents that plan it, argue about it in front of you, and are held to your '
     'budget in code — built, deployed, and live.',
     size=16, color=RGBColor(0x9D, 0xB3, 0xAC), leading=1.15)

x = 0.93
for t in ('7 AGENTS · 1 BACKWARD EDGE', '6 TRAVEL PATHS', '7 LANGUAGES', '₹0 INFRASTRUCTURE'):
    x = chip(s, x, 4.55, t, fill=PINE, fg=PAPER) + 0.18

text(s, 0.93, 5.35, 11.5, 0.4, 'Team DEBUGGERS — BITSoM · Product Management with Generative & Agentic AI',
     size=13, bold=True, color=PAPER)
text(s, 0.93, 5.75, 11.5, 0.7,
     'Shiva K · Nusrat Sultana · Divyam Singh · Manish Dwivedi · Devyani Harpale · Prajwal D R',
     size=12, color=RGBColor(0x9D, 0xB3, 0xAC))

# QR to the live product
qr = qrcode.QRCode(border=1, box_size=10)
qr.add_data('https://tripme-khaki.vercel.app')
qr.make()
img = qr.make_image(fill_color='#0E1F1A', back_color='#EEF4EF')
buf = io.BytesIO()
img.save(buf, format='PNG')
buf.seek(0)
s.shapes.add_picture(buf, Inches(10.55), Inches(1.55), Inches(2.1), Inches(2.1))
text(s, 10.4, 3.78, 2.4, 0.4, 'scan → live product', size=11, color=PAPER, align=PP_ALIGN.CENTER)

# ================================================================ SLIDE 2 — problem
s = slide()
kicker(s, 'The problem — evidenced, not imagined')
title(s, 'Planning one trip means 6–8 apps that never talk to each other')

probs = [
    ('Budget is a hope, not a rule', 'Estimated before the trip, reconciled after it — never enforced during it.'),
    ('Groups fail at agreement', 'The hard part is not booking — it is getting five people to one plan.'),
    ('Recommendations are black boxes', 'No reasoning attached, so they cannot be interrogated or trusted.'),
    ('Context is re-entered everywhere', '4–6 hours across apps, typing the same dates and budget at every boundary.'),
]
y = 1.75
for h, b in probs:
    box(s, 0.55, y, 6.1, 1.08, fill=CARD, line=LINE, radius=True)
    text(s, 0.8, y + 0.12, 5.7, 0.4, h, size=15.5, bold=True)
    text(s, 0.8, y + 0.5, 5.7, 0.5, b, size=12, color=SLATE, leading=1.05)
    y += 1.22

box(s, 7.0, 1.75, 5.8, 2.6, fill=PINE, radius=True)
text(s, 7.3, 1.95, 5.2, 0.4, 'EVIDENCE — 5 JTBD INTERVIEWS', size=11.5, bold=True, color=MARIGOLD)
text(s, 7.3, 2.35, 5.25, 1.9, [
    'Every participant used multiple tools and re-entered the same context.',
    'Expense tracking: the worst part — always done after the fact.',
    'Group trips stalled at agreement, never at booking.',
    'Nobody trusted a recommendation they could not question.',
], size=13, color=PAPER, leading=1.1)

box(s, 7.0, 4.55, 5.8, 1.85, fill=CARD, line=MARIGOLD, radius=True)
text(s, 7.3, 4.72, 5.2, 0.4, 'CORE HYPOTHESIS', size=11.5, bold=True, color=RGBColor(0xC5, 0x82, 0x00))
text(s, 7.3, 5.1, 5.25, 1.2,
     'A mood-first, single-app experience — visible reasoning, upfront budget certainty, '
     'trade-offs arbitrated in front of the user — beats today’s fragmented process.',
     size=13.5, bold=True, leading=1.12)
footer(s, 2)

# ================================================================ SLIDE 3 — proposed solution (with agents)
s = slide()
kicker(s, 'Proposed solution')
title(s, 'Seven agents. Typed handoffs. One backward edge.', size=30)

agents = ['Mood &\nIntent', 'Discovery', 'Budget', 'Itinerary', 'Booking', 'Referee', 'Notification']
x0, y0, w, h, gap = 0.55, 1.5, 1.62, 0.62, 0.155
for i, a in enumerate(agents):
    x = x0 + i * (w + gap)
    fill = PINE_DEEP if a != 'Referee' else MARIGOLD
    fg = CARD if a != 'Referee' else INK
    b = box(s, x, y0, w, h, fill=fill, radius=True)
    tf = b.text_frame
    tf.word_wrap = True
    pgh = tf.paragraphs[0]
    pgh.alignment = PP_ALIGN.CENTER
    r = pgh.add_run()
    r.text = a.replace('\n', ' ')
    r.font.name = FONT
    r.font.size = Pt(11.5)
    r.font.bold = True
    r.font.color.rgb = fg
    if i < 6:
        text(s, x + w - 0.04, y0 + 0.1, 0.35, 0.4, '\u2192', size=14, bold=True, color=SLATE)

text(s, 0.55, 2.25, 12.2, 0.35, [
    [('\u21a9  the backward edge \u2014 ', {'size': 12, 'bold': True, 'color': RGBColor(0xC5, 0x82, 0x00)}),
     ('the Referee can reject another agent\u2019s work and send it BACK to be re-done. '
      'Agents that negotiate \u2014 not a sequence of prompts.', {'size': 12, 'color': INK})],
])

agent_cards = [
    ('Mood & Intent', 'Turns a feeling + budget into a structured brief \u2014 never invents a preference the traveller didn\u2019t express.'),
    ('Discovery', 'Picks the destination with line-by-line evidence per non-negotiable; India-only scope enforced in the pipeline.'),
    ('Budget', 'Allocates every rupee across transport, stay, food, activities and buffer \u2014 before anything is booked.'),
    ('Itinerary', 'Builds the day-by-day plan from real, map-resolved places \u2014 open data, not model memory.'),
    ('Booking', 'Prepares simulated, gated bookings with real deep links; spend above threshold needs explicit approval.'),
    ('Referee', 'Audits agents against each other, states conflicts in rupees; one Advocate per traveller in group mode.'),
    ('Notification', 'Builds opt-in, time-anchored reminders \u2014 only from the bookings the traveller actually accepted.'),
    ('The design rules', 'LLM for judgment, code for money \u2014 a model never touches arithmetic. Six travel paths, one architecture. The traveller gets the last word.'),
]
for i, (name, desc) in enumerate(agent_cards):
    col, row = i % 2, i // 2
    x = 0.55 + col * 6.23
    y = 2.72 + row * 0.99
    accent = (name == 'The design rules')
    box(s, x, y, 6.05, 0.88, fill=CARD, line=(MARIGOLD if accent else LINE), radius=True)
    text(s, x + 0.22, y + 0.08, 1.72, 0.72, name, size=12, bold=True, leading=0.95,
         color=(RGBColor(0xC5, 0x82, 0x00) if accent else PINE))
    text(s, x + 2.0, y + 0.07, 3.92, 0.78, desc, size=10.5, color=SLATE, leading=1.0)
footer(s, 3)

# ================================================================ SLIDE 4 — implementation: how we built it
s = slide()
kicker(s, 'Implementation \u2014 how we built it')
title(s, 'An agile process, a lean stack, AI only where it earns its place', size=29)

cols = [
    ('PROCESS', [
        'Agile \u2192 Scrum, run in Jira: a 61-story backlog groomed into six sprints',
        'Sequenced by data dependency \u2014 Booking cannot exist before Itinerary',
        'QA stories in every sprint, not batched at the end; moderated UAT with real users',
        'Sprint 7 added on evidence: a plan you cannot change is a demo, not a product',
        'A continuously maintained decision log \u2014 27 entries; no call re-litigated',
    ]),
    ('TOOLS & FRAMEWORKS', [
        'Next.js App Router + TypeScript \u2014 UI and server routes in one deployable',
        'Tailwind CSS v4 on a fixed design system \u2014 pine, marigold, Plex Mono for money',
        'Vercel \u2014 push-to-deploy on every commit to main',
        'Auth.js + Google OAuth + a password-less test user; the gate sits at commitment',
        'OpenStreetMap + Nominatim + Wikipedia \u2014 real places, licensed photos, keyless',
        'Trips in browser storage \u2014 a privacy position, not a missing database',
    ]),
    ('AI & MODELS', [
        'Three Groq-hosted models, routed per agent by job:',
        '\u2022 gpt-oss-120b \u2014 reasoning: Discovery, Itinerary, Budget',
        '\u2022 qwen3.8-27b \u2014 arbitration: Referee, consensus, intent',
        '\u2022 gpt-oss-20b \u2014 structural: Booking, Advocates, translation',
        'Typed JSON-schema handoffs \u2014 every output validated before it enters trip-state',
        'Per-agent failover chains across all three \u2014 quota, schema errors, even model retirement',
        'Deterministic money layer in code; translation runs after generation completes',
    ]),
]
for i, (hdr, items) in enumerate(cols):
    x = 0.55 + i * 4.17
    box(s, x, 1.7, 3.99, 4.5, fill=CARD, line=LINE, radius=True)
    text(s, x + 0.22, 1.85, 3.5, 0.35, hdr, size=11.5, bold=True, color=RGBColor(0xC5, 0x82, 0x00))
    text(s, x + 0.22, 2.24, 3.58, 3.85, items, size=10.5, leading=1.1, color=INK)

box(s, 0.55, 6.35, 12.25, 0.58, fill=INK, radius=True)
text(s, 0.85, 6.44, 11.8, 0.42, [
    [('Total infrastructure cost: \u20b90 ', {'size': 12.5, 'bold': True, 'color': MARIGOLD}),
     ('\u2014 every dependency inside a free tier. The constraint drove the engineering: '
      'three-model failover, identical-brief caching, zero-quota sample trips.',
      {'size': 12, 'color': PAPER})],
])
footer(s, 4)

# ================================================================ SLIDE 5 — built & honest
s = slide()
kicker(s, 'What shipped — and what we refuse to fake')
title(s, 'A complete MVP that tells the truth about itself', size=30)

pic(s, '01-landing-hero.png', 0.55, 1.72, w=4.0)
pic(s, '12-trip-bookings.png', 4.72, 1.72, w=4.0)
pic(s, '33-hindi-complete.png', 8.89, 1.72, w=4.0)
for cx, cap in ((0.55, 'Mood-first — no destination field'),
                (4.72, 'Approval gates · DEMO labels on every booking'),
                (8.89, 'Agent output translated — figures untouched')):
    text(s, cx, 4.28, 4.0, 0.35, cap, size=10.5, bold=True, color=SLATE, align=PP_ALIGN.CENTER)

left = [
    ('18 MVP features', 'six paths · arbitration · override with re-pricing · reminders · settle-up · expense report'),
    ('₹0 infrastructure', 'three Groq models with per-agent failover · OpenStreetMap & Wikipedia · Vercel — all free tier'),
]
right = [
    ('Honesty as a feature', 'bookings labelled simulated · prices marked “est.” · India-only stated and enforced in the pipeline'),
    ('Privacy position', 'trips never leave the browser; an account stores only name, email, picture'),
]
y = 4.75
for (h1, b1), (h2, b2) in zip(left, right):
    box(s, 0.55, y, 6.05, 0.95, fill=CARD, line=LINE, radius=True)
    text(s, 0.8, y + 0.08, 2.1, 0.7, h1, size=13.5, bold=True, leading=0.95)
    text(s, 2.95, y + 0.08, 3.55, 0.8, b1, size=10.5, color=SLATE, leading=1.0)
    box(s, 6.78, y, 6.05, 0.95, fill=CARD, line=LINE, radius=True)
    text(s, 7.03, y + 0.08, 2.1, 0.7, h2, size=13.5, bold=True, leading=0.95)
    text(s, 9.18, y + 0.08, 3.55, 0.8, b2, size=10.5, color=SLATE, leading=1.0)
    y += 1.1
footer(s, 5)

# ================================================================ SLIDE 6 — key outcomes & impact
s = slide()
kicker(s, 'Key outcomes & impact')
title(s, 'What TripME delivers \u2014 today, and measured', size=30)

box(s, 0.55, 1.7, 6.05, 3.3, fill=CARD, line=LINE, radius=True)
text(s, 0.8, 1.85, 5.5, 0.35, 'OUTCOMES \u2014 SHIPPED AND VERIFIED', size=11, bold=True,
     color=RGBColor(0xC5, 0x82, 0x00))
text(s, 0.8, 2.24, 5.6, 2.65, [
    [('Complete MVP live', {'bold': True}), (' \u2014 18 features, all 6 travel paths, 7 languages, on a real URL', {})],
    [('4\u20136 hours \u2192 under 60 seconds', {'bold': True}),
     (' of agent time \u2014 measured and printed on every plan (34\u201358s)', {})],
    [('Arbitration is real', {'bold': True}),
     (' \u2014 the Referee rejected two agents\u2019 work on a live run and re-planned it (9 calls, 58s)', {})],
    [('Survived a provider outage', {'bold': True}),
     (' \u2014 both original models were retired by Groq; failover absorbed it', {})],
], size=12, leading=1.16)

box(s, 6.78, 1.7, 6.05, 3.3, fill=PINE, radius=True)
text(s, 7.03, 1.85, 5.5, 0.35, 'IMPACT \u2014 WHAT CHANGES FOR THE TRAVELLER', size=11, bold=True, color=MARIGOLD)
text(s, 7.03, 2.24, 5.6, 2.65, [
    [('One brief replaces 6\u20138 apps', {'bold': True, 'color': CARD}),
     (' \u2014 context entered once, carried end to end', {'color': PAPER})],
    [('Budget enforced during planning', {'bold': True, 'color': CARD}),
     (' \u2014 not reconciled after the money is gone', {'color': PAPER})],
    [('Groups reach a defensible plan', {'bold': True, 'color': CARD}),
     (' \u2014 a published concession matrix; nobody concedes twice', {'color': PAPER})],
    [('Honesty as shipped UI', {'bold': True, 'color': CARD}),
     (' \u2014 simulated labelled, prices marked est., scope stated up front', {'color': PAPER})],
], size=12, leading=1.16)

box(s, 0.55, 5.18, 12.25, 0.72, fill=CARD, line=LINE, radius=True)
text(s, 0.8, 5.29, 11.8, 0.5, [
    [('Validation gates for the beta: ', {'size': 11.5, 'bold': True, 'color': PINE}),
     ('>70% plan completion \u00b7 <60s median agent time \u00b7 >50% can explain the Referee \u00b7 '
      '>30% override something \u00b7 >25% confirm \u00b7 >20% return in 30 days',
      {'size': 11.5, 'color': SLATE})],
])

box(s, 0.55, 6.08, 12.25, 0.84, fill=INK, radius=True)
text(s, 0.9, 6.21, 8.5, 0.6, [
    [('Try it now \u2014 ', {'size': 15, 'bold': True, 'color': PAPER}),
     ('tripme-khaki.vercel.app', {'size': 15, 'bold': True, 'color': MARIGOLD}),
     ('   \u00b7   wireframes: /wireframes.html', {'size': 11, 'color': RGBColor(0x9D, 0xB3, 0xAC)})],
])
text(s, 9.3, 6.22, 3.3, 0.55, 'One mood. One budget.\nOne complete trip.',
     size=12.5, bold=True, color=PAPER, align=PP_ALIGN.RIGHT, leading=1.05)
footer(s, 6)

# ================================================================ APPENDIX
s = slide(PINE_DEEP)
text(s, 0.55, 3.2, 12.2, 0.8, 'Appendix — for Q&A', size=40, bold=True, color=PAPER)
text(s, 0.55, 4.05, 12.2, 0.5,
     'Architecture & PEAS · tech stack · testing · challenges we actually hit · ethics · prioritisation',
     size=15, color=RGBColor(0x9D, 0xB3, 0xAC))

# A1 — architecture / PEAS summary
s = slide()
kicker(s, 'Appendix A1')
title(s, 'Agent architecture — formally specified (PEAS)', size=28)
rows = [
    ('Mood & Intent', 'goal-based', 'accuracy of captured intent — never invents a preference'),
    ('Discovery', 'goal-based', 'match relevance; India-only; must explain any substitution'),
    ('Budget', 'utility-based', 'spend & split correctness — arithmetic in code, never the model'),
    ('Itinerary', 'utility-based', 'coherence & pacing fit; places from open map data, not memory'),
    ('Booking', 'action, gated', 'simulated bookings; every item above threshold needs explicit approval'),
    ('Referee', 'utility + arbitration', 'conflicts in rupees; fairness floor; can send work backwards'),
    ('Notification', 'model-based reflex', 'time-anchored reminders; opt-in per trip, off by default'),
]
y = 1.8
for a, t_, d in rows:
    box(s, 0.55, y, 12.25, 0.62, fill=CARD, line=LINE, radius=True)
    text(s, 0.8, y + 0.09, 2.2, 0.4, a, size=13, bold=True)
    text(s, 3.1, y + 0.09, 2.2, 0.4, t_, size=11.5, color=RGBColor(0xC5, 0x82, 0x00), bold=True)
    text(s, 5.4, y + 0.09, 7.2, 0.45, d, size=11.5, color=SLATE)
    y += 0.71
text(s, 0.55, 6.9, 12.2, 0.4,
     'Design rule: as much autonomy as the stakes of the decision can safely support — and no more.',
     size=12, bold=True, color=PINE)

# A2 — tech stack
s = slide()
kicker(s, 'Appendix A2')
title(s, 'Tech: what we built with vs the funded version', size=28)
built = [
    'Next.js App Router + TypeScript on Vercel — push-to-deploy',
    'Groq: llama-3.3-70b · gpt-oss-120b · llama-3.1-8b — per-agent failover chains',
    'Failover on 429 / 400 / 413 / 422 / 503 — quota becomes a slowdown, not an outage',
    'OpenStreetMap + Nominatim + Wikipedia — real, keyless, licensed places & photos',
    'Auth.js + Google OAuth + password-less demo user · trips stay in the browser',
    'Total infrastructure cost: ₹0 — every dependency inside a free tier',
]
funded = [
    'LangGraph-class runtime — retries, checkpointing, observability at scale',
    'Vector store for cross-trip preference memory; relational store for transactions',
    'FCM/APNs push, SMS & voice gateways — closed-app reminder delivery',
    'Amadeus/Travelport, Uber/Ola, IRCTC behind one adapter — real bookings',
]
box(s, 0.55, 1.8, 6.05, 4.6, fill=CARD, line=LINE, radius=True)
text(s, 0.8, 1.95, 5.5, 0.4, 'ACTUALLY BUILT', size=12, bold=True, color=PINE)
text(s, 0.8, 2.35, 5.6, 3.9, built, size=12, leading=1.18)
box(s, 6.78, 1.8, 6.05, 4.6, fill=CARD, line=LINE, radius=True)
text(s, 7.03, 1.95, 5.5, 0.4, 'FUNDED VERSION — AND WHY NOT NOW', size=12, bold=True,
     color=RGBColor(0xC5, 0x82, 0x00))
text(s, 7.03, 2.35, 5.6, 3.3, funded, size=12, leading=1.18)
text(s, 7.03, 5.5, 5.6, 0.8,
     'Adding these before validation would be infrastructure without a user.',
     size=12, bold=True, color=SLATE)

# A3 — challenges actually hit
s = slide()
kicker(s, 'Appendix A3')
title(s, 'Challenges we actually hit (and what each taught us)', size=28)
challenges = [
    ('Free-tier quota died mid-build',
     'The real limit was tokens-per-day, visible only in the 429 body. Built three-model per-agent '
     'failover; verified with the primary model fully exhausted.'),
    ('One model 400’d on a nested schema',
     'gpt-oss rejects a schema Llama accepts — took the Pilgrimage path down in production. Failover now '
     'covers 400/413/422/503, not just quota.'),
    ('A few-shot example leaked into output',
     'The Booking prompt said “like Bengaluru → Gokarna…” and got no origin field — so Bengaluru appeared in '
     'everyone’s reminders. Fix: origin in the payload, no city named in any prompt. Verified from Guwahati.'),
    ('Approvals survived price changes',
     'You could approve ₹8,000 and confirm ₹14,000. Now any amount change revokes its approval — consent '
     'is to a number, not a line item.'),
    ('Built features were invisible',
     'Confirm, reminders, email all shipped — behind an unsignposted gate chain. A gate that hides what is '
     'behind it looks unbuilt. Fix: the four-step stepper on every plan.'),
]
y = 1.8
for h, b in challenges:
    box(s, 0.55, y, 12.25, 0.94, fill=CARD, line=LINE, radius=True)
    text(s, 0.8, y + 0.08, 3.4, 0.8, h, size=13, bold=True, leading=0.98)
    text(s, 4.35, y + 0.08, 8.25, 0.85, b, size=11, color=SLATE, leading=1.02)
    y += 1.04

# A4 — testing & ethics
s = slide()
kicker(s, 'Appendix A4')
title(s, 'Testing two failure modes · ethics as shipped behaviour', size=28)
box(s, 0.55, 1.8, 6.05, 4.7, fill=CARD, line=LINE, radius=True)
text(s, 0.8, 1.95, 5.5, 0.4, 'TESTING', size=12, bold=True, color=PINE)
text(s, 0.8, 2.35, 5.6, 4.0, [
    'Two failure modes: software bugs AND AI failures (hallucination, silent bad money decisions).',
    'Offline regression per agent — fixed input/output suites re-run before any prompt change.',
    'Observability — every agent decision and handoff logged; the raw JSON log is on every trip page.',
    'RAG grounding — places from map data, not model memory.',
    'Human-in-the-loop mandatory above the spend threshold.',
    'Moderated UAT with 5–8 real users before release.',
], size=11.5, leading=1.15)
box(s, 6.78, 1.8, 6.05, 4.7, fill=CARD, line=LINE, radius=True)
text(s, 7.03, 1.95, 5.5, 0.4, 'ETHICS — LIVE IN THE PRODUCT', size=12, bold=True,
     color=RGBColor(0xC5, 0x82, 0x00))
text(s, 7.03, 2.35, 5.6, 4.0, [
    'Privacy: trips never leave the device — stated on the sign-in page.',
    'No silent substitution: out-of-scope asks are named and explained.',
    'Money: gates, revocation, code-computed arithmetic.',
    'Reminders: opt-in, time-anchored, never engagement-tuned.',
    'No dark patterns: no fake scarcity, no urgency styling, no forced sign-in before value.',
    'Standing question at every review: could we defend this to a journalist?',
], size=11.5, leading=1.15)

# A5 — prioritisation & metrics detail
s = slide()
kicker(s, 'Appendix A5')
title(s, 'Prioritisation: three lenses had to agree', size=28)
text(s, 0.55, 1.75, 12.2, 0.5,
     'RICE (reach · impact · confidence · effort) ranked every feature → MoSCoW translated it for planning → '
     'a Value-vs-Complexity quadrant sanity-checked both.', size=13, color=SLATE, leading=1.1)
box(s, 0.55, 2.5, 12.25, 1.4, fill=CARD, line=LINE, radius=True)
text(s, 0.8, 2.62, 11.7, 1.1, [
    [('Rule: ', {'bold': True}),
     ('every Quick Win went into the MVP, full stop. Everything scoring Strategic Bet, Fill-in or Money Pit '
      'was excluded by rule, not by discretion — that is what kept the MVP minimal instead of merely '
      '“smaller than the vision”.', {})],
    [('Example: ', {'bold': True}),
     ('Notification reminders scored well on RICE — but for retention, not for the hypothesis. '
      'Deliberately pushed to Should-have, Sprint 6.', {})],
], size=12.5, leading=1.15)
box(s, 0.55, 4.15, 12.25, 2.3, fill=PINE, radius=True)
text(s, 0.8, 4.3, 11.7, 0.4, 'IF YOU ASK “WHAT WOULD YOU CUT NEXT TIME?”', size=11.5, bold=True, color=MARIGOLD)
text(s, 0.8, 4.7, 11.7, 1.6, [
    'Nothing from the Must list — but Sprint 7 (traveller control) taught us the real lesson: a plan the '
    'traveller cannot change is a demo, not a product. We would plan for override from Sprint 1.',
    'And we would instrument the funnel from day one — you cannot measure a launch retroactively.',
], size=13, color=PAPER, leading=1.2)

prs.save('docs/TripME_Presentation.pptx')
print('wrote docs/TripME_Presentation.pptx —', len(prs.slides.__iter__().__length_hint__() if hasattr(prs.slides,'__length_hint__') else []) if False else f'{len(prs.slides._sldIdLst)} slides')
