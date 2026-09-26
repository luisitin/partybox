// §7.17 Deck rules: right, pass, wrong (burns the next word), wrong on the last word (a won word
// goes to lost), a VIP-counted guess; the rating table; results crown only Great or better.
import { describe, expect, it } from 'vitest';
import { beforeResultCounts } from '../client/deck-counts';
import { piles, ratingOf } from '../server/deck';
import { game } from '../server/index';
import type { State } from '../server/types';
import { atClue, input, skip, TELESCOPE, timer, withClues } from './helpers';

function toGuess(state: State): State {
  let s = state.w.guesser === 'p1' ? withClues(state, ['stars', 'lens', 'Galileo', 'zoom']) : state;
  while (s.phase.id === 'clue' || s.phase.id === 'check') s = skip(s);
  return s;
}

function guess(state: State, text: string): State {
  return input(state, state.w.guesser, { type: 'guess', text });
}

/** Play the current word with the given guess ('' = pass), then move on past `result`. */
function play(state: State, text: string): State {
  const g = toGuess(state);
  const r = text ? guess(g, text) : input(g, g.w.guesser, { type: 'pass' });
  return timer(r);
}

describe('deck piles', () => {
  it('a right guess goes to won; the guesser rotates', () => {
    const g = toGuess(atClue(5));
    const r = guess(g, 'Telescopes');
    expect(r.phase.id).toBe('result');
    expect(r.w.guess).toEqual({ text: 'Telescopes', result: 'right', byVip: false });
    expect(piles(r)).toEqual({ won: [TELESCOPE.id], lost: [], left: 9 });
    expect(beforeResultCounts(game.tvView(r).counts, game.tvView(r).result!)).toEqual(
      game.tvView(g).counts,
    );
    const next = timer(r);
    expect(next.phase.id).toBe('clue');
    expect(next.w.guesser).toBe('p2');
    expect(next.w.idx).toBe(1);
  });

  it('a pass (or the clock) goes to lost', () => {
    const passed = input(toGuess(atClue(5)), 'p1', { type: 'pass' });
    expect(piles(passed)).toMatchObject({ won: [], lost: [TELESCOPE.id], left: 9 });
    const timedOut = timer(toGuess(atClue(5)));
    expect(timedOut.w.guess?.result).toBe('pass');
  });

  it('a wrong guess burns the next word too', () => {
    const g = toGuess(atClue(5));
    const r = guess(g, 'microscope');
    expect(r.w.guess?.result).toBe('wrong');
    const p = piles(r);
    expect(p.lost).toHaveLength(2);
    expect(p.left).toBe(8);
    expect(beforeResultCounts(game.tvView(r).counts, game.tvView(r).result!)).toEqual(
      game.tvView(g).counts,
    );
    expect(timer(r).w.idx).toBe(2);
  });

  it('a wrong guess on the last word sends the latest won word to lost', () => {
    let s = atClue(5, { words: 6 });
    s = play(s, 'Telescope');
    for (let i = 0; i < 4; i++) s = play(s, '');
    expect(s.w.idx).toBe(5);
    const r = guess(toGuess(s), 'zzzz');
    const p = piles(r);
    expect(p.won).toEqual([]);
    expect(p.lost).toHaveLength(6);
    expect(r.turns[5]?.unwon).toBe(TELESCOPE.id);
    expect(beforeResultCounts(game.tvView(r).counts, game.tvView(r).result!)).toEqual(
      game.tvView(toGuess(s)).counts,
    );
    expect(timer(r).phase.id).toBe('done');
  });

  it('a wrong guess on the last word with nothing won costs nothing more', () => {
    let s = atClue(5, { words: 6 });
    for (let i = 0; i < 5; i++) s = play(s, '');
    const r = guess(toGuess(s), 'zzzz');
    expect(r.turns[5]?.unwon).toBeNull();
    expect(piles(r).lost).toHaveLength(6);
  });

  it('the VIP can count a rejected guess; the deck is recomputed', () => {
    const r = guess(toGuess(atClue(5)), 'star gazer thing');
    expect(r.w.guess?.result).toBe('wrong');
    expect(input(r, 'p3', { type: 'countGuess' })).toBe(r);
    const counted = input(r, 'p3', { type: 'countGuess' }, r.phase.startedAt + 500, true);
    expect(counted.w.guess).toMatchObject({ result: 'right', byVip: true });
    expect(piles(counted)).toMatchObject({ won: [TELESCOPE.id], lost: [], left: 9 });
    expect(game.tvView(counted).result?.byVip).toBe(true);
    expect(timer(counted).w.idx).toBe(1);
  });

  it('countGuess outside result, or on a right guess, is ignored', () => {
    const g = toGuess(atClue(5));
    expect(input(g, 'p3', { type: 'countGuess' }, g.phase.startedAt + 1, true)).toBe(g);
    const right = guess(g, 'telescope');
    expect(input(right, 'p3', { type: 'countGuess' }, right.phase.startedAt + 1, true)).toBe(right);
  });
});

describe('rating and results', () => {
  it.each([
    [10, 10, 'flawless'],
    [9, 10, 'brilliant'],
    [7, 10, 'great'],
    [6, 10, 'solid'],
    [3, 10, 'warming'],
    [2, 10, 'again'],
    [11, 13, 'great'],
    [0, 6, 'again'],
  ])('%i of %i → %s', (won, size, id) => {
    expect(ratingOf(won, size)).toBe(id);
  });

  it('everyone scores the team total; below Great nobody is crowned (co-op lost)', () => {
    let s = atClue(5, { words: 6 });
    for (let i = 0; i < 6; i++) s = play(s, i === 0 ? 'telescope' : '');
    expect(s.phase.id).toBe('done');
    const res = game.results(s);
    expect(res?.scores).toEqual({ p1: 1, p2: 1, p3: 1, p4: 1, p5: 1 });
    expect(res?.winnerIds).toEqual([]);
    expect(res?.outcome).toEqual({ kind: 'coop', won: false });
    expect(res?.headline).toBe('🔁 Try again! 1 of 6 words');
    expect(game.tvView(s).final?.rating).toBe('again');
    expect(res?.awards.map((a) => a.id)).toContain('sharp-guesser-p1');
  });

  it('a perfect deck is Flawless', () => {
    let s = atClue(5, { words: 6 });
    for (let i = 0; i < 6; i++) s = play(s, s.w.word.answer);
    const res = game.results(s);
    expect(res?.scores['p1']).toBe(6);
    expect(res?.winnerIds).toHaveLength(5);
    expect(res?.outcome).toEqual({ kind: 'coop', won: true });
    expect(game.tvView(s).final?.rating).toBe('flawless');
  });
});
