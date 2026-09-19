// Card mechanics that are pure data: dealing and drawing with a discard reshuffle, and how a black
// card reads with white cards dropped into its blanks (the one rendering rule TV, phones and tests
// share).
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { BLANK, blanksIn } from '../content/schema';
import { WHITE_KINDS, blackTier, whiteKind, whiteServes, whiteTier } from './content';
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

/** The great prompts first, the filler last, each group in its shuffled order (owner, 2026-09-18:
 *  the best-fitting, funniest cards weighted up): a six-round night never reaches the back. */
export function orderBlackDeck(deck: readonly string[]): string[] {
  return [3, 2, 1].flatMap((tier) => deck.filter((id) => blackTier(id) === tier));
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

/** A hand always holds at least this many cards of each kind (thing / doing / person). */
export const KIND_FLOOR = 2;
/** …and at least this many tier-3 cards — half the hand (owner, 2026-09-18: "at least half of
 *  their cards as really good cards"). */
export const GOOD_FLOOR = HAND_SIZE / 2;
/** How many cards a round may swap out of one hand to meet the kind floor: a hand loses one card
 *  a round, so a top-up alone can never climb from none of a kind to two (review-loop #175). */
const MAX_SWAPS = 2;
/** …and how many for the quality floor (a round's play of a great card is one swap back). */
const MAX_GOOD_SWAPS = 3;

/** Cards in the hand that serve `kind` (a short thing is a thing and a name). */
function countKind(hand: readonly string[], kind: WhiteKind): number {
  return hand.filter((id) => whiteServes(id).includes(kind)).length;
}

const isGood = (id: string): boolean => whiteTier(id) === 3;

function countGood(hand: readonly string[]): number {
  return hand.filter(isGood).length;
}

/** The first card in the white deck that `wants`, taken out of its place. A deck with none left
 *  shuffles the discard back in and looks again — without that, a long game on a deck thin in one
 *  kind (mild holds 45 gerunds) left hands with none of it at all. Null only when neither pile
 *  holds one. */
function takeWhere(state: State, wants: (id: string) => boolean): [string | null, State] {
  let next = state;
  let i = next.whiteDeck.findIndex(wants);
  if (i === -1 && next.discard.length > 0) {
    const [refill, rng] = shuffle(next.rng, next.discard);
    next = { ...next, rng, whiteDeck: [...next.whiteDeck, ...refill], discard: [] };
    i = next.whiteDeck.findIndex(wants);
  }
  if (i === -1) return [null, next];
  const id = next.whiteDeck[i] as string;
  return [id, { ...next, whiteDeck: next.whiteDeck.filter((_, j) => j !== i) }];
}

function takeKind(state: State, kind: WhiteKind): [string | null, State] {
  return takeWhere(state, (id) => whiteServes(id).includes(kind));
}

/**
 * One hand back up to `target`, with something of every kind to play and enough great cards: the
 * missing kinds are drawn first, then great cards up to the quality floor, then the rest off the
 * top, and finally — when the hand is full and still short — up to MAX_SWAPS cards of the most
 * plentiful kind (and up to MAX_GOOD_SWAPS spare cards) go to the discard and are replaced. So a
 * player always has a noun, an action and a person to work with (the owner's ask, loop #175), and
 * half a hand of cards worth playing (loop 451).
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
  while (countGood(out) < GOOD_FLOOR && out.length < target) {
    const [card, after] = takeWhere(next, isGood);
    if (card === null) break;
    next = after;
    out.push(card);
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
      const i = out.findIndex(
        (id) =>
          whiteKind(id) === surplus &&
          !whiteServes(id).some((k) => k !== surplus && countKind(out, k) <= KIND_FLOOR),
      );
      if (i === -1) break;
      const dropped = out[i] as string;
      out = [...out.slice(0, i), ...out.slice(i + 1), card];
      next = { ...after, discard: [...after.discard, dropped] };
      swaps += 1;
    }
  }
  let goodSwaps = 0;
  while (countGood(out) < GOOD_FLOOR && goodSwaps < MAX_GOOD_SWAPS) {
    const swapped = swapForGood(next, out);
    if (swapped === null) break;
    [out, next] = swapped;
    goodSwaps += 1;
  }
  return [out, next];
}

/** One spare card out for a great one that keeps every kind floor: the weakest non-great cards
 *  are tried first, and the great card must serve whatever kinds the hand would fall short of
 *  without the spare. Null when no spare has a great card to cover it. (The old rule wanted a
 *  spare that served no kind at its floor and a great card of the very same kind; a hand whose
 *  spare things all read as names too had no spare at all and stopped at four — loop #472.) */
function swapForGood(state: State, hand: readonly string[]): [string[], State] | null {
  const spares = hand
    .map((id, i) => ({ id, i }))
    .filter(({ id }) => !isGood(id))
    .sort((a, b) => whiteTier(a.id) - whiteTier(b.id));
  for (const { id: dropped, i } of spares) {
    const rest = hand.filter((_, j) => j !== i);
    const needs = WHITE_KINDS.filter((k) => countKind(rest, k) < KIND_FLOOR);
    const [card, after] = takeWhere(
      state,
      (id) => isGood(id) && needs.every((k) => whiteServes(id).includes(k)),
    );
    if (card === null) continue;
    return [[...rest, card], { ...after, discard: [...after.discard, dropped] }];
  }
  return null;
}

/** Every player's hand back up to HAND_SIZE (+ `extra` for the ids in `extraFor`). */
export function refillHands(state: State, extra = 0, extraFor: readonly string[] = []): State {
  let next = state;
  const hands = { ...state.hands };
  for (const id of Object.keys(state.players).sort()) {
    const target = HAND_SIZE + (extraFor.includes(id) ? extra : 0);
    const hand = hands[id] ?? [];
    if (hand.length >= target && countsMeetFloor(hand) && countGood(hand) >= GOOD_FLOOR) continue;
    const [filled, after] = fillHand(next, hand, Math.max(target, hand.length));
    // A fresh shuffle every round: cards were appended to the end, so the top of the hand never
    // changed and a phone showed the same four cards round after round while the new ones sat
    // below the fold (review-loop #177).
    const [shuffled, rng] = shuffle(after.rng, filled);
    next = { ...after, rng };
    hands[id] = frontLoadKinds(shuffled);
  }
  return { ...next, hands };
}

/** One of each kind at the top of the hand, the shuffle's order kept otherwise. A phone shows
 *  about four cards without scrolling, so a hand whose every noun is on screen and whose every
 *  action sits below the fold reads as "no options" even when the floor is met (loop #195). */
function frontLoadKinds(hand: readonly string[]): string[] {
  const seen = new Set<string>();
  const front: string[] = [];
  const rest: string[] = [];
  for (const id of hand) {
    const kind = whiteKind(id);
    if (seen.has(kind)) rest.push(id);
    else {
      seen.add(kind);
      front.push(id);
    }
  }
  return [...front, ...rest];
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
/** A card that ends in an abbreviation, not in a sentence's full stop: "2 a.m.", "O.J.", "Jr.". */
const ABBREVIATION = /(?:\b[A-Za-z]\.){2}$|\b(?:Jr|Sr|St|Dr|Mr|Mrs|Ms|Inc|Ltd|vs|etc)\.$/;

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
    // "Dancing in the kitchen at 2 a.m." keeps the abbreviation's own period mid-sentence — it
    // came out as "2 a.m," before (review-loop #201) — but gives it up when the black card supplies
    // a full stop of its own, which would read "2 a.m..".
    const keepDot = ABBREVIATION.test(white) && !punctuation.startsWith('.');
    // An opening quote or bracket immediately before the blank joins the card too, so a quoted
    // answer reads as one piece of paper: `says "____."` becomes `says` + `"The moist part of the
    // sandwich."`, not an orphan quote against the black text (review-loop #330).
    const opener = /(?:^|[\s(])(["“'‘(\[])$/.exec(lastText(segments))?.[1] ?? '';
    if (opener) trimLastText(segments, opener.length);
    // A card that ends inside its own quotes — 'Naming a goldfish "Doug."' — carries its full stop
    // on the inside: mid-sentence the dot goes the way a bare one does ('"Doug" is my motto.'), and
    // at the end the black card's own full stop is dropped rather than doubled — the card of the
    // night read '…meaning "soup.".' on a results screen (review-loop #391).
    const closed = /\.["”'’)\]]+$/.test(white);
    const ownStop = closed && punctuation.startsWith('.');
    const tail = ownStop ? punctuation.slice(1) : punctuation;
    const body =
      atEnd || keepDot || ownStop
        ? white
        : closed
          ? white.replace(/\.(["”'’)\]]+)$/, '$1')
          : white.replace(/\.$/, '');
    segments.push({ kind: 'fill', text: opener + body + tail });
  });
  return { segments, extra: whites.slice(blanksIn(text)) };
}

/** The text of the segment a fill is about to follow (empty when the blank opens the card). */
function lastText(segments: readonly Segment[]): string {
  const last = segments[segments.length - 1];
  return last?.kind === 'text' ? last.text : '';
}

/** Drops `n` characters from the end of the last text segment, removing it when nothing is left. */
function trimLastText(segments: Segment[], n: number): void {
  const last = segments[segments.length - 1];
  if (!last || last.kind !== 'text') return;
  const text = last.text.slice(0, -n);
  if (text === '') segments.pop();
  else segments[segments.length - 1] = { ...last, text };
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
