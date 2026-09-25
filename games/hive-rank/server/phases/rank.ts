// Phase "rank": everyone taps the five things into order on their phone. A resent order replaces
// the earlier one. Ends when every connected player has an order, at the deadline, or on a VIP
// skip. Only a permutation of the round's five ids counts (anything else is ignored).
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isPermutation } from '../hive';
import { newRound, question, sayReady } from '../round';
import type { Input, State, Transition } from '../types';

export function enterRank(state: State, now: number, n: number): State {
  const round: State = { ...state, q: newRound(n) };
  const ready: State = { ...round, q: { ...round.q, sayOk: sayReady(round) } };
  return enterPhase(ready, 'rank', now, state.settings.rankSeconds * 1000);
}

/** Everyone still here has locked in (and somebody has). */
export function rankDone(state: State): boolean {
  const ids = Object.keys(state.q.orders);
  return ids.length > 0 && allConnectedDone(state, ids);
}

export function reduceRank(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'order') return state;
  const ids = question(state)?.items.map((i) => i.id) ?? [];
  if (!hasPlayer(state, event.playerId) || !isPermutation(event.input.items, ids)) return state;
  const after: State = {
    ...state,
    q: { ...state.q, orders: { ...state.q.orders, [event.playerId]: [...event.input.items] } },
  };
  return rankDone(after) ? next(after, event.now) : after;
}
