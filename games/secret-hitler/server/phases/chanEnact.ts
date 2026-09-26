// Phase "chanEnact" (R11, R19): the Chancellor enacts one of the two policies and discards the
// other, or (once the veto is unlocked, once per session) requests a veto. A timeout enacts at
// random with no veto (D1, D3).
import { isTimerFor, nextInt } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { announced, go, timed, withRound } from '../phase';
import type { Input, State, Transition } from '../types';

export function enterChanEnact(state: State, now: number): State {
  return go(state, 'chanEnact', now, timed(state, 'chanEnact'));
}

export function canRequestVeto(state: State): boolean {
  return state.vetoUnlocked && !state.round.vetoRequested && state.round.enacted === null;
}

export function enactAt(state: State, index: number): State {
  const passed = state.round.passed ?? [];
  const card = passed[index];
  if (card === undefined || state.round.enacted !== null) return state;
  const rest = passed.filter((_, i) => i !== index);
  return withRound({ ...state, discards: [...state.discards, ...rest] }, { enacted: card });
}

export function timeoutChanEnact(state: State): State {
  if (state.round.enacted !== null) return state;
  const passed = state.round.passed ?? [];
  if (passed.length === 0) return state;
  const [index, rng] = nextInt(state.rng, 0, passed.length - 1);
  return announced(enactAt({ ...state, rng }, index), null);
}

export function reduceChanEnact(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.playerId === state.round.nominee) {
    if (event.input.type === 'enact') {
      const after = enactAt(state, event.input.index);
      return after === state ? state : next(after, event.now);
    }
    if (event.input.type === 'vetoRequest' && canRequestVeto(state))
      return next(withRound(state, { vetoRequested: true }), event.now);
    return state;
  }
  if (isTimerFor(state, event)) return next(timeoutChanEnact(state), event.now);
  return state;
}
