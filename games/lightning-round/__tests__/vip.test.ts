// VIP actions from README.md "Edge cases": skip from every phase, end from anywhere, pause/resume.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { pick, start, timer, toWager, tv, vip, wager } from './helpers';

describe('VIP skip', () => {
  it('intro → first question', () => {
    const s = vip(start(), 'skip');
    expect(s.phase.id).toBe('question');
    expect(s.index).toBe(0);
  });

  it('I-287 B: a skipped regular question is voided — the next one, nothing scored', () => {
    let s = timer(start());
    const total = s.questionIds.length;
    s = pick(s, 'a', true);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('question');
    expect(s.index).toBe(0);
    expect(s.questionIds.length).toBe(total - 1);
    expect(s.scores['a']).toBe(0);
  });

  it('I-287 B: voiding every regular question leads to the wager', () => {
    let s = timer(start({ questions: 5 }));
    for (let i = 0; i < 5; i++) s = vip(s, 'skip'); // q1..q5, each voided
    expect(s.phase.id).toBe('wager');
  });

  it('wager → final question with the wagers placed so far (missing = 0)', () => {
    let s = toWager(start(), { a: true, b: true });
    s = wager(s, 'a', 50);
    const bet = s.wagers['a'];
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('question');
    expect(s.index).toBe(s.questionIds.length - 1);
    expect(s.wagers).toEqual({ a: bet });
    // I-287 A: the VIP closing the final costs a nothing — the wager stays; b and c bet nothing.
    const before = { ...s.scores };
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('reveal');
    expect(s.scores['a']).toBe(before['a'] ?? 0);
    expect(bet).toBeGreaterThan(0);
    expect(s.scores['b']).toBe(before['b']);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('done');
    expect(game.results(s)).not.toBeNull();
  });

  it('skip in done is a no-op', () => {
    let s = start();
    while (game.results(s) === null) s = vip(s, 'skip');
    expect(s.phase.id).toBe('done');
    expect(vip(s, 'skip')).toEqual(s);
  });
});

describe('VIP end and pause', () => {
  it('end → done from any phase with the scores so far', () => {
    let s = timer(start());
    s = pick(s, 'a', true);
    s = pick(s, 'b', true);
    s = pick(s, 'c', true); // reveal, scored
    const scores = { ...s.scores };
    s = timer(s); // next question
    s = pick(s, 'a', true); // not yet revealed → not counted
    const ended = vip(s, 'end');
    expect(ended.phase.id).toBe('done');
    expect(game.results(ended)?.scores).toEqual(scores);
    expect(vip(start(), 'end').phase.id).toBe('done');
    expect(vip(toWager(start()), 'end').phase.id).toBe('done');
  });

  it('pause holds the deadline and ignores inputs/timers; resume shifts the deadline', () => {
    let s = timer(start({ answerSeconds: 10 }));
    const deadline = s.phase.deadline as number;
    s = vip(s, 'pause', s.phase.startedAt + 2_000);
    expect(s.phase.paused).toEqual({ at: s.phase.startedAt + 2_000 });
    expect(pick(s, 'a', true, 3_000)).toBe(s);
    expect(timer(s)).toBe(s);
    expect(tv(s).paused).toBe(true);
    s = vip(s, 'resume', s.phase.startedAt + 6_000);
    expect(s.phase.paused).toBeUndefined();
    expect(s.phase.deadline).toBe(deadline + 4_000);
    s = pick(s, 'a', true, 7_000);
    expect(s.picks['a']?.elapsedMs).toBe(3_000);
  });

  it('skip while paused resumes first, then advances', () => {
    let s = vip(timer(start()), 'pause');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('question'); // I-287 B: voided, the next question
    expect(s.phase.paused).toBeUndefined();
  });
});
