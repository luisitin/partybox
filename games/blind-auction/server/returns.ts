// What a bet gives back when the box opens — one rule for the settlement (open.ts) and the views,
// so the coins and the own lines never disagree. Boxes and most events pay by the odds; the shell
// game (the owner's spec) is a shared pot: the right calls split everything staked, in proportion
// to their stakes; if everyone is wrong, or everyone is right, every stake goes back.
import { payout } from './odds';
import { blackjackReturn } from './phases/hands';
import { KENO_PAY } from './timing';
import type { State } from './types';

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
    const rightTotal = right.reduce((s, b) => s + b.amount, 0);
    return Math.floor((pot * bet.amount) / rightTotal);
  }
  if (round.box.event === 'blackjack') return blackjackReturn(state, id, bet.amount);
  if (round.box.event === 'keno') {
    const drawn = round.detail ?? [];
    const matches = (state.r.spots?.[id] ?? []).filter((n) => drawn.includes(n)).length;
    return Math.floor(bet.amount * (KENO_PAY[matches] ?? 0));
  }
  const option = round.box.options[bet.option];
  if (bet.option !== round.outcome || !option) return 0;
  return payout(bet.amount, option.pay, round.box.grand);
}
