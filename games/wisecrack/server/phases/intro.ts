// Phase "intro": the round card ("Round r of R", double points on the last round). Entering it
// starts the round: draws prompts and pairs authors. Exits on the 7 s deadline or VIP skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { startRound } from '../round';
import { INTRO_MS } from '../types';
import type { Input, State } from '../types';

/** What a phase does when it is over: the composer (server/flow.ts) decides where to go. */
export type Transition = (state: State, now: number) => State;

export function enterIntro(state: State, now: number): State {
  return enterPhase(startRound(state), 'intro', now, INTRO_MS);
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
