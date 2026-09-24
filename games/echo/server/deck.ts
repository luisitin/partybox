// The deck and its three piles (§7.7), derived from the finished turns so a VIP "That counts"
// can rewrite one turn and everything downstream follows.
import type { Outcome, State, Turn } from './types';

export interface Piles {
  won: string[];
  lost: string[];
  /** Words not played yet (the current one included while it is being played). */
  left: number;
}

export function piles(state: Pick<State, 'turns' | 'deck'>): Piles {
  const won: string[] = [];
  const lost: string[] = [];
  let used = 0;
  for (const t of state.turns) {
    used += 1 + (t.burned ? 1 : 0);
    if (t.result === 'right') won.push(t.word);
    else lost.push(t.word);
    if (t.burned) lost.push(t.burned);
    if (t.unwon) {
      const at = won.indexOf(t.unwon);
      if (at >= 0) won.splice(at, 1);
      lost.push(t.unwon);
    }
  }
  return { won, lost, left: Math.max(0, state.deck.length - used) };
}

/** Where the next word sits in the deck after the finished turns. */
export function nextIdx(state: Pick<State, 'turns'>): number {
  return state.turns.reduce((n, t) => n + 1 + (t.burned ? 1 : 0), 0);
}

/**
 * The turn record for the word on the table given its outcome: a wrong guess burns the next
 * word, or — on the last word — sends the most recent won word to the lost pile.
 */
export function settle(
  state: State,
  result: Outcome,
  byVip: boolean,
  kept: string[],
  echoed: string[],
): Turn {
  const { idx, word, guesser } = state.w;
  const base: Turn = {
    word: word.id,
    guesser,
    result,
    byVip,
    burned: null,
    unwon: null,
    kept,
    echoed,
  };
  if (result !== 'wrong') return base;
  const after = state.deck[idx + 1];
  if (after) return { ...base, burned: after.id };
  const { won } = piles({ turns: state.turns, deck: state.deck });
  return { ...base, unwon: won[won.length - 1] ?? null };
}

export type RatingId = 'flawless' | 'brilliant' | 'great' | 'solid' | 'warming' | 'again';

export const RATINGS: { id: RatingId; icon: string; label: string; min: number }[] = [
  { id: 'flawless', icon: '🏆', label: 'Flawless', min: 1 },
  { id: 'brilliant', icon: '🌟', label: 'Brilliant', min: 0.85 },
  { id: 'great', icon: '🎉', label: 'Great', min: 0.7 },
  { id: 'solid', icon: '👍', label: 'Solid', min: 0.55 },
  { id: 'warming', icon: '🔥', label: 'Warming up', min: 0.3 },
  { id: 'again', icon: '🔁', label: 'Try again!', min: 0 },
];

export function ratingOf(won: number, deckSize: number): RatingId {
  const share = deckSize > 0 ? won / deckSize : 0;
  if (won >= deckSize && deckSize > 0) return 'flawless';
  for (const r of RATINGS.slice(1)) if (share >= r.min) return r.id;
  return 'again';
}

/** Great or better crowns everyone (§7.7). */
export function crowns(rating: RatingId): boolean {
  return rating === 'flawless' || rating === 'brilliant' || rating === 'great';
}
