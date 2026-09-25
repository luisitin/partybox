// Phase "bet": everyone secretly picks what they think is inside and how many coins to put on it
// (0 = sit this one out); a resend changes it. A player who is broke is topped up to 10 coins so
// nobody spends the game watching. Ends when every connected player has bet, at `betSeconds`, or
// on the VIP's skip. A stake above your coins, or a content the box doesn't have, is refused.
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { PITY_COINS } from '../timing';
import type { Input, State, Transition } from '../types';
import { teamOf } from './tug';

export function inGame(state: State, id: string): boolean {
  return Object.hasOwn(state.players, id) && !state.left.includes(id);
}

export function enterBet(state: State, now: number): State {
  const broke = state.seats.filter((id) => inGame(state, id) && (state.coins[id] ?? 0) <= 0);
  const coins = { ...state.coins };
  for (const id of broke) coins[id] = PITY_COINS;
  return enterPhase(
    { ...state, coins, r: { ...state.r, topped: broke } },
    'bet',
    now,
    state.cfg.betSeconds * 1000,
  );
}

export function betsAllIn(state: State): boolean {
  return allConnectedDone(state, Object.keys(state.r.bets));
}

export function reduceBet(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'bet') return state;
  const id = event.playerId;
  if (!inGame(state, id)) return state;
  const { option, amount } = event.input;
  const have = state.coins[id] ?? 0;
  const box = state.boxes[state.r.idx]?.box;
  // Hot potato: you cannot bet on yourself holding it (you could just keep it).
  const self = box?.event === 'potato' && amount > 0 && state.seats[option] === id;
  // Tug of war: you back your own team (your taps pull for it).
  const team = box?.event === 'tug' ? teamOf(state, id) : null;
  const wrongSide = box?.event === 'tug' && amount > 0 && team !== option;
  const code =
    amount > have
      ? 'over'
      : !box || option >= box.options.length || wrongSide
        ? 'option'
        : self
          ? 'self'
          : null;
  if (code) return { ...state, notices: { ...state.notices, [id]: { code, have, at: event.now } } };
  const { [id]: _cleared, ...notices } = state.notices;
  const after: State = {
    ...state,
    notices,
    r: { ...state.r, bets: { ...state.r.bets, [id]: { option, amount } } },
  };
  return betsAllIn(after) ? next(after, event.now) : after;
}
