// Phase "bet": everyone secretly picks what they think is inside and how many coins to put on it
// (0 = sit this one out); a resend changes it. A player who is broke is topped up to 10 coins so
// nobody spends the game watching. Ends when every connected player has bet, at `betSeconds`, or
// on the VIP's skip. A stake above your coins, or a content the box doesn't have, is refused.
import { allConnectedDone, enterPhase, isTimerFor, nextFloat } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { PITY_COINS } from '../timing';
import { insuranceFee, peekPrice } from '../odds';
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
    { ...state, coins, r: { ...state.r, topped: broke, betOpenedAt: now } },
    'bet',
    now,
    state.cfg.betSeconds * 1000,
  );
}

export function betsAllIn(state: State): boolean {
  return allConnectedDone(state, Object.keys(state.r.bets));
}

/** What this player has paid to peek on the current box (0 if they didn't). */
export function peekPaid(state: State, id: string): number {
  const box = state.boxes[state.r.idx]?.box;
  return box && Object.hasOwn(state.r.peeks ?? {}, id) ? peekPrice(box.options.length) : 0;
}

/** The peek twist: rule out one wrong option at random, for this player only, if they can pay. */
function peek(state: State, id: string, now: number): State {
  const round = state.boxes[state.r.idx];
  if (!inGame(state, id) || round?.box.twist !== 'peek' || Object.hasOwn(state.r.peeks ?? {}, id))
    return state;
  const have = state.coins[id] ?? 0;
  const bet = state.r.bets[id];
  const staked = (bet?.amount ?? 0) + (bet?.insured ? insuranceFee(bet.amount) : 0);
  if (staked + peekPrice(round.box.options.length) > have)
    return { ...state, notices: { ...state.notices, [id]: { code: 'over', have, at: now } } };
  const wrong = round.box.options.map((_, i) => i).filter((i) => i !== round.outcome);
  const [f, rng] = nextFloat(state.rng);
  const out = wrong[Math.min(wrong.length - 1, Math.floor(f * wrong.length))] ?? 0;
  return { ...state, rng, r: { ...state.r, peeks: { ...state.r.peeks, [id]: out } } };
}

export function reduceBet(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type === 'input' && event.input.type === 'peek')
    return peek(state, event.playerId, event.now);
  if (event.type === 'input' && event.input.type === 'spots') {
    const id = event.playerId;
    const spots = [...new Set(event.input.spots)];
    const box = state.boxes[state.r.idx]?.box;
    if (!inGame(state, id) || box?.event !== 'keno' || spots.length !== 3) return state;
    return { ...state, r: { ...state.r, spots: { ...state.r.spots, [id]: spots } } };
  }
  if (event.type !== 'input' || event.input.type !== 'bet') return state;
  const id = event.playerId;
  if (!inGame(state, id)) return state;
  const { option, amount } = event.input;
  const insured = event.input.insured === true && state.boxes[state.r.idx]?.box.twist === 'insure';
  const doubled = event.input.doubled === true && state.boxes[state.r.idx]?.box.twist === 'double';
  // Split: a second pick, only on its twist, never the first pick again, and 2+ coins to halve.
  const also =
    state.boxes[state.r.idx]?.box.twist === 'split' &&
    event.input.also !== undefined &&
    event.input.also !== option &&
    amount >= 2
      ? event.input.also
      : undefined;
  const have = state.coins[id] ?? 0;
  const box = state.boxes[state.r.idx]?.box;
  // Hot potato: you cannot bet on yourself holding it (you could just keep it).
  const self = box?.event === 'potato' && amount > 0 && state.seats[option] === id;
  // Tug of war: you back your own team (your taps pull for it).
  const team = box?.event === 'tug' ? teamOf(state, id) : null;
  const wrongSide = box?.event === 'tug' && amount > 0 && team !== option;
  // Keno: pick your three numbers before you stake.
  const noSpots = box?.event === 'keno' && amount > 0 && (state.r.spots?.[id]?.length ?? 0) !== 3;
  const code =
    amount + (insured ? insuranceFee(amount) : 0) + peekPaid(state, id) > have
      ? 'over'
      : !box || option >= box.options.length || (also ?? 0) >= box.options.length || wrongSide
        ? 'option'
        : self
          ? 'self'
          : noSpots
            ? 'spots'
            : null;
  if (code) return { ...state, notices: { ...state.notices, [id]: { code, have, at: event.now } } };
  const { [id]: _cleared, ...notices } = state.notices;
  const after: State = {
    ...state,
    notices,
    r: {
      ...state.r,
      bets: {
        ...state.r.bets,
        [id]: {
          option,
          amount,
          at: event.now,
          ...(insured ? { insured } : {}),
          ...(also !== undefined ? { also } : {}),
          ...(doubled ? { doubled } : {}),
        },
      },
    },
  };
  return betsAllIn(after) ? next(after, event.now) : after;
}
