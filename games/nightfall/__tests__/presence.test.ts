// SPEC §10.17 presence modes, §10.6 last words, §10.19 edge cases (drops, one connected player,
// a late joiner, everyone idle) and VIP skips from every phase.
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
import type { Presence, State } from '../server/types';

const TEXT: Presence = { mode: 'remote-text', phoneOnly: false };

describe('presence', () => {
  it('together: no town board and no last words by default', () => {
    const s = start({ roles: EIGHT });
    expect(s.cfg.townBoard).toBe(false);
    expect(game.tvView(s).townBoard).toBe(false);
  });

  it('remote-text: the board is on (auto) and the voted-out player types last words', () => {
    let s = finish(night(toNight(start({ roles: EIGHT, presence: TEXT })), {}));
    expect(s.cfg.townBoard).toBe(true);
    s = finish(votes(vip(s, 'skip'), { ana: 'dee', eli: 'dee', fay: 'dee' }));
    expect(s.phase.id).toBe('lastWords');
    expect(phone(s, 'dee').speak).toBe(true);
    expect(phone(s, 'ana').speak).toBe(false);
    expect(input(s, 'ana', { type: 'lastWords', text: 'not me' }).lastWords).toBeNull();
    s = input(s, 'dee', { type: 'lastWords', text: `  It was Ben ${'!'.repeat(100)}` });
    expect(s.lastWords?.length).toBe(80);
    expect(game.tvView(s).stage.lastWords).toEqual({ by: 'dee', text: s.lastWords });
    expect(game.tvView(s).stage.lines).toEqual(["Dee's last words."]);
    s = timer(s);
    expect(s.phase.id).toBe('night');
  });

  it('townBoard off beats remote-text; on works in a together room', () => {
    expect(start({ presence: TEXT, settings: { townBoard: 'off' } }).cfg.townBoard).toBe(false);
    expect(start({ settings: { townBoard: 'on' } }).cfg.townBoard).toBe(true);
  });

  it('phone views carry the stage for dawn, verdict and end (PhoneStage)', () => {
    let s = night(toNight(start({ roles: EIGHT })), { ben: 'dee', cy: 'dee' });
    expect(phone(s, 'ana').stage).not.toBeNull();
    s = finish(s);
    expect(phone(s, 'ana').stage).toBeNull(); // day: already on the phone
  });
});

describe('edge cases', () => {
  it('a drop mid-night does not stall: the rest finishing ends the night', () => {
    let s = toNight(start({ roles: EIGHT }));
    const picks = {
      ben: 'dee',
      cy: 'dee',
      ana: 'ben',
      eli: 'eli',
      dee: 'ben',
      fay: 'cy',
      gus: 'ben',
    };
    for (const [by, target] of Object.entries(picks)) s = input(s, by, { type: 'night', target });
    expect(s.phase.id).toBe('night');
    s = reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 900,
      playerId: 'hal',
      connected: false,
    });
    expect(s.phase.id).toBe('dawn');
  });

  it('a dropped living player can still be voted for', () => {
    let s = finish(night(toNight(start({ roles: EIGHT })), {}));
    s = reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 1,
      playerId: 'ben',
      connected: false,
    });
    s = votes(vip(s, 'skip'), { ana: 'ben', dee: 'ben' });
    expect(s.verdict?.out).toBe('ben');
  });

  it('one connected player: every phase still ends', () => {
    let s = toNight(start({ roles: EIGHT }));
    for (const id of s.seats.slice(1))
      s = reduce(s, { type: 'player', now: s.phase.startedAt + 1, playerId: id, connected: false });
    for (let i = 0; i < 400 && s.phase.id !== 'done'; i++) s = timer(s);
    expect(s.phase.id).toBe('done');
  });

  it('everyone idle: no kills, no eliminations, the wolves win after the last day', () => {
    let s = start({ roles: EIGHT });
    for (let i = 0; i < 400 && s.phase.id !== 'end'; i++) s = timer(s);
    expect(s.alive).toHaveLength(8);
    expect(s.reason).toBe('maxDays');
    expect(s.day).toBe(6);
  });

  it('a late joiner is a spectator: the TV view, no role', () => {
    const s = toNight(start({ roles: EIGHT }));
    const v = phone(s, 'late');
    expect(v.me.role).toBe('spectator');
    expect(v.role).toBeNull();
    expect(input(s, 'late', { type: 'night', target: 'ana' })).toBe(s);
  });

  it('ghosts cannot act or vote', () => {
    let s = finish(night(toNight(start({ roles: EIGHT })), { ben: 'dee', cy: 'dee' }));
    s = vip(s, 'skip');
    expect(input(s, 'dee', { type: 'vote', target: 'ben' }).votes).toEqual({});
    expect(phone(s, 'dee').ghost).toBe(true);
    expect(phone(s, 'dee').vote).toBeNull();
  });

  it('the VIP can skip out of every phase', () => {
    const phases = new Set<string>();
    let s: State = start({ roles: { ...EIGHT, fay: 'hunter' }, presence: TEXT });
    for (let i = 0; i < 200 && s.phase.id !== 'done'; i++) {
      phases.add(s.phase.id);
      if (s.phase.id === 'night' && s.day === 1) s = night(s, { ben: 'fay', cy: 'fay' });
      else if (s.phase.id === 'vote' && s.day === 2)
        s = votes(s, { ana: 'dee', eli: 'dee', gus: 'dee' });
      else s = vip(s, 'skip');
    }
    expect(s.phase.id).toBe('done');
    for (const p of [
      'roles',
      'night',
      'dawn',
      'hunter',
      'day',
      'vote',
      'verdict',
      'lastWords',
      'end',
    ])
      expect(phases, p).toContain(p);
  });

  it('pause stops the night and the day clocks', () => {
    const s = toNight(start({ roles: EIGHT }));
    const paused = vip(s, 'pause', s.phase.startedAt + 1000);
    expect(timer(paused).phase.id).toBe('night');
    const resumed = vip(paused, 'resume', s.phase.startedAt + 6000);
    expect(resumed.phase.deadline).toBe((s.phase.deadline ?? 0) + 5000);
  });
});
