// Phase "guess": the surviving clues on the TV and every phone; only the guesser types. A guess
// or a pass ends it; the clock (or the VIP) counts as a pass.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { autoGroups } from '../echoes';
import type { Input, Outcome, State } from '../types';

/** What ends the guess: the outcome and the typed text (server/index.ts routes it to `result`). */
export type GuessEnd = (
  state: State,
  now: number,
  outcome: Outcome | 'judge',
  text: string,
) => State;

export function enterGuess(state: State, now: number): State {
  const groups = state.w.groups ?? autoGroups(state);
  return enterPhase(
    { ...state, w: { ...state.w, groups } },
    'guess',
    now,
    state.cfg.guessSeconds * 1000,
  );
}

export function reduceGuess(state: State, event: GameEvent<Input>, end: GuessEnd): State {
  if (isTimerFor(state, event)) return end(state, event.now, 'pass', '');
  if (event.type !== 'input' || event.playerId !== state.w.guesser) return state;
  const { input } = event;
  if (input.type === 'pass') return end(state, event.now, 'pass', '');
  if (input.type === 'guess') {
    const text = input.text.trim();
    return text.length > 0 ? end(state, event.now, 'judge', text.slice(0, 60)) : state;
  }
  return state;
}
