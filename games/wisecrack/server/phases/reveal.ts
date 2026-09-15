// Phase "reveal": authors, vote counts and points for the prompt just voted on. Points are locked
// in on entry (exactly once per prompt). Exits on the 6 s deadline or VIP skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { currentPrompt } from '../round';
import { applyTally, tallyPrompt } from '../scoring';
import { REVEAL_MS } from '../types';
import type { Input, State } from '../types';
import type { Transition } from './intro';

export function enterReveal(state: State, now: number): State {
  const prompt = currentPrompt(state);
  const scored = prompt ? applyTally(state, tallyPrompt(state, prompt)) : state;
  return enterPhase(scored, 'reveal', now, REVEAL_MS);
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
