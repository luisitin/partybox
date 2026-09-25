// The reader (README "Settings"; SPEC §6.11): what is asked for when, the hive's pacing to the
// voice, the wait cap, and the words the voice gets.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import {
  LINES,
  numberWords,
  sayRequest,
  speakable,
  spotRequest,
  speechKey,
} from '../server/speech';
import { SPOT_BEAT_MS, VOICE_WAIT_MS } from '../server/types';
import { order, start, timer, toRank, tv } from './helpers';

const answerAll = (s: ReturnType<typeof start>, ms: number) => {
  let out = s;
  for (const r of game.speech?.(out) ?? [])
    out = game.reduce(out, { type: 'speech', now: out.phase.startedAt + 10, key: r.key, ms });
  return out;
};

describe('what the reader is asked to make', () => {
  it('nothing with no reader', () => {
    expect(game.speech?.(start({ reader: 'none' }))).toEqual([]);
  });

  it('the stock lines and round 1’s question during intro; the next question during score', () => {
    let s = start({ reader: 'jessica' });
    const intro = game.speech?.(s) ?? [];
    expect(intro).toHaveLength(Object.keys(LINES).length + 1);
    expect(intro.map((r) => r.key)).toContain(sayRequest(s, 1)?.key);
    s = answerAll(s, 800);
    expect(game.speech?.(s)).toEqual([]);
    s = order(order(order(toRank(s), 'a'), 'b'), 'c');
    s = answerAll(s, 800);
    for (let i = 0; i < 8 && s.phase.id === 'hive'; i++) s = timer(s);
    expect(s.phase.id).toBe('score');
    expect((game.speech?.(s) ?? []).map((r) => r.key)).toEqual([sayRequest(s, 2)?.key]);
  });

  it('keys follow the host’s rule: no hyphen, at most 40 characters', () => {
    const key = speechKey('jessica', [{ text: 'Number five: Egg sandwich.' }]);
    expect(key).toMatch(/^[a-z0-9]{6,40}$/);
  });
});

describe('pacing the hive to the voice', () => {
  const ready = () => order(order(order(toRank(start({ reader: 'jessica' })), 'a'), 'b'), 'c');

  it('holds each spot for its reading plus a beat', () => {
    let s = answerAll(ready(), 2400);
    s = timer(s); // 5th place lands
    expect(tv(s).speech?.key).toBe(spotRequest(s, 1)?.key);
    expect((s.phase.deadline ?? 0) - (s.phase.startedAt + 1800)).toBe(2400 + SPOT_BEAT_MS);
  });

  it('waits for a reading that is not made yet, and lands it the moment it arrives', () => {
    let s = timer(ready()); // decided → wants 5th place, not made yet
    expect(s.q.hold).toBe(true);
    expect(tv(s).step).toBe(0);
    const key = spotRequest(s, 1)?.key ?? '';
    s = game.reduce(s, { type: 'speech', now: s.phase.startedAt + 2500, key, ms: 1500 });
    expect(tv(s).step).toBe(1);
    expect(tv(s).speech?.key).toBe(key);
  });

  it('never waits past the cap: the spot lands silent', () => {
    let s = timer(ready());
    expect(s.phase.deadline).toBe(s.phase.startedAt + VOICE_WAIT_MS);
    s = timer(s);
    expect(tv(s).step).toBe(1);
    expect(tv(s).speech).toBeNull();
    // Past the cap, later spots no longer wait at all.
    s = timer(s);
    expect(tv(s).step).toBe(2);
  });

  it('a failed reading (-1) never holds the room', () => {
    let s = answerAll(ready(), -1);
    s = timer(s);
    expect(tv(s).step).toBe(1);
    expect(tv(s).speech).toBeNull();
  });
});

describe('the words the voice gets', () => {
  it('numbers, symbols and emoji', () => {
    expect(numberWords(100)).toBe('one hundred');
    expect(numberWords(21)).toBe('twenty-one');
    expect(numberWords(1999)).toBe('one thousand nine hundred ninety-nine');
    expect(speakable('100 ducks')).toBe('one hundred ducks');
    expect(speakable('Rock & roll 🎸')).toBe('Rock and roll');
    expect(speakable('3 in the morning')).toBe('three in the morning');
    expect(speakable('Don’t “panic”…')).toBe("Don't panic,");
  });
});
