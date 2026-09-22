// The VIP's "close enough" veto (the owner, 2026-09-21): a broken book counts as intact on the
// VIP's word, on its last page in the show or in the summary — from the VIP alone (ADR-042).
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { encodePoints } from '../server/encoding';
import { owedNow } from '../server/books';
import type { Input, State } from '../server/types';

const T0 = 1_000_000;
function players(n: number): { id: string; name: string; avatarId: string; connected: boolean }[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    avatarId: 'fox',
    connected: true,
  }));
}
function start(n = 3): State {
  return game.init({
    players: players(n),
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
  const now = state.phase.deadline ?? state.phase.startedAt + 1;
  return game.reduce(state, {
    type: 'timer',
    now,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}
function vip(state: State, action: 'skip'): State {
  return game.reduce(state, { type: 'vip', now: state.phase.startedAt + 500, action });
}
const DOT: Input = { type: 'draw', strokes: [{ c: 0, w: 1, p: encodePoints([10, 10]) }] };
function playThrough(state: State): State {
  let s = state;
  for (const id of s.seats) s = input(s, id, { type: 'pick', option: 1 });
  let guard = 0;
  while (s.phase.id !== 'show' && guard++ < 60) {
    for (const id of s.seats) {
      if (owedNow(s, id) === 'guess') s = input(s, id, { type: 'guess', text: 'wrong' });
      if (owedNow(s, id) === 'draw') s = input(s, id, DOT);
    }
  }
  expect(s.phase.id).toBe('show');
  return s;
}

describe("the VIP's close-enough veto (the owner, 2026-09-21)", () => {
  const vetoAs = (state: State, playerId: string, book: number, vip: boolean): State =>
    game.reduce(state, {
      type: 'input',
      now: state.phase.startedAt + 500,
      playerId,
      input: { type: 'veto', book },
      vip,
    });
  it('flips a broken book on its last page to intact — from the VIP only, once', () => {
    let s = playThrough(start(3));
    // walk book 0 to its last page
    while (s.showing && s.showing.book === 0 && s.showing.page < s.pageCount - 1)
      s = vip(s, 'skip');
    expect(s.showing?.verdict).toBe('broken');
    const before = s.intactBooks;
    // a player who is not the VIP: ignored
    expect(vetoAs(s, 'p2', 0, false)).toBe(s);
    const ok = vetoAs(s, 'p1', 0, true);
    expect(ok.showing?.verdict).toBe('intact');
    expect(ok.intactBooks).toBe(before + 1);
    expect(ok.vetoed).toEqual([0]);
    // once
    expect(vetoAs(ok, 'p1', 0, true)).toBe(ok);
    // an intact-by-rule book, or a page that is not the last one: ignored
    expect(vetoAs(s, 'p1', 1, true)).toBe(s);
  });
  it('works in the summary too and reaches the summary rows and the awards', () => {
    let s = playThrough(start(3));
    while (s.phase.id === 'show') s = vip(s, 'skip');
    expect(s.phase.id).toBe('summary');
    const v = vetoAs(s, 'p1', 1, true);
    expect(game.controllerView(v, 'p1').summary?.[1]?.intact).toBe(true);
    let d = v;
    while (d.phase.id !== 'done') d = timer(d);
    expect(game.results(d)?.awards.some((a) => a.playerId === d.books[1]?.ownerId)).toBe(true);
  });
});
