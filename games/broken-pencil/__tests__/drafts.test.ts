// Drafts (README "Inputs"): the sheet so far, sent while drawing, is what the deadline keeps when
// an artist never presses Done — instead of an empty sheet.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { encodePoints } from '../server/encoding';
import type { Input, State } from '../server/types';

const T0 = 1_000_000;

function start(n: number): State {
  return game.init({
    players: Array.from({ length: n }, (_, i) => ({
      id: `p${i + 1}`,
      name: `P${i + 1}`,
      avatarId: 'fox',
      connected: true,
    })),
    settings: { passes: 15, drawSeconds: 60, guessSeconds: 30, customWords: true, spicy: false },
    seed: 1,
    now: T0,
  });
}

function input(state: State, playerId: string, value: Input): State {
  return game.reduce(state, {
    type: 'input',
    now: state.phase.startedAt + 500,
    playerId,
    input: value,
  });
}

function timer(state: State): State {
  const now = state.phase.deadline ?? state.phase.startedAt;
  return game.reduce(state, {
    type: 'timer',
    now,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

const DOT: Input = { type: 'draw', strokes: [{ c: 0, w: 1, p: encodePoints([10, 10]) }] };

describe('drafts', () => {
  it('the deadline keeps a draft where the artist never pressed Done; Done spends it', () => {
    let s = start(3);
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    const [a, b, c] = s.seats as [string, string, string];
    const half: Input = {
      type: 'draft',
      strokes: [{ c: 2, w: 0, p: encodePoints([1, 2, 3, 4]) }],
    };
    const more: Input = { type: 'draft', strokes: [...half.strokes, ...DOT.strokes] };
    s = input(s, a, half);
    s = input(s, a, more); // the later draft replaces the earlier one
    s = input(s, b, half);
    s = input(s, b, DOT); // Done: the page is the sent drawing, the draft is gone
    expect(s.drafts).toEqual({ [a]: { strokes: more.strokes } });
    expect(game.controllerView(s, a).draft).toEqual({ strokes: more.strokes });
    expect(game.controllerView(s, b).draft).toBeNull();
    expect(JSON.stringify(game.tvView(s))).not.toContain(more.strokes[0]?.p);
    s = timer(s); // a and c never pressed Done
    expect(s.phase.id).toBe('pass');
    expect(s.drafts).toBeUndefined();
    expect(s.books[0]?.pages[1]).toEqual({
      kind: 'draw',
      authorId: a,
      drawing: { strokes: more.strokes },
      filled: 'time', // I-213: the deadline filled it
    });
    expect(s.books[1]?.pages[1]).toEqual({
      kind: 'draw',
      authorId: b,
      drawing: DOT.strokes && { strokes: DOT.strokes },
    });
    expect(s.books[2]?.pages[1]).toEqual({ kind: 'draw', authorId: c, drawing: null, filled: 'time' });
    // In a pass a draft only counts once the guess is in; a stray draft before it changes nothing.
    expect(input(s, c, half)).toBe(s);
    s = input(s, c, { type: 'guess', text: 'a line' });
    s = input(s, c, half);
    expect(game.controllerView(s, c).draft).toEqual({ strokes: half.strokes });
    s = timer(s);
    expect(s.books[1]?.pages[3]).toEqual({
      kind: 'draw',
      authorId: c,
      drawing: { strokes: half.strokes },
      filled: 'time',
    });
    expect(input(s, 'ghost', half)).toBe(s);
  });
});
