// Phase "pick" (czar mode only): the judge chooses this round's black card from three. The TV
// shows the three; the judge's phone lets them tap one; everyone else waits. Exits on the choice,
// on the deadline (20 s timed, a hidden 60 s fallback untimed — the first card is the default), or
// on VIP skip; a judge who is gone never holds it (flow.ts closes it on entry).
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { chooseBlack, isCzar } from '../round';
import { PICK_HOLD_MS, PICK_MS, UNTIMED_PICK_MS } from '../types';
import type { Input, State } from '../types';
import type { Transition } from './intro';

export function enterPick(state: State, now: number): State {
  // The card is chosen when the phase ends: nothing is settled while the judge is deciding.
  const open: State = { ...state, blackId: null };
  return enterPhase(open, 'pick', now, state.settings.timed ? PICK_MS : UNTIMED_PICK_MS);
}

export function reducePick(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type !== 'choose') return state;
    if (!hasPlayer(state, event.playerId) || !isCzar(state, event.playerId)) return state;
    // A choice is final: a second one must not push the beat's deadline out again.
    if (state.blackId !== null) return state;
    const after = chooseBlack(state, event.input.index);
    if (after === state) return state;
    // The three cards hold a beat with the chosen one lit, then picking opens (review-loop #180).
    const deadline = Math.min(state.phase.deadline ?? Infinity, event.now + PICK_HOLD_MS);
    return { ...after, phase: { ...after.phase, deadline } };
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
