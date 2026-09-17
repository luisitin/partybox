// Phase "scoreboard" (6 s): rounds won so far and the next round's pattern, between rounds only.
// Exits on the deadline via `next` (the next round's intro). `done` is the terminal phase.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { setMenu } from '../claims';
import { SCOREBOARD_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterScoreboard(state: State, now: number): State {
  return enterPhase(state, 'scoreboard', now, SCOREBOARD_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceScoreboard(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'menu')
    return setMenu(state, event.playerId, event.input.open);
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
