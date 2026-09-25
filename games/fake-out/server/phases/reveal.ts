// Phase "reveal": one phase instance, stepped (SPEC §3.4, §3.12). Each picked option flips over,
// least-picked first, the truth last; then the completed fact; then "Nobody fell for…". Points are
// computed as it begins (the views hand them out step by step) and a VIP skip turns one page.
// A step re-arms the same instance's deadline (ADR-033), so the shell sees one reveal.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { revealOrderOf } from '../options';
import { optionOnStep, stepTiming } from '../pacing';
import { questionDelta, questionStats } from '../scoring';
import { completedReading, optionReading, voiceOf } from '../speech';
import type { Input, State, Transition } from '../types';

export function enterReveal(state: State, now: number): State {
  const ordered: State = {
    ...state,
    q: { ...state.q, revealOrder: revealOrderOf(state), step: 0 },
  };
  const delta = questionDelta(ordered);
  const scores = { ...state.scores };
  for (const [p, row] of Object.entries(delta)) scores[p] = (scores[p] ?? 0) + row.pts;
  const scored: State = {
    ...ordered,
    scores,
    stats: questionStats(ordered),
    q: { ...ordered.q, delta, stepAt: now },
  };
  return enterPhase(scored, 'reveal', now, stepTiming(scored, 0)?.ms ?? 1_000);
}

/** Turns to step `step` now, or leaves the reveal when there is none. */
function goToStep(state: State, step: number, now: number, next: Transition): State {
  const timing = stepTiming(state, step);
  if (!timing) return next(state, now);
  return {
    ...state,
    q: { ...state.q, step, stepAt: now },
    phase: { ...state.phase, deadline: now + timing.ms },
  };
}

/** The VIP's skip in the reveal: the next page, like turning a page. */
export function skipStep(state: State, now: number, next: Transition): State {
  return goToStep(state, state.q.step + 1, now, next);
}

/** The reading for the step on stage arrived after the step began: the step restarts its beats
 *  from now, so the stamp lands after the voice. */
export function retimeReveal(state: State, key: string, now: number): State {
  const voice = voiceOf(state);
  if (state.phase.id !== 'reveal' || !voice || (state.speechMs[key] ?? -1) < 0) return state;
  const option = optionOnStep(state, state.q.step);
  const onStage = option
    ? optionReading(voice, option.display).key
    : state.q.step === state.q.revealOrder.length
      ? completedReading(voice, state.q.item).key
      : null;
  if (onStage !== key) return state;
  const timing = stepTiming(state, state.q.step);
  if (!timing) return state;
  return {
    ...state,
    q: { ...state.q, stepAt: now },
    phase: { ...state.phase, deadline: now + timing.ms },
  };
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? goToStep(state, state.q.step + 1, event.now, next) : state;
}

/** Test and preview helper: the reveal with every step shown. */
export function lastStep(state: State): number {
  let step = 0;
  while (stepTiming(state, step + 1)) step += 1;
  return step;
}
