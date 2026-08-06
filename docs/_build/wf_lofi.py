# -*- coding: utf-8 -*-
"""Low-fidelity wireframes for every TripME screen.

Classic lo-fi vocabulary — grey boxes, crossed image placeholders, text stubs,
labelled regions — in the style of standard Figma wireframing practice
(reference: the Netflix wireframing walkthrough the team shared). Each entry
mirrors the STRUCTURE of the corresponding real screen, so flipping the
viewer's fidelity toggle shows the same skeleton, built.

Everything is emitted from a small component vocabulary so all thirty screens
stay visually consistent, exactly as a Figma component library would.
"""


# ---------------------------------------------------------------- components
def ln(w='100%', d=False, h=8):
    """A text stub line."""
    return f'<div class="wf-ln{" d" if d else ""}" style="width:{w};height:{h}px"></div>'


def lns(*pairs):
    """A stack of text stubs: (width, dark) tuples or plain widths."""
    out = []
    for p in pairs:
        if isinstance(p, tuple):
            out.append(ln(*p))
        else:
            out.append(ln(p))
    return f'<div class="wf-stack">{"".join(out)}</div>'


def x(h, label='', grow=False):
    """A crossed box — the universal lo-fi image placeholder."""
    g = 'flex:1;' if grow else ''
    lab = f'<span>{label}</span>' if label else ''
    return f'<div class="wf-x" style="height:{h}px;{g}">{lab}</div>'


def btn(t, solid=True, w=''):
    style = f'style="width:{w}"' if w else ''
    return f'<div class="wf-btn{"" if solid else " o"}" {style}>{t}</div>'


def pill(t, on=False):
    return f'<div class="wf-pill{" on" if on else ""}">{t}</div>'


def tag(t):
    """Region label — the annotation captions lo-fi decks use."""
    return f'<div class="wf-tag">{t}</div>'


def card(inner, cls='', style=''):
    return f'<div class="wf-card {cls}" style="{style}">{inner}</div>'


def row(inner, gap=10, style=''):
    return f'<div class="wf-r" style="gap:{gap}px;{style}">{inner}</div>'


def grid(inner, cols, gap=10, style=''):
    return (f'<div class="wf-g" style="grid-template-columns:repeat({cols},1fr);'
            f'gap:{gap}px;{style}">{inner}</div>')


def kv(n=4):
    """Label:value stub rows, right-aligned values — the summary-rail pattern."""
    r = ''.join(f'<div class="wf-kv">{ln("34%", h=7)}{ln("26%", h=7)}</div>' for _ in range(n))
    return r


def nav(cta='PLAN A TRIP', extra=''):
    menu = ''.join(ln('44px', h=7) for _ in range(4))
    return (f'<div class="wf-nav">{x(24, "LOGO")}'
            f'<div class="wf-r" style="gap:14px;flex:1;justify-content:center">{menu}</div>'
            f'{extra}{pill("EN")}{btn(cta)}</div>')


def footer():
    return (f'<div class="wf-footer">{x(22, "LOGO")}{lns(("60%",), ("48%",))}'
            f'<div style="flex:1"></div>{lns(("70px",), ("54px",), ("62px",))}'
            f'{lns(("70px",), ("54px",))}</div>')


def agent_row(state='done', indent=False, warn=False):
    """One pipeline row: icon, name stub, result stub, status."""
    cls = 'wf-agent'
    if warn:
        cls += ' warn'
    mark = '✓' if state == 'done' else ('⚠' if warn else '···')
    ind = 'margin-left:26px;' if indent else ''
    return (f'<div class="{cls}" style="{ind}">{x(26)}'
            f'<div style="flex:1">{lns(("32%", True), ("55%",))}</div>'
            f'<span class="wf-mark">{mark}</span></div>')


def trip_hero(chips=3, live=False):
    ch = ''.join(pill('CHIP') for _ in range(chips))
    tiles = grid(''.join(card(lns(('40%',), ('70%', True), ('30%',)), 'ghost') for _ in range(3)), 3)
    badge = pill('RE-PLANNED BY REFEREE', on=True) if live else ''
    return (f'<div class="wf-x wf-hero" style="height:230px">'
            f'<div class="wf-hero-in"><div class="wf-r" style="gap:6px">{ch}{badge}</div>'
            f'{ln("42%", True, 20)}{ln("20%", False, 9)}{tiles}</div></div>')


def rail(status='DRAFT PLAN'):
    bar = '<div class="wf-bar"><i style="width:38%"></i></div>'
    menu = lns(('50%',), ('58%',), ('46%',), ('64%',))
    return card(f'{tag(status)}{ln("55%", True, 12)}{ln("35%", h=7)}<hr class="wf-hr">'
                f'{kv(4)}<hr class="wf-hr">{ln("40%", True, 9)}{bar}{kv(3)}'
                f'<hr class="wf-hr">{menu}', style='position:sticky;top:0')


def page(inner, pad=18, bg=True):
    return f'<div class="wf{" bg" if bg else ""}" style="padding:{pad}px">{inner}</div>'


def two_col(main, side):
    return grid(f'<div>{main}</div><div>{side}</div>', 1, 14,
                'grid-template-columns:2.1fr 1fr;align-items:start')


def stepper(done=1):
    steps = ''
    for i in range(4):
        state = 'done' if i < done else ('on' if i == done else '')
        mark = '✓' if i < done else str(i + 1)
        steps += (f'<div class="wf-step {state}"><span class="wf-dot">{mark}</span>'
                  f'{lns(("55%", True), ("80%",), ("62%",))}</div>')
    return card(f'{tag("WHAT HAPPENS NEXT")}{ln("30%", True, 11)}{ln("74%", h=7)}'
                f'{grid(steps, 4)}')


def booking_card(label='BOOKING'):
    return card(f'<div class="wf-r" style="gap:12px;align-items:stretch">'
                f'<div style="flex:2.2">{row(pill(label) + pill("DEMO — NO REAL RESERVATION", on=True), 6)}'
                f'{lns(("62%", True), ("80%",), ("46%",))}{ln("38%", h=6)}</div>'
                f'<div class="wf-vr"></div>'
                f'<div style="flex:1;display:flex;flex-direction:column;gap:8px;align-items:flex-end;'
                f'justify-content:space-between">{ln("52%", True, 12)}{btn("APPROVE (SIMULATED)")}</div></div>')


# ---------------------------------------------------------------- screens
WF = {}

# 01 — landing hero
WF['landing-hero'] = page(
    nav() +
    f'<div class="wf-center" style="padding:34px 0 18px">{pill("7 AGENTS · ONE PIPELINE")}'
    f'{ln("46%", True, 22)}{ln("52%", True, 22)}{ln("40%", True, 22)}'
    f'{ln("58%", h=8)}{ln("48%", h=8)}'
    f'<div class="wf-r" style="gap:10px;margin-top:14px">{btn("START PLANNING")}{btn("SEE A SAMPLE TRIP", False)}</div></div>' +
    tag('AGENT PIPELINE STRIP') +
    row(''.join(f'<div class="wf-node"><span></span>{ln("34px", h=6)}</div>' for _ in range(7)), 0,
        'justify-content:space-between;padding:6px 40px 14px') +
    grid(''.join(card(lns(('55%', True), ('72%',))) for _ in range(3)), 3),
    bg=False)

# 02 — landing full page
WF['landing-full'] = page(
    nav() +
    f'<div class="wf-center" style="padding:22px 0 10px">{ln("44%", True, 16)}{ln("52%", h=7)}'
    f'<div class="wf-r" style="gap:10px;margin-top:10px">{btn("START PLANNING")}{btn("SAMPLE", False)}</div></div>' +
    grid(''.join(card(lns(('55%', True), ('72%',))) for _ in range(3)), 3) +
    tag('SAMPLE TRIPS — OPEN INSTANTLY, ZERO QUOTA') +
    grid(''.join(card(x(70, 'IMG') + lns(('50%', True), ('76%',)) + ln('34%', h=6)) for _ in range(4)), 4) +
    tag('SIX TRAVEL PATHS') +
    grid(''.join(card(x(26) + lns(('55%', True), ('80%',))) for _ in range(6)), 6) +
    tag('PLANNER FORM — MOOD FIRST') +
    card(grid(''.join(pill('MOOD') for _ in range(6)), 6) + ln('100%', h=26) +
         row(ln('40%', h=10) + ln('18%', h=26), 10, 'margin-top:10px;align-items:center') +
         btn('PLAN MY TRIP')) +
    footer(), bg=False)

# 03 — how it works
WF['how-it-works'] = page(
    nav() +
    ln('34%', True, 18) +
    two_col(
        tag('THE PROBLEM') + lns(('92%',), ('84%',), ('60%',)),
        ''.join(card(lns(('58%', True), ('40%',)), 'ghost') for _ in range(3))) +
    tag('SIX ENTRY PATHS, ONE AGENT CORE') +
    card(''.join(f'<div class="wf-kv" style="grid-template-columns:1fr 1.4fr 2.4fr">'
                 f'{ln("56%", True, 7)}{ln("70%", h=7)}{ln("88%", h=7)}</div>' for _ in range(6))) +
    tag('THE SEVEN AGENTS') +
    row(''.join(x(38, f'A{i+1}', grow=True) + ('<span class="wf-arrow">→</span>' if i < 6 else '')
        for i in range(7)), 6, 'align-items:center') +
    f'<div class="wf-caption">↩ REFEREE CAN SEND THE BRIEF BACKWARDS</div>' +
    grid(''.join(card(lns(('45%', True), ('88%',), ('76%',), ('58%',))) for _ in range(7)), 3) +
    tag("WHAT'S REAL · WHAT'S SIMULATED") +
    grid(card(lns(('30%', True), ('90%',), ('82%',), ('70%',))) +
         card(lns(('40%', True), ('86%',), ('78%',), ('64%',)), 'accent'), 2) +
    footer(), bg=False)

# 04 — sample chooser (modal)
WF['samples'] = (
    f'<div class="wf dim" style="padding:34px 60px">'
    + card(
        ln('34%', True, 14) + ln('72%', h=7) + ln('58%', h=7) +
        grid(''.join(card(x(80, 'PHOTO') + row(pill('PATH · MOOD'), 0, 'margin-top:6px') +
                          lns(('45%', True), ('82%',)) + ln('30%', h=6))
                     for _ in range(4)), 2, 12, 'margin-top:12px'),
        style='max-width:640px;margin:0 auto;position:relative') +
    '</div>')

# 05 — planner paths + mood
WF['planner-paths'] = page(
    nav() +
    f'<div class="wf-center">{ln("30%", True, 16)}{ln("52%", h=7)}</div>' +
    tag('TRAVEL PATH — CHOSEN BEFORE THE BRIEF') +
    grid(f'<div class="wf-card sel">{x(24)}{lns(("60%", True), ("80%",))}</div>' +
         ''.join(card(x(24) + lns(('60%', True), ('80%',))) for _ in range(5)), 6) +
    card(tag('MOOD — REQUIRED, THE ONE THING AGENTS CANNOT GUESS') +
         grid(''.join(pill('MOOD', on=(i == 1)) for i in range(6)), 3) +
         f'<div class="wf-input">{ln("52%", h=7)}</div>'), bg=False)

# 06 — planner brief (budget · days · origin · date)
WF['planner-brief'] = page(
    nav() +
    card(tag('BUDGET') +
         row(ln('26%', True, 11) + '<div style="flex:1"></div>' + ln('16%', h=22), 10, 'align-items:center') +
         '<div class="wf-slider"><i></i></div>' +
         grid(
            card(tag('DAYS') + row(btn('−', False) + ln('20px', True, 12) + btn('+', False), 8,
                                   'justify-content:center;align-items:center'), 'ghost') +
            card(tag('FROM') + f'<div class="wf-input empty">{ln("40%", h=7)}<span class="wf-ph">YOUR CITY — NO DEFAULT</span></div>', 'ghost') +
            card(tag('START DATE') + f'<div class="wf-input">{ln("55%", h=7)}</div>', 'ghost'),
            3, 10, 'margin-top:12px') +
         row(ln('24%', h=7) + '<div style="flex:1"></div>' + btn('PLAN MY TRIP'), 0, 'margin-top:12px;align-items:center')),
    bg=False)

# 07 — agent stream (start)
WF['agent-stream'] = page(
    nav() +
    two_col(
        row(ln('34%', True, 16) + '<div style="flex:1"></div>' + card(ln('30px', True, 12) + tag('AGENT TIME'), 'ghost'), 0,
            'align-items:center') +
        ln('68%', h=7) +
        agent_row('done') +
        f'<div class="wf-caption" style="text-align:center">AGENTS PASS STRUCTURED BRIEFS — NO CONTEXT LOST</div>',
        card(tag('YOUR BRIEF') + kv(7) + '<hr class="wf-hr">' + tag('PROGRESS') +
             '<div class="wf-bar"><i style="width:14%"></i></div>')),
    bg=False)

# 08 — backward edge
WF['backward-edge'] = page(
    nav() +
    two_col(
        ln('34%', True, 16) + ln('68%', h=7) +
        agent_row('done') + agent_row('done') + agent_row('done') + agent_row('done') +
        f'<div class="wf-agent warn">{x(26)}<div style="flex:1">{lns(("44%", True), ("88%",), ("70%",))}</div>'
        f'<span class="wf-mark">⚠</span></div>' +
        f'<div class="wf-caption" style="margin-left:26px">↩ TRIGGERED BY REFEREE</div>' +
        agent_row('done', indent=True) +
        f'<div class="wf-agent" style="margin-left:26px;border-style:dashed">{x(26)}'
        f'<div style="flex:1">{lns(("40%", True), ("60%",))}</div><span class="wf-mark">···</span></div>',
        card(tag('YOUR BRIEF') + kv(7) + '<hr class="wf-hr">' + tag('PROGRESS 5/7') +
             '<div class="wf-bar"><i style="width:72%"></i></div>')),
    bg=False)

# 09 — live result
WF['live-result'] = page(
    nav() +
    two_col(
        trip_hero(live=True) +
        card(tag('WHY THE DISCOVERY AGENT CHOSE THIS') + lns(('90%',), ('82%',), ('55%',)) + ln('28%', h=6)),
        rail()),
    bg=False)

# 10 — trip header (sample)
WF['trip-header'] = page(
    nav() +
    two_col(
        trip_hero() +
        card(tag('WHY THE DISCOVERY AGENT CHOSE THIS') + lns(('90%',), ('70%',)) +
             f'<div class="wf-caption">IT ALSO CONSIDERED THESE →</div>'),
        rail()),
    bg=False)

# 11 — trip full page
WF['trip-full'] = page(
    nav() +
    two_col(
        trip_hero() +
        card(tag('ARBITRATION — TWO AGENTS DISAGREED') + lns(('86%',), ('64%',)) +
             grid(''.join(card(lns(('55%', True), ('84%',), ('70%',)), 'ghost') for _ in range(3)), 3), 'accent') +
        card(tag('BUDGET') + '<div class="wf-bar seg"><i style="width:33%"></i><i style="width:24%"></i>'
             '<i style="width:19%"></i><i style="width:15%"></i></div>' +
             ''.join(f'<div class="wf-kv" style="grid-template-columns:1.6fr .7fr 2.6fr">'
                     f'{ln("60%", True, 7)}{ln("50%", h=7)}{ln("86%", h=7)}</div>' for _ in range(5))) +
        card(tag('DAY BY DAY') +
             ''.join(f'<div class="wf-day">{pill(f"DAY {i+1}")}'
                     + ''.join(f'<div class="wf-kv" style="grid-template-columns:.7fr 3fr .5fr">'
                               f'{ln("70%", h=7)}{ln("88%", h=7)}{ln("60%", h=7)}</div>' for _ in range(3))
                     + '</div>' for i in range(3))) +
        card(tag('BOOKINGS')) + booking_card('TRANSPORT') + booking_card('STAY') + booking_card('ACTIVITY') +
        stepper() +
        card(tag('CHANGE IT') + lns(('80%',), ('58%',)) + btn('SHOW ME THE ALTERNATIVES')) +
        card(tag('CONFIRM — GATED') + lns(('74%',)) + btn('SIGN IN TO CONFIRM', False)) +
        card(tag('RAW AGENT LOG — JSON HANDOFFS') + ln('40%', h=7), 'ghost'),
        rail()),
    bg=False)

# 12 — arbitration
WF['arbitration'] = page(
    nav() +
    two_col(
        card(row(x(22) + ln('34%', True, 12) + pill('MINOR'), 8, 'align-items:center') +
             lns(('88%',), ('52%',)) +
             grid(''.join(card(lns(('60%', True), ('86%',), ('74%',), ('68%',)), 'ghost') for _ in range(3)), 3) +
             f'<div class="wf-caption">"AT ₹50 THIS IS ROUNDING, NOT A REAL CONFLICT"</div>', 'accent') +
        card(tag('BUDGET') + '<div class="wf-bar seg"><i style="width:33%"></i><i style="width:24%"></i>'
             '<i style="width:22%"></i><i style="width:21%"></i></div>' + kv(4)),
        rail()),
    bg=False)

# 13 — itinerary
WF['itinerary'] = page(
    nav() +
    two_col(
        card(tag('DAY BY DAY — REAL PLACES, HONEST PRICES') +
             ''.join(f'<div class="wf-day">{pill(f"DAY {i+1}")}{ln("40%", h=6)}'
                     + ''.join(f'<div class="wf-kv" style="grid-template-columns:.7fr 3fr .5fr .8fr">'
                               f'{ln("70%", h=7)}{ln("90%", h=7)}{ln("55%", h=7)}{ln("70%", h=7)}</div>'
                               for _ in range(3))
                     + '</div>' for i in range(3))),
        rail()),
    bg=False)

# 14 — bookings
WF['bookings'] = page(
    nav() +
    two_col(
        ln('26%', True, 15) + ln('60%', h=7) +
        booking_card('TRANSPORT') + booking_card('STAY') + booking_card('ACTIVITY'),
        rail()),
    bg=False)

# 15 — stepper
WF['stepper'] = page(
    nav() +
    two_col(
        card(tag('LIVE SPEND & SETTLE-UP') +
             grid(''.join(card(ln('50%', h=6) + ln('60%', True, 13), 'ghost') for _ in range(3)), 3)) +
        stepper(done=2) +
        card(tag('NOT QUITE RIGHT? CHANGE IT') + lns(('84%',), ('58%',)) + btn('SHOW ME THE ALTERNATIVES')),
        rail()),
    bg=False)

# 16 — options
WF['options'] = page(
    nav() +
    two_col(
        ln('20%', True, 15) + lns(('86%',), ('64%',)) +
        tag('1 · GETTING THERE AND BACK') +
        grid(''.join(card(row(ln('40%', True, 10) + '<div style="flex:1"></div>' + ln('30%', True, 10), 0) +
                          ln('50%', h=6) + lns(('84%',), ('70%',)) + ln('60%', h=6)) for _ in range(3)), 3) +
        f'<div class="wf-caption">BOOKING FOR REAL? CHECK LIVE FARES → (DEEP LINK)</div>' +
        tag('2 · GETTING AROUND WHILE THERE') +
        grid(''.join(card(row(ln('44%', True, 10) + '<div style="flex:1"></div>' + ln('34%', True, 10), 0) +
                          lns(('80%',), ('64%',))) for _ in range(3)), 3),
        rail()),
    bg=False)

# 17 — stays
WF['stays'] = page(
    nav() +
    two_col(
        tag('3 · WHERE YOU STAY — COMFORT TIERS') +
        grid(''.join(card(row(ln('40%', True, 10) + '<div style="flex:1"></div>' + ln('38%', True, 10), 0) +
                          lns(('80%',), ('58%',))) for _ in range(3)), 3) +
        row(tag('REAL HOTELS NEAR THE DESTINATION') + '<div style="flex:1"></div>' +
            f'<div class="wf-caption">FROM OPENSTREETMAP · RATES ARE OUR ESTIMATE</div>', 0, 'align-items:baseline') +
        grid(''.join(card(x(56, 'MAP PIN') + lns(('70%', True), ('45%',)) + ln('50%', h=6) + ln('38%', h=6))
                     for _ in range(8)), 4),
        rail()),
    bg=False)

# 18 — sign in
WF['signin'] = page(
    nav('PLAN A TRIP') +
    grid(
        f'<div class="wf-x wf-hero" style="height:330px"><div class="wf-hero-in">'
        f'{ln("70%", True, 15)}{ln("55%", True, 15)}{ln("80%", h=7)}{ln("66%", h=7)}'
        + ''.join(row(x(20) + lns(('50%', True), ('80%',)), 8, 'margin-top:10px') for _ in range(3)) +
        f'</div></div>',
        f'<div style="padding:8px 20px">{ln("60%", True, 16)}{lns(("82%",), ("60%",))}'
        f'{btn("CONTINUE WITH GOOGLE", False, "100%")}'
        f'<div class="wf-caption" style="text-align:center">— OR —</div>'
        f'{btn("CONTINUE AS A TEST USER — NO PASSWORD", True, "100%")}'
        f'{lns(("88%",), ("74%",))}<hr class="wf-hr">'
        f'{tag("PRIVACY — STATED ON THE PAGE")}{lns(("90%",), ("70%",))}'
        f'<div class="wf-caption">PLAN A TRIP WITHOUT SIGNING IN →</div></div>',
        2, 16),
    bg=False)

# 19 — confirm unlocked
WF['confirm'] = page(
    nav() +
    two_col(
        card(ln('60%', h=7) + row(ln('44%', True, 8) + '<div style="flex:1"></div>' + ln('30%', True, 8), 0), 'ghost') +
        card(tag('GOING AHEAD WITH THIS?') + ln('30%', True, 13) + lns(('88%',), ('76%',), ('50%',)) +
             btn("YES — I'M GOING") + f'<div class="wf-caption">YOU CAN UNDO THIS AT ANY TIME</div>', 'accent') +
        card(tag('RAW AGENT LOG') + ln('40%', h=7), 'ghost'),
        rail()) +
    f'<div class="wf-actionbar">{ln("30%", h=8)}<div style="flex:1"></div>'
    f'{btn("SAVE TRIP")}{btn("PLAN ANOTHER", False)}{btn("PRINT", False)}</div>',
    bg=False)

# 20 — confirmed + reminders
WF['confirmed'] = page(
    nav(extra=x(20, '🔔')) +
    two_col(
        card(tag('TRIP CONFIRMED 🎉') + ln('50%', True, 13) + ln('70%', h=7) +
             f'<div class="wf-caption">UNCONFIRM AND EDIT</div>' +
             card(tag('REMINDERS FOR THIS TRIP — OPT-IN, PER TRIP') + lns(('84%',), ('62%',)) +
                  row(btn('TURN OFF', False) + btn('✉ EMAIL ME THIS TRIP', False), 8) +
                  f'<div class="wf-caption">DELIVERY LIMIT STATED HERE — BELL WHILE APP IS OPEN</div>', 'ghost') +
             ''.join(f'<div class="wf-kv" style="grid-template-columns:2.6fr 1fr">'
                     f'<div>{lns(("55%", True), ("80%",))}</div>{ln("80%", h=7)}</div>' for _ in range(3)),
             'accent'),
        rail('CONFIRMED')),
    bg=False)

# 21 — reminders bell
WF['bell'] = (
    f'<div class="wf dim" style="padding:0">'
    + nav(extra=f'<div class="wf-x" style="height:20px;width:20px;border-color:#666"><span>🔔</span></div>')
    + f'<div style="display:flex;justify-content:center;padding:6px 0 30px">'
    + card(tag('REMINDERS — COMING UP') +
           ''.join(row(x(20) + f'<div style="flex:1">{lns(("60%", True), ("86%",), ("40%",))}</div>' + ln('44px', h=6), 8,
                       'margin-bottom:10px') for _ in range(3)) +
           '<hr class="wf-hr">' +
           f'<div class="wf-caption">FOR CONFIRMED TRIPS · APPEAR WHENEVER TRIPME IS OPEN · CLOSED-APP PUSH '
           f'NEEDS INFRASTRUCTURE THIS DEMO DOES NOT HAVE</div>',
           style='width:330px;position:relative') +
    f'</div>{trip_hero()}</div>')

# 22 — my trips
WF['my-trips'] = page(
    nav(extra=x(20, '🔔')) +
    ln('22%', True, 16) +
    grid(card(x(80, 'PHOTO') + row(pill('✓ CONFIRMED', on=True) + pill('MOOD'), 6, 'margin-top:6px') +
              lns(('60%', True), ('75%',)) +
              row(btn('OPEN') + btn('PLAN SIMILAR', False) + btn('DELETE', False), 6, 'margin-top:8px')) +
         f'<div class="wf-card ghost" style="border-style:dashed;display:grid;place-items:center;min-height:180px">'
         f'{ln("40%", h=7)}</div>', 3),
    bg=False)

# 23 — assistant
WF['assistant'] = (
    f'<div class="wf dim" style="padding:0">' + nav() +
    f'<div style="padding:18px">{ln("22%", True, 16)}{grid(card(x(60, "PHOTO") + lns(("60%", True), ("75%",))), 3)}</div>'
    f'<div class="wf-assist">'
    + card(row(x(16, '⠿') + ln('40%', True, 9) + '<div style="flex:1"></div>' + ln('26px', h=7), 6, 'align-items:center') +
           card(lns(('88%',), ('76%',), ('55%',)), 'ghost') +
           row(pill('WHAT ARE MY SAVED TRIPS?') + pill("WHAT'S MY TRAVEL DNA?"), 5) +
           row(pill('HOW DO I PLAN A TRIP?') + pill('WHERE IS MY DATA STORED?'), 5) +
           f'<div class="wf-caption">PRE-MADE QUESTIONS FILL THE INPUT — THEY DO NOT FIRE</div>' +
           row(f'<div class="wf-input" style="flex:1">{ln("40%", h=7)}</div>' + btn('ASK'), 6, 'align-items:center'),
           style='width:330px;position:relative') +
    '</div></div>')

# 24 — group referee / concession matrix
WF['referee-group'] = page(
    nav() +
    two_col(
        card(row(x(22) + ln('40%', True, 13), 8, 'align-items:center') + ln('62%', h=7) +
             f'<div class="wf-kv wf-th" style="grid-template-columns:1fr 1.3fr 1.6fr 1.4fr .8fr">'
             + ''.join(ln('70%', True, 7) for _ in range(5)) + '</div>' +
             ''.join(f'<div class="wf-kv" style="grid-template-columns:1fr 1.3fr 1.6fr 1.4fr .8fr">'
                     + ''.join(ln('80%', h=7) for _ in range(4)) + '<div class="wf-score">●●●●○</div></div>'
                     for _ in range(3)) +
             lns(('86%',), ('72%',)) +
             f'<div class="wf-caption">"NOBODY CONCEDED TWICE" — THE FAIRNESS FLOOR</div>' +
             f'<div class="wf-caption">▶ WHAT EACH ADVOCATE ARGUED →</div>', 'accent'),
        rail()),
    bg=False)

# 25 — settle-up
WF['settle-up'] = page(
    nav() +
    two_col(
        card(tag('LIVE SPEND & SETTLE-UP — NO SEPARATE APP') +
             grid(card(tag('PLANNED') + ln('60%', True, 13), 'ghost') +
                  card(tag('APPROVED SO FAR') + ln('50%', True, 13), 'ghost') +
                  card(tag('STILL UNSPENT') + ln('55%', True, 13), 'ghost'), 3) +
             f'<div class="wf-caption">APPROVE A BOOKING ABOVE TO SEE THE PER-TRAVELLER SPLIT</div>') +
        stepper(done=2),
        rail()),
    bg=False)

# 26 — corporate policy
WF['corporate'] = page(
    nav() +
    two_col(
        card(row(ln('34%', True, 13) + pill('COMPLIANT', on=True), 8, 'align-items:center') +
             ''.join(row(x(16, '✓') + ln('80%', h=7), 8, 'margin-top:8px') for _ in range(4)) +
             f'<div class="wf-caption">POLICY CAPS ENFORCED IN CODE · EXPENSE REPORT BY COST CENTRE</div>', 'accent') +
        card(tag('BUDGET — POLICY CAPS') + '<div class="wf-bar seg"><i style="width:36%"></i>'
             '<i style="width:30%"></i><i style="width:20%"></i><i style="width:14%"></i></div>' + kv(4)),
        rail()),
    bg=False)

# 27 — hindi
WF['hindi'] = page(
    nav(extra=pill('हिन्दी', on=True)) +
    two_col(
        card(tag('SAME STRUCTURE — AGENT OUTPUT TRANSLATED AFTER GENERATION') +
             ln('30%', True, 13) + lns(('88%',), ('76%',)) +
             f'<div class="wf-caption">FIGURES, DATES AND ₹ AMOUNTS KEPT EXACTLY AS WRITTEN</div>') +
        card(tag('बजट (BUDGET)') + '<div class="wf-bar seg"><i style="width:33%"></i><i style="width:26%"></i>'
             '<i style="width:22%"></i><i style="width:19%"></i></div>' + kv(5)),
        rail()),
    bg=False)

# 28 — mobile trip
WF['mobile-trip'] = (
    f'<div class="wf" style="padding:0">'
    f'<div class="wf-nav" style="padding:10px 12px">{x(22, "LOGO")}<div style="flex:1"></div>{x(20, "≡")}</div>'
    f'<div style="padding:10px">'
    f'<div class="wf-x wf-hero" style="height:250px"><div class="wf-hero-in">'
    f'{row(pill("SOLO") + pill("RELAX", on=True), 5)}{ln("54%", h=6)}{row(pill("RE-PLANNED BY REFEREE"), 0)}'
    f'{ln("80%", True, 17)}{ln("50%", True, 17)}{ln("36%", h=7)}'
    + ''.join(card(ln('35%', h=6) + ln('70%', True, 9), 'ghost') for _ in range(3)) +
    f'</div></div>'
    f'{card(tag("WHY THIS DESTINATION") + lns(("92%",), ("84%",), ("55%",)))}'
    f'</div>'
    f'<div class="wf-actionbar">{ln("20%", h=7)}<div style="flex:1"></div>{btn("SAVE TRIP")}{btn("PLAN ANOTHER", False)}</div>'
    f'</div>')

# 29 — mobile landing
WF['mobile-landing'] = (
    f'<div class="wf" style="padding:0">'
    f'<div class="wf-nav" style="padding:10px 12px">{x(22, "LOGO")}<div style="flex:1"></div>{x(20, "≡")}</div>'
    f'<div class="wf-center" style="padding:26px 16px 12px">{pill("7 AGENTS · ONE PIPELINE")}'
    f'{ln("80%", True, 18)}{ln("64%", True, 18)}{ln("88%", h=7)}{ln("70%", h=7)}'
    f'<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;width:100%">'
    f'{btn("START PLANNING", True, "100%")}{btn("SEE A SAMPLE TRIP", False, "100%")}</div></div>'
    f'<div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px">'
    + ''.join(card(lns(('55%', True), ('72%',))) for _ in range(3)) +
    f'</div></div>')

# 30 — contact
WF['contact'] = page(
    nav() +
    ln('26%', True, 16) + ln('56%', h=7) +
    grid(
        card(tag('WAYS TO REACH US') +
             ''.join(row(x(22) + lns(('45%', True), ('70%',)), 8, 'margin-top:10px') for _ in range(3))) +
        card(tag('WRITE TO US') +
             f'<div class="wf-input">{ln("30%", h=7)}</div><div class="wf-input">{ln("38%", h=7)}</div>'
             f'<div class="wf-input" style="height:64px;align-items:flex-start;padding-top:8px">{ln("46%", h=7)}</div>'
             + btn('SEND')),
        2, 14) +
    footer(), bg=False)
