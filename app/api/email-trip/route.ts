import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Email a confirmed trip to the address you signed in with.
 * GET  -> { configured } so the UI can hide a button that cannot work
 * POST -> sends the trip and its reminder schedule
 *
 * What this is, and what it deliberately is not:
 *
 * It sends ON DEMAND, when the traveller presses a button while the app is
 * open. It does NOT send reminders at their scheduled time, and that gap is
 * architectural rather than a missing feature: trips live in the traveller's
 * browser and are never uploaded, so the server does not know they exist.
 * Timed email would mean storing every itinerary server-side plus a scheduler —
 * a reversal of the privacy position the product has taken and published, not a
 * toggle. The in-app bell covers that ground instead.
 *
 * THE RECIPIENT IS TAKEN FROM THE SESSION, NEVER FROM THE REQUEST. Letting a
 * caller name the address would turn our API key into an open relay for sending
 * mail to strangers, which is precisely how a key gets suspended.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
/*
 * Resend's sandbox sender. Without a verified domain this is the only allowed
 * `from`, and mail can only go to the account's own signup address — see
 * docs/EMAIL_SETUP.md. That restriction is anti-spam and every provider has it.
 */
const FROM = 'TripME <onboarding@resend.dev>';

const configured = () => Boolean(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json({ ok: true, configured: configured() });
}

interface TripPayload {
  destination?: string;
  region?: string;
  originCity?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  travellers?: number;
  budgetINR?: number;
  committedINR?: number;
  bookings?: { title: string; detail?: string; amountINR: number }[];
  days?: { day: number; theme: string; morning: string; afternoon: string; evening: string }[];
  reminders?: { title: string; when: string; body: string }[];
  packingTips?: string[];
}

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const inr = (n?: number) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');

function buildHtml(trip: TripPayload, name: string): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#5b6b66;font-size:13px">${esc(label)}</td><td style="padding:6px 0;font-weight:600;font-size:13px">${esc(value)}</td></tr>`;

  const bookings = (trip.bookings ?? [])
    .map(
      (b) =>
        `<tr><td style="padding:8px 12px 8px 0;font-size:13px">${esc(b.title)}${
          b.detail ? `<div style="color:#5b6b66;font-size:12px">${esc(b.detail)}</div>` : ''
        }</td><td style="padding:8px 0;text-align:right;font-size:13px;white-space:nowrap">${inr(b.amountINR)}</td></tr>`,
    )
    .join('');

  const days = (trip.days ?? [])
    .map(
      (d) =>
        `<div style="margin:0 0 14px;padding:12px 14px;background:#f4f7f5;border-radius:10px">
           <div style="font-weight:700;font-size:13px;margin-bottom:6px">Day ${esc(d.day)} — ${esc(d.theme)}</div>
           <div style="font-size:13px;color:#31413c;line-height:1.6">
             <div><strong>Morning</strong> · ${esc(d.morning)}</div>
             <div><strong>Afternoon</strong> · ${esc(d.afternoon)}</div>
             <div><strong>Evening</strong> · ${esc(d.evening)}</div>
           </div>
         </div>`,
    )
    .join('');

  const reminders = (trip.reminders ?? [])
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px 6px 0;font-size:13px">${esc(r.title)}<div style="color:#5b6b66;font-size:12px">${esc(r.body)}</div></td><td style="padding:6px 0;text-align:right;font-size:12px;color:#5b6b66;white-space:nowrap">${esc(r.when)}</td></tr>`,
    )
    .join('');

  return `<!doctype html><html><body style="margin:0;background:#eef2f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0e1f1a">
  <div style="max-width:620px;margin:0 auto;padding:24px 16px">
    <div style="background:#14453d;color:#fff;border-radius:16px;padding:26px 24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.7">TripME · your confirmed trip</div>
      <div style="font-size:30px;font-weight:800;margin-top:6px">${esc(trip.destination)}</div>
      <div style="opacity:.75;font-size:14px">${esc(trip.region)}</div>
    </div>

    <div style="background:#fff;border-radius:16px;padding:22px 24px;margin-top:14px">
      <div style="font-size:15px">Hello ${esc(name)},</div>
      <p style="font-size:14px;line-height:1.6;color:#31413c">Here is your trip and the reminder schedule that goes with it.</p>
      <table style="width:100%;border-collapse:collapse">
        ${row('Dates', `${trip.startDate ?? '—'} → ${trip.endDate ?? '—'} (${trip.durationDays ?? '—'} days)`)}
        ${row('From', String(trip.originCity ?? '—'))}
        ${row('Travelling', `${trip.travellers ?? 1} ${trip.travellers === 1 ? 'person' : 'people'}`)}
        ${row('Budget', `${inr(trip.budgetINR)} · ${inr(trip.committedINR)} committed`)}
      </table>
    </div>

    ${
      bookings
        ? `<div style="background:#fff;border-radius:16px;padding:22px 24px;margin-top:14px">
             <div style="font-weight:800;font-size:15px;margin-bottom:8px">Bookings</div>
             <table style="width:100%;border-collapse:collapse">${bookings}</table>
             <p style="font-size:12px;color:#5b6b66;margin:12px 0 0">Simulated for this demo — nothing is reserved, and every amount is an estimate rather than a quoted price.</p>
           </div>`
        : ''
    }

    ${days ? `<div style="background:#fff;border-radius:16px;padding:22px 24px;margin-top:14px"><div style="font-weight:800;font-size:15px;margin-bottom:12px">Day by day</div>${days}</div>` : ''}

    ${
      reminders
        ? `<div style="background:#fff;border-radius:16px;padding:22px 24px;margin-top:14px">
             <div style="font-weight:800;font-size:15px;margin-bottom:8px">Your reminders</div>
             <table style="width:100%;border-collapse:collapse">${reminders}</table>
             <p style="font-size:12px;color:#5b6b66;margin:12px 0 0">These also appear in the bell inside TripME. This email is a snapshot you asked for, not a scheduled send.</p>
           </div>`
        : ''
    }

    ${
      (trip.packingTips ?? []).length
        ? `<div style="background:#fff;border-radius:16px;padding:22px 24px;margin-top:14px">
             <div style="font-weight:800;font-size:15px;margin-bottom:8px">Before you go</div>
             <ul style="margin:0;padding-left:18px;font-size:13px;color:#31413c;line-height:1.7">${(trip.packingTips ?? []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
           </div>`
        : ''
    }

    <p style="font-size:12px;color:#5b6b66;text-align:center;margin:18px 0 0">
      TripME · a BITSoM capstone project by Team DEBUGGERS · demo product, no real bookings are made.
    </p>
  </div>
</body></html>`;
}

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!configured()) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const session = await auth();
  const to = session?.user?.email;
  if (!to) {
    return NextResponse.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  }
  /*
   * The demo account's address is on the reserved .example domain, which by
   * design can never receive mail. Saying so is more useful than letting the
   * provider return an opaque failure.
   */
  if (to.endsWith('.example')) {
    return NextResponse.json({ ok: false, error: 'demo_account' }, { status: 400 });
  }

  let trip: TripPayload;
  try {
    const body = (await request.json()) as { trip?: TripPayload };
    trip = body.trip ?? {};
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  if (JSON.stringify(trip).length > 60_000) {
    return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: `Your ${trip.destination ?? 'TripME'} trip — plan and reminders`,
        html: buildHtml(trip, session.user?.name ?? 'traveller'),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true, to });
    }

    const detail = await res.text();
    /*
     * The one failure worth naming precisely. Without a verified domain Resend
     * only delivers to the account's own signup address, and the error it
     * returns is easy to mistake for a broken key.
     */
    if (res.status === 403 || /testing emails|own email address|verify a domain/i.test(detail)) {
      return NextResponse.json({ ok: false, error: 'sandbox_restricted', to }, { status: 403 });
    }
    console.error('[TripME] email-trip: provider rejected', res.status, detail.slice(0, 300));
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  } catch (err) {
    console.error('[TripME] email-trip: failed', err);
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }
}
