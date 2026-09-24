// Phase "sold" (SPEC §8.4–8.6): who won and what they paid. Sealed: the bids rise lowest to
// highest, 0.4 s apart, a tie line if the top was tied, then the SOLD stamp. Live: the hammer
// falls on the final bid. The winner pays the bank on entry; nobody else pays. Two beats in one
// phase (ADR-033): step 0 builds the stage; step 1 is the stamp — the phones get their own line
// only then, and "Sold, for ninety coins." plays on it if it is ready (else the "Sold!" clip).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { resolveSealed } from '../auction';
import type { Sale } from '../auction';
import { soldRequest } from '../speech';
import {
  HAMMER_MS,
  LADDER_LEAD_MS,
  SOLD_HOLD_MS,
  TIE_HOLD_MS,
  UNSOLD_HOLD_MS,
  VOICE_BEAT_MS,
  ladderStepMs,
} from '../timing';
import type { Input, State, Transition } from '../types';

/** Positive bids, lowest first (the ladder's order). Equal bids: seat order, except the winner of a
 *  tie, who tops their rung (the ladder always ends on the SOLD bid). */
export function ladder(state: State): { id: string; amount: number }[] {
  const won = (id: string): number => (id === state.l.winner ? 1 : 0);
  return state.seats
    .filter((id) => (state.l.bids[id] ?? 0) > 0)
    .map((id) => ({ id, amount: state.l.bids[id] ?? 0 }))
    .sort((a, b) => a.amount - b.amount || won(a.id) - won(b.id));
}

/** How long the stage builds before the stamp. */
export function buildMs(state: State): number {
  if (state.cfg.live) return HAMMER_MS;
  const n = ladder(state).length;
  return LADDER_LEAD_MS + n * ladderStepMs(n) + (state.l.tie ? TIE_HOLD_MS : 0);
}

function pay(state: State, sale: Sale): State {
  const winner = sale.winner;
  if (!winner) return state;
  const stats = state.stats[winner];
  return {
    ...state,
    coins: { ...state.coins, [winner]: Math.max(0, (state.coins[winner] ?? 0) - sale.price) },
    stats: stats
      ? {
          ...state.stats,
          [winner]: {
            ...stats,
            biggestBid: Math.max(stats.biggestBid, sale.price),
            spent: stats.spent + sale.price,
          },
        }
      : state.stats,
  };
}

export function enterSold(state: State, now: number): State {
  let sale: Sale;
  let rng = state.rng;
  if (state.cfg.live) {
    const high = state.l.high;
    sale = { winner: high?.by ?? null, price: high?.amount ?? 0, tie: false };
  } else {
    [sale, rng] = resolveSealed(state, state.rng);
  }
  const paid = pay({ ...state, rng }, sale);
  const staged: State = {
    ...paid,
    notices: {},
    l: { ...paid.l, winner: sale.winner, price: sale.price, tie: sale.tie, step: 0, voiceAt: null },
  };
  return enterPhase(staged, 'sold', now, buildMs(staged));
}

/** Step 1: the stamp lands. The price reading plays now if it is ready. */
function stamp(state: State, now: number): State {
  const key = soldRequest(state)?.key;
  const ms = key ? state.speechMs[key] : undefined;
  const voiced = ms !== undefined && ms >= 0;
  const hold = !state.l.winner
    ? UNSOLD_HOLD_MS
    : voiced
      ? Math.max(SOLD_HOLD_MS, ms + VOICE_BEAT_MS)
      : SOLD_HOLD_MS;
  return {
    ...state,
    phase: { ...state.phase, deadline: now + hold },
    l: { ...state.l, step: 1, voiceAt: voiced ? now : null },
  };
}

export function reduceSold(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  return state.l.step === 0 ? stamp(state, event.now) : next(state, event.now);
}
