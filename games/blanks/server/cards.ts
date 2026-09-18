// Card mechanics that are pure data: dealing and drawing with a discard reshuffle, and how a black
// card reads with white cards dropped into its blanks (the one rendering rule TV, phones and tests
// share).
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { BLANK, blanksIn } from '../content/schema';
import { WHITE_KINDS, whiteKind } from './content';
import type { WhiteKind } from './content';
import {
  BIG_REVEAL_MAX_MS,
  BIG_REVEAL_MIN_MS,
  BIG_REVEAL_PER_CHAR_MS,
  BIG_ROOM,
  HAND_SIZE,
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

/** Draws the next black card; the black deck reshuffles from scratch when it runs out. */
export function drawBlack(state: State, pool: readonly string[]): [string | null, State] {
  let deck = state.blackDeck;
  let rng = state.rng;
  if (deck.length === 0) {
    const [refill, next] = shuffle(rng, pool);
    rng = next;
    deck = refill;
  }
  const id = deck[0] ?? null;
  return [id, { ...state, rng, blackDeck: deck.slice(1) }];
}

/** A hand always holds at least this many cards of each kind (thing / doing / combo). */
export const KIND_FLOOR = 2;
/** How many cards a round may swap out of one hand to meet the floor: a hand loses one card a
 *  round, so a top-up alone can never climb from none of a kind to two (review-loop #175). */
const MAX_SWAPS = 2;

function countKind(hand: readonly string[], kind: WhiteKind): number {
  return hand.filter((id) => whiteKind(id) === kind).length;
}

/** The first card of `kind` in the white deck, taken out of its place. A deck with none left
 *  shuffles the discard back in and looks again — without that, a long game on a deck thin in one
 *  kind (mild holds 45 gerunds) left hands with none of it at all. Null only when neither pile
 *  holds one. */
function takeKind(state: State, kind: WhiteKind): [string | null, State] {
  let next = state;
  let i = next.whiteDeck.findIndex((id) => whiteKind(id) === kind);
  if (i === -1 && next.discard.length > 0) {
    const [refill, rng] = shuffle(next.rng, next.discard);
    next = { ...next, rng, whiteDeck: [...next.whiteDeck, ...refill], discard: [] };
    i = next.whiteDeck.findIndex((id) => whiteKind(id) === kind);
  }
  if (i === -1) return [null, next];
  const id = next.whiteDeck[i] as string;
  return [id, { ...next, whiteDeck: next.whiteDeck.filter((_, j) => j !== i) }];
}

/**
 * One hand back up to `target`, with something of every kind to play: the missing kinds are drawn
 * first, then the rest off the top, and finally — when the hand is full and still short of a kind
 * — up to MAX_SWAPS cards of the most plentiful kind go to the discard and are replaced. So a
 * player always has a noun, an action and a phrase to work with (the owner's ask, loop #175).
 */
function fillHand(state: State, hand: readonly string[], target: number): [string[], State] {
  let next = state;
  let out = [...hand];
  for (const kind of WHITE_KINDS) {
    while (countKind(out, kind) < KIND_FLOOR && out.length < target) {
      const [card, after] = takeKind(next, kind);
      if (card === null) break;
      next = after;
      out.push(card);
    }
  }
  if (out.length < target) {
    const [drawn, after] = drawWhite(next, target - out.length);
    next = after;
    out = [...out, ...drawn];
  }
  for (const kind of WHITE_KINDS) {
    let swaps = 0;
    while (countKind(out, kind) < KIND_FLOOR && swaps < MAX_SWAPS) {
      const surplus = [...WHITE_KINDS].sort((a, b) => countKind(out, b) - countKind(out, a))[0];
      if (surplus === undefined || countKind(out, surplus) <= KIND_FLOOR) break;
      const [card, after] = takeKind(next, kind);
      if (card === null) break;
      const i = out.findIndex((id) => whiteKind(id) === surplus);
      const dropped = out[i] as string;
      out = [...out.slice(0, i), ...out.slice(i + 1), card];
      next = { ...after, discard: [...after.discard, dropped] };
      swaps += 1;
    }
  }
  return [out, next];
}

/** Every player's hand back up to HAND_SIZE (+ `extra` for the ids in `extraFor`). */
export function refillHands(state: State, extra = 0, extraFor: readonly string[] = []): State {
  let next = state;
  const hands = { ...state.hands };
  for (const id of Object.keys(state.players).sort()) {
    const target = HAND_SIZE + (extraFor.includes(id) ? extra : 0);
    const hand = hands[id] ?? [];
    if (hand.length >= target && countsMeetFloor(hand)) continue;
    const [filled, after] = fillHand(next, hand, Math.max(target, hand.length));
    // A fresh shuffle every round: cards were appended to the end, so the top of the hand never
    // changed and a phone showed the same four cards round after round while the new ones sat
    // below the fold (review-loop #177).
    const [shuffled, rng] = shuffle(after.rng, filled);
    next = { ...after, rng };
    hands[id] = shuffled;
  }
  return { ...next, hands };
}

function countsMeetFloor(hand: readonly string[]): boolean {
  return WHITE_KINDS.every((kind) => countKind(hand, kind) >= KIND_FLOOR);
}

export interface Segment {
  kind: 'text' | 'fill';
  text: string;
}

/**
 * The black card's text with the white cards dropped into its blanks, in order. A white card
 * loses its trailing period inside a sentence and keeps it (or its ! / ?) at the very end.
 * Blanks beyond the whites played stay as blanks; whites beyond the blanks (a question card, a
 * "make a haiku") come back in `extra` for the caller to list underneath.
 */
export function fill(
  text: string,
  whites: readonly string[],
): { segments: Segment[]; extra: string[] } {
  const parts = text.split(BLANK);
  const segments: Segment[] = [];
  // Punctuation right after a blank is carried inside the fill ("Walmart." on one paper card,
  // never "Walmart ." with a gap); `carried` is what the next text part must drop.
  let carried = 0;
  parts.forEach((part, i) => {
    const own = part.slice(carried);
    carried = 0;
    if (own) segments.push({ kind: 'text', text: own });
    if (i === parts.length - 1) return;
    const white = whites[i];
    if (white === undefined) {
      segments.push({ kind: 'text', text: BLANK });
      return;
    }
    // Anything after the blank (a comma, the black card's own full stop) supplies the punctuation.
    const rest = parts.slice(i + 1).join('');
    const atEnd = rest.trim() === '';
    const nextPart = parts[i + 1] ?? '';
    // Closing quotes and brackets ride along too ('"Goodnight, ____."' ends inside the paper), but
    // never a letter's apostrophe: "____'s" keeps its 's in the black text (review-loop #101).
    const punctuation = /^[.,!?;:"”’')\]]+(?![A-Za-z])/.exec(nextPart)?.[0] ?? '';
    carried = punctuation.length;
    segments.push({
      kind: 'fill',
      text: (atEnd ? white : white.replace(/\.$/, '')) + punctuation,
    });
  });
  return { segments, extra: whites.slice(blanksIn(text)) };
}

/** A white card's short first word ("A", "The", "My") stays on the line with its next word: a
 *  lone "A" in a paper mark at the end of a line read as its own card (review-loop #115).
 *  Rendering only: `fillText` (labels, tests) keeps plain spaces. */
export function glue(white: string): string {
  return white.replace(/^(\S{1,3}) (?=\S)/, '$1\u00A0');
}

/** The filled sentence as plain text (a11y labels, tests, bots). */
export function fillText(text: string, whites: readonly string[]): string {
  const { segments, extra } = fill(text, whites);
  const line = segments.map((s) => s.text).join('');
  return extra.length > 0 ? `${line} ${extra.join(' / ')}` : line;
}

/** How long a reveal card stays up: long enough to read it out loud; a room with more than
 *  BIG_ROOM cards to get through reads each one a little faster. */
export function revealMs(text: string, whites: readonly string[], cards = 1): number {
  const length = fillText(text, whites).length;
  if (cards > BIG_ROOM)
    return Math.min(BIG_REVEAL_MAX_MS, BIG_REVEAL_MIN_MS + length * BIG_REVEAL_PER_CHAR_MS);
  return Math.min(REVEAL_MAX_MS, REVEAL_MIN_MS + length * REVEAL_PER_CHAR_MS);
}
