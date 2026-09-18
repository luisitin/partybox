// Phase "result": the winning card with its author, every other card's author, and the point.
// Points lock in on entry (exactly once per round). Exits on the 8 s deadline (untimed rounds: Next
// from any player, or a hidden 60 s fallback) or VIP skip; the last round's result goes to "final"
// — the board with the crown withheld for 4 s ("And the winner is…", review-loop #134) — and then
// "done", the terminal phase where results() becomes non-null. VIP end jumps to "done" from
// anywhere.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { applyRound } from '../scoring';
import { FINAL_MS, RESULT_MS, UNTIMED_RESULT_MS } from '../types';
import type { Input, State } from '../types';
import type { Transition } from './intro';

export function enterResult(state: State, now: number): State {
  return enterPhase(
    applyRound(state),
    'result',
    now,
    state.settings.timed ? RESULT_MS : UNTIMED_RESULT_MS,
  );
}

export function enterFinal(state: State, now: number): State {
  return enterPhase(state, 'final', now, FINAL_MS);
}

export function reduceFinal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceResult(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'next')
    return !state.settings.timed && hasPlayer(state, event.playerId)
      ? next(state, event.now)
      : state;
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
