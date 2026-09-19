// The hand floors across every deck setting, table size and a spread of seeds (loop #472 found
// the quality floor could be missed on one seed; this keeps the sweep in the suite).
import { describe, expect, it } from 'vitest';
import { GOOD_FLOOR, KIND_FLOOR } from '../server/cards';
import { WHITE_KINDS, whiteServes, whiteTier } from '../server/content';
import { playRound, start, timer } from './helpers';

const DECKS = ['mild', 'adults', 'wild', 'wild-only'] as const;
/** Pools with no tiered cards yet: mild and crude carry no `tier`, so only wild supplies great cards. */
const UNTIERED = ['mild ', 'adults '];

function sweep(check: (hand: readonly string[], where: string) => void): void {
  for (const decks of DECKS) {
    for (const players of [3, 8, 12]) {
      for (let seed = 1; seed <= 6; seed++) {
        let s = start({ players, decks, seed, rounds: 5 });
        for (let round = 1; round <= 5; round++) {
          for (const id of Object.keys(s.players))
            check(s.hands[id] ?? [], `${decks} p${players} s${seed} r${round} ${id}`);
          s = timer(playRound(s));
          if (s.phase.id === 'final' || s.phase.id === 'done') break;
        }
      }
    }
  }
}

describe('hand floors', () => {
  it('every hand holds two of each kind, whatever the deck, table or seed', () => {
    sweep((hand, where) => {
      for (const k of WHITE_KINDS) {
        const n = hand.filter((c) => whiteServes(c).includes(k)).length;
        expect(n, `${where} ${k}`).toBeGreaterThanOrEqual(KIND_FLOOR);
      }
    });
  });

  it('every hand holds five great cards wherever the pool has tiers', () => {
    sweep((hand, where) => {
      if (UNTIERED.some((d) => where.startsWith(d))) return;
      const good = hand.filter((c) => whiteTier(c) >= 3).length;
      expect(good, where).toBeGreaterThanOrEqual(GOOD_FLOOR);
    });
  });
});
