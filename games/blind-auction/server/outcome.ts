// The flip (SPEC §8.3, §8.7, §8.17): the lot's stored outcome applies to the winner — and to the
// victim of a heist or the partner of a swap, both chosen now with the rng. Coins never go below 0.
import { nextInt } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { byId, inGame } from './auction';
import type { Effect, State, Stats } from './types';

function pickOne(ids: string[], rng: RngState): [string | null, RngState] {
  if (ids.length === 0) return [null, rng];
  if (ids.length === 1) return [ids[0] ?? null, rng];
  const [i, next] = nextInt(rng, 0, ids.length - 1);
  return [ids[i] ?? null, next];
}

/** The richest other player still in the game; a tie is broken by the rng. */
function richestOther(state: State, winner: string, rng: RngState): [string | null, RngState] {
  const others = state.seats.filter((id) => id !== winner && inGame(state, id));
  if (others.length === 0) return [null, rng];
  const top = Math.max(...others.map((id) => state.coins[id] ?? 0));
  return pickOne(others.filter((id) => (state.coins[id] ?? 0) === top).sort(byId), rng);
}

function bump(stats: Stats, change: Partial<Stats>): Stats {
  return { ...stats, ...change };
}

/** Applies the current lot's outcome. With no winner nothing moves: the effect is `none`. */
export function applyOutcome(state: State): State {
  const { l } = state;
  const lot = state.lots[l.idx];
  const winner = l.winner;
  if (!lot || !winner) {
    const none: Effect = { kind: 'none', amount: 0, other: null, before: { winner: 0, other: 0 } };
    return { ...state, l: { ...l, effect: none } };
  }
  const outcome = lot.item.outcomes[lot.outcome];
  const coins = { ...state.coins };
  const mine = coins[winner] ?? 0;
  let rng = state.rng;
  let effect: Effect = { kind: 'dud', amount: 0, other: null, before: { winner: mine, other: 0 } };
  switch (outcome?.type) {
    case 'gain':
      coins[winner] = mine + outcome.amount;
      effect = { ...effect, kind: 'gain', amount: outcome.amount };
      break;
    case 'lose': {
      const lost = Math.min(mine, outcome.amount);
      coins[winner] = mine - lost;
      effect = { ...effect, kind: 'lose', amount: lost };
      break;
    }
    case 'double':
      coins[winner] = mine + 2 * l.price;
      effect = { ...effect, kind: 'double', amount: 2 * l.price };
      break;
    case 'refund':
      coins[winner] = mine + l.price;
      effect = { ...effect, kind: 'refund', amount: l.price };
      break;
    case 'steal': {
      const [victim, next] = richestOther(state, winner, rng);
      rng = next;
      const theirs = victim ? (coins[victim] ?? 0) : 0;
      const taken = Math.floor((theirs * outcome.percent) / 100);
      if (victim) coins[victim] = theirs - taken;
      coins[winner] = mine + taken;
      effect = {
        kind: 'steal',
        amount: taken,
        other: victim,
        before: { winner: mine, other: theirs },
      };
      break;
    }
    case 'swap': {
      const partners = state.seats.filter((id) => id !== winner && inGame(state, id)).sort(byId);
      const [partner, next] = pickOne(partners, rng);
      rng = next;
      if (!partner) break; // nobody to swap with: a dud (§8.17)
      const theirs = coins[partner] ?? 0;
      coins[partner] = mine;
      coins[winner] = theirs;
      effect = {
        kind: 'swap',
        amount: Math.abs(theirs - mine),
        other: partner,
        before: { winner: mine, other: theirs },
      };
      break;
    }
    default:
      break;
  }
  return {
    ...state,
    rng,
    coins,
    stats: tally(state, winner, mine, coins[winner] ?? 0, effect),
    l: { ...l, effect },
  };
}

/** Awards bookkeeping for one flip (§8.7): profit, thief gains, trap losses. */
function tally(
  state: State,
  winner: string,
  before: number,
  after: number,
  effect: Effect,
): State['stats'] {
  const stats = { ...state.stats };
  const own = stats[winner];
  if (!own) return stats;
  const gained = after - before;
  const profit = gained - state.l.price;
  let next = bump(own, {
    bestProfit: own.bestProfit === null ? profit : Math.max(own.bestProfit, profit),
  });
  if (effect.kind === 'steal' || effect.kind === 'swap')
    next = bump(next, { thief: next.thief + Math.max(0, gained) });
  if (effect.kind === 'lose')
    next = bump(next, { trapped: next.trapped + effect.amount, traps: next.traps + 1 });
  stats[winner] = next;
  return stats;
}
