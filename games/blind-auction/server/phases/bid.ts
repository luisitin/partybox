// Phase "bid" (sealed, SPEC §8.6): everyone types a secret bid, 0 = pass; a resend changes it.
// Ends when every connected player has bid, at `bidSeconds`, or on the VIP's skip. A bid above
// your coins is refused with "You only have N" on that phone.
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { inGame, refuseBid } from '../auction';
import type { Input, State, Transition } from '../types';

export function enterBid(state: State, now: number): State {
  return enterPhase(
    { ...state, l: { ...state.l, openedAt: now } },
    'bid',
    now,
    state.cfg.bidSeconds * 1000,
  );
}

/** Everyone still here has a bid in: close early. */
export function bidsAllIn(state: State): boolean {
  return allConnectedDone(state, Object.keys(state.l.bids));
}

export function reduceBid(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'bid') return state;
  const id = event.playerId;
  if (!inGame(state, id)) return state;
  const amount = event.input.amount;
  if (refuseBid(state, id, amount)) {
    const have = state.coins[id] ?? 0;
    return { ...state, notices: { ...state.notices, [id]: { code: 'over', have, at: event.now } } };
  }
  const { [id]: _cleared, ...notices } = state.notices;
  const after: State = {
    ...state,
    notices,
    l: { ...state.l, bids: { ...state.l.bids, [id]: amount } },
  };
  return bidsAllIn(after) ? next(after, event.now) : after;
}
