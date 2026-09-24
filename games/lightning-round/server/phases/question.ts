// Phase "question": one locked pick per player within `answerSeconds`. Exits when every connected
// player has picked or the deadline fires; the reveal (`next`) does the scoring.
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isPlayer } from '../types';
import type { Input, State } from '../types';
import type { Advance } from './intro';

/** Asks the next drawn question (index + 1) with fresh picks. */
export function enterQuestion(state: State, now: number): State {
  const index = Math.min(state.index + 1, state.questionIds.length - 1);
  return enterPhase(
    { ...state, index, picks: {}, returnedAt: {}, noFault: [] },
    'question',
    now,
    state.settings.answerSeconds * 1000,
  );
}

/**
 * Time into the answer window. Measured from the deadline, not `startedAt`, so a pause (which
 * shifts the deadline) does not eat into the speed bonus. Clamped to [0, window].
 */
export function elapsedMs(state: State, now: number): number {
  const window = state.settings.answerSeconds * 1000;
  const raw =
    state.phase.deadline === null
      ? now - state.phase.startedAt
      : window - (state.phase.deadline - now);
  return Math.min(window, Math.max(0, raw));
}

export function reduceQuestion(state: State, event: GameEvent<Input>, next: Advance): State {
  if (event.type === 'input') {
    if (event.input.type !== 'pick') return state;
    // Playing players only, first pick only: later picks are ignored so "submitted" stays honest.
    if (!isPlayer(state, event.playerId) || Object.hasOwn(state.picks, event.playerId))
      return state;
    const picked: State = {
      ...state,
      picks: {
        ...state.picks,
        [event.playerId]: { index: event.input.index, elapsedMs: pickElapsed(state, event.playerId, event.now) },
      },
    };
    return allConnectedDone(picked, Object.keys(picked.picks)) ? next(picked, event.now) : picked;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

/**
 * I-264 A: how far into the window a pick counts. A player who came back mid-question is timed from
 * their return, scaled to the time that was left — never better than half the window (half the
 * speed bonus), so a drop can't be used to buy time.
 */
export function pickElapsed(state: State, playerId: string, now: number): number {
  const plain = elapsedMs(state, now);
  const back = state.returnedAt?.[playerId];
  const deadline = state.phase.deadline;
  if (back === undefined || deadline === null || back <= state.phase.startedAt) return plain;
  const window = state.settings.answerSeconds * 1000;
  const left = Math.max(1, deadline - back);
  const scaled = window * Math.min(1, Math.max(0, now - back) / left);
  return Math.min(plain, Math.max(scaled, window / 2));
}

/** I-264 A: a player's return during an open question, remembered for their pick. */
export function noteReturn(state: State, playerId: string, now: number): State {
  if (state.phase.id !== 'question' || Object.hasOwn(state.picks, playerId)) return state;
  const returned = { ...state, returnedAt: { ...state.returnedAt, [playerId]: now } };
  // I-264 B: back with under 3 s left — a miss won't cost the streak
  const deadline = state.phase.deadline;
  if (deadline !== null && deadline - now < 3000)
    return { ...returned, noFault: [...(state.noFault ?? []), playerId] };
  return returned;
}
