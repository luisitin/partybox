// The TV's own toasts (I-054: the room filling, a seat opening; I-069: sound off / on). They sit in
// the toast list in English, like the server's, and are worded when shown (TvFrame): a language
// switch while one is up (the host bar's 🌐) re-words it, and nothing ever reads a translated toast.
import type { Translator } from '@partybox/game-sdk/ui';
import { t, tEn } from '../i18n';

/** What the list keeps: the English of the `L` sentences below, filled. */
export const roomFullToast = (n: number, cap: number): string => `Room full — ${n} / ${cap}`;
export const seatOpenedToast = (n: number, cap: number): string => `A seat opened — ${n} / ${cap}`;
export const soundToast = (muted: boolean): string =>
  muted ? tEn.tv.soundOffToast : tEn.tv.soundOnToast;

const SEATS = /^(Room full|A seat opened) — (\d+) \/ (\d+)$/;

/** One of the TV's own toasts in the TV's language; null for anything else (the server's). */
export function ownToast(L: Translator, text: string): string | null {
  const seats = SEATS.exec(text);
  if (seats) {
    const vars = { n: seats[2] ?? '', cap: seats[3] ?? '' };
    return seats[1] === 'Room full'
      ? L('Room full — {n} / {cap}', vars)
      : L('A seat opened — {n} / {cap}', vars);
  }
  if (text === tEn.tv.soundOffToast) return t.tv.soundOffToast;
  if (text === tEn.tv.soundOnToast) return t.tv.soundOnToast;
  return null;
}
