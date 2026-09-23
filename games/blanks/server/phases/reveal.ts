// Phase "reveal": the TV (and every phone) reads one submission at a time — the black card with
// the white cards dropped in — one phase instance per slot, timed to its length. Exits on each
// card's deadline; VIP skip jumps straight to the vote.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { flightMs, revealMs, revealSpan } from '../cards';
import { blackCard, whiteText } from '../content';
import type { Input, State } from '../types';
import type { Transition } from './intro';

/** Puts the flight starting at `state.slots[index]` on stage (one card in a small room — I-157). */
export function enterReveal(state: State, now: number, index: number): State {
  const span = revealSpan(state.slots.length);
  const each = state.slots.slice(index, index + span).map((submitter) => {
    const whites = state.submissions[submitter] ?? [];
    return revealMs(blackCard(state.blackId).text, whites.map(whiteText), state.slots.length);
  });
  return enterPhase({ ...state, revealIndex: index }, 'reveal', now, flightMs(each));
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
