// A phone's own line at the reveal ("You called it! +40"), and the two helpers the views share
// with it: whether the box has turned for the room, and a player's gain or loss on it.
import { returned } from './returns';
import type { State } from './types';
import type { OwnLine } from './view-types';

export function opened(state: State): boolean {
  return state.phase.id === 'open' && state.r.step === 1;
}

export function deltaOf(state: State, id: string): number {
  const bet = state.r.bets[id];
  if (!bet || bet.amount <= 0) return 0;
  return returned(state, id) - bet.amount;
}

export function ownLine(state: State, me: string): OwnLine | null {
  if (!opened(state)) return null;
  const bet = state.r.bets[me];
  if (!bet || bet.amount <= 0) return { kind: 'sat' };
  const back = deltaOf(state, me) + bet.amount;
  const inside = state.boxes[state.r.idx]?.outcome;
  if ((bet.option === inside || bet.also === inside) && back > bet.amount)
    return {
      kind: 'won',
      option: inside ?? bet.option,
      amount: bet.amount,
      back,
      ...(bet.doubled && state.r.flips?.[me] === true ? { doubled: true } : {}),
    };
  // The shell game's all-right / all-wrong pot: every stake goes back.
  if (back === bet.amount) return { kind: 'back', amount: bet.amount };
  // Double or nothing: a right call the coin took away.
  const busted = bet.doubled === true && state.r.flips?.[me] === false;
  return { kind: 'lost', option: bet.option, amount: bet.amount, ...(busted ? { busted } : {}) };
}
