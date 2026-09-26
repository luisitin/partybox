// Blackjack (LIVE-EVENTS.md — the owner: "a round of blackjack where everyone can play"): every
// staker is dealt two cards face up, the dealer one up and one down. On `hands` each player hits or
// stands on their phone (bust or 21 stands you); when all have stood, or HANDS_MS runs out, the
// dealer turns the hole card and draws to 17 at `open`. Win ×2, blackjack ×2.5, a push is the stake
// back, bust or beaten loses. Cards: 0–51, rank = n % 13 (0 = A … 12 = K), suit = n / 13.
import { allConnectedDone, enterPhase, isTimerFor, nextFloat } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { HANDS_MS } from '../timing';
import type { Input, State, Transition } from '../types';
import { inGame } from './bet';

export function isBlackjack(state: State): boolean {
  return state.boxes[state.r.idx]?.box.event === 'blackjack';
}

/** A hand's best total (aces 11 unless that busts). */
export function total(cards: readonly number[]): number {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    const rank = c % 13;
    if (rank === 0) {
      aces++;
      sum += 11;
    } else sum += Math.min(10, rank + 1);
  }
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

export const isNatural = (cards: readonly number[]): boolean =>
  cards.length === 2 && total(cards) === 21;

function stakers(state: State): string[] {
  return Object.entries(state.r.bets)
    .filter(([id, b]) => b.amount > 0 && inGame(state, id))
    .map(([id]) => id);
}

/** Draw the top card of the round's shoe. */
function draw(state: State): [number, State] {
  const shoe = state.r.shoe ?? [];
  const [card = 0, ...rest] = shoe;
  return [card, { ...state, r: { ...state.r, shoe: rest } }];
}

export function enterHands(state: State, now: number): State {
  // One shuffled deck per round.
  const deck = Array.from({ length: 52 }, (_, i) => i);
  let rng = state.rng;
  for (let i = deck.length - 1; i > 0; i--) {
    const [f, next] = nextFloat(rng);
    rng = next;
    const j = Math.floor(f * (i + 1));
    [deck[i], deck[j]] = [deck[j] ?? 0, deck[i] ?? 0];
  }
  let s: State = { ...state, rng, r: { ...state.r, shoe: deck, hands: {}, stood: [] } };
  const hands: Record<string, number[]> = {};
  for (const id of stakers(state)) {
    const [a, s1] = draw(s);
    const [b, s2] = draw(s1);
    s = s2;
    hands[id] = [a, b];
  }
  const [d1, s3] = draw(s);
  const [d2, s4] = draw(s3);
  s = s4;
  // A natural 21 stands at once.
  const stood = Object.entries(hands)
    .filter(([, h]) => total(h) >= 21)
    .map(([id]) => id);
  return enterPhase(
    { ...s, r: { ...s.r, hands, dealer: [d1, d2], stood } },
    'hands',
    now,
    HANDS_MS,
  );
}

export function handsIn(state: State): boolean {
  const done = state.r.stood ?? [];
  const idle = state.seats.filter((id) => !Object.hasOwn(state.r.hands ?? {}, id));
  return allConnectedDone(state, [...done, ...idle]);
}

export function reduceHands(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || (event.input.type !== 'hit' && event.input.type !== 'stand'))
    return state;
  const id = event.playerId;
  // Own keys only: a player id like '__proto__' must never read Object.prototype.
  const hands = state.r.hands ?? {};
  const hand = Object.hasOwn(hands, id) ? hands[id] : undefined;
  if (!hand || (state.r.stood ?? []).includes(id)) return state;
  let after: State;
  if (event.input.type === 'stand') {
    after = { ...state, r: { ...state.r, stood: [...(state.r.stood ?? []), id] } };
  } else {
    const [card, drawn] = draw(state);
    const cards = [...hand, card];
    const out = total(cards) >= 21;
    after = {
      ...drawn,
      r: {
        ...drawn.r,
        hands: { ...drawn.r.hands, [id]: cards },
        stood: out ? [...(drawn.r.stood ?? []), id] : (drawn.r.stood ?? []),
      },
    };
  }
  return handsIn(after) ? next(after, event.now) : after;
}

/** The dealer plays out (hits to 17) — the cards the TV turns at `open`. */
export function finishHands(state: State): State {
  let s = state;
  let dealer = [...(s.r.dealer ?? [])];
  while (total(dealer) < 17) {
    const [card, next] = draw(s);
    s = next;
    dealer = [...dealer, card];
  }
  return { ...s, r: { ...s.r, dealer } };
}

/** What a blackjack stake returns (× 0, 1, 2 or 2.5). */
export function blackjackReturn(state: State, id: string, amount: number): number {
  const hands = state.r.hands ?? {};
  const hand = Object.hasOwn(hands, id) ? hands[id] : undefined;
  const dealer = state.r.dealer ?? [];
  if (!hand) return 0;
  const mine = total(hand);
  const theirs = total(dealer);
  if (mine > 21) return 0;
  if (isNatural(hand) && !isNatural(dealer)) return Math.floor(amount * 2.5);
  if (isNatural(dealer) && !isNatural(hand)) return 0;
  if (theirs > 21 || mine > theirs) return amount * 2;
  if (mine === theirs) return amount;
  return 0;
}
