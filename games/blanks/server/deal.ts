// Dealing (loop 445–525): every hand back up to ten with the floors the owner asked for — two
// cards for each kind of question, five great cards and three amazing ones, no four-card clump on
// one subject — and, once the prompt is known, the best-fitting cards on top. Pure data, like
// cards.ts, which it draws from.
import { shuffle } from '@partybox/game-sdk';
import {
  WHITE_KINDS,
  blackCard,
  blackSlot,
  blackSlots,
  deckSubject,
  whiteKind,
  whiteServes,
  whiteTags,
  whiteText,
  whiteTier,
} from './content';
import type { WhiteKind } from './content';
import { drawWhite } from './cards';
import { fitScore } from './fit';
import { tagHit, topicsOf } from './topics';
import type { Topic } from './topics';
import { HAND_SIZE } from './types';
import type { State } from './types';

/** A hand always holds at least this many cards of each kind (thing / doing / person / name)… */
export const KIND_FLOOR = 2;
/** …and more of a kind the prompts ask for often: a "…do?" round is one in seven, and a hand of
 *  two gerunds is a choice of two (loop 536). The floor per kind, never under KIND_FLOOR. */
export const KIND_FLOORS: Readonly<Record<WhiteKind, number>> = {
  thing: KIND_FLOOR,
  doing: 3,
  person: KIND_FLOOR,
  name: KIND_FLOOR,
};
const floorOf = (kind: WhiteKind): number => KIND_FLOORS[kind];
/** …and at least this many great cards (tier 3 or 4) — half the hand (owner, 2026-09-18: "at
 *  least half of their cards as really good cards")… */
export const GOOD_FLOOR = HAND_SIZE / 2;
/** The room's hand size (I-141: 7 / 10 / 12 / 15; a state from before the setting holds 10). */
export const handSizeOf = (state: State): number => state.settings.handSize ?? HAND_SIZE;
/** Half the hand, whatever its size (10 → 5, 7 → 4, 15 → 8). */
export const goodFloor = (size: number): number => Math.ceil(size / 2);
/** …of which at least this many amazing ones (tier 4: the best third of a deck, the way the loop rated them)… */
export const BEST_FLOOR = 3;
/** …and at most this many filler cards (tier 1): nobody plays them, so a hand silts up with
 *  them round after round — a fifth of hands held three or more before the cap (loop 602). */
export const FILLER_CAP = 2;
/** How many cards a round may swap out of one hand to meet the kind floor: a hand loses one card
 *  a round, so a top-up alone can never climb from none of a kind to two (review-loop #175). */
const MAX_SWAPS = 2;
/** …and how many for the quality floor: the floor itself. Three was one short when a full hand
 *  came back from a Pick 2 with two great cards and the kind swap had just dropped one (loop
 *  #500); the loop only runs while the hand is short, so the floor bounds it anyway. */
const MAX_BEST_SWAPS = BEST_FLOOR;
/** …and at least one WORD: a card of one or two words, for the blanks that want exactly that —
 *  a safe word, a nickname, a password, a hurricane's name (fit.ts WORD_PROMPT). Short cards are
 *  one in twenty-three, so two hands in three held none and every answer to "My cellmate's
 *  nickname is ____" was a sentence (loop 741). */
export const WORD_FLOOR = 1;
/** …and, once the prompt is known, cards that read well in its blank (fit 0.85+: a noun or a
 *  person in a noun blank, a gerund in a verb blank, a name in a name blank): half the hand when
 *  the deck allows, never under the four a phone shows without scrolling — the other floors (two
 *  of each kind, a word) hold five cards of a ten-card hand, so a person prompt over a hand whose
 *  word is a bare adjective stops at four. At most this many swaps a round to get there. */
export const FIT_TARGET = HAND_SIZE / 2;
export const FIT_FLOOR = 4;
export const FIT_FLOOR_SCORE = 0.85;
const MAX_FIT_SWAPS = 4;
export const WORD_MAX_WORDS = 2;
export const isWord = (id: string): boolean =>
  whiteText(id).split(/\s+/).filter(Boolean).length <= WORD_MAX_WORDS;

/** Cards in the hand that serve `kind` (a short thing is a thing and a name). */
function countKind(hand: readonly string[], kind: WhiteKind): number {
  return hand.filter((id) => whiteServes(id).includes(kind)).length;
}

const isGood = (id: string): boolean => whiteTier(id) >= 3;
const isBest = (id: string): boolean => whiteTier(id) === 4;
const isFiller = (id: string): boolean => whiteTier(id) === 1;

/** The hand has a card that reads as `kind` first (`name` is only ever a second reading, so it
 *  always counts as led): the top of a hand leads with one card of each kind by first reading. */
function leads(hand: readonly string[], kind: WhiteKind): boolean {
  return kind === 'name' || hand.some((id) => whiteKind(id) === kind);
}

function countGood(hand: readonly string[]): number {
  return hand.filter(isGood).length;
}

function countBest(hand: readonly string[]): number {
  return hand.filter(isBest).length;
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

/** A card for `kind`: one that reads as it first while the hand has none that does (the top of a
 *  hand leads with one card of each kind by first reading — a hand whose only doings were things
 *  read as doings second had no doing up top, loop #488), otherwise any card that serves it. */
function takeKind(state: State, kind: WhiteKind, hand: readonly string[]): [string | null, State] {
  if (!hand.some((id) => whiteKind(id) === kind)) {
    const [card, after] = takeWhere(state, (id) => whiteKind(id) === kind);
    // `name` is only ever a second reading, so a first-reading name never exists: any serving card.
    if (card !== null) return [card, after];
  }
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
  const good = goodFloor(handSizeOf(state));
  let next = state;
  let out = [...hand];
  for (const kind of WHITE_KINDS) {
    while ((countKind(out, kind) < floorOf(kind) || !leads(out, kind)) && out.length < target) {
      const [card, after] = takeKind(next, kind, out);
      if (card === null) break;
      next = after;
      out.push(card);
    }
  }
  while (countBest(out) < BEST_FLOOR && out.length < target) {
    const [card, after] = takeWhere(next, isBest);
    if (card === null) break;
    next = after;
    out.push(card);
  }
  while (countGood(out) < good && out.length < target) {
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
    while (countKind(out, kind) < floorOf(kind) && swaps < MAX_SWAPS) {
      const surplus = [...WHITE_KINDS].sort((a, b) => countKind(out, b) - countKind(out, a))[0];
      if (surplus === undefined || countKind(out, surplus) <= floorOf(surplus)) break;
      const [card, after] = takeKind(next, kind, out);
      if (card === null) break;
      // The weakest card of the surplus kind goes (a great one went first before loop #500).
      const i =
        out
          .map((id, j) => ({ id, j }))
          .filter(
            ({ id }) =>
              whiteKind(id) === surplus &&
              !whiteServes(id).some((k) => k !== surplus && countKind(out, k) <= floorOf(k)) &&
              out.filter((x) => whiteKind(x) === surplus).length > 1,
          )
          .sort((a, b) => whiteTier(a.id) - whiteTier(b.id))[0]?.j ?? -1;
      if (i === -1) break;
      const dropped = out[i] as string;
      out = [...out.slice(0, i), ...out.slice(i + 1), card];
      next = { ...after, discard: [...after.discard, dropped] };
      swaps += 1;
    }
  }
  let bestSwaps = 0;
  while (countBest(out) < BEST_FLOOR && bestSwaps < MAX_BEST_SWAPS) {
    const swapped = swapForGood(next, out, isBest);
    if (swapped === null) break;
    [out, next] = swapped;
    bestSwaps += 1;
  }
  let goodSwaps = 0;
  while (countGood(out) < good && goodSwaps < good) {
    const swapped = swapForGood(next, out, isGood);
    if (swapped === null) break;
    [out, next] = swapped;
    goodSwaps += 1;
  }
  // The word card last, so no later swap can take it back out: a great one where the deck has it.
  if (out.filter(isWord).length < WORD_FLOOR) {
    const swapped =
      swapForGood(
        next,
        out,
        (id) => isWord(id) && isGood(id),
        (id) => !isWord(id),
      ) ?? swapForGood(next, out, isWord, (id) => !isWord(id) && !isGood(id));
    if (swapped !== null) [out, next] = swapped;
  }
  let fillerSwaps = 0;
  while (out.filter(isFiller).length > FILLER_CAP && fillerSwaps < 2) {
    const swapped = swapForGood(next, out, (id) => !isFiller(id), isFiller);
    if (swapped === null) break;
    [out, next] = swapped;
    fillerSwaps += 1;
  }
  const varied = swapForVariety(next, out);
  if (varied !== null) [out, next] = varied;
  return [out, next];
}

/** One spare card out for a great one that keeps every kind floor: the weakest non-great cards
 *  are tried first, and the great card must serve whatever kinds the hand would fall short of
 *  without the spare. Null when no spare has a great card to cover it. (The old rule wanted a
 *  spare that served no kind at its floor and a great card of the very same kind; a hand whose
 *  spare things all read as names too had no spare at all and stopped at four — loop #472.) */
export function swapForGood(
  state: State,
  hand: readonly string[],
  wants: (id: string) => boolean = isGood,
  spare: (id: string) => boolean = (id) => !wants(id),
  floor: (kind: WhiteKind) => number = floorOf,
): [string[], State] | null {
  // The hand's last word card is never the spare: the filler cap and the variety swap run after
  // the word block, and each traded a filler-tier word away (loop 788 — "a hand holds a word"
  // failed on a reshuffle), so the guard sits here, under every swap.
  const spares = hand
    .map((id, i) => ({ id, i }))
    .filter(({ id }) => spare(id) && !(isWord(id) && hand.filter(isWord).length <= WORD_FLOOR))
    .sort((a, b) => whiteTier(a.id) - whiteTier(b.id));
  for (const { id: dropped, i } of spares) {
    const rest = hand.filter((_, j) => j !== i);
    // Kinds the rest would fall short of — by any reading for the floor, and by first reading for
    // the spare's own kind, so the top of the hand can still lead with one of each (loop #488: a
    // spare gerund swapped for a great noun left a hand with no card that reads as a doing first).
    const needs = WHITE_KINDS.filter((k) => countKind(rest, k) < floor(k));
    const lead = leads(rest, whiteKind(dropped)) ? null : whiteKind(dropped);
    const [card, after] = takeWhere(
      state,
      (id) =>
        wants(id) &&
        needs.every((k) => whiteServes(id).includes(k)) &&
        (lead === null || whiteKind(id) === lead),
    );
    if (card === null) continue;
    return [[...rest, card], { ...after, discard: [...after.discard, dropped] }];
  }
  return null;
}

/** A hand with four or more cards on one subject (the deck's own aside — the wild deck is about
 *  sex the way the mild deck is about family) trades one of them, the weakest that no floor
 *  needs, for a card off that subject of at least its tier (loop 525: "balanced" hands — one
 *  clump a round is enough to notice, one swap a round enough to thin it). */
const CLUMP = 4;
function swapForVariety(state: State, hand: readonly string[]): [string[], State] | null {
  const subject = deckSubject(state.settings.decks);
  const byTopic = new Map<Topic, number>();
  for (const id of hand)
    for (const t of topicsOf(whiteText(id)))
      if (t !== subject) byTopic.set(t, (byTopic.get(t) ?? 0) + 1);
  const clump = [...byTopic].find(([, n]) => n >= CLUMP)?.[0];
  if (clump === undefined) return null;
  const onClump = (id: string): boolean => topicsOf(whiteText(id)).includes(clump);
  const floorTier = Math.min(...hand.filter(onClump).map(whiteTier));
  return swapForGood(
    state,
    hand,
    (id) => !onClump(id) && whiteTier(id) >= floorTier,
    (id) => onClump(id) && whiteTier(id) === floorTier,
  );
}

/** Rando's play (a setting): `count` great cards off the deck — random, but never filler, so the
 *  house's card is in the running (loop 619) — and, once the prompt is known, cards that read in
 *  its blanks (loop 813: a Pick 1 doing round drew "A jury of my exes"; now a gerund). Short when
 *  the decks hold fewer. */
export function drawGreat(state: State, count: number): [string[], State] {
  let next = state;
  const out: string[] = [];
  const slots = blackSlots(state.blackId);
  const black = blackCard(state.blackId).text;
  for (let i = 0; i < count; i += 1) {
    const slot = slots[i] ?? slots[0] ?? 'thing';
    const reads = (id: string): boolean =>
      fitScore(slot, whiteServes(id), whiteText(id), black) >= RANDO_FIT;
    const [fitting, afterFit] = takeWhere(next, (id) => isGood(id) && reads(id));
    const [card, after] = fitting !== null ? [fitting, afterFit] : takeWhere(next, isGood);
    if (card === null) break;
    next = after;
    out.push(card);
  }
  return [out, next];
}
/** How well Rando's card must read in the blank before any great card will do. */
const RANDO_FIT = 0.85;

/** Every player's hand back up to the room's hand size (+ `extra` for the ids in `extraFor`). */
export function refillHands(state: State, extra = 0, extraFor: readonly string[] = []): State {
  let next = state;
  const hands = { ...state.hands };
  for (const id of Object.keys(state.players).sort()) {
    const target = handSizeOf(state) + (extraFor.includes(id) ? extra : 0);
    const hand = hands[id] ?? [];
    if (
      hand.length >= target &&
      countsMeetFloor(hand) &&
      countGood(hand) >= goodFloor(handSizeOf(state)) &&
      countBest(hand) >= BEST_FLOOR &&
      hand.filter(isFiller).length <= FILLER_CAP &&
      hand.filter(isWord).length >= WORD_FLOOR
    )
      continue;
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

/** Once the prompt is known, every answerer's hand leads with the cards that read best in it —
 *  fit for the blank first, tier next, the shuffle's order kept among equals — so the first
 *  screenful on the phone is the four best answers, not four random ones (loop 473). */
export function leadWithFit(state: State, playerIds: readonly string[]): State {
  const slot = blackSlot(state.blackId);
  const black = blackCard(state.blackId).text;
  const fits = (id: string): boolean =>
    fitScore(slot, whiteServes(id), whiteText(id), black) >= FIT_FLOOR_SCORE;
  // A card tagged for this prompt (its killer, `killers.ts`) is never the one traded away.
  const spare = (id: string): boolean => !fits(id) && !tagHit(black, whiteTags(id));
  let next = state;
  const hands = { ...state.hands };
  for (const id of playerIds) {
    const held = hands[id];
    if (!held) continue;
    let hand: readonly string[] = held;
    // The fit floor: the kind floors keep three doings in a hand, but a "…had to ____." round
    // wants a hand of them, and a phone of seven "A ____" nouns under a verb prompt reads as no
    // options (owner, 2026-09-19). The weakest misfits go for great fitting cards, then any; the
    // other kinds keep only the base floor for the round, so a person prompt can hold four people.
    const fitTarget = goodFloor(handSizeOf(state));
    for (let n = 0; n < MAX_FIT_SWAPS && hand.filter(fits).length < fitTarget; n++) {
      const swapped: [string[], State] | null =
        swapForGood(next, hand, (c) => fits(c) && isGood(c), spare) ??
        swapForGood(next, hand, fits, spare);
      if (swapped === null) break;
      [hand, next] = swapped;
    }
    hands[id] = hand
      .map((card, i) => ({
        card,
        i,
        fit: fitScore(slot, whiteServes(card), whiteText(card), black),
        // A card written for this prompt family (`tags`) leads its fit group, ahead of the tier.
        hit: tagHit(black, whiteTags(card)) ? 1 : 0,
        tier: whiteTier(card),
      }))
      .sort((a, b) => b.fit - a.fit || b.hit - a.hit || b.tier - a.tier || a.i - b.i)
      .map((c) => c.card);
  }
  return { ...next, hands };
}

/** One of each kind at the top of the hand, the shuffle's order kept otherwise. A phone shows
 *  about four cards without scrolling, so a hand whose every noun is on screen and whose every
 *  action sits below the fold reads as "no options" even when the floor is met (loop #195). */
function frontLoadKinds(hand: readonly string[]): string[] {
  // A card can serve two kinds (an event is a thing and a doing): the front covers every kind
  // with as few cards as it takes, first card of each kind in hand order.
  const front: string[] = [];
  const rest = [...hand];
  for (const kind of WHITE_KINDS) {
    if (kind === 'name') continue; // only ever a second reading
    if (front.some((id) => whiteServes(id).includes(kind))) continue;
    const i = rest.findIndex((id) => whiteServes(id).includes(kind));
    if (i === -1) continue;
    front.push(rest[i] as string);
    rest.splice(i, 1);
  }
  return [...front, ...rest];
}

function countsMeetFloor(hand: readonly string[]): boolean {
  return WHITE_KINDS.every((kind) => countKind(hand, kind) >= floorOf(kind));
}
