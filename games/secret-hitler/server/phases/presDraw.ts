// Phase "presDraw" (R11, R12): the President draws the top three policies and secretly discards
// one; the other two go to the Chancellor. A timeout discards at random, unnamed (D1, D3).
import { isTimerFor, nextInt } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { announced, go, timed, withRound } from '../phase';
import { reshuffleIfLow } from '../rules';
import type { Input, State, Transition } from '../types';

export function enterPresDraw(state: State, now: number): State {
  const s = reshuffleIfLow(state); // R13 already ran at the last session's end; this is a guard
  const drawn = withRound({ ...s, deck: s.deck.slice(3) }, { draw: s.deck.slice(0, 3) });
  return go(drawn, 'presDraw', now, timed(s, 'presDraw'));
}

export function discardAt(state: State, index: number): State {
  const draw = state.round.draw ?? [];
  const card = draw[index];
  if (card === undefined || state.round.passed !== null) return state;
  const passed = draw.filter((_, i) => i !== index);
  return withRound({ ...state, discards: [...state.discards, card] }, { passed });
}

export function timeoutPresDraw(state: State): State {
  if (state.round.passed !== null) return state;
  const draw = state.round.draw ?? [];
  if (draw.length === 0) return state;
  const [index, rng] = nextInt(state.rng, 0, draw.length - 1);
  return announced(discardAt({ ...state, rng }, index), null);
}

export function reducePresDraw(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'discard') {
    if (event.playerId !== state.round.president) return state;
    const after = discardAt(state, event.input.index);
    return after === state ? state : next(after, event.now);
  }
  if (isTimerFor(state, event)) return next(timeoutPresDraw(state), event.now);
  return state;
}
