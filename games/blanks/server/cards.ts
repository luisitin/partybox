// Card mechanics that are pure data: dealing and drawing with a discard reshuffle, and how a black
// card reads with white cards dropped into its blanks (the one rendering rule TV, phones and tests
// share).
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { BLANK, blanksIn } from '../content/schema';
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

/** Every player's hand back up to HAND_SIZE (+ `extra` for the ids in `extraFor`). */
export function refillHands(state: State, extra = 0, extraFor: readonly string[] = []): State {
  let next = state;
  const hands = { ...state.hands };
  for (const id of Object.keys(state.players).sort()) {
    const target = HAND_SIZE + (extraFor.includes(id) ? extra : 0);
    const hand = hands[id] ?? [];
    if (hand.length >= target) continue;
    const [drawn, after] = drawWhite(next, target - hand.length);
    next = after;
    hands[id] = [...hand, ...drawn];
  }
  return { ...next, hands };
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
    const punctuation = /^[.,!?;:]+/.exec(parts[i + 1] ?? '')?.[0] ?? '';
    carried = punctuation.length;
    segments.push({
      kind: 'fill',
      text: (atEnd ? white : white.replace(/\.$/, '')) + punctuation,
    });
  });
  return { segments, extra: whites.slice(blanksIn(text)) };
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
