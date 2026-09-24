// Phase "lastWords" (remote-text rooms only, SPEC §10.6): the eliminated player types one line
// (80 characters) for the TV. Step 0: they type (20 s); step 1: "Ben's last words…" and the line.
// Exits after the line's step, the clock, or the VIP's skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { enterStep } from '../steps';
import { cleanText } from '../text';
import { LAST_WORDS_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterLastWords(state: State, now: number): State {
  const at: State = { ...state, lastWords: null, step: 0, stepAt: now };
  return enterPhase(at, 'last-words', now, LAST_WORDS_MS);
}

export function reduceLastWords(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'lastWords' || state.step !== 0) return state;
  if (event.playerId !== state.verdict?.out) return state;
  const text = cleanText(event.input.text);
  if (!text) return state;
  return enterStep({ ...state, lastWords: text }, event.now, 1);
}
