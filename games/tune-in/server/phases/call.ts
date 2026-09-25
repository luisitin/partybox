// Phase "call" (teams only): the other team calls whether the target is LEFT or RIGHT of the
// needle. A caller may change their tap until the phase ends. Ends when every connected caller has
// tapped, at the deadline, or on a VIP skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { callersOf } from '../turn';
import type { Input, State, Transition } from '../types';

export function enterCall(state: State, now: number): State {
  return enterPhase(state, 'call', now, state.cfg.callSeconds * 1000);
}

export function callDone(state: State): boolean {
  const live = callersOf(state).filter((id) => state.players[id]?.connected === true);
  return live.length > 0 && live.every((id) => Object.hasOwn(state.turn.calls, id));
}

export function reduceCall(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'call') return state;
  if (!callersOf(state).includes(event.playerId)) return state;
  const { turn } = state;
  if (turn.calls[event.playerId] === event.input.side) return state;
  const calls = { ...turn.calls, [event.playerId]: event.input.side };
  const after = { ...state, turn: { ...turn, calls } };
  return callDone(after) ? next(after, event.now) : after;
}
