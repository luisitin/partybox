// Phase "end": every role card flips, the winning side's banner, and why (SPEC §10.9). Exits after
// 12 s or on the VIP's "See results", into "done" — where `results()` is set and the Finale keeps
// the end board on the results screen.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { tellAll } from '../rules';
import { END_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterEnd(state: State, now: number, win: Pick<State, 'winner' | 'reason'>): State {
  const at: State = { ...tellAll(state), ...win, step: 0, stepAt: now, beats: [] };
  return enterPhase(at, 'end', now, END_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase({ ...tellAll(state), beats: [] }, 'done', now, null);
}

export function reduceEnd(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
