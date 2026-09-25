// Phase "talk" (only when the room can talk, SPEC §1.13): 60 s of "Dinner? Really, Sam?", or the
// VIP's Start the vote (the engine's skip).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import type { Input, State, Transition } from '../types';

export function enterTalk(state: State, now: number): State {
  return enterPhase(state, 'talk', now, state.cfg.talkSeconds * 1000);
}

export function reduceTalk(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
