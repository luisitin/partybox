// Phase "guess": the surviving clues on the TV and every phone; only the guesser types. A guess
// or a pass ends it; the clock (or the VIP) counts as a pass. A guess that comes in while the TV
// is still turning the clues over is held (`w.early`) and lands when the reveal ends.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { autoGroups, survivorRefs } from '../echoes';
import { readingMs } from '../speech';
import { guessShowMs } from '../types';
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
  const w = { ...state.w, groups, early: null };
  return enterPhase({ ...state, w }, 'guess', now, state.cfg.guessSeconds * 1000);
}

/** The deadline or the VIP: an answer already held lands; otherwise it is a pass. */
export function closeGuess(state: State, now: number, end: GuessEnd): State {
  const early = state.w.early;
  return early ? end(state, now, early.outcome, early.text) : end(state, now, 'pass', '');
}

export function reduceGuess(state: State, event: GameEvent<Input>, end: GuessEnd): State {
  if (isTimerFor(state, event)) return closeGuess(state, event.now, end);
  if (event.type !== 'input' || event.playerId !== state.w.guesser || state.w.early) return state;
  const { input } = event;
  let answer: { outcome: 'pass' | 'judge'; text: string } | null = null;
  if (input.type === 'pass') answer = { outcome: 'pass', text: '' };
  if (input.type === 'guess' && input.text.trim().length > 0)
    answer = { outcome: 'judge', text: input.text.trim().slice(0, 60) };
  if (!answer) return state;
  const showUntil =
    state.phase.startedAt + guessShowMs(survivorRefs(state).length, readingMs(state));
  if (event.now >= showUntil) return end(state, event.now, answer.outcome, answer.text);
  return {
    ...state,
    w: { ...state.w, early: answer },
    phase: { ...state.phase, deadline: showUntil },
  };
}
