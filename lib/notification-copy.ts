/**
 * How each delivery channel is described to the traveller.
 *
 * Kept separate from the components because the honesty matters more than the
 * layout: two of these channels genuinely work today and three do not, and the
 * wording is what stops the schedule reading as a promise.
 */

export const CHANNEL_NOTE: Record<string, string> = {
  push: '📱 Browser notification — works while TripME is open',
  sms: '💬 SMS — chosen for low-connectivity routes; delivery needs telephony infrastructure (post-MVP)',
  voice: '📞 Voice call — chosen for travellers who do not read notifications; delivery post-MVP',
  calendar: '📆 Calendar entry — export planned, delivery post-MVP',
  email: '✉️ Email — delivery post-MVP',
};
