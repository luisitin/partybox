// SPEC §10.7, §10.8, §10.19 / §10.20 "Special roles and winning": hunter shots at night and after a
// vote, the jester's win, win checks after every death and departure, maxDays, results + awards.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import {
  EIGHT,
  finish,
  input,
  night,
  phone,
  reduce,
  start,
  timer,
  toNight,
  vip,
  votes,
} from './helpers';
import type { State } from '../server/types';

const WITH_HUNTER = { ...EIGHT, fay: 'hunter', gus: 'jester' } as const;

function voteDay(state: State, ballots: Record<string, string>): State {
  return votes(vip(state, 'skip'), ballots);
}

describe('hunter', () => {
  it('killed at night: the hunter shoots right after dawn; the shot is revealed', () => {
    let s = night(toNight(start({ roles: WITH_HUNTER })), { ben: 'fay', cy: 'fay' });
    s = finish(s);
    expect(s.phase.id).toBe('hunter');
    expect(phone(s, 'fay').shoot?.targets).not.toContain('fay');
    expect(phone(s, 'ana').shoot).toBeNull();
    expect(input(s, 'ana', { type: 'shoot', target: 'ben' }).shot).toBeNull();
    s = input(s, 'fay', { type: 'shoot', target: 'ben' });
    expect(s.step).toBe(1);
    expect(game.tvView(s).stage.hunter).toEqual({ id: 'fay', shot: 'ben', role: 'wolf' });
    s = timer(s);
    expect(s.phase.id).toBe('day');
    expect(s.alive).not.toContain('ben');
  });

  it('voted out: last words are skipped in a together room, the hunter shoots, then night', () => {
    let s = finish(night(toNight(start({ roles: WITH_HUNTER })), {}));
    s = voteDay(s, { ana: 'fay', dee: 'fay', eli: 'fay' });
    s = finish(s);
    expect(s.phase.id).toBe('hunter');
    s = timer(s); // no shot within 20 s: nobody dies
    expect(s.phase.id).toBe('night');
    expect(s.alive).toHaveLength(7);
  });

  it('a shot can win the game for the village', () => {
    const roles = { ben: 'wolf', fay: 'hunter', ana: 'seer' } as const;
    let s = finish(night(toNight(start({ n: 6, roles })), {}));
    s = voteDay(s, { ana: 'fay', cy: 'fay', dee: 'fay' });
    s = input(finish(s), 'fay', { type: 'shoot', target: 'ben' });
    s = timer(s);
    expect(s.phase.id).toBe('end');
    expect(s.winner).toBe('village');
  });
});

describe('jester and winning', () => {
  it('the jester voted out wins alone, at once', () => {
    let s = finish(night(toNight(start({ roles: WITH_HUNTER })), {}));
    s = finish(voteDay(s, { ana: 'gus', dee: 'gus', eli: 'gus' }));
    expect(s.phase.id).toBe('end');
    expect(s.winner).toBe('jester');
    s = timer(s);
    const r = game.results(s);
    expect(r?.winnerIds).toEqual(['gus']);
    expect(r?.scores['gus']).toBe(1);
    expect(r?.scores['ben']).toBe(0);
  });

  it('a jester killed at night just dies', () => {
    const s = finish(night(toNight(start({ roles: WITH_HUNTER })), { ben: 'gus', cy: 'gus' }));
    expect(s.phase.id).toBe('day');
    expect(s.alive).not.toContain('gus');
  });

  it('the village wins when the last wolf goes; every villager scores, dead or alive', () => {
    const roles = { ben: 'wolf', ana: 'seer' } as const;
    let s = finish(night(toNight(start({ n: 6, roles })), { ben: 'dee' }));
    s = finish(voteDay(s, { ana: 'ben', cy: 'ben', eli: 'ben' }));
    expect(s.winner).toBe('village');
    expect(s.reason).toBe('wolvesGone');
    s = timer(s);
    const r = game.results(s);
    expect(r?.scores['dee']).toBe(1);
    expect(r?.scores['ben']).toBe(0);
  });

  it('the wolves win when they equal the rest (checked at dawn)', () => {
    const roles = { ben: 'wolf', cy: 'wolf' } as const;
    let s = finish(night(toNight(start({ n: 7, roles })), { ben: 'ana', cy: 'ana' }));
    s = finish(voteDay(s, { ben: 'dee', cy: 'dee', eli: 'dee' }));
    expect(s.phase.id).toBe('night');
    s = finish(night(s, { ben: 'eli', cy: 'eli' }));
    expect(s.phase.id).toBe('end');
    expect(s.winner).toBe('wolves');
    expect(s.reason).toBe('wolvesEqual');
  });

  it('the wolves win after the vote on the last day', () => {
    let s = toNight(start({ roles: EIGHT, settings: { maxDays: 4 } }));
    for (let d = 1; d <= 4; d++) {
      s = finish(night(s, {}));
      s = finish(voteDay(s, {}));
    }
    expect(s.phase.id).toBe('end');
    expect(s.reason).toBe('maxDays');
  });

  it('a departure dies at the next announcement and the win check runs', () => {
    const roles = { ben: 'wolf', ana: 'seer' } as const;
    let s = toNight(start({ n: 6, roles }));
    s = reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 1,
      playerId: 'ben',
      connected: false,
      gone: 'left',
    });
    expect(s.alive).toContain('ben');
    s = timer(s); // night ends → dawn resolves the departure
    s = timer(s); // step 1: the news
    expect(game.tvView(s).stage.lines).toEqual(['Ben packed up and left the village.']);
    s = finish(s);
    expect(s.winner).toBe('village');
  });

  it('VIP end jumps to done with complete results', () => {
    const s = vip(toNight(start({ roles: EIGHT })), 'end');
    expect(s.phase.id).toBe('done');
    expect(Object.keys(game.results(s)?.scores ?? {})).toHaveLength(8);
  });
});

describe('awards', () => {
  it('Sharp Eyes, Life Saver and First to Fall when earned', () => {
    let s = night(toNight(start({ roles: EIGHT })), {
      ben: 'dee',
      cy: 'dee',
      ana: 'ben',
      eli: 'fay',
    });
    s = finish(s);
    s = vip(s, 'end');
    const ids = game.results(s)?.awards.map((a) => `${a.id}:${a.playerId}`);
    expect(ids).toContain('sharp-eyes:ana');
    expect(ids).toContain('first-to-fall:dee');
    expect(ids?.some((a) => a.startsWith('life-saver'))).toBe(false);
  });
});
