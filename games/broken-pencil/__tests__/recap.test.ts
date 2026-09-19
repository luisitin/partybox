// The recap the host writes (ADR-035): every page of every book in order, each drawing as an SVG
// file the markdown references, the chain line and the verdict.
import { describe, expect, it } from 'vitest';
import { encodePoints } from '../server/encoding';
import { drawingSvg, recap } from '../server/recap';
import type { State } from '../server/types';
import { game } from '../server/index';

const players = [
  { id: 'a', name: 'Ana', avatarId: 'fox', connected: true },
  { id: 'b', name: 'Ben', avatarId: 'owl', connected: true },
  { id: 'c', name: 'Cleo', avatarId: 'frog', connected: true },
];

describe('drawingSvg', () => {
  it('renders each stroke as a path in its palette colour and says so for an empty sheet', () => {
    const svg = drawingSvg({ strokes: [{ c: 1, w: 2, p: encodePoints([10, 10, 100, 120]) }] });
    expect(svg).toContain('<path d="M10 10 L100 120" stroke="#e63946" stroke-width="12"');
    expect(svg).toContain('viewBox="0 0 256 256"');
    expect(drawingSvg(null)).toContain('(nothing was drawn)');
  });
});

describe('recap', () => {
  it('walks every book page by page with the drawings as files', () => {
    const state = game.init({ players, settings: {}, seed: 3, now: 0 }) as State;
    const drawing = { strokes: [{ c: 0, w: 1, p: encodePoints([0, 0, 50, 50]) }] };
    const finished: State = {
      ...state,
      pageCount: 5,
      books: [
        {
          ownerId: 'a',
          pages: [
            { kind: 'word', authorId: 'a', text: 'a cactus hug' },
            { kind: 'draw', authorId: 'a', drawing },
            { kind: 'guess', authorId: 'b', text: 'cactus' },
            { kind: 'draw', authorId: 'b', drawing: null },
            { kind: 'guess', authorId: 'c', text: null },
          ],
        },
      ],
    };
    const out = recap(finished, {
      players,
      history: [],
      results: { scores: {}, ranking: [], winnerIds: [], awards: [] },
    });
    expect(out).not.toBeNull();
    const md = out?.markdown ?? '';
    expect(md).toContain('## Book 1 — Ana — “a cactus hug” — broken ✗');
    expect(md).toContain("1. **Ana's word:** a cactus hug");
    expect(md).toContain("2. **Ana drew:** ![Ana's drawing](book-01-page-02-ana.svg)");
    expect(md).toContain(
      "4. **Ben drew:** ![Ben's drawing](book-01-page-04-ben.svg) _(empty sheet)_",
    );
    expect(md).toContain('5. **Cleo guessed:** ??? (no guess)');
    expect(md).toContain('Chain: a cactus hug → cactus → ???');
    expect(out?.files?.map((f) => f.name)).toEqual([
      'book-01-page-02-ana.svg',
      'book-01-page-04-ben.svg',
    ]);
  });
});
