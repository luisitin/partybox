// Card mechanics that are pure data: drawing with a discard reshuffle, the black deck's order,
// and how a black card reads with white cards dropped into its blanks (the one rendering rule
// TV, phones and tests share). Dealing — the hand floors and the refill — lives in deal.ts.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { blackCard, blackTier } from './content';
import {
  BIG_REVEAL_MAX_MS,
  BIG_REVEAL_MIN_MS,
  BIG_REVEAL_PER_CHAR_MS,
  BIG_ROOM,
  REVEAL_MAX_MS,
  REVEAL_MIN_MS,
  REVEAL_PER_CHAR_MS,
} from './types';
import type { State } from './types';

/**
 * Takes `count` cards off the white deck. A dry deck is refilled by shuffling the discard pile
 * in; when both are empty the draw is short (hands can be under HAND_SIZE with a tiny deck).
 */
export function drawWhite(state: State, count: number): [string[], State] {
  let deck = state.whiteDeck;
  let discard = state.discard;
  let rng: RngState = state.rng;
  if (deck.length < count && discard.length > 0) {
    const [refill, next] = shuffle(rng, discard);
    rng = next;
    deck = [...deck, ...refill];
    discard = [];
  }
  return [deck.slice(0, count), { ...state, rng, whiteDeck: deck.slice(count), discard }];
}

/** The great prompts first, the filler last, each group in its shuffled order (owner, 2026-09-18:
 *  the best-fitting, funniest cards weighted up): a six-round night never reaches the back. */
export function orderBlackDeck(deck: readonly string[]): string[] {
  return [3, 2, 1].flatMap((tier) => spaceOut(deck.filter((id) => blackTier(id) === tier)));
}

/** The Pick 2 and Pick 3 prompts spread evenly through a run of singles, never two in a row: a
 *  Pick 3 takes three cards off every hand, and two back to back (loop 751's transcript, rounds
 *  2 and 3) left the room playing its leftovers. Order within each group is kept. */
function spaceOut(ids: readonly string[]): string[] {
  const multi = ids.filter((id) => blackCard(id).pick > 1);
  const single = ids.filter((id) => blackCard(id).pick <= 1);
  if (multi.length === 0 || single.length === 0) return [...ids];
  const gap = single.length / multi.length;
  const out: string[] = [];
  let m = 0;
  single.forEach((id, i) => {
    out.push(id);
    // One multi after every `gap` singles (the last multis ride at the end when gap < 1).
    while (m < multi.length && Math.floor((m + 1) * gap) <= i + 1) out.push(multi[m++] as string);
  });
  return [...out, ...multi.slice(m)];
}

/** Draws the next black card; the black deck reshuffles from scratch when it runs out. */
export function drawBlack(state: State, pool: readonly string[]): [string | null, State] {
  let deck = state.blackDeck;
  let rng = state.rng;
  if (deck.length === 0) {
    const [refill, next] = shuffle(rng, pool);
    rng = next;
    deck = orderBlackDeck(refill);
  }
  const id = deck[0] ?? null;
  return [id, { ...state, rng, blackDeck: deck.slice(1) }];
}

export { fill, fillText, glue } from './fill'; // I-752 B
export type { Segment } from './fill';
import { fillText } from './fill';

/** How long a reveal card stays up: long enough to read it out loud; a room with more than
 *  BIG_ROOM cards to get through reads each one a little faster. */
export function revealMs(text: string, whites: readonly string[], cards = 1): number {
  const length = fillText(text, whites).length;
  if (cards > BIG_ROOM)
    return Math.min(BIG_REVEAL_MAX_MS, BIG_REVEAL_MIN_MS + length * BIG_REVEAL_PER_CHAR_MS);
  return Math.min(REVEAL_MAX_MS, REVEAL_MIN_MS + length * REVEAL_PER_CHAR_MS);
}
