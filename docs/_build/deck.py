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

# ================================================================ SLIDE 3 — solution
s = slide()
kicker(s, 'The solution')
title(s, 'Seven agents. Typed handoffs. One backward edge.')

agents = ['Mood &\nIntent', 'Discovery', 'Budget', 'Itinerary', 'Booking', 'Referee', 'Notification']
x0, y0, w, h, gap = 0.55, 1.95, 1.62, 0.95, 0.155
for i, a in enumerate(agents):
    x = x0 + i * (w + gap)
    fill = PINE_DEEP if a != 'Referee' else MARIGOLD
    fg = CARD if a != 'Referee' else INK
    b = box(s, x, y0, w, h, fill=fill, radius=True)
    tf = b.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = a.replace('\n', ' ')
    r.font.name = FONT
    r.font.size = Pt(12.5)
    r.font.bold = True
    r.font.color.rgb = fg
    if i < 6:
        text(s, x + w - 0.04, y0 + 0.22, 0.35, 0.4, '→', size=16, bold=True, color=SLATE)

# backward edge arc note
text(s, 0.55, 3.0, 12.2, 0.4, [
    [('↩  the backward edge — ', {'size': 13, 'bold': True, 'color': RGBColor(0xC5, 0x82, 0x00)}),
     ('the Referee audits Itinerary against Budget and can send the work BACK. Agents that can '
      'reject each other’s work are what make this a system, not a sequence.', {'size': 13, 'color': INK})],
])

cards = [
    ('LLM for judgment, code for money',
     'Models propose destinations and plans. Every rupee — totals, splits, re-pricing, approval '
     'thresholds — is computed deterministically in code. A model never touches arithmetic.'),
    ('Six travel paths, one architecture',
     'Solo, Couple, Group, Family, Pilgrimage, Corporate. Each changes what the agents do — corporate '
     'swaps mood for policy; groups get one Advocate agent per traveller.'),
    ('The traveller gets the last word',
     'Every decision is overridable. Change the stay and the whole trip re-prices instantly — and any '
     'approval on a changed amount is revoked. Consent is to a number.'),
]
y = 3.6
for hdr, bdy in cards:
    box(s, 0.55, y, 12.25, 1.02, fill=CARD, line=LINE, radius=True)
    text(s, 0.8, y + 0.1, 3.6, 0.8, hdr, size=14.5, bold=True, leading=1.0)
    text(s, 4.55, y + 0.1, 8.05, 0.85, bdy, size=12, color=SLATE, leading=1.05)
    y += 1.16
footer(s, 3)

# ================================================================ SLIDE 4 — proof (backward edge, live)
s = slide()
kicker(s, 'Implementation — caught live on the deployed product')
title(s, 'The Referee rejected two agents’ work — on camera', size=30)

pic(s, '27-agent-stream-midway.png', 0.55, 1.7, w=7.35)
box(s, 0.55, 6.0, 7.35, 0.62, fill=INK, radius=True)
text(s, 0.75, 6.09, 7.0, 0.45, [
    [('Live run · solo · ₹25,000 · from Pune  —  ', {'size': 11.5, 'color': PAPER}),
     ('₹10,000 of activities vs a ₹5,000 allocation → sent backwards → both agents re-ran',
      {'size': 11.5, 'bold': True, 'color': MARIGOLD})],
])

box(s, 8.15, 1.7, 4.65, 2.28, fill=CARD, line=LINE, radius=True)
text(s, 8.4, 1.85, 4.2, 0.4, 'WHAT YOU ARE SEEING', size=11, bold=True, color=RGBColor(0xC5, 0x82, 0x00))
text(s, 8.4, 2.22, 4.2, 1.7, [
    'Referee Agent · budget audit — conflict stated in rupees',
    'Budget Agent · re-planning — “triggered by Referee”',
    'Itinerary Agent · revised to fit',
    [('Result: 9 agent calls · 58s · “Re-planned by Referee” in the header',
      {'bold': True})],
], size=12, leading=1.12)

box(s, 8.15, 4.15, 4.65, 2.5, fill=PINE, radius=True)
text(s, 8.4, 4.3, 4.2, 0.4, 'AND FOR GROUPS', size=11, bold=True, color=MARIGOLD)
text(s, 8.4, 4.66, 4.2, 1.9, [
    'One Advocate agent per traveller.',
    'The Referee publishes who conceded what, with a satisfaction score per person.',
    [('The fairness floor, in writing: “Nobody conceded twice.”', {'bold': True, 'color': MARIGOLD})],
], size=12.5, color=PAPER, leading=1.15)
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

# ================================================================ SLIDE 6 — outcomes & close
s = slide()
kicker(s, 'Outcomes, validation & what’s next')
title(s, 'Instrumented targets, honest scope, a sequenced launch', size=30)

box(s, 0.55, 1.75, 6.15, 3.1, fill=CARD, line=LINE, radius=True)
text(s, 0.8, 1.88, 5.6, 0.4, 'HOW WE KNOW IT WORKS — MVP TARGETS', size=11, bold=True,
     color=RGBColor(0xC5, 0x82, 0x00))
rows = [
    ('Plan completion', '> 70% of started briefs'),
    ('Agent time to plan', 'median < 60s — measured on-screen (34–58s)'),
    ('Referee comprehension', '> 50% of testers can explain it'),
    ('Override rate', '> 30% change something — the plan is theirs'),
    ('Confirm rate · 30-day return', '> 25% · > 20%'),
]
y = 2.3
for k, v in rows:
    text(s, 0.8, y, 2.6, 0.4, k, size=12, bold=True)
    text(s, 3.45, y, 3.15, 0.4, v, size=11.5, color=SLATE)
    y += 0.49

box(s, 7.0, 1.75, 5.8, 3.1, fill=CARD, line=LINE, radius=True)
text(s, 7.25, 1.88, 5.3, 0.4, 'NEXT — IN ORDER', size=11, bold=True, color=RGBColor(0xC5, 0x82, 0x00))
text(s, 7.25, 2.3, 5.3, 2.4, [
    [('1  ', {'bold': True, 'color': PINE}), ('Launch to two personas only — solo & couple; groups and families at month 3+', {})],
    [('2  ', {'bold': True, 'color': PINE}), ('Real booking execution behind the same approval gates', {})],
    [('3  ', {'bold': True, 'color': PINE}), ('Voice input & large-text — owed before pilgrimage acquisition is honest', {})],
    [('4  ', {'bold': True, 'color': PINE}), ('Monetise: commission · Pro tier · early-bird plan lock-in', {})],
], size=12.5, leading=1.25)

box(s, 0.55, 5.1, 12.25, 1.35, fill=INK, radius=True)
text(s, 0.9, 5.3, 8.5, 1.0, [
    [('Try it now — ', {'size': 17, 'bold': True, 'color': PAPER}),
     ('tripme-khaki.vercel.app', {'size': 17, 'bold': True, 'color': MARIGOLD})],
    [('wireframes: /wireframes.html · source: github.com/divyamsingh4444/tripme',
      {'size': 12, 'color': RGBColor(0x9D, 0xB3, 0xAC)})],
], leading=1.2)
text(s, 9.6, 5.32, 3.0, 0.9, 'One mood. One budget.\nOne complete trip.',
     size=15, bold=True, color=PAPER, align=PP_ALIGN.RIGHT, leading=1.1)
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
