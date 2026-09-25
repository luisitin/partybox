// What a bet gives back when the box opens — one rule for the settlement (open.ts) and the views,
// so the coins and the own lines never disagree. Boxes and most events pay by the odds; the shell
// game (the owner's spec) is a shared pot: the right calls split everything staked, in proportion
// to their stakes; if everyone is wrong, or everyone is right, every stake goes back.
import { payout } from './odds';
import { blackjackReturn } from './phases/hands';
import { KENO_PAY } from './timing';
import type { State } from './types';

/** The pot split among the right calls by stake, largest remainder first (ties by seat order), so
 *  the shares always add up to the whole pot (review C2). */
function shellShares(state: State, pot: number): Record<string, number> {
  const round = state.boxes[state.r.idx];
  const right = state.seats.filter((id) => {
    const b = state.r.bets[id];
    return b !== undefined && b.amount > 0 && b.option === round?.outcome;
  });
  const total = right.reduce((s, id) => s + (state.r.bets[id]?.amount ?? 0), 0);
  const exact = right.map((id) => ({ id, x: (pot * (state.r.bets[id]?.amount ?? 0)) / total }));
  const out: Record<string, number> = {};
  let left = pot;
  for (const e of exact) {
    out[e.id] = Math.floor(e.x);
    left -= out[e.id] ?? 0;
  }
  const byRemainder = [...exact].sort((a, b) => b.x - Math.floor(b.x) - (a.x - Math.floor(a.x)));
  for (const e of byRemainder) {
    if (left <= 0) break;
    out[e.id] = (out[e.id] ?? 0) + 1;
    left--;
  }
  return out;
}

export function returned(state: State, id: string): number {
  const round = state.boxes[state.r.idx];
  const bet = state.r.bets[id];
  if (!round || !bet || bet.amount <= 0) return 0;
  if (round.box.event === 'shells') {
    const staked = Object.values(state.r.bets).filter((b) => b.amount > 0);
    const pot = staked.reduce((s, b) => s + b.amount, 0);
    const right = staked.filter((b) => b.option === round.outcome);
    if (right.length === 0 || right.length === staked.length) return bet.amount;
    if (bet.option !== round.outcome) return 0;
    return shellShares(state, pot)[id] ?? 0;
  }
  if (round.box.event === 'blackjack') return blackjackReturn(state, id, bet.amount);
  // Tug of war, a dead heat: every stake back.
  if (round.box.event === 'tug' && state.r.draw) return bet.amount;
  if (round.box.event === 'keno') {
    const drawn = round.detail ?? [];
    const matches = (state.r.spots?.[id] ?? []).filter((n) => drawn.includes(n)).length;
    return Math.floor(bet.amount * (KENO_PAY[matches] ?? 0));
  }
  const option = round.box.options[bet.option];
  if (bet.option !== round.outcome || !option) return 0;
  return payout(bet.amount, option.pay, round.box.grand);
}
