# TripME — What to test

**Try it here → https://tripme-khaki.vercel.app**

TripME turns one input — *how you want to feel*, what you can spend, and how long you have — into a complete trip plan. Seven AI agents do the work, and when two of them disagree, a Referee settles it in front of you.

You do **not** need an account to plan — only to confirm or save a trip, and there is a one-tap test login for that. Nothing is ever really booked.

---

## Before you start — 4 things (please read, it saves confusion)

1. **Nothing is real.** Every booking is simulated and labelled *Demo Mode*. The AI planning is completely real — the destination, budget and itinerary are generated live for whatever you type.
2. **It runs on a free AI plan.** Each agent now falls back across three different models, so a busy one no longer ends a plan — but the daily allowance is finite. If a step stops, press **Retry step** and it picks up exactly where it stopped. Still worth not all testing in the same minute.
3. **In a hurry, or it's being slow?** Hit **"See a sample trip"** on the home page — it opens a complete finished plan instantly, no waiting, no quota.
4. **Try it on a laptop if you can**, then on your phone. They're deliberately different: the laptop gets an animated 3D globe, the phone gets a lighter version so it doesn't eat your data or battery.
5. **Signing in:** use **Continue as a test user** — one tap, no password. Google sign-in only works for accounts on the project's test list, so it will probably refuse you, and that is expected rather than broken.
6. **TripME plans trips inside India only.** Ask for Bali or Switzerland and it should tell you so and offer the nearest Indian equivalent — that behaviour is worth testing too.

---

## The 12 things worth testing

Do as many as you like. **#1, #2 and #3 matter most.**

### 1. Plan a solo trip — the basic promise
Home → **Solo** → pick a mood → set a budget and dates → **Plan my trip**.

- Watch the agents work one by one. Does it feel like something is genuinely happening, or like a fake loading bar?
- On the plan: does the destination actually match the mood you picked? *(Try **Spiritual** — you should get somewhere like Rishikesh or Varanasi, not a beach.)*
- Look for **"Your non-negotiables, and where they're met"** near the top. Do those promises look honestly kept?
- **Judge:** would you actually consider this trip? Is anything obviously wrong or impossible?

### 2. Plan with friends — the part no other app does
Home → **Group** → add 2–4 people, give each a *different* mood and budget → **Negotiate our trip**.

- Each person gets their own AI agent that argues **only** for them and refuses to compromise. Read what they each say.
- Then find **"How the Referee settled it"** — a table of who wanted what, who got what, and **who gave something up**.
- **Judge:** is that fair? Does it match how your group actually decides things? Would you send this table to your friends?

### 3. Watch two agents fight — the thing that makes this different
Try a **deliberately tight budget** — e.g. Adventure, ₹20,000, 5 days, from Delhi.

- The Itinerary agent plans the trip you *deserve* (it's never shown the budget). The Budget agent argues for what you can *afford*. When they clash, a **Referee** appears, states the gap in rupees, and offers three trade-offs.
- You may see the plan get **sent backwards** for a re-think (marked `↩`).
- **Judge:** does seeing the disagreement make you trust it more, or less?

### 4. Family trip — does it respect the actual people?
Home → **Family** → keep or edit the household (there's a child and a grandparent with knee trouble pre-filled).

- Check **"Referee checked this works for everyone"** — it should flag problems **by name** ("Day 2 affects Ira…") with a specific fix.
- **Judge:** are those real problems a family would care about? Anything it missed?

### 5. Pilgrimage — for parents and grandparents
Home → **Pilgrimage** → pick a circuit (Char Dham, Varanasi, Shirdi…), set mobility and diet.

- No mood quiz — it asks about faith logistics instead. Check the route order, season, darshan timing, and food rules.
- **Judge:** would you trust this for an elderly relative? Show it to someone who has actually done a yatra.

### 6. Work trip — policy instead of mood
Home → **Corporate** → set a hotel cap, per-diem and approval limit.

- The destination is fixed by the meeting, so it picks a *business district* instead. At the bottom: a **compliance check** and a **reimbursement-ready expense report**.
- **Judge:** would your finance team accept that table? Anything missing?

### 7. Change your mind
On any plan: **"Switch destination →"** and pick an alternate.

- It re-plans the budget, days and bookings around the new place.
- **Judge:** does the new plan hold together? Does anything still refer to the *old* destination?

### 8. Save it, then come back
Bottom bar → **Save trip** → **My Trips**.

- Your **Travel DNA** appears (top mood, usual pace, average spend). Now plan another trip — the form should pre-fill from your history and the plan should say **✨ Personalised**.
- **Judge:** does it feel like it's learning you, or just repeating you?


### 9. Argue with the plan — the part that makes it yours
On any plan, scroll to **"Not quite right? Change it"** → **Show me the alternatives**.

- Change how you get there, how you get around once you are there, and where you stay.
- The hotels and places listed are **real** — from OpenStreetMap, with photos where they exist. Open one on the map and check it is a genuine place.
- **Judge:** does the budget update instantly and correctly as you change things? Every price should be marked *est.* — flag anything that reads like a real quote.

### 10. The order of things — approve, confirm, save
Approve each booking, then confirm the trip, then save it.

- Now go back and change your hotel. **The approvals should reset** and the confirm button should disappear until you approve again.
- **Judge:** does that feel right, or annoying? We think an approval is consent to a specific amount — tell us if you disagree.

### 11. Reminders
On a confirmed trip, press **Turn on reminders**, then look at the **bell in the navigation**.

- Departure, check-in, each activity and every day's plan should be there, grouped by urgency.
- They are **off by default and per trip** — deliberately, so a cancelled trip does not keep nagging you.
- **Judge:** is the bell where you would look? Is anything missing that you would want reminding about?

### 12. Ask the assistant
Press **Ask TripME**, on any page, and ask it anything: *what is this*, *are the bookings real*, *what are my saved trips*, *what is on day 2*.

- Drag it around — it should park on either side and never sit in the middle of the page.
- **Judge:** does it answer the question you asked? Tell us anything it got wrong or refused — most answers come from a written knowledge base rather than the AI, so a wrong one is a bug we can fix directly.

---

## Quick feature checklist

Tick anything you tried, flag anything broken.

| | Feature | Where |
|---|---|---|
| ☐ | Six ways to start: Solo · Couple · Group · Family · Pilgrimage · Corporate | Home |
| ☐ | Mood-first planning (you never type a destination) | Solo/Couple/Group |
| ☐ | Live agent pipeline with a running timer | While planning |
| ☐ | One agent per person, arguing for them | Group / Couple |
| ☐ | Referee consensus table — who conceded what | Group trip page |
| ☐ | Referee money arbitration + backward re-plan | Tight-budget trip |
| ☐ | Referee family pacing audit (flags by name) | Family trip |
| ☐ | Referee policy compliance + expense report | Corporate trip |
| ☐ | Budget split across transport / stay / food / activities / buffer | Every trip |
| ☐ | Day-by-day timeline with costs, meals and a plan-B | Every trip |
| ☐ | Local language phrase card | Every trip |
| ☐ | Boarding-pass bookings you approve one at a time | Every trip |
| ☐ | "See real options →" links to Google Flights / Booking.com | Booking cards |
| ☐ | Live spend tracker + who-owes-who settle-up | Group / family |
| ☐ | Reminder schedule (SMS/voice for pilgrimage, calendar for work) | Every trip |
| ☐ | Agent log — the raw JSON each agent produced | Bottom of trip |
| ☐ | Switch destination and re-plan | Trip header |
| ☐ | Save trips + Travel DNA + personalisation | My Trips |
| ☐ | Print a clean itinerary | Bottom bar |
| ☐ | Sample trip works instantly with no waiting | Home |
| ☐ | Works on phone as well as laptop | Anywhere |

---

## Already known — please **don't** report these

These are logged; flagging them again doesn't help us.

- **Bookings are simulated.** Deliberate — this is a demo, not a travel agency.
- **No login or accounts.** Also deliberate: your trips stay in your browser and never touch a server.
- **The Referee's three trade-off options are display-only.** You can select one, but it doesn't re-plan yet.
- **The family pacing fixes are advice, not buttons.** It tells you what to change; it can't apply it for you.
- **"Free-tier rate limit reached"** — that's the free AI quota. Retry works.
- **The 3D globe doesn't appear on phones.** Intentional, to save your battery and data.

---

## What we'd love to hear

Short answers are fine. Voice notes are even better.

1. **First 10 seconds** — before clicking anything, what did you think this was?
2. **Would you actually use it?** For which trip? If not, what's missing?
3. **Where did you get confused, bored or stuck?**
4. **The Referee** — did watching the agents disagree make you trust it more, or make it feel complicated?
5. **What would you tell a friend this app does**, in one sentence?
6. **What's the one thing that would stop you using it again?**
7. **What do you do today** to plan a trip — which apps, how long does it take, and what's the worst part?

Screenshots of anything broken or odd are hugely helpful — include what you'd entered.

*Thanks. TripME · BITSoM Capstone · Team DEBUGGERS*
