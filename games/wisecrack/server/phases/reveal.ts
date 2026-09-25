// Phase "reveal": authors, vote counts and points for the prompt just voted on. Points are locked
// in on entry (exactly once per prompt). Exits on its reading-time deadline (revealMs) or VIP skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { currentPrompt } from '../round';
import { applyTally, tallyPrompt } from '../scoring';
import { REVEAL_BEATS_MS, REVEAL_MIN_MS, readMs, wordCount } from '../types';
import type { Input, RoundPrompt, State } from '../types';
import type { Transition } from './intro';

export function enterReveal(state: State, now: number): State {
  const prompt = currentPrompt(state);
  const scored = prompt ? applyTally(state, tallyPrompt(state, prompt)) : state;
  return enterPhase(scored, 'reveal', now, prompt ? revealMs(scored, prompt) : REVEAL_MIN_MS);
}

/** Pacing rule (2026-09-25): the beats, then a slow reader's time for the answers, the two
 *  authors, the voters' names and the result line. */
export function revealMs(state: State, prompt: RoundPrompt): number {
  const answers = state.answers[prompt.id] ?? {};
  const answerWords = prompt.authors.reduce(
    (n, a) => n + wordCount(answers[a] ?? '(no answer)'),
    0,
  );
  const voters = Object.keys(state.votes[prompt.id] ?? {}).length;
  const words = answerWords + prompt.authors.length + voters + 4;
  return Math.max(REVEAL_MIN_MS, REVEAL_BEATS_MS + readMs(words));
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
