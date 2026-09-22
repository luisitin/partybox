// What the join page reads off its own URL: the room the QR carried (I-041) and the date a
// seasonal preview asks for (I-079).
import { EVERYDAY_AVATAR_IDS, seasonalAvatarId } from '@partybox/shared';
import type { AvatarId } from '@partybox/shared';

/** The `room` query parameter of the page the phone opened (the QR's), as a 4-letter code. */
export function roomFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('room');
  const code = raw?.trim().toUpperCase() ?? '';
  return /^[A-Z]{4}$/.test(code) ? code : null;
}

/** I-079 A: `?date=YYYY-MM-DD` on the join link previews that month's grid. */
export function previewDate(): Date {
  const raw =
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('date');
  const d = raw ? new Date(`${raw}T12:00:00`) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/**
 * I-079 B: the sixteen faces on offer today. In season the seasonal face takes the unicorn's
 * slot, so sixteen cells stay sixteen; the unicorn is back next month.
 */
export function joinGrid(date = previewDate()): {
  season: AvatarId | null;
  ids: readonly AvatarId[];
} {
  const season = seasonalAvatarId(date);
  return {
    season,
    ids: season ? [...EVERYDAY_AVATAR_IDS.slice(0, 15), season] : EVERYDAY_AVATAR_IDS,
  };
}
