// Phase "hunter" (SPEC §10.7): the dead hunter takes one living player with them. Step 0: the
// hunter aims (20 s; no shot = nobody). Once they shoot, step 0 holds until the narrator's line is
// ready (NOTES decision 2), then step 1: the shot lands and its victim's card flips like any
// other death. Exits after the shot's step, the clock, or the VIP's skip (no shot).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isAlive, kill } from '../rules';
import { HOLD_NEXT_MS, enterStep, nextStep } from '../steps';
import { readingNow } from '../speech';
import { HUNTER_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterHunter(state: State, now: number, from: 'dawn' | 'verdict'): State {
  const at: State = { ...state, hunterFrom: from, shot: null, step: 0, stepAt: now };
  return enterPhase(at, 'hunter', now, HUNTER_MS);
}

/** The shot lands: its victim dies (told at once: the TV shows it on this step). */
function land(state: State, now: number): State {
  const target = state.shot as string;
  return enterStep(kill(state, [{ id: target, how: 'hunter' }], true), now, 1);
}

export function reduceHunter(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    if (state.step === 0 && state.shot && isAlive(state, state.shot)) return land(state, event.now);
    return next(state, event.now);
  }
  if (event.type !== 'input' || event.input.type !== 'shoot' || state.step !== 0) return state;
  if (state.shot) return state;
  const target = event.input.target;
  if (event.playerId !== state.hunterPending || target === event.playerId) return state;
  if (!isAlive(state, target)) return state;
  const aimed: State = { ...state, shot: target };
  const step = nextStep(aimed);
  const line = step === null ? null : readingNow({ ...aimed, step });
  if (!line || aimed.speechMs[line.key] !== undefined) return land(aimed, event.now);
  return { ...aimed, phase: { ...aimed.phase, deadline: event.now + HOLD_NEXT_MS } };
}
