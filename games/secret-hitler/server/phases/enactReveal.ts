// Phase "enactReveal" (R11, R20, R4): the government's policy lands on its track; the tracker
// resets; the 5th Fascist policy unlocks the veto (R14); the 5th Liberal or 6th Fascist wins.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { enactOnBoard, go, headlined, patchHistory } from '../phase';
import { policyWinner, reshuffleIfLow } from '../rules';
import { REVEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterEnactReveal(state: State, now: number): State {
  const card = state.round.enacted;
  if (card === null) return go(state, 'enactReveal', now, REVEAL_MS.enactReveal);
  let s = patchHistory(enactOnBoard(state, card), { enacted: card });
  const won = policyWinner(s.board);
  if (won)
    s = {
      ...s,
      winner: won,
      winReason: won === 'liberals' ? 'liberalPolicies' : 'fascistPolicies',
    };
  s = headlined(
    s,
    won
      ? won === 'liberals'
        ? 'liberalPolicies'
        : 'fascistPolicies'
      : card === 'L'
        ? 'liberal'
        : s.board.F === 3
          ? 'zone'
          : 'fascist',
  );
  // R13: the session is over, so the deck is topped up now.
  return go(reshuffleIfLow(s), 'enactReveal', now, REVEAL_MS.enactReveal);
}

export function reduceEnactReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
