// Phase "deal": a new round — word, category and imposters — and every phone holds its SecretCard.
// Ends when every connected player tapped Got it, after 12 s (a quiet timer), or on the VIP's skip.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { activeSeats, blankRound, drawImposters, imposterCount } from '../round';
import { DEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

/** Round `n` (1-based) uses the n-th drawn word; bots are ready at once (the game readies them). */
export function enterDeal(state: State, now: number, n: number): State {
  const w = Math.min(n - 1, state.words.length - 1);
  const word = state.words[w];
  const round = blankRound(n, w, { id: word?.cat ?? '', label: word?.label ?? '' });
  const withRound: State = { ...state, round };
  const drawn = drawImposters(withRound, imposterCount(state.cfg, activeSeats(state).length));
  const bots = activeSeats(drawn).filter((id) => drawn.players[id]?.bot === true);
  return enterPhase({ ...drawn, round: { ...drawn.round, ready: bots } }, 'deal', now, DEAL_MS);
}

export function reduceDeal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!hasPlayer(state, id) || !state.seats.includes(id) || state.round.ready.includes(id))
    return state;
  const after: State = { ...state, round: { ...state.round, ready: [...state.round.ready, id] } };
  return allConnectedDone(after, after.round.ready) ? next(after, event.now) : after;
}
