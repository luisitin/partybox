// Phase "hunter" (SPEC §10.7): the dead hunter takes one living player with them. Step 0: the
// hunter aims (20 s; no shot = nobody). Step 1: the shot lands, its victim's card flips like any
// other death. Exits after the shot's step, the clock, or the VIP's skip (no shot).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isAlive, kill } from '../rules';
import { enterStep } from '../steps';
import { HUNTER_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterHunter(state: State, now: number, from: 'dawn' | 'verdict'): State {
  const at: State = { ...state, hunterFrom: from, shot: null, step: 0, stepAt: now };
  return enterPhase(at, 'hunter', now, HUNTER_MS);
}

export function reduceHunter(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'shoot' || state.step !== 0) return state;
  const target = event.input.target;
  if (event.playerId !== state.hunterPending || target === event.playerId) return state;
  if (!isAlive(state, target)) return state;
  const shot = kill({ ...state, shot: target }, [{ id: target, how: 'hunter' }], true);
  return enterStep(shot, event.now, 1);
}
