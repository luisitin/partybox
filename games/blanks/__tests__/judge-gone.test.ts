// I-773: a judge who goes for good hands the round to the room.
import { describe, expect, it } from 'vitest';
import { connect, cv, playAll, readAll, reduce, start, timer, toAnswer, tv } from './helpers';

const toJudge = () => readAll(playAll(toAnswer(start({ judge: 'czar', players: 4, timed: true }))));

describe('I-773: the room judges when the judge is gone', () => {
  it('after the grace, everyone votes; a card wins; the next round has a judge again', () => {
    let s = toJudge();
    const judge = s.czarId as string;
    s = connect(s, judge, false, s.phase.startedAt + 100);
    s = timer(s); // the grace runs out
    expect(s.phase.id).toBe('judge');
    expect(tv(s).judgeMode).toBe('vote');
    expect(tv(s).judgeGone?.name).toBeTruthy();
    for (const id of s.order) {
      if (id === judge) continue;
      const view = cv(s, id);
      const open = view.cards.find((c) => c.slot !== view.vote?.mySlot);
      if (open) s = reduce(s, { type: 'input', now: s.phase.startedAt + 500, playerId: id, input: { type: 'vote', slot: open.slot } });
    }
    while (s.phase.id === 'judge') s = timer(s);
    expect(s.phase.id).toBe('result');
    expect(s.winners.length).toBeGreaterThan(0);
    while (s.phase.id !== 'pick' && s.phase.id !== 'answer' && s.phase.id !== 'final') s = timer(s);
    expect(s.settings.judge).toBe('czar');
    expect(tv(s).judgeGone).toBeNull();
  });
  it('B: a judge who is removed hands over at once — no grace', () => {
    let s = toJudge();
    const judge = s.czarId as string;
    s = reduce(s, { type: 'player', now: s.phase.startedAt + 100, playerId: judge, connected: false, gone: 'kicked' });
    expect(s.phase.id).toBe('judge');
    expect(tv(s).judgeMode).toBe('vote');
    expect(tv(s).judgeGone?.why).toBe('kicked');
  });
});
