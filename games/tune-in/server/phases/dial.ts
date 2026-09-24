// Phase "dial": the guessers slide their dials and lock in. A dial after a lock clears the lock
// (moving the thumb unlocks). Ends when every connected guesser locked, at the deadline, or on a
// VIP skip, which locks every dial where it is.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { connectedGuessers, guessersOf } from '../turn';
import type { Input, State, Transition } from '../types';

export function enterDial(state: State, now: number): State {
  return enterPhase(state, 'dial', now, state.cfg.dialSeconds * 1000);
}

/** Every connected guesser has locked (and at least one is connected). */
export function dialDone(state: State): boolean {
  const live = connectedGuessers(state);
  return live.length > 0 && live.every((id) => state.turn.locked.includes(id));
}

export function reduceDial(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input') return state;
  const { turn } = state;
  const id = event.playerId;
  if (!guessersOf(state).includes(id)) return state;
  if (event.input.type === 'dial') {
    const pos = event.input.pos;
    if (turn.dials[id] === pos && !turn.locked.includes(id)) return state;
    const locked = turn.locked.filter((x) => x !== id);
    return { ...state, turn: { ...turn, dials: { ...turn.dials, [id]: pos }, locked } };
  }
  if (event.input.type === 'lock') {
    if (!Object.hasOwn(turn.dials, id) || turn.locked.includes(id)) return state;
    const after = { ...state, turn: { ...turn, locked: [...turn.locked, id] } };
    return dialDone(after) ? next(after, event.now) : after;
  }
  return state;
}
