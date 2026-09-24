// I-172 A: the default votes, except a three-player game, which gets a judge.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { PLAYERS, T0 } from './helpers';

const init = (players: number, judge?: string) =>
  game.init({
    players: PLAYERS.slice(0, players),
    settings: { rounds: 3, decks: 'mild', timed: true, reader: 'none', ...(judge ? { judge } : {}) },
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
