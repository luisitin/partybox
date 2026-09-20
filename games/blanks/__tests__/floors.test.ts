// The hand floors across every deck setting, table size and a spread of seeds (loop #472 found
// the quality floor could be missed on one seed; this keeps the sweep in the suite). Since loop
// 521 every pool is tiered, so the quality floors apply to mild and adults rooms too.
import { describe, expect, it } from 'vitest';
import { BEST_FLOOR, FIT_FLOOR, FIT_FLOOR_SCORE, GOOD_FLOOR, KIND_FLOORS } from '../server/deal';
import {
  WHITE_KINDS,
  blackCard,
  blackSlot,
  whiteKind,
  whiteServes,
  whiteText,
  whiteTier,
} from '../server/content';
import { fitScore } from '../server/fit';
import { answerers } from '../server/round';
import { playRound, start, timer, toAnswer } from './helpers';

const DECKS = ['mild', 'adults', 'wild', 'wild-only'] as const;

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
        expect(n, `${where} ${k}`).toBeGreaterThanOrEqual(KIND_FLOORS[k]);
      }
    });
  });

  it('every hand holds a card that reads first as each leading kind', () => {
    sweep((hand, where) => {
      for (const k of WHITE_KINDS) {
        if (k === 'name') continue; // only ever a second reading
        expect(
          hand.some((c) => whiteKind(c) === k),
          `${where} ${k}`,
        ).toBe(true);
      }
    });
  });

  it('every hand holds five great cards, two of them amazing, in every pool (all decks are tiered since loop 521)', () => {
    sweep((hand, where) => {
      const good = hand.filter((c) => whiteTier(c) >= 3).length;
      expect(good, where).toBeGreaterThanOrEqual(GOOD_FLOOR);
      const best = hand.filter((c) => whiteTier(c) === 4).length;
      expect(best, `${where} amazing`).toBeGreaterThanOrEqual(BEST_FLOOR);
    });
  });

  it('once the prompt is known, every answerer holds five cards that read well in its blank (owner, 2026-09-19)', () => {
    let rounds = 0;
    let verbRounds = 0;
    for (const decks of DECKS) {
      for (const players of [3, 8, 12]) {
        for (let seed = 1; seed <= 6; seed++) {
          let s = start({ players, decks, seed, rounds: 5 });
          for (let round = 1; round <= 5; round++) {
            const a = toAnswer(s);
            const slot = blackSlot(a.blackId);
            const black = blackCard(a.blackId).text;
            rounds++;
            if (slot === 'doing') verbRounds++;
            for (const id of answerers(a)) {
              const hand = a.hands[id] ?? [];
              const fits = hand.filter(
                (c) => fitScore(slot, whiteServes(c), whiteText(c), black) >= FIT_FLOOR_SCORE,
              ).length;
              expect(
                fits,
                `${decks} p${players} s${seed} r${round} ${id} "${black}" (${slot})`,
              ).toBeGreaterThanOrEqual(FIT_FLOOR);
              // The other floors survive the fit swap.
              for (const k of WHITE_KINDS)
                expect(
                  hand.filter((c) => whiteServes(c).includes(k)).length,
                ).toBeGreaterThanOrEqual(KIND_FLOORS[k]);
              expect(hand.filter((c) => whiteTier(c) >= 3).length).toBeGreaterThanOrEqual(
                GOOD_FLOOR,
              );
            }
            s = timer(playRound(s));
            if (s.phase.id === 'final' || s.phase.id === 'done') break;
          }
        }
      }
    }
    expect(verbRounds, `${verbRounds} verb rounds of ${rounds}`).toBeGreaterThan(20);
  });
});
