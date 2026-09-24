// Phase "vetoAsk" (R19): the President agrees or refuses the Chancellor's veto. Agreed: both
// policies are discarded and the tracker moves up (R9), which can cause chaos. Refused, or no
// answer in time: back to the Chancellor, who must enact.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, patchHistory, timed, withRound } from '../phase';
import { reshuffleIfLow } from '../rules';
import type { Input, State, Transition } from '../types';

export function enterVetoAsk(state: State, now: number): State {
  return go(state, 'vetoAsk', now, timed(state, 'vetoAsk'));
}

export function answerVeto(state: State, agree: boolean): State {
  if (state.round.vetoAgreed !== null) return state;
  if (!agree) return withRound(state, { vetoAgreed: false });
  const s: State = {
    ...state,
    discards: [...state.discards, ...(state.round.passed ?? [])],
    tracker: state.tracker + 1,
  };
  // R13: the session is over, so the deck is topped up now.
  return reshuffleIfLow(patchHistory(withRound(s, { vetoAgreed: true }), { veto: true }));
}

export function reduceVetoAsk(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'vetoAnswer') {
    if (event.playerId !== state.round.president) return state;
    return next(answerVeto(state, event.input.agree), event.now);
  }
  if (isTimerFor(state, event)) return next(answerVeto(state, false), event.now);
  return state;
}
