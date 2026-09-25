// Phase "scoreboard" (scoreboardMs: time to read every row, >= 10 s): rounds won so far and the
// next round's pattern, between rounds only.
// Exits on the deadline via `next` (the next round's intro). `done` is the terminal phase.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { setMenu } from '../claims';
import { FINAL_MS, scoreboardMs } from '../types';
import type { Input, State, Transition } from '../types';

export function enterScoreboard(state: State, now: number): State {
  return enterPhase(state, 'scoreboard', now, scoreboardMs(Object.keys(state.players).length));
}

/** After the last round: the final board with the crown withheld for FINAL_MS, then done. */
export function enterFinal(state: State, now: number): State {
  return enterPhase(state, 'final', now, FINAL_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceFinal(state: State, event: GameEvent<Input>): State {
  if (event.type === 'input' && event.input.type === 'menu')
    return setMenu(state, event.playerId, event.input.open);
  if (isTimerFor(state, event)) return enterDone(state, event.now);
  return state;
}

export function reduceScoreboard(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'menu')
    return setMenu(state, event.playerId, event.input.open);
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
