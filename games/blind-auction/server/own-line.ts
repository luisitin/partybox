// A phone's own line at the reveal ("You called it! +40"), and the two helpers the views share
// with it: whether the box has turned for the room, and a player's gain or loss on it.
import { peekPaid } from './phases/bet';
import { returned } from './returns';
import type { State } from './types';
import type { OwnLine } from './view-types';

export function opened(state: State): boolean {
  return state.phase.id === 'open' && state.r.step === 1;
}

/** A player's real gain or loss on this box: what came back less the stake, less a peek's price. */
export function deltaOf(state: State, id: string): number {
  const bet = state.r.bets[id];
  const staked = bet && bet.amount > 0 ? returned(state, id) - bet.amount : 0;
  return staked - peekPaid(state, id);
}

/** Everyone whose coins this box moves: the bettors and the peekers. */
export function movers(state: State): string[] {
  const ids = Object.keys(state.r.bets).filter((id) => (state.r.bets[id]?.amount ?? 0) > 0);
  return [...new Set([...ids, ...Object.keys(state.r.peeks ?? {})])];
}

export function ownLine(state: State, me: string): OwnLine | null {
  if (!opened(state)) return null;
  const bet = state.r.bets[me];
  const delta = deltaOf(state, me);
  if (!bet || bet.amount <= 0) return { kind: 'sat', delta };
  const back = returned(state, me);
  const inside = state.boxes[state.r.idx]?.outcome;
  if ((bet.option === inside || bet.also === inside) && delta > 0)
    return {
      kind: 'won',
      option: inside ?? bet.option,
      amount: bet.amount,
      back,
      delta,
      ...(bet.doubled && state.r.flips?.[me] === true ? { doubled: true } : {}),
    };
  // The shell game's all-right / all-wrong pot: every stake goes back.
  if (back === bet.amount) return { kind: 'back', amount: bet.amount, delta };
  // Double or nothing: a right call the coin took away.
  const busted = bet.doubled === true && state.r.flips?.[me] === false;
  return {
    kind: 'lost',
    option: bet.option,
    amount: bet.amount,
    delta,
    ...(busted ? { busted } : {}),
  };
}
