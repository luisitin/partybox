// Phase "prompt": "Prompt 2 of 3" and the prompt, read aloud. Lasts the reading + 1 s, at most
// 10 s; a reading not made yet holds it at 10 s and re-times it when it arrives. Without a voice it
// lasts the time to read it. Exits on the deadline or VIP skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { startPrompt } from '../round';
import { msOf, promptReading } from '../speech';
import { PROMPT_AFTER_MS, PROMPT_MAX_MS, VOICE_LEAD_MS } from '../types';
import type { Input, State, Transition } from '../types';

/** Time for a slow reader to read `text` (the owner's pacing rule [cc45f4]): 2.5 s plus 0.45 s a
 *  word, 4–10 s. */
export function readingTimeMs(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.min(PROMPT_MAX_MS, Math.max(4_000, 2_500 + words * 450));
}

function stayMs(state: State): number {
  const req = promptReading(state, state.p.n);
  const ms = msOf(state, req);
  if (!req || (ms !== undefined && ms < 0))
    return readingTimeMs(state.prompts[state.p.n]?.prompt ?? '');
  if (ms === undefined) return PROMPT_MAX_MS;
  return Math.min(PROMPT_MAX_MS, VOICE_LEAD_MS + ms + PROMPT_AFTER_MS);
}

export function enterPrompt(state: State, now: number, n: number): State {
  const started = startPrompt(state, n);
  return enterPhase(started, 'prompt', now, stayMs(started));
}

/** A reading arrived while the prompt is up: the phase re-times to it (never past 10 s). */
export function retimePrompt(state: State, now: number): State {
  if (state.phase.id !== 'prompt' || state.phase.deadline === null) return state;
  const end = Math.min(
    state.phase.startedAt + PROMPT_MAX_MS,
    state.phase.startedAt + stayMs(state),
  );
  return { ...state, phase: { ...state.phase, deadline: Math.max(now + 300, end) } };
}

export function reducePrompt(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
