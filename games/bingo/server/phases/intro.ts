// Phase "intro" (5 s): the TV announces the round and its pattern; phones show their new card.
// Entering it deals the round: one deck shuffle, then one card per player in sorted-id order so
// the same seed always deals the same cards. Exits on the deadline (or VIP skip) via `next`.
import { enterPhase, isTimerFor, shuffle } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { dealCard, range } from '../cards';
import { DECK, INTRO_MS } from '../types';
import type { Input, Pattern, RoundState, State, Transition } from '../types';

export function enterIntro(state: State, number: number, now: number): State {
  let rng = state.rng;
  const [deck, afterDeck] = shuffle(rng, range(1, DECK));
  rng = afterDeck;
  const cards: Record<string, number[]> = {};
  const daubs: Record<string, number[]> = {};
  for (const id of Object.keys(state.players).sort()) {
    const [card, next] = dealCard(rng);
    cards[id] = card;
    daubs[id] = [];
    rng = next;
  }
  const pattern: Pattern =
    state.settings.patterns[number - 1] ?? state.settings.patterns[0] ?? 'line';
  const round: RoundState = {
    number,
    pattern,
    deck,
    drawn: 0,
    cards,
    daubs,
    claim: null,
    waitForCall: {},
    winnerId: null,
    settled: [],
  };
  return enterPhase({ ...state, rng, round }, 'intro', now, INTRO_MS);
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
