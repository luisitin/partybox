// The judge's grace (review-loop #351): a czar whose phone drops mid-vote gets JUDGE_GRACE_MS to
// come back; back in time, they get a fresh window and their pick still counts.
import { describe, expect, it } from 'vitest';
import { judgeAway, votesIn } from '../server/phases/judge';
import { JUDGE_CZAR_MS, JUDGE_GRACE_MS, UNTIMED_JUDGE_MS } from '../server/types';
import { connect, cv, playAll, readAll, reduce, start, timer, toAnswer, tv } from './helpers';

const toJudge = (opts: Parameters<typeof start>[0]) => readAll(playAll(toAnswer(start(opts))));

describe("the judge's grace", () => {
  it('a judge back inside the grace gets a fresh window and can still pick', () => {
    let s = toJudge({ judge: 'czar', players: 4, timed: true });
    const judge = s.czarId as string;
    const t0 = s.phase.startedAt;
    s = connect(s, judge, false, t0 + 1_000);
    expect(judgeAway(s)).toBe(true);
    expect(votesIn(s)).toBe(false); // no "that's everyone" beat, the clock stays up
    expect(tv(s).timerMode).toBe('normal');
    expect(s.phase.deadline).toBe(t0 + 1_000 + JUDGE_GRACE_MS);
    s = connect(s, judge, true, t0 + 9_000);
    expect(judgeAway(s)).toBe(false);
    expect(s.phase.deadline).toBe(t0 + 9_000 + JUDGE_CZAR_MS);
    const slot = cv(s, judge).cards[0]?.slot ?? 0;
    s = reduce(s, {
      type: 'input',
      now: t0 + 10_000,
      playerId: judge,
      input: { type: 'vote', slot },
    });
    expect(s.phase.id).toBe('judge'); // the 0.9 s "has decided" beat
    s = timer(s);
    expect(s.phase.id).toBe('result');
    expect(s.winners.length).toBe(1);
  });

  it('untimed rounds give the returning judge the untimed window back', () => {
    let s = toJudge({ judge: 'czar', players: 4, timed: false });
    const judge = s.czarId as string;
    const t0 = s.phase.startedAt;
    s = connect(s, judge, false, t0 + 500);
    s = connect(s, judge, true, t0 + 2_000);
    expect(s.phase.deadline).toBe(t0 + 2_000 + UNTIMED_JUDGE_MS);
  });

  it("the grace never pushes a deadline later, and nobody else's return moves it", () => {
    let s = toJudge({ judge: 'czar', players: 4, timed: true });
    const judge = s.czarId as string;
    const t0 = s.phase.startedAt;
    const late = t0 + JUDGE_CZAR_MS - 5_000; // 5 s left: the grace cannot add 20 s
    s = connect(s, judge, false, late);
    expect(s.phase.deadline).toBe(t0 + JUDGE_CZAR_MS);
    const other = s.order.find((id) => id !== judge) as string;
    const before = s.phase.deadline;
    s = connect(s, other, false, late + 100);
    s = connect(s, other, true, late + 200);
    expect(s.phase.deadline).toBe(before);
    expect(s.phase.id).toBe('judge');
  });

  it('a judge who already picked can drop and return without touching the beat', () => {
    let s = toJudge({ judge: 'czar', players: 4, timed: true });
    const judge = s.czarId as string;
    const t0 = s.phase.startedAt;
    const slot = cv(s, judge).cards[0]?.slot ?? 0;
    s = reduce(s, {
      type: 'input',
      now: t0 + 3_000,
      playerId: judge,
      input: { type: 'vote', slot },
    });
    // The drop closes the beat early (every vote is in, nobody connected is waited on); the
    // return must not reopen a judge window on a pick already made.
    s = connect(s, judge, false, t0 + 3_100);
    s = connect(s, judge, true, t0 + 3_200);
    if (s.phase.id === 'judge') s = timer(s);
    expect(s.phase.id).toBe('result');
    expect(s.winners.length).toBe(1);
  });
});
