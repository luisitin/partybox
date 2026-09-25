// Phases "turn-end", "win" and "done" (SPEC §9.4): the turn's summary card, the round's result with
// the whole key face up, and the game's end. Each exits on its deadline or a VIP skip via `next`.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { TURN_END_MS, WIN_MS } from '../types';
import type { Input, Reason, State, Team, Transition } from '../types';

export function enterTurnEnd(state: State, now: number): State {
  return enterPhase(state, 'turn-end', now, TURN_END_MS);
}

/** The round is over: every card face up everywhere, the winner's round counted. */
export function enterWin(
  state: State,
  now: number,
  winner: Team | 'draw' | null,
  reason: Reason,
): State {
  const roundWins = { ...state.roundWins };
  if (winner === 'sun' || winner === 'moon') roundWins[winner] += 1;
  const flipped = state.flipped.map(() => 2 as const);
  return enterPhase({ ...state, winner, reason, roundWins, flipped }, 'win', now, WIN_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceTimed(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
