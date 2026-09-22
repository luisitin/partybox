// Words both surfaces share for a bingo: the headline counts bingos under the current pattern
// ("2nd bingo in round 1", "1st blackout in round 1"), the first bingo of a round is plainly a
// win. Owner, 2026-09-17: "it always says person won round 1".
import type { BingoTvView } from '../server/views';

export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const rem10 = n % 10;
  return `${n}${rem10 === 1 ? 'st' : rem10 === 2 ? 'nd' : rem10 === 3 ? 'rd' : 'th'}`;
}

type Win = Pick<BingoTvView, 'pattern' | 'patternBingos' | 'round'>;

/** What this bingo is: "wins round 1", "2nd bingo in round 1", "1st blackout in round 1". */
export function winPhrase(view: Win): string {
  const n = Math.max(1, view.patternBingos);
  if (view.pattern === 'blackout') return `${ordinal(n)} blackout in round ${view.round}`;
  return n === 1 ? `wins round ${view.round}` : `${ordinal(n)} bingo in round ${view.round}`;
}

/** The TV's headline under BINGO!, one line: "Sam wins round 1" / "Sam's 2nd bingo" (the line
 * under it carries the round). */
export function winHeadline(view: Win, name: string): string {
  const n = Math.max(1, view.patternBingos);
  if (view.pattern === 'blackout') return `${name}'s ${ordinal(n)} blackout`;
  return n === 1 ? `${name} wins round ${view.round}` : `${name}'s ${ordinal(n)} bingo`;
}

/** The winner's own phone title. */
export function winTitle(view: Win, which: string): string {
  const phrase = winPhrase(view);
  const head = view.pattern === 'blackout' ? 'BLACKOUT!' : 'BINGO!';
  return phrase.startsWith('wins')
    ? `${head} You win round ${view.round}${which}`
    : `${head} Your ${phrase}${which}`;
}

/** Everyone else's phone title. */
export function otherTitle(view: Win, name: string): string {
  const phrase = winPhrase(view);
  if (view.pattern === 'blackout') return `${name} has a blackout`;
  return phrase.startsWith('wins') ? `${name} has bingo` : `${name} — ${phrase}`;
}

/**
 * Why a claim failed, by the numbers (loop 272): "19 was never called · 3 was missed", "19 and 44
 * were never called", or nothing when the card is simply short of the pattern.
 */
export function whyNot(claim: { card: number[]; red: number[]; missing: number[] }): string {
  const num = (i: number): string => (i === 12 ? 'FREE' : String(claim.card[i] ?? '?'));
  const list = (cells: number[]): string => {
    const names = cells.map(num);
    if (names.length <= 2) return names.join(' and ');
    return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
  };
  const parts: string[] = [];
  if (claim.red.length > 0)
    parts.push(`${list(claim.red)} ${claim.red.length === 1 ? 'was' : 'were'} never called`);
  const missed = claim.missing.filter((i) => i !== 12);
  if (missed.length > 0)
    parts.push(`${list(missed)} ${missed.length === 1 ? 'was' : 'were'} missed`);
  return parts.join(' · ');
}

/** A choice made mid-celebration, as the room reads it: who picked what, and when it starts. */
export function pendingLine(
  pending: 'same' | 'blackout' | 'next' | null,
  lastRound: boolean,
  by: string | null = null,
): string | null {
  if (!pending) return null;
  const what =
    pending === 'same'
      ? 'keep going — same pattern'
      : pending === 'blackout'
        ? 'keep going — blackout'
        : lastRound
          ? 'finish the game'
          : 'next round';
  return `${by ? `${by} picked` : 'Picked'}: ${what}. It starts when the celebration is done.`;
}

/** I-138 A: a bot answers its own verdict — one line, keyed to what went wrong. */
const BOT_MISS = [
  'my sensors were dirty',
  'I got excited',
  'recalculating…',
  'that was a rounding error',
];
const BOT_EARLY = ['I got excited', 'I counted the FREE twice', 'my clock is fast'];

export function botLine(claim: {
  name: string;
  bot?: boolean;
  red: number[];
  playerId?: string;
}): string | null {
  if (!claim.bot) return null;
  const pool = claim.red.length > 0 ? BOT_MISS : BOT_EARLY;
  return `${claim.name}: ${pool[Math.floor(Math.random() * pool.length)]}`;
}
