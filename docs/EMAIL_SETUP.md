# Emailing a trip to yourself

TripME can email a confirmed trip — the plan, the bookings, the day-by-day and the reminder
schedule — to the address you signed in with. It sends **on demand**, when you press the button.

Without a key configured the button does not appear at all, and nothing else changes.

---

## What this does and does not do

| | |
|---|---|
| **Does** | Send a snapshot of a confirmed trip, now, to your signed-in address |
| **Does not** | Send reminders at their scheduled time |

That second line is architectural, not a missing feature. **Your trips live in your browser and are
never uploaded**, so the server has no idea they exist and cannot mail you about one at 6am next
Tuesday. Doing that would mean storing every traveller's itinerary server-side plus running a
scheduler — a reversal of the privacy position the product has taken and published, not a toggle.

The in-app bell covers that ground instead: it shows what has come due whenever you open TripME.

---

## Setup — about five minutes

1. Create a free account at <https://resend.com>. The free tier is 3,000 emails a month, 100 a day.
2. **API Keys → Create API Key.** Copy it; it starts `re_`.
3. Add it to `.env.local` for local development — this file is gitignored and must stay that way:

```
RESEND_API_KEY=re_your_key_here
```

4. Add the same variable in **Vercel → your project → Settings → Environment Variables**, for
   Production (and Preview if you use it), then redeploy.
5. Restart the dev server locally.

Check it worked: `/api/email-trip` returns `{"ok":true,"configured":true}`, and the
**Email me this trip** button appears on a confirmed trip when you are signed in.

---

## The restriction that catches everyone

**Until you verify a domain, Resend will only deliver to the email address you registered the
account with**, and only from `onboarding@resend.dev`.

| Setup | Can email |
|---|---|
| API key only | Only your own Resend signup address |
| API key + verified domain | Anyone |

So with just a key: you can email **yourself**. A teammate signing in with their own Google account
and pressing the button will get an honest message explaining why it did not send, rather than a
silent failure.

For a demo where you are the one signed in, a key alone is enough. To email anyone else, add a
domain you own under **Domains** and follow the DNS steps.

This is anti-spam behaviour that every provider has — SendGrid and Mailgun sandbox new accounts the
same way. It is not a Resend quirk and not something the code can work around.

**The demo account cannot receive email at all.** Its address is on the reserved `.example` domain,
which by RFC 2606 can never exist. The button says so plainly instead of failing opaquely.

---

## Rotating the key

Treat a key as compromised the moment it appears in a chat, a screenshot, a shared document or a
commit. Rotation is cheap: **Resend → API Keys → create a new one, then delete the old.** Update
`.env.local` and Vercel, and redeploy.

Generate and paste it directly into those two places. Do not print a key into a chat window — that
is how the last one leaked.

---

## If it does not send

| What you see | Almost always |
|---|---|
| Button never appears | `RESEND_API_KEY` not set, or the server was not restarted after setting it |
| "The shared demo account has no real inbox" | You are on the demo login; sign in with Google |
| "Our email provider is still in test mode…" | You are signed in as someone other than the Resend account owner — see the restriction above |
| "That did not send" | Check the server log: the provider's own error is recorded there |
| Nothing arrives, no error | Check spam. Mail from `onboarding@resend.dev` is unverified, so filters are suspicious of it — another reason to add a domain before showing this to anyone |
