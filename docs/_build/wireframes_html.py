# -*- coding: utf-8 -*-
"""TripME interactive wireframes — a Figma/Stitch-style flow viewer.

One self-contained HTML file: every screenshot is embedded as a compressed
data URI, so the file works from a Vercel URL, a Drive upload, or a double-
click on a laptop with no internet. No external requests of any kind.

Output: public/wireframes.html  →  served at /wireframes.html on the live app.
"""

import base64
import io
import json
from pathlib import Path

from PIL import Image

from wf_lofi import WF

SRC = Path('docs/wireframes/screens')
OUT = Path('public/wireframes.html')

DESKTOP_W = 1000   # px — enough to read UI copy, small enough to embed
QUALITY = 62


def uri(name, max_w=DESKTOP_W):
    im = Image.open(SRC / name).convert('RGB')
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode(), im.width, im.height


# ---------------------------------------------------------------------------
# id, stage, title, route, badge, purpose, notes, file, device, scroll
SCREENS = [
    ('landing-hero', 'Discover', 'Landing — the proposition', '/', 'Public',
     'One job: make it obvious TripME does not need you to know where you are going. Competitors open with a '
     'destination field; this opens with a feeling and a budget.',
     ['The seven-agent pipeline runs as a strip along the bottom — the architecture is a selling point, not hidden.',
      'Two deliberately unequal CTAs: Start planning for intent, See a sample trip for the sceptical majority.',
      'Every claim in the metric cards is measurable — and planning time is measured live, on every trip page.'],
     '01-landing-hero.png', 'desktop', False),

    ('landing-full', 'Discover', 'Landing — full page', '/', 'Public',
     'The whole story in one scroll: proposition, pipeline, samples, paths. Scroll inside the frame.',
     ['The page sells the system, not a destination — no deals, no urgency banners, no fake scarcity.',
      'Sample trips appear before any form does.'],
     '02-landing-full.png', 'desktop', True),

    ('how-it-works', 'Discover', 'How it works — architecture, public', '/how-it-works', 'Public',
     'The full agent architecture explained to users, not just to evaluators. Most products hide this; here it is '
     'a trust surface. Scroll inside the frame.',
     ['A "What\'s real, what\'s simulated" panel separates real, estimated and simulated — in the product itself.',
      '"India, and only India" is stated as a scope decision with a reason, not discovered on failure.',
      'The Referee\'s right to send the brief backwards is documented here — then screen ⑧ shows it happening.'],
     '03-how-it-works.png', 'desktop', True),

    ('samples', 'Discover', 'Sample plans — zero-friction entry', '/', 'Public · zero quota',
     'Four complete plans that open instantly: no brief, no account, no model call. The answer to a real risk — an '
     'entry with no destination field can read as broken rather than novel.',
     ['Each sample demos a different capability: core plan, group arbitration, family pacing, corporate policy.',
      'Zero quota needed — the guaranteed-working path in any demo.',
      'Real, licensed photography from Wikimedia Commons; no stock imagery.'],
     '07-sample-chooser.png', 'desktop', False),

    ('planner-paths', 'Brief', 'Planner — six paths, six question sets', '/#plan', 'Public',
     'Who is travelling changes which questions are worth asking, so the path comes before the brief. Six genuinely '
     'different intent flows — not one form with a dropdown.',
     ['Family, Pilgrimage and Corporate skip the mood quiz entirely — their intent is already known.',
      'Mood is one tap plus a free-text vibe line the agents quote back later.'],
     '05-planner-form.png', 'desktop', False),

    ('planner-brief', 'Brief', 'Planner — the whole brief', '/#plan', 'Public',
     'Budget, days, origin, date. This is the entire input the seven agents run on.',
     ['The From field is EMPTY with a "Your city" placeholder. It used to pre-fill Bengaluru — which leaked through '
      'the Booking Agent into other travellers\' reminders. Nothing about the traveller is assumed any more.',
      'Budget is a slider plus a typed figure — a range for explorers, an exact number for planners.'],
     '06-planner-form-lower.png', 'desktop', False),

    ('agent-stream', 'Generate', 'The pipeline, running live', '/run', 'Live run',
     'Captured during a real run: solo · relax · ₹25,000 · 3 days · from Pune. Each agent reports what it decided '
     'as it finishes, with the brief pinned alongside.',
     ['Agents report decisions, not progress bars — "Relax · slow pace, waterfront views".',
      'The clock is honest about what it counts: agent time only, not free-tier queueing.',
      'FROM: Pune in the brief panel — the origin fix, verified live from a city the prompts never mention.'],
     '26-agent-stream.png', 'desktop', False),

    ('backward-edge', 'Generate', 'The backward edge — Referee rejects', '/run', 'Live run',
     'The most important capture in this deck, and it happened unprompted. The Referee audited the Itinerary Agent '
     'against the Budget Agent, found a ₹5,000 overrun, and sent the work BACK.',
     ['Referee Agent · budget audit — ₹10,000 of activities vs a ₹5,000 allocation, stated in rupees.',
      'Budget Agent · re-planning, tagged "triggered by Referee" — ₹2,000 → ₹7,000.',
      'Itinerary Agent · revised to fit — the affected steps re-run.',
      'This is why it is a graph, not a chain: agents can reject each other\'s work.'],
     '27-agent-stream-midway.png', 'desktop', False),

    ('live-result', 'Generate', 'The finished live plan', '/trip', 'Live run',
     'The result of that run: Kerala Backwaters, chosen for the brief, with the re-planning on record in the header.',
     ['9 agents · 58s of agent time · Re-planned by Referee — nine calls, because two agents ran twice.',
      'The rationale quotes the traveller\'s own words back — "soothing, gentle escape", "calm waters and greenery".',
      'Transport reads "train and taxi from Pune" — the origin carried correctly end to end.'],
     '28-live-plan-result.png', 'desktop', False),

    ('trip-header', 'Read the plan', 'Trip page — header & rationale', '/trip', 'Sample data',
     'The most important screen in the product. Destination, evidence, and the agent metrics that back the landing '
     'page\'s performance claim.',
     ['"7 agents · 34s of agent time" — the product instruments its own claim.',
      '"Why the Discovery Agent chose this" sits right below the fold, with the rejected alternates one tap away.',
      'Wikimedia attribution on the photograph — even the imagery is honest.'],
     '09-trip-header.png', 'desktop', False),

    ('trip-full', 'Read the plan', 'Trip page — everything, one scroll', '/trip', 'Sample data',
     'Arbitration, budget, day-by-day, phrase card, bookings, live spend, next steps, override panel, confirm gate '
     'and the raw agent log — one page. Scroll inside the frame.',
     ['The right rail keeps status, dates, origin and the approved/committed/unspent split pinned while you scroll.',
      'The raw JSON agent log is at the bottom of every trip page — full auditability, one tap away.'],
     '08-trip-full.png', 'desktop', True),

    ('arbitration', 'Read the plan', 'Arbitration — a conflict, in rupees', '/trip', 'Sample data',
     'Two agents produced incompatible outputs. Instead of silently reconciling them, the product shows the '
     'disagreement and three ways to settle it.',
     ['₹4,500 of activities vs a ₹4,450 allowance — quantified, not described as a "tension".',
      'Three resolutions, each with its impact spelled out. The traveller decides.',
      'The Referee grades its own finding "minor": at ₹50 this is rounding, not a re-plan. An arbitrator that '
      'escalates everything equally is noise.'],
     '10-trip-arbitration.png', 'desktop', False),

    ('itinerary', 'Read the plan', 'Day by day', '/trip', 'Sample data',
     'The itinerary at honest local prices, slot by slot.',
     ['Each slot carries its own cost — the ₹ figures roll up to the budget, not the other way round.',
      'Places are real and mappable, resolved from open map data rather than model memory.'],
     '11-trip-itinerary.png', 'desktop', False),

    ('bookings', 'Read the plan', 'Bookings — gates & honest labels', '/trip', 'Sample data',
     'Every item of spend is gated behind explicit approval, and every item says what it really is.',
     ['DEMO MODE — NO REAL RESERVATION on each card, in the product, not only in the documentation.',
      'Each gate states its reason: "Above ₹3,000 spend gate", "Weather-dependent slot".',
      'Changing an amount revokes its approval — you can no longer approve ₹8,000 and confirm ₹14,000.',
      '"See real options" deep-links to genuine providers; the links are real even though bookings are not.'],
     '12-trip-bookings.png', 'desktop', False),

    ('stepper', 'Decide', 'What happens next — the visible gate chain', '/trip', 'Sample data',
     'Born from a real complaint: confirm, reminders and email were all built and all invisible, because each '
     'unlocks only after the previous step. A gate that hides what is behind it looks identical to a feature that '
     'was never built.',
     ['Adjust → Approve → Confirm → Reminders, stated from the moment a plan exists.',
      'Each locked step says what unlocks it — nothing is mysteriously greyed out.',
      'The order is explained, not imposed: confirming builds reminders from the bookings you actually agreed to.'],
     '13-trip-stepper.png', 'desktop', False),

    ('options', 'Decide', 'Alternatives — overruling the agents', '/trip', 'Sample data',
     'The agents make the first call, not the last. Transport, local travel, stay and every day can change — and '
     'the money recomputes in code, not by asking a model again.',
     ['Trade-offs, not marketing: "Cheapest, but arrives at 4am" · "Meters are often refused — agree the fare first".',
      'Every price is marked "est." with the reason stated: live fares sit behind paid inventory APIs.'],
     '14-trip-options.png', 'desktop', False),

    ('stays', 'Decide', 'Real stays from OpenStreetMap', '/trip', 'Sample data',
     'Real hotels and guesthouses near the destination — named, mappable, linkable.',
     ['Every listing is a real place with "View on map"; some carry their own websites.',
      'Small guesthouses show a map pin, not a photo — Wikimedia has a licensed photo of Gokarna, but not of one '
      'guesthouse in it. A stock photo of somewhere else would be a small dishonesty.'],
     '15-trip-options-stays.png', 'desktop', False),

    ('signin', 'Commit', 'Sign in — at commitment, not entry', '/signin', 'Public',
     'Planning works signed out. An account is needed only to confirm or save — a confirmed trip and its reminders '
     'must belong to someone.',
     ['"Continue as a test user" — password-less, so any evaluator reaches every gated feature.',
      'The privacy position is on the page, not in a policy: trips stay in the browser; the account holds only what '
      'Google returns.',
      '"Plan a trip without signing in" is an explicit exit. The gate is honest about being optional.'],
     '16-signin.png', 'desktop', True),

    ('confirm', 'Commit', 'Confirm — unlocked by approvals', '/trip', 'Signed in · test user',
     'All three bookings approved, so the gate has opened. The footer now reads ₹10,200 approved.',
     ['The copy tells the truth twice: confirming locks the plan, and nothing is booked for real.',
      '"You can undo this at any time" — commitment without a trap.',
      'The right-rail budget bar has moved: approved ₹10,200 of ₹18,000.'],
     '18-confirm-unlocked.png', 'desktop', False),

    ('confirmed', 'Commit', 'Confirmed — reminders are opt-in', '/trip', 'Signed in · test user',
     'The trip is confirmed and reminders are ON — because the traveller switched them on. Off by default, per trip, '
     'off again in one click.',
     ['The schedule is rebuilt from the bookings actually approved — reminders can no longer name a rejected hotel.',
      'The delivery limit is stated where the feature is: reminders live in the bell while TripME is open; a '
      'closed-app push needs infrastructure this demo does not have.',
      'Status chip: DRAFT PLAN → CONFIRMED. Action bar: "Sign in to save" → "Save trip".'],
     '19-confirmed-reminders.png', 'desktop', False),

    ('bell', 'Commit', 'The bell — time-anchored reminders', '/trip', 'Signed in · test user',
     'Departure, check-in, each activity, each day — anchored to real trip events, never to engagement targets.',
     ['"You leave tomorrow · 3 days from Bengaluru · worth checking your packing list tonight" — useful, specific, '
      'time-bound.',
      'The honesty line is inside the dropdown itself: delivery to a closed app needs push infrastructure this '
      'demo does not have.'],
     '20-reminders-bell.png', 'desktop', False),

    ('my-trips', 'Return', 'My Trips — no duplicates', '/trips', 'Signed in · test user',
     'Saved trips with status. One card per trip.',
     ['One card, although this trip was saved after being confirmed — saving upserts. An earlier defect minted a new '
      'id every save; one trip once produced six cards.',
      'Status on the card: ✓ Confirmed, plus the mood it was planned for.'],
     '21-my-trips.png', 'desktop', False),

    ('assistant', 'Return', 'The global assistant', '/trips', 'Signed in · test user',
     'On every page, draggable collapsed or open, aware of the trip being viewed.',
     ['The greeting names your trip and offers to explain the product — including "what is real and what is '
      'simulated". The assistant is part of the honesty surface.',
      'Pre-made questions FILL the input rather than firing — the traveller edits before asking.'],
     '22-assistant.png', 'desktop', False),

    ('referee-group', 'Breadth', 'Group mode — the concession matrix', '/trip', 'Sample data',
     'One Advocate agent per traveller, and the Referee publishes exactly who conceded what — the part of group '
     'travel that actually breaks down.',
     ['Wanted · got · conceded · a satisfaction score per person. Nobody takes the plan on trust.',
      'The fairness floor, in writing: "Nobody conceded twice."',
      'Trades are causal: Priya\'s trek won the weather window, so Rohan absorbed the early start — and got both '
      'free afternoons in exchange.'],
     '23-referee-advocates.png', 'desktop', False),

    ('settle-up', 'Breadth', 'Live spend & settle-up', '/trip', 'Sample data',
     'Planned vs actually-approved spend, updating as each booking is approved. An earlier draft listed expense '
     'splitting as NOT in the MVP. It is built.',
     ['Planned, approved-so-far and still-unspent are separate numbers because they answer different questions.',
      '"No separate app" — the split runs against the plan that was approved, not receipts reconstructed later.'],
     '24-settle-up.png', 'desktop', False),

    ('corporate', 'Breadth', 'Corporate — policy, enforced', '/trip', 'Sample data',
     'The corporate path swaps mood for policy. Caps are enforced in code and the Referee runs a compliance audit.',
     ['A Policy compliance panel with an explicit verdict — compliant, or a named breach.',
      'The city is fixed by the meeting, so Discovery picks the district instead — the same agent, a different job.',
      'The output includes a reimbursement-ready expense report by cost centre.'],
     '25-corporate-policy.png', 'desktop', False),

    ('hindi', 'Breadth', 'Hindi — the agents\' own words, translated', '/trip', 'Live run · हिन्दी',
     'Interface AND content: the budget notes, the tips, the Referee\'s re-planning narrative — translated after '
     'generation, so agents reason in one language and the traveller reads in another.',
     ['The Referee\'s ₹2,000 → ₹7,000 re-allocation survives translation intact, strikethrough included.',
      'Currency, dates and figures stay as written — no numeral-system conversion.',
      'Six Indian languages plus English; this is a live-generated plan, not a canned translation.'],
     '33-hindi-complete.png', 'desktop', False),

    ('mobile-trip', 'Breadth', 'Mobile — full capability at 390px', '/trip', 'Mobile 390×844',
     'Not a reduced product: everything on desktop is here. Density changes; capability does not.',
     ['Single column, pinned action bar, assistant collapsed to a bubble.',
      'The metrics chips wrap instead of truncating — nothing is dropped.',
      '"Print" is the one action the phone loses, deliberately.'],
     '29-mobile-trip.png', 'mobile', False),

    ('mobile-landing', 'Breadth', 'Mobile — landing', '/', 'Mobile 390×844',
     'The proposition survives the narrowest mainstream viewport.',
     ['The globe hero degrades gracefully; the CTAs stay above the fold.'],
     '30-mobile-landing.png', 'mobile', False),

    ('contact', 'Breadth', 'Contact', '/contact', 'Public',
     'A supporting page held to the product standard — where brands usually fall apart. Scroll inside the frame.',
     ['Same voice, same design system, same honesty line in the footer: "Demo product — no real bookings are made."'],
     '31-contact.png', 'desktop', True),
]

COVERAGE = [
    ('Seven specialised agents, not one prompt', ['agent-stream', 'backward-edge', 'live-result', 'how-it-works']),
    ('The architecture is a graph — agents can reject each other\'s work', ['backward-edge']),
    ('Arbitration is visible and quantified in rupees', ['arbitration', 'referee-group']),
    ('One Advocate per traveller, with a published fairness floor', ['referee-group']),
    ('Money is deterministic and re-prices on every change', ['arbitration', 'bookings', 'options', 'settle-up']),
    ('Approvals are revoked when the amount changes', ['bookings']),
    ('Bookings are simulated and labelled as such', ['bookings', 'how-it-works']),
    ('Mood-first entry with no assumed origin', ['landing-hero', 'planner-brief', 'agent-stream']),
    ('All six travel paths are built', ['planner-paths', 'referee-group', 'corporate']),
    ('Expense splitting is built', ['settle-up']),
    ('Notification Agent is built; reminders opt-in per trip', ['confirmed', 'bell']),
    ('Authentication gates commitment, not planning', ['stepper', 'signin']),
    ('Seven languages including agent-generated output', ['hindi']),
    ('Real places from open map data', ['stays', 'itinerary']),
    ('Responsive to 390px', ['mobile-trip', 'mobile-landing']),
    ('India-only scope, stated rather than hidden', ['how-it-works']),
    ('Zero-quota demonstration path', ['samples']),
    ('Under-60s agent time, instrumented in-product', ['trip-header', 'live-result']),
]

STAGE_BLURBS = {
    'Discover': 'A sceptical first-time visitor, before any form',
    'Brief': 'The entire input: mood, budget, days, origin',
    'Generate': 'Seven agents — captured on a real, live run',
    'Read the plan': 'The plan, and why it is this plan',
    'Decide': 'The traveller gets the final call',
    'Commit': 'Sign in → approve → confirm → reminders',
    'Return': 'The second visit',
    'Breadth': 'Group · corporate · language · mobile',
}


def build():
    shots = []
    total = 0
    for (sid, stage, title, route, badge, purpose, notes, fname, device, scroll) in SCREENS:
        max_w = 420 if device == 'mobile' else DESKTOP_W
        u, w, h = uri(fname, max_w)
        total += len(u)
        assert sid in WF, f'no lo-fi wireframe for {sid}'
        shots.append(dict(id=sid, stage=stage, title=title, route=route, badge=badge,
                          purpose=purpose, notes=notes, img=u, w=w, h=h,
                          device=device, scroll=scroll, wf=WF[sid]))
        print(f'  {fname:32s} {w}x{h}  {len(u)//1024} KB')
    print(f'embedded total ~ {total // 1024} KB')

    data = json.dumps(shots, ensure_ascii=False)
    coverage = json.dumps([{'claim': c, 'ids': ids} for c, ids in COVERAGE], ensure_ascii=False)
    blurbs = json.dumps(STAGE_BLURBS, ensure_ascii=False)

    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>TripME — Wireframes &amp; Screen Flows</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%2314453D'/%3E%3Ctext x='50' y='68' font-size='52' text-anchor='middle' fill='%23FFB52E' font-family='sans-serif' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E">
<style>
  :root{
    --pine:#14453D; --pine-deep:#0E332D; --ink:#0E1F1A; --slate:#5B6B66;
    --marigold:#FFB52E; --paper:#EFF2EF; --card:#FFFFFF; --line:#DDE4E0;
    --flag:#B4361E; --mono:'IBM Plex Mono','Cascadia Code',Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{font-family:'Bricolage Grotesque','Segoe UI',system-ui,sans-serif;background:var(--paper);color:var(--ink)}

  .app{display:grid;grid-template-rows:56px 1fr;height:100vh}
  /* ---------- top bar ---------- */
  .top{background:var(--pine);color:#fff;display:flex;align-items:center;gap:16px;padding:0 18px;z-index:5}
  .brand{font-weight:800;font-size:17px;letter-spacing:.2px;white-space:nowrap}
  .brand em{color:var(--marigold);font-style:normal}
  .top .sub{font-size:11px;opacity:.75;border-left:1px solid rgba(255,255,255,.25);padding-left:14px;white-space:nowrap}
  .top .title{flex:1;text-align:center;font-size:13.5px;font-weight:600;opacity:.95;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .counter{font-family:var(--mono);font-size:11.5px;opacity:.8;white-space:nowrap}
  .navbtn{background:rgba(255,255,255,.12);border:0;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:15px;line-height:1}
  .navbtn:hover{background:rgba(255,255,255,.25)}
  .live{background:var(--marigold);color:var(--ink);text-decoration:none;font-size:11.5px;font-weight:700;padding:7px 12px;border-radius:999px;white-space:nowrap}

  .main{display:grid;grid-template-columns:250px 1fr 305px;min-height:0}
  /* ---------- sidebar ---------- */
  .side{background:var(--card);border-right:1px solid var(--line);overflow-y:auto;padding:14px 0 30px}
  .stage{padding:14px 16px 4px}
  .stage h3{font-size:10.5px;letter-spacing:1.4px;text-transform:uppercase;color:var(--pine);font-weight:800}
  .stage p{font-size:10.5px;color:var(--slate);margin-top:2px;line-height:1.35}
  .item{display:flex;gap:9px;align-items:center;width:100%;text-align:left;border:0;background:none;
        padding:7px 16px;cursor:pointer;font:inherit;font-size:12.5px;color:var(--ink)}
  .item:hover{background:#F2F6F3}
  .item.on{background:#E8F0EB;box-shadow:inset 3px 0 0 var(--marigold);font-weight:700}
  .item .n{font-family:var(--mono);font-size:10px;color:var(--slate);width:20px;flex:none;text-align:right}
  .item.special{color:var(--pine);font-weight:700}

  /* ---------- canvas ---------- */
  .canvas{overflow:auto;display:flex;flex-direction:column;align-items:center;padding:26px 30px 44px;
          background:
            radial-gradient(circle at 1px 1px, #D6DEDA 1px, transparent 0);
          background-size:22px 22px}
  .frame{max-width:960px;width:100%}
  .browser{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;
           box-shadow:0 18px 50px -18px rgba(14,31,26,.35)}
  .chrome{display:flex;align-items:center;gap:10px;background:#F4F6F4;border-bottom:1px solid var(--line);padding:9px 14px}
  .dots span{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px}
  .dots span:nth-child(1){background:#F26D5F}.dots span:nth-child(2){background:#F2BE4B}.dots span:nth-child(3){background:#5FC26D}
  .url{flex:1;background:#fff;border:1px solid var(--line);border-radius:8px;font-family:var(--mono);
       font-size:11px;color:var(--slate);padding:5px 11px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
  .url b{color:var(--pine);font-weight:600}
  .shot{display:block;width:100%;height:auto}
  .scrollwrap{max-height:66vh;overflow-y:auto}
  .scrollwrap::-webkit-scrollbar{width:9px}
  .scrollwrap::-webkit-scrollbar-thumb{background:#BFCBC5;border-radius:8px}
  .hint{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:11px;color:var(--slate)}
  .hint .chip{background:var(--pine);color:#fff;border-radius:999px;padding:2px 9px;font-size:10px;font-weight:700}

  .phone{width:330px;background:#101613;border-radius:38px;padding:12px 10px 16px;margin:0 auto;
         box-shadow:0 18px 50px -18px rgba(14,31,26,.5)}
  .notch{width:110px;height:16px;background:#101613;border-radius:0 0 12px 12px;margin:0 auto 6px}
  .phone .screen{border-radius:26px;overflow:hidden;background:#fff}

  /* ---------- inspect panel ---------- */
  .inspect{background:var(--card);border-left:1px solid var(--line);overflow-y:auto;padding:20px 20px 40px}
  .kicker{font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:var(--slate);font-weight:800;margin:18px 0 6px}
  .kicker:first-child{margin-top:0}
  .badge{display:inline-block;background:#E8F0EB;color:var(--pine);font-size:10.5px;font-weight:700;
         padding:3px 10px;border-radius:999px;margin-bottom:8px}
  .badge.live{background:var(--marigold);color:var(--ink)}
  .inspect h2{font-size:16.5px;line-height:1.25;margin-bottom:6px}
  .inspect .purpose{font-size:12.5px;color:#33413C;line-height:1.55}
  .note{display:flex;gap:9px;margin-bottom:9px;font-size:12px;line-height:1.5;color:#33413C}
  .note .dot{flex:none;width:17px;height:17px;border-radius:50%;background:var(--pine);color:#fff;
             font-size:9.5px;font-weight:800;display:grid;place-items:center;margin-top:1px}
  .meta{font-family:var(--mono);font-size:10.5px;color:var(--slate);line-height:1.8}
  .meta b{color:var(--ink);font-weight:600}

  /* ---------- special views ---------- */
  .special-view{max-width:980px;width:100%}
  .hero-card{background:var(--pine);color:#fff;border-radius:18px;padding:30px 34px;margin-bottom:20px}
  .hero-card h1{font-size:26px;margin-bottom:8px}
  .hero-card h1 em{color:var(--marigold);font-style:normal}
  .hero-card p{font-size:13px;line-height:1.6;opacity:.92;max-width:640px}
  .hero-card .mono{font-family:var(--mono);font-size:11px;opacity:.75;margin-top:14px}
  .flow{display:flex;flex-wrap:wrap;gap:0;align-items:stretch;margin-bottom:20px}
  .fstage{flex:1 1 200px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 14px 14px 0;position:relative}
  .fstage:after{content:'→';position:absolute;right:-13px;top:50%;transform:translateY(-50%);color:var(--slate);font-size:15px}
  .fstage:last-child:after{content:''}
  .fstage h4{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--pine);margin-bottom:3px}
  .fstage p{font-size:10.5px;color:var(--slate);line-height:1.4;margin-bottom:8px}
  .fstage a{display:block;font-size:11.5px;color:var(--ink);text-decoration:none;padding:3px 0;border-radius:6px}
  .fstage a:hover{color:var(--pine);font-weight:600}
  .fstage a .fn{font-family:var(--mono);font-size:9.5px;color:var(--slate);margin-right:5px}
  .callout{background:#FFF6E3;border:1px solid #F2DCA6;border-radius:14px;padding:16px 20px;font-size:12.5px;line-height:1.6}
  .callout b{color:var(--pine)}
  .cov{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
  .cov th{background:var(--pine);color:#fff;text-align:left;font-size:11px;letter-spacing:.8px;text-transform:uppercase;padding:11px 16px}
  .cov td{border-top:1px solid var(--line);padding:10px 16px;font-size:12.5px;vertical-align:top}
  .cov .chip{display:inline-block;background:#E8F0EB;color:var(--pine);font-size:10.5px;font-weight:700;
             padding:3px 10px;border-radius:999px;margin:2px 4px 2px 0;text-decoration:none;cursor:pointer}
  .cov .chip:hover{background:var(--marigold);color:var(--ink)}


  /* ---------- low-fidelity wireframe vocabulary ---------- */
  .modes{display:flex;gap:0;margin:0 auto 14px;background:#fff;border:1px solid var(--line);
         border-radius:999px;padding:3px;width:max-content}
  .modes button{border:0;background:none;font:inherit;font-size:11.5px;font-weight:700;color:var(--slate);
                padding:7px 16px;border-radius:999px;cursor:pointer}
  .modes button.on{background:var(--pine);color:#fff}
  .modes button:not(.on):hover{color:var(--pine)}
  .wf{background:#FBFBF9;color:#8A938F;font-size:10px;min-height:100%}
  .wf.bg{background:#F4F5F3}
  .wf.dim{background:#DDE1DE}
  .wf-stack{display:flex;flex-direction:column;gap:6px;margin:4px 0}
  .wf-ln{background:#CBD1CD;border-radius:4px;flex:none}
  .wf-ln.d{background:#96A09B}
  .wf-x{border:1.5px solid #B4BCB7;border-radius:6px;background:
        linear-gradient(to top right, transparent calc(50% - .75px), #C4CBC6 calc(50% - .75px),
          #C4CBC6 calc(50% + .75px), transparent calc(50% + .75px)),
        linear-gradient(to bottom right, transparent calc(50% - .75px), #C4CBC6 calc(50% - .75px),
          #C4CBC6 calc(50% + .75px), transparent calc(50% + .75px)), #F2F4F2;
        display:grid;place-items:center;flex:none;min-width:24px}
  .wf-x span{background:#F2F4F2;padding:1px 6px;font-size:8px;font-weight:800;letter-spacing:1px;color:#96A09B}
  .wf-btn{background:#8F9995;color:#fff;border-radius:999px;padding:7px 14px;font-size:8.5px;font-weight:800;
          letter-spacing:.8px;display:inline-block;text-align:center;flex:none}
  .wf-btn.o{background:#fff;color:#828C87;border:1.5px solid #B4BCB7}
  .wf-pill{border:1.5px solid #B4BCB7;border-radius:999px;padding:2px 9px;font-size:7.5px;font-weight:800;
           letter-spacing:.6px;color:#828C87;display:inline-block;background:#fff;flex:none}
  .wf-pill.on{background:#8F9995;border-color:#8F9995;color:#fff}
  .wf-tag{font-size:7.5px;font-weight:800;letter-spacing:1.4px;color:#A6AFAA;margin:12px 0 6px;text-transform:uppercase}
  .wf-card .wf-tag:first-child{margin-top:0}
  .wf-card{background:#fff;border:1.5px solid #C4CBC6;border-radius:10px;padding:12px;margin:10px 0}
  .wf-card.ghost{border-color:#D8DDDA;margin:0}
  .wf-card.sel{background:#8F9995;border-color:#8F9995}
  .wf-card.sel .wf-ln{background:#C9CFCC}
  .wf-card.accent{border-color:#96A09B;border-width:2px}
  .wf-r{display:flex;align-items:flex-start}
  .wf-g{display:grid;margin:8px 0}
  .wf-g .wf-card{margin:0}
  .wf-center{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center}
  .wf-center .wf-ln{margin:0 auto}
  .wf-nav{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1.5px solid #C4CBC6;
          background:#fff;margin:-18px -18px 14px}
  .wf[style*="padding:0"] .wf-nav{margin:0 0 10px}
  .wf-footer{display:flex;gap:26px;align-items:flex-start;border-top:1.5px solid #C4CBC6;background:#fff;
             margin:14px -18px -18px;padding:16px 18px}
  .wf-hr{border:0;border-top:1.5px dashed #D8DDDA;margin:10px 0}
  .wf-kv{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center;padding:5px 0;
         border-bottom:1px solid #EDEFEC}
  .wf-kv .wf-ln:last-child{justify-self:end}
  .wf-kv.wf-th{border-bottom:1.5px solid #C4CBC6}
  .wf-bar{height:9px;border-radius:999px;background:#E4E7E4;overflow:hidden;margin:7px 0;display:flex}
  .wf-bar i{display:block;height:100%;background:#96A09B}
  .wf-bar.seg i:nth-child(2){background:#AAB3AE}.wf-bar.seg i:nth-child(3){background:#BFC7C2}
  .wf-bar.seg i:nth-child(4){background:#D2D8D4}
  .wf-slider{height:5px;border-radius:999px;background:#D8DDDA;position:relative;margin:14px 4px}
  .wf-slider i{position:absolute;left:26%;top:50%;transform:translate(-50%,-50%);width:14px;height:14px;
               border-radius:50%;background:#8F9995;display:block}
  .wf-input{border:1.5px solid #C4CBC6;border-radius:8px;min-height:30px;display:flex;align-items:center;
            padding:0 10px;background:#fff;margin:6px 0;position:relative}
  .wf-input.empty .wf-ln{display:none}
  .wf-ph{font-size:8px;font-weight:800;letter-spacing:.8px;color:#B4BCB7}
  .wf-node{display:flex;flex-direction:column;align-items:center;gap:5px}
  .wf-node span{width:11px;height:11px;border-radius:50%;border:2px solid #96A09B;background:#fff;display:block}
  .wf-agent{display:flex;gap:10px;align-items:center;background:#fff;border:1.5px solid #C4CBC6;
            border-radius:10px;padding:10px 12px;margin:8px 0}
  .wf-agent.warn{border-color:#96A09B;border-width:2px;background:#F2F4F2}
  .wf-mark{font-size:12px;color:#828C87;font-weight:800;flex:none}
  .wf-arrow{color:#A6AFAA;font-size:12px;flex:none}
  .wf-caption{font-size:7.5px;font-weight:800;letter-spacing:.8px;color:#A6AFAA;margin:7px 0;text-transform:uppercase}
  .wf-hero{position:relative;background-blend-mode:normal;padding:0;display:block}
  .wf-hero-in{position:absolute;inset:0;padding:16px 18px;display:flex;flex-direction:column;gap:8px;
              justify-content:flex-end;background:linear-gradient(rgba(251,251,249,.35),rgba(251,251,249,.88))}
  .wf-hero-in .wf-g,.wf-hero-in .wf-card{margin:0}
  .wf-hero-in{container-type:normal}
  .wf-hero-in > .wf-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .wf-day{border:1.5px solid #E4E7E4;border-radius:8px;padding:8px 10px;margin:8px 0}
  .wf-vr{width:1.5px;background:#E4E7E4;align-self:stretch}
  .wf-step{border:1.5px solid #C4CBC6;border-radius:10px;padding:9px;position:relative;border-style:dashed}
  .wf-step.done,.wf-step.on{border-style:solid}
  .wf-step.on{border-color:#8F9995;border-width:2px}
  .wf-dot{width:16px;height:16px;border-radius:50%;background:#C4CBC6;color:#fff;font-size:8.5px;font-weight:800;
          display:grid;place-items:center;margin-bottom:6px}
  .wf-step.done .wf-dot{background:#8F9995}
  .wf-score{font-size:8px;color:#96A09B;letter-spacing:1px;justify-self:end}
  .wf-actionbar{position:sticky;bottom:0;display:flex;gap:8px;align-items:center;background:#fff;
                border-top:1.5px solid #C4CBC6;margin:14px -18px -18px;padding:10px 18px}
  .wf[style*="padding:0"] .wf-actionbar{margin:0}
  .wf-assist{display:flex;justify-content:flex-end;padding:0 16px 16px}
  .wf-assist .wf-card{margin:0}

  @media (max-width:1100px){
    .main{grid-template-columns:1fr}
    .side,.inspect{display:none}
    .top .sub{display:none}
  }
</style>
</head>
<body>
<div class="app">
  <header class="top">
    <div class="brand">Trip<em>ME</em></div>
    <div class="sub">Wireframes · Release 0.1.1 · Team DEBUGGERS</div>
    <div class="title" id="barTitle"></div>
    <div class="counter" id="barCount"></div>
    <button class="navbtn" id="prev" title="Previous (←)">‹</button>
    <button class="navbtn" id="next" title="Next (→)">›</button>
    <a class="live" href="https://tripme-khaki.vercel.app" target="_blank" rel="noopener">Open live product ↗</a>
  </header>
  <div class="main">
    <nav class="side" id="side"></nav>
    <main class="canvas" id="canvas"></main>
    <aside class="inspect" id="inspect"></aside>
  </div>
</div>
<script>
const SCREENS = __DATA__;
const COVERAGE = __COVERAGE__;
const BLURBS = __BLURBS__;
const ORDER = ['overview'].concat(SCREENS.map(s=>s.id)).concat(['coverage']);
const byId = Object.fromEntries(SCREENS.map(s=>[s.id,s]));
const esc = t => t.replace(/&/g,'&amp;').replace(/</g,'&lt;');

/* ---------- sidebar ---------- */
function sidebar(){
  const el = document.getElementById('side');
  let h = '<button class="item special" data-id="overview"><span class="n">◈</span>User-flow overview</button>';
  let stage = '';
  SCREENS.forEach((s,i)=>{
    if(s.stage!==stage){
      stage = s.stage;
      h += `<div class="stage"><h3>${esc(stage)}</h3><p>${esc(BLURBS[stage]||'')}</p></div>`;
    }
    h += `<button class="item" data-id="${s.id}"><span class="n">${String(i+1).padStart(2,'0')}</span>${esc(s.title)}</button>`;
  });
  h += '<div class="stage"><h3>Evidence</h3></div>';
  h += '<button class="item special" data-id="coverage"><span class="n">✓</span>Claim → screen map</button>';
  el.innerHTML = h;
  el.querySelectorAll('.item').forEach(b=>b.onclick=()=>go(b.dataset.id));
}

/* ---------- views ---------- */
function overviewView(){
  const stages = [...new Set(SCREENS.map(s=>s.stage))];
  const cols = stages.map(st=>{
    const links = SCREENS.filter(s=>s.stage===st).map(s=>{
      const n = String(SCREENS.indexOf(s)+1).padStart(2,'0');
      return `<a href="#${s.id}"><span class="fn">${n}</span>${esc(s.title)}</a>`;
    }).join('');
    return `<div class="fstage"><h4>${esc(st)}</h4><p>${esc(BLURBS[st]||'')}</p>${links}</div>`;
  }).join('');
  return `<div class="special-view">
    <div class="hero-card">
      <h1>One mood. One budget. <em>One complete trip.</em></h1>
      <p>Thirty screens, arranged as the traveller meets them — from a sceptical first visit to a
         confirmed trip with reminders on. Each screen exists in <b>two fidelities</b>: the low-fidelity
         wireframe (the rough structure — boxes, placeholders, no styling) and the real built screen,
         captured from the live deployment. Flip between them with the toggle above any screen, or press F.</p>
      <p class="mono">Captured 6 Aug 2026 · tripme-khaki.vercel.app · desktop 1440×900 · mobile 390×844 · test-user account</p>
    </div>
    <div class="flow">${cols}</div>
    <div class="callout"><b>One sequence is genuinely live.</b> Screens 07–09 come from a real run during capture
      — solo · relax · ₹25,000 · from Pune — in which the Referee rejected the Itinerary Agent's costs
      (a ₹5,000 overrun) and sent the brief <b>backwards</b> to the Budget Agent. Both agents re-ran. That is the
      backward edge that makes this a graph rather than a chain, caught happening unprompted.</div>
  </div>`;
}

function coverageView(){
  const rows = COVERAGE.map(c=>{
    const chips = c.ids.map(id=>{
      const n = String(SCREENS.findIndex(s=>s.id===id)+1).padStart(2,'0');
      return `<a class="chip" href="#${id}">${n} · ${esc(byId[id].title.split(' — ')[0])}</a>`;
    }).join('');
    return `<tr><td>${esc(c.claim)}</td><td>${chips}</td></tr>`;
  }).join('');
  return `<div class="special-view">
    <div class="hero-card"><h1>Every claim, <em>evidenced.</em></h1>
      <p>Each claim made in the Phase 2 submission, mapped to the screen that proves it.
         Click a chip to jump to the evidence.</p></div>
    <table class="cov"><tr><th>Claim in the submission</th><th>Evidenced by</th></tr>${rows}</table>
  </div>`;
}

let MODE = 'wf';   // 'wf' = low-fidelity wireframe (default) · 'real' = built screen

function screenView(s){
  const toggle = `<div class="modes">
      <button class="${MODE==='wf'?'on':''}" data-mode="wf">Low-fi wireframe</button>
      <button class="${MODE==='real'?'on':''}" data-mode="real">Built screen</button>
    </div>`;
  const content = MODE==='wf'
    ? s.wf
    : `<img class="shot" src="${s.img}" alt="${esc(s.title)}" width="${s.w}" height="${s.h}">`;
  if(s.device==='mobile'){
    return `<div class="frame" style="max-width:400px">${toggle}
      <div class="phone"><div class="notch"></div><div class="screen">${content}</div></div></div>`;
  }
  const needScroll = s.scroll && MODE==='real';
  const body = needScroll ? `<div class="scrollwrap">${content}</div>` : content;
  const hint = needScroll ? `<div class="hint"><span class="chip">SCROLL</span>this is the full page — scroll inside the frame</div>` : '';
  return `<div class="frame">${toggle}
    <div class="browser">
      <div class="chrome"><span class="dots"><span></span><span></span><span></span></span>
        <span class="url"><b>tripme-khaki.vercel.app</b>${esc(s.route)}${MODE==='wf'?' · wireframe':''}</span></div>
      ${body}
    </div>${hint}</div>`;
}

function inspectView(s){
  const live = /Live/.test(s.badge) ? ' live' : '';
  const notes = s.notes.map((n,i)=>`<div class="note"><span class="dot">${i+1}</span><span>${esc(n)}</span></div>`).join('');
  const fid = MODE==='wf' ? 'low-fi wireframe' : 'built screen';
  return `<span class="badge${live}">${esc(s.badge)}</span>
    <h2>${esc(s.title)}</h2>
    <div class="kicker">Purpose</div><p class="purpose">${esc(s.purpose)}</p>
    <div class="kicker">What to look at</div>${notes}
    <div class="kicker">Capture</div>
    <div class="meta">route <b>${esc(s.route)}</b><br>viewport <b>${s.device==='mobile'?'390 × 844':'1440 × 900'}</b><br>
    source <b>live deployment</b><br>date <b>6 Aug 2026</b><br>viewing <b>${fid}</b></div>`;
}

function specialInspect(id){
  if(id==='overview') return `<span class="badge">Start here</span><h2>How to read this deck</h2>
    <div class="kicker">Method</div>
    <p class="purpose">Every screen is shown in two fidelities. The <b>low-fi wireframe</b> is the rough
    structure — grey boxes, crossed image placeholders, labelled regions — the skeleton a designer commits
    to before any styling. The <b>built screen</b> is the same skeleton captured from the live product.
    Flipping between them shows that what was structured is what was shipped.</p>
    <div class="kicker">Navigate</div>
    <div class="note"><span class="dot">1</span><span>Use the ← and → arrow keys (or the ‹ › buttons above) to step through every screen in flow order.</span></div>
    <div class="note"><span class="dot">2</span><span>Press F on any screen to flip between the low-fi wireframe and the built screen.</span></div>
    <div class="note"><span class="dot">3</span><span>Or jump anywhere from the list on the left — the last item maps every claim to its evidence.</span></div>
    <div class="kicker">Honesty notes</div>
    <p class="purpose">Screens that show a limitation say so — the map-pin fallback for unphotographed guesthouses,
    the in-app-only reminder delivery, the "est." price labels. A deck that only shows the product at its best
    is a brochure.</p>`;
  return `<span class="badge">Evidence</span><h2>Claim → screen map</h2>
    <div class="kicker">Why this exists</div>
    <p class="purpose">So a reviewer can check any assertion in the written submission against a specific screen
    instead of taking the narrative on trust. Every chip is a link.</p>`;
}

/* ---------- router ---------- */
function go(id){
  if(!ORDER.includes(id)) id='overview';
  location.hash = id;
  const canvas = document.getElementById('canvas');
  const inspect = document.getElementById('inspect');
  const idx = ORDER.indexOf(id);
  document.querySelectorAll('.item').forEach(b=>b.classList.toggle('on', b.dataset.id===id));
  if(id==='overview'){ canvas.innerHTML=overviewView(); inspect.innerHTML=specialInspect(id);
    document.getElementById('barTitle').textContent='User-flow overview';
  } else if(id==='coverage'){ canvas.innerHTML=coverageView(); inspect.innerHTML=specialInspect(id);
    document.getElementById('barTitle').textContent='Claim → screen evidence map';
  } else { const s=byId[id]; canvas.innerHTML=screenView(s); inspect.innerHTML=inspectView(s);
    document.getElementById('barTitle').textContent=s.title;
  }
  document.getElementById('barCount').textContent=(idx+1)+' / '+ORDER.length;
  canvas.scrollTop=0; inspect.scrollTop=0;
  canvas.querySelectorAll('a[href^="#"]').forEach(a=>a.onclick=e=>{e.preventDefault();go(a.getAttribute('href').slice(1));});
  canvas.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>{MODE=b.dataset.mode;go(id);});
}
document.getElementById('prev').onclick=()=>go(ORDER[Math.max(0,ORDER.indexOf(location.hash.slice(1)||'overview')-1)]);
document.getElementById('next').onclick=()=>go(ORDER[Math.min(ORDER.length-1,ORDER.indexOf(location.hash.slice(1)||'overview')+1)]);
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')document.getElementById('prev').click();
  if(e.key==='ArrowRight')document.getElementById('next').click();
  if(e.key==='f'||e.key==='F'){const id=location.hash.slice(1)||'overview';
    if(byId[id]){MODE=(MODE==='wf'?'real':'wf');go(id);}}
});
window.addEventListener('hashchange',()=>go(location.hash.slice(1)));
sidebar(); go(location.hash.slice(1)||'overview');
</script>
</body>
</html>"""

    html = html.replace('__DATA__', data).replace('__COVERAGE__', coverage).replace('__BLURBS__', blurbs)
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding='utf-8')
    print(f'wrote {OUT}  ({OUT.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    build()
