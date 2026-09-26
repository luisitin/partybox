// Hidden information, proved by non-interference (audit #24): re-roll every secret a viewer may
// not know and the view must be byte-identical. Outcomes: every view, the bot and the speech
// requests until the box opens. Bets: other phones and the TV before `open`.
import { createRng } from '@partybox/game-sdk';
import type { Settings } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { State } from '../server/types';
import { playThrough } from './helpers';

/** Is this state's current box still closed to the room? */
const closed = (s: State): boolean =>
  s.phase.id === 'rules' ||
  s.phase.id === 'box' ||
  s.phase.id === 'bet' ||
  (s.phase.id === 'open' && s.r.step === 0);

/** Every box not yet opened gets a different stored outcome. */
function reroll(s: State): State {
  const openedUpTo = closed(s) ? s.r.idx - 1 : s.r.idx;
  const boxes = s.boxes.map((b, i) =>
    i <= openedUpTo || b.box.options.length < 2
      ? b
      : { ...b, outcome: (b.outcome + 1) % b.box.options.length },
  );
  return { ...s, boxes };
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
    ['default', {}],
    ['spicy, 12 boxes', { spicy: true, rounds: 12 }],
  ];
  for (const [label, settings] of runs)
    it(`${label}: until the box opens, no view, bot or speech request depends on what is inside`, () => {
      let checked = 0;
      for (const seed of [1, 2, 3]) {
        for (const s of playThrough(seed, 5, settings)) {
          // `open` step 0 settled the coins already: only the views are gated there, so compare
          // views before `open`, and at step 0 the TV/phones through their gated fields.
          if (!closed(s) || s.phase.id === 'open') continue;
          const other = reroll(s);
          expect(views(other)).toBe(views(s));
          for (const id of s.seats)
            expect(game.bot.sampleInput(other, id, createRng(9))).toEqual(
              game.bot.sampleInput(s, id, createRng(9)),
            );
          checked++;
        }
      }
      expect(checked).toBeGreaterThan(40);
    });

  it('at `open` step 0 no view shows the outcome, a result or moved coins', () => {
    let checked = 0;
    for (const s of playThrough(8, 5)) {
      if (s.phase.id !== 'open' || s.r.step !== 0) continue;
      const tv = game.tvView(s);
      expect([tv.outcome, tv.results]).toEqual([null, null]);
      for (const id of s.seats) {
        const cv = game.controllerView(s, id);
        expect([cv.outcome, cv.line]).toEqual([null, null]);
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(3);
  });

  it("bets stay on the bettor's phone until `open`", () => {
    let checked = 0;
    for (const s of playThrough(4, 6)) {
      if (s.phase.id !== 'bet') continue;
      for (const viewer of s.seats) {
        const bets = { ...s.r.bets };
        for (const id of Object.keys(bets))
          if (id !== viewer) bets[id] = { option: 0, amount: ((bets[id]?.amount ?? 0) + 5) % 50 };
        const other: State = { ...s, r: { ...s.r, bets } };
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
});
