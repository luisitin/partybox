// Card mechanics that are pure data: drawing with a discard reshuffle, the black deck's order,
// and how a black card reads with white cards dropped into its blanks (the one rendering rule
// TV, phones and tests share). Dealing — the hand floors and the refill — lives in deal.ts.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { blackCard, blackTier } from './content';
import { REVEAL_POP_MS, readMs, wordCount } from './types';
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
export type DoubleBlanks = 'rare' | 'one' | 'many';

export function orderBlackDeck(
  deck: readonly string[],
  rounds = 0,
  doubles: DoubleBlanks = 'one',
): string[] {
  if (doubles === 'many' && rounds > 0) {
    // every fourth round (A's rule)
    const maxGap = 3;
    return [3, 2, 1].flatMap((tier) =>
      spaceOut(
        deck.filter((id) => blackTier(id) === tier),
        maxGap,
      ),
    );
  }
  const ordered = [3, 2, 1].flatMap((tier) =>
    spaceOut(deck.filter((id) => blackTier(id) === tier)),
  );
  if (doubles === 'rare' || rounds <= 0) return ordered;
  // I-158 B: exactly one double-blank in the middle of the game. Round 1's card is drawn at init,
  // so index k of this deck is round k + 1; round floor(rounds / 2) + 1 is index floor(rounds / 2).
  const at = Math.floor(rounds / 2);
  const j = ordered.findIndex((id) => blackCard(id).pick > 1);
  if (j < 0 || j === at) return ordered;
  const out = [...ordered];
  const [multi] = out.splice(j, 1);
  out.splice(Math.min(at, out.length), 0, multi as string);
  return out;
}

/** The Pick 2 and Pick 3 prompts spread evenly through a run of singles, never two in a row: a
 *  Pick 3 takes three cards off every hand, and two back to back (loop 751's transcript, rounds
 *  2 and 3) left the room playing its leftovers. Order within each group is kept. */
function spaceOut(ids: readonly string[], maxGap = Infinity): string[] {
  const multi = ids.filter((id) => blackCard(id).pick > 1);
  const single = ids.filter((id) => blackCard(id).pick <= 1);
  if (multi.length === 0 || single.length === 0) return [...ids];
  // I-158: the deck's own ratio put the first multi ~17 singles deep (WILD) — past the end of a
  // 6-round game. `maxGap` lets the game's length cap it; never below 2, so never back to back.
  const gap = Math.max(2, Math.min(single.length / multi.length, maxGap));
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
    deck = orderBlackDeck(refill, state.settings.rounds, 'one'); // I-158
  }
  const id = deck[0] ?? null;
  return [id, { ...state, rng, blackDeck: deck.slice(1) }];
}

export { fill, fillText, glue } from './fill'; // I-752 B
export type { Segment } from './fill';
import { fillText } from './fill';

/** How long a reveal card stays up with no voice: the whites' drop-in, then the time a slow reader
 *  needs for the whole sentence (deck text: no UI margin). `cards` is kept for callers. */
export function revealMs(text: string, whites: readonly string[], _cards = 1): number {
  return REVEAL_POP_MS + readMs(wordCount(fillText(text, whites)), 1);
}
