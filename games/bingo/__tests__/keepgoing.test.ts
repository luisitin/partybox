// Pins how a round goes on after a bingo (owner, 2026-09-17): the number that was up repeats, a
// card that won still daubs, "2nd bingo" / "1st blackout" counts, a two-player game with one side
// locked out offers only blackout or the end, a blacked-out player ends the round, and a choice
// made mid-celebration waits for the reveal.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { AUTO_END_MS, VERDICT_READ_MS, claimRevealMs } from '../server/reveal';
import { pointsFor } from '../server/scoring';
import {
  PLAYERS,
  T0,
  after,
  callUntil,
  claim,
  claimRaw,
  daubAll,
  input,
  start,
  timer,
  vip,
} from './helpers';

const LINE = [0, 1, 2, 3, 4];

describe('keeping the round going', () => {
  it('resumes on the number that was up, and a won card still takes daubs', () => {
    let s = callUntil(start(), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claim(s, 'a');
    const drawn = s.round.drawn;
    const endsAt = after(s) - 10;
    s = input(s, 'b', { type: 'continue', pattern: 'same' }, endsAt + 10);
    expect(s.phase.id).toBe('play');
    expect(s.round.drawn).toBe(drawn);
    expect(game.tvView(s).callIndex).toBe(drawn);
    // Ana's card 1 won the line: no claim from it, but daubs land (a blackout may be next).
    expect(game.controllerView(s, 'a').claimable).toEqual([]);
    s = input(s, 'a', { type: 'daub', card: 0, index: 7 });
    expect(s.round.daubs['a']?.[0]).toContain(7);
  });

  it('counts bingos under the pattern: the first "wins round 1", the next "2nd bingo", a blackout "1st blackout"', () => {
    let s = callUntil(start(), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claim(s, 'a');
    expect(game.tvView(s).patternBingos).toBe(1);
    const endsAt = after(s) - 10;
    s = input(s, 'b', { type: 'continue', pattern: 'same' }, endsAt + 10);
    // Ben completes the same row later on his card: the second bingo of the pattern.
    s = callUntil(s, 'b', LINE);
    s = daubAll(s, 'b', LINE);
    s = claim(s, 'b');
    expect(game.tvView(s).patternBingos).toBe(2);
    expect(game.tvView(s).bingosThisRound).toBe(2);
    const endsAt2 = after(s) - 10;
    s = input(s, 'c', { type: 'continue', pattern: 'blackout' }, endsAt2 + 10);
    expect(s.round.pattern).toBe('blackout');
    expect(s.round.patternBingos).toBe(0);
    expect(s.round.won).toEqual({});
  });

  it('two players, one with every card won: only blackout or the end; a blackout on every card: only the end', () => {
    let s = game.init({
      players: PLAYERS.slice(0, 2),
      settings: { rounds: 1, round1: 'line', callSeconds: 6 },
      seed: 3,
      now: T0,
    });
    s = timer(s); // intro → play
    s = callUntil(s, 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claim(s, 'a');
    expect(s.phase.id).toBe('bingo');
    expect(game.tvView(s).decide).toEqual({ same: false, blackout: true });
    const endsAt = after(s) - 10;
    expect(input(s, 'b', { type: 'continue', pattern: 'same' }, endsAt + 10)).toBe(s);
    s = input(s, 'b', { type: 'continue', pattern: 'blackout' }, endsAt + 10);
    expect(s.phase.id).toBe('play');
    expect(s.round.pattern).toBe('blackout');
    // A round that is a blackout from the start: the first full card ends it.
    let b = game.init({
      players: PLAYERS.slice(0, 2),
      settings: { rounds: 1, round1: 'blackout', callSeconds: 6 },
      seed: 5,
      now: T0,
    });
    b = timer(b);
    const all = Array.from({ length: 25 }, (_, i) => i).filter((i) => i !== 12);
    b = callUntil(b, 'a', all);
    b = daubAll(b, 'a', all);
    b = claim(b, 'a');
    expect(b.phase.id).toBe('bingo');
    expect(game.tvView(b).patternBingos).toBe(1);
    expect(game.tvView(b).decide).toEqual({ same: false, blackout: false });
  });

  it('a choice made mid-celebration is held until the reveal is done, then applied; the first one counts', () => {
    let s = callUntil(start(), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claim(s, 'a');
    const endsAt = after(s) - 10;
    const early = input(s, 'b', { type: 'continue', pattern: 'same' }, s.phase.startedAt + 400);
    expect(early.phase.id).toBe('bingo');
    expect(early.round.decision).toEqual({ type: 'continue', pattern: 'same' });
    expect(early.phase.deadline).toBe(endsAt);
    expect(game.tvView(early).pendingDecision).toBe('same');
    // A second, different choice while one is held changes nothing.
    expect(input(early, 'c', { type: 'next' }, s.phase.startedAt + 800)).toBe(early);
    const applied = timer(early);
    expect(applied.phase.id).toBe('play');
    expect(applied.round.decision).toBeNull();
    // With nothing held, the long deadline still means "abandoned": on to the scoreboard.
    expect(timer(s).phase.id).toBe('scoreboard');
  });
});

describe('points and the end of a round', () => {
  it('scores 3, 2, 1, then ½ under a pattern; a blackout starts the ladder again', () => {
    let s = callUntil(start({ cards: 4 }), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claim(s, 'a', 0);
    expect(s.wins['a']).toBe(3);
    expect(game.tvView(s).claimPoints).toBe(3);
    s = input(s, 'b', { type: 'continue', pattern: 'same' }, after(s));
    for (const [card, points] of [
      [1, 2],
      [2, 1],
      [3, 0.5],
    ] as const) {
      s = callUntil(s, 'a', LINE, card);
      s = daubAll(s, 'a', LINE, card);
      s = claim(s, 'a', card);
      expect(s.phase.id).toBe('bingo');
      expect(game.tvView(s).claimPoints).toBe(points);
      if (card < 3) s = input(s, 'b', { type: 'continue', pattern: 'same' }, after(s));
    }
    expect(s.wins['a']).toBe(6.5);
    expect(game.tvView(s).standings[0]).toMatchObject({ playerId: 'a', wins: 6.5, rank: 1 });
    // Every card of Ana's has won the line: in a three-player game the others still contest.
    expect(game.tvView(s).decide).toEqual({ same: true, blackout: true });
    s = input(s, 'b', { type: 'continue', pattern: 'blackout' }, after(s));
    // The ladder starts again for the blackout: the next bingo would be worth 3.
    expect(s.round.patternBingos).toBe(0);
    expect(pointsFor(s.round.patternBingos + 1)).toBe(3);
  });

  it('two players, a blackout on every card: the round ends by itself once the verdict is read', () => {
    let s = game.init({
      players: PLAYERS.slice(0, 2),
      settings: { rounds: 2, round1: 'blackout', round2: 'line', callSeconds: 6 },
      seed: 5,
      now: T0,
    });
    s = timer(s);
    const all = Array.from({ length: 25 }, (_, i) => i).filter((i) => i !== 12);
    s = callUntil(s, 'a', all);
    s = daubAll(s, 'a', all);
    s = claim(s, 'a');
    expect(s.phase.id).toBe('bingo');
    expect(game.tvView(s).autoEnd).toBe(true);
    expect(game.tvView(s).decide).toEqual({ same: false, blackout: false });
    expect(s.phase.deadline).toBe(after(s) - 10 + AUTO_END_MS);
    expect(timer(s).phase.id).toBe('scoreboard');
  });
});

describe('the points land with the verdict (loop 257)', () => {
  it('a win is not scored, and the winner not ticked, until the reveal ends; the first tick scores it', () => {
    let s = callUntil(start(), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claimRaw(s, 'a');
    expect(s.phase.id).toBe('bingo');
    expect(s.round.winnerId).toBe('a');
    expect(s.round.credited).toBe(false);
    expect(s.wins['a'] ?? 0).toBe(0);
    expect(game.tvView(s).players.find((p) => p.id === 'a')?.status).toBe('waiting');
    const claim0 = s.round.claim;
    const verdictAt = s.phase.startedAt + claimRevealMs(claim0?.cells ?? [], claim0?.daubs ?? []);
    expect(s.phase.deadline).toBe(verdictAt);
    const scored = timer(s);
    expect(scored.phase.id).toBe('bingo');
    expect(scored.round.credited).toBe(true);
    expect(scored.wins['a']).toBe(3);
    expect(game.tvView(scored).players.find((p) => p.id === 'a')?.status).toBe('submitted');
    // With a choice to make, the room is unpaced after the verdict (the abandoned valve only).
    expect(scored.phase.deadline).toBeGreaterThan(verdictAt + VERDICT_READ_MS + AUTO_END_MS);
  });

  it('a choice made before the verdict waits for it, then a moment to read, then applies', () => {
    let s = callUntil(start(), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claimRaw(s, 'a');
    const verdictAt = s.phase.deadline ?? 0;
    const early = input(s, 'b', { type: 'continue', pattern: 'same' }, s.phase.startedAt + 400);
    expect(early.round.decision).toEqual({ type: 'continue', pattern: 'same' });
    expect(early.phase.deadline).toBe(verdictAt); // the verdict tick is still due
    const scored = timer(early);
    expect(scored.phase.id).toBe('bingo');
    expect(scored.wins['a']).toBe(3);
    expect(scored.phase.deadline).toBe(verdictAt + VERDICT_READ_MS);
    expect(timer(scored).phase.id).toBe('play');
  });

  it('a VIP skip or end mid-reveal still scores the win', () => {
    let s = callUntil(start(), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claimRaw(s, 'a');
    expect(vip(s, 'skip').wins['a']).toBe(3);
    expect(vip(s, 'end').wins['a']).toBe(3);
  });
});
