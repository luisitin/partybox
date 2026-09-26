// Phase "nominate" (R6): the Presidential candidate picks an eligible Chancellor. A timeout picks
// one at random and the TV names it (D1, D3).
import { isTimerFor, pick } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { announced, go, timed, withRound } from '../phase';
import { eligibleNominees } from '../rules';
import type { Input, State, Transition } from '../types';

export function enterNominate(state: State, now: number): State {
  return go(
    withRound(state, { nominee: null, votes: {} }),
    'nominate',
    now,
    timed(state, 'nominate'),
  );
}

/** The timeout result: a random eligible nominee, announced by name. */
export function timeoutNominate(state: State): State {
  if (state.round.nominee !== null) return state;
  const eligible = eligibleNominees(state);
  if (eligible.length === 0) return state;
  const [nominee, rng] = pick(state.rng, eligible);
  return announced(withRound({ ...state, rng }, { nominee }), nominee);
}

export function reduceNominate(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'nominate') {
    if (event.playerId !== state.round.president) return state;
    const target = event.input.target;
    if (!eligibleNominees(state).includes(target)) return state;
    return next(withRound(state, { nominee: target }), event.now);
  }
  if (isTimerFor(state, event)) return next(timeoutNominate(state), event.now);
  return state;
}
