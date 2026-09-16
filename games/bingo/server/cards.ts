// Cards and daubs: dealing a 5×5 card from the rng and toggling squares. Pure helpers shared by
// the intro (deal), play and check (daub) phases — phase files never import each other.
import { hasPlayer, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { FREE } from './types';
import type { State } from './types';

export const LETTERS = ['B', 'I', 'N', 'G', 'O'] as const;
export type Letter = (typeof LETTERS)[number];

export function range(from: number, to: number): number[] {
  const out: number[] = [];
  for (let n = from; n <= to; n++) out.push(n);
  return out;
}

/** B = 1–15, I = 16–30, N = 31–45, G = 46–60, O = 61–75. */
export function letterOf(n: number): Letter {
  return LETTERS[Math.min(4, Math.max(0, Math.floor((n - 1) / 15)))] as Letter;
}

/** Column c holds 5 distinct numbers from c×15+1 … c×15+15; the centre is FREE (0). */
export function dealCard(rng: RngState): [number[], RngState] {
  const card: number[] = new Array<number>(25).fill(0);
  let r = rng;
  for (let c = 0; c < 5; c++) {
    const [column, next] = shuffle(r, range(c * 15 + 1, c * 15 + 15));
    r = next;
    for (let row = 0; row < 5; row++) card[row * 5 + c] = column[row] as number;
  }
  card[FREE] = 0;
  return [card, r];
}

/** Tap = daub, tap again = undo. FREE and spectators are ignored. No validation against calls. */
export function toggleDaub(state: State, playerId: string, index: number): State {
  const round = state.round;
  if (index === FREE || !hasPlayer(state, playerId) || !Object.hasOwn(round.cards, playerId))
    return state;
  const mine = round.daubs[playerId] ?? [];
  const next = mine.includes(index)
    ? mine.filter((i) => i !== index)
    : [...mine, index].sort((a, b) => a - b);
  return { ...state, round: { ...round, daubs: { ...round.daubs, [playerId]: next } } };
}

/** Numbers called so far this round (the deck is public once drawn). */
export function calledNumbers(state: State): number[] {
  return state.round.deck.slice(0, state.round.drawn);
}
