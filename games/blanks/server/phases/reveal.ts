// Phase "reveal": the TV (and every phone) reads one submission at a time — the black card with
// the white cards dropped in — one phase instance per slot, timed to its length. Exits on each
// card's deadline; VIP skip jumps straight to the vote.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { revealMs } from '../cards';
import { readingOpen } from '../round';
import { blackCard, whiteText } from '../content';
import type { Input, State } from '../types';
import type { Transition } from './intro';

/** Puts `state.slots[index]` on stage. */
export function enterReveal(state: State, now: number, index: number): State {
  const submitter = state.slots[index];
  const whites = (submitter ? state.submissions[submitter] : []) ?? [];
  const ms = revealMs(blackCard(state.blackId).text, whites.map(whiteText), state.slots.length);
  return enterPhase({ ...state, revealIndex: index }, 'reveal', now, ms);
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  // I-143 C: nobody can do the reading — the first person to offer takes it.
  if (event.type === 'input' && event.input.type === 'takeReading') {
    const p = state.players[event.playerId];
    if (!readingOpen(state) || !p?.connected || p.bot === true) return state;
    return { ...state, readerId: event.playerId };
  }
  return state;
}
