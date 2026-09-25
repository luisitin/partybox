// I-172 A: the default votes, except a three-player game, which gets a judge.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { connect, PLAYERS, playAll, readAll, start, T0, timer, toAnswer, tv } from './helpers';

const init = (players: number, judge?: string) =>
  game.init({
    players: PLAYERS.slice(0, players),
    settings: {
      rounds: 3,
      decks: 'mild',
      timed: true,
      reader: 'none',
      ...(judge ? { judge } : {}),
    },
    seed: 1,
    now: T0,
  });

describe('I-172 A: a judge at three', () => {
  it('the default is a vote with four, a judge with three', () => {
    expect(init(4).settings.judge).toBe('vote');
    expect(init(3).settings.judge).toBe('czar');
    expect(init(3, 'auto').settings.judge).toBe('czar');
  });
  it('an explicit choice is kept', () => {
    expect(init(3, 'vote').settings.judge).toBe('vote');
    expect(init(4, 'czar').settings.judge).toBe('czar');
  });
});

// I-172 A (Session C): drops mid-game never stall — the mode is fixed at init.
const finish = (s0: ReturnType<typeof init>) => {
  let s = s0;
  for (let i = 0; i < 400 && s.phase.id !== 'done'; i++) s = timer(s);
  return s;
};

describe('I-172 A: drops', () => {
  it('four voting, one drops to three: still a vote, and the game ends on timers', () => {
    let s = readAll(playAll(toAnswer(start({ judge: 'auto' as never, players: 4 }))));
    expect(s.settings.judge).toBe('vote');
    s = connect(s, 'dev', false, s.phase.startedAt + 100);
    expect(s.settings.judge).toBe('vote');
    expect(finish(s).phase.id).toBe('done');
  });
  it('three with a judge: the judge drops mid-judge — the room votes, no stall', () => {
    let s = readAll(playAll(toAnswer(start({ judge: 'auto' as never, players: 3 }))));
    expect(s.phase.id).toBe('judge');
    expect(s.settings.judge).toBe('czar');
    s = connect(s, s.czarId as string, false, s.phase.startedAt + 100);
    s = timer(s);
    expect(tv(s).judgeMode).toBe('vote');
    expect(finish(s).phase.id).toBe('done');
  });
  it('three with a judge, one drops to two: the game still ends on timers', () => {
    let s = toAnswer(start({ judge: 'auto' as never, players: 3 }));
    const other = s.order.find((id) => id !== s.czarId) as string;
    s = connect(s, other, false, s.phase.startedAt + 100);
    expect(finish(s).phase.id).toBe('done');
  });
});
