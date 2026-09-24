// Hidden information (SPEC §8.8, §8.18), proved by non-interference (audit #24): re-roll every
// secret a viewer may not know and the view must be byte-identical. Outcomes: every view, the bot
// and the speech requests before the flip. Sealed bids: other phones and the TV before `sold`.
import { createRng } from '@partybox/game-sdk';
import type { Settings } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { State } from '../server/types';
import { playThrough } from './helpers';

/** Every lot not yet flipped gets a different stored outcome. */
function reroll(s: State): State {
  const flippedUpTo = s.phase.id === 'flip' || s.phase.id === 'done' ? s.l.idx : s.l.idx - 1;
  const lots = s.lots.map((lot, i) =>
    i <= flippedUpTo || lot.item.outcomes.length < 2
      ? lot
      : { ...lot, outcome: (lot.outcome + 1) % lot.item.outcomes.length },
  );
  return { ...s, lots };
}

const views = (s: State): string =>
  JSON.stringify([
    game.tvView(s),
    ...s.seats.map((id) => game.controllerView(s, id)),
    game.controllerView(s, 'spectator'),
    (game.speech?.(s) ?? []).map((r) => r.key),
  ]);

describe('secrets never reach a view early', () => {
  const runs: [string, Settings][] = [
    ['sealed', {}],
    ['live', { style: 'live' }],
    ['wild + spicy', { chaos: 'wild', spicy: true, lots: 12 }],
  ];
  for (const [label, settings] of runs)
    it(`${label}: before the flip no view, bot or speech request depends on the outcome`, () => {
      let checked = 0;
      for (const seed of [1, 2, 3]) {
        for (const s of playThrough(seed, 5, settings)) {
          if (s.phase.id === 'flip' || s.phase.id === 'done') continue;
          const other = reroll(s);
          expect(views(other)).toBe(views(s));
          for (const id of s.seats) {
            const a = game.bot.sampleInput(s, id, createRng(9));
            expect(game.bot.sampleInput(other, id, createRng(9))).toEqual(a);
          }
          checked++;
        }
      }
      expect(checked).toBeGreaterThan(50);
    });

  it("sealed bids stay on the bidder's phone until `sold`", () => {
    let checked = 0;
    for (const s of playThrough(4, 6)) {
      if (s.phase.id !== 'bid') continue;
      for (const viewer of s.seats) {
        const bids = { ...s.l.bids };
        for (const id of Object.keys(bids))
          if (id !== viewer) bids[id] = ((bids[id] ?? 0) + 35) % 100;
        const other: State = { ...s, l: { ...s.l, bids } };
        expect(JSON.stringify(game.controllerView(other, viewer))).toBe(
          JSON.stringify(game.controllerView(s, viewer)),
        );
        expect(JSON.stringify(game.tvView(other))).toBe(JSON.stringify(game.tvView(s)));
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(10);
  });

  it('never more than 10 readings pending (P00 §5.7)', () => {
    for (const s of playThrough(6, 4, {}, false))
      expect((game.speech?.(s) ?? []).length).toBeLessThanOrEqual(10);
  });

  it('an own line reaches a phone only once the TV has shown it (step 1)', () => {
    for (const s of playThrough(7, 5)) {
      if (s.phase.id !== 'sold' && s.phase.id !== 'flip') continue;
      for (const id of s.seats) {
        const line = game.controllerView(s, id).line;
        expect(line === null).toBe(s.l.step === 0);
      }
    }
  });
});
