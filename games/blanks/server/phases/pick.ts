// Phase "pick" (czar mode only): the judge chooses this round's black card from three. The TV
// shows the three; the judge's phone lets them tap one; everyone else waits. Exits on the choice,
// on the deadline (20 s timed, a hidden 60 s fallback untimed — the first card is the default), or
// on VIP skip; a judge who is gone never holds it (flow.ts closes it on entry).
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { chooseBlack, isCzar } from '../round';
import { PICK_MS, UNTIMED_PICK_MS } from '../types';
import type { Input, State } from '../types';
import type { Transition } from './intro';

export function enterPick(state: State, now: number): State {
  return enterPhase(state, 'pick', now, state.settings.timed ? PICK_MS : UNTIMED_PICK_MS);
}

export function reducePick(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type !== 'choose') return state;
    if (!hasPlayer(state, event.playerId) || !isCzar(state, event.playerId)) return state;
    const after = chooseBlack(state, event.input.index);
    return after === state ? state : next(after, event.now);
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
