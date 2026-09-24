// The owner's play-test notes (2026-09-24): a ready-up with a 3 · 2 · 1 before question 1, and a
// settings menu that holds the room for everyone (like Bingo's style menu), then a 3 · 2 · 1 back.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { controllerView, tvView } from '../server/views';
import type { State } from '../server/types';
import { atAnswer, input, players, start, T0, timer } from './helpers';

const ID = 'herd-mind';
const menu = (s: State, id: string, open: boolean, now: number): State =>
  input(s, id, { type: 'menu', open }, now);

describe('ready-up', () => {
  it('bots are ready from the start; people tap Ready', () => {
    const withBot = game.init({
      players: [
        ...players(2),
        { id: 'robo', name: 'Bot', avatarId: 'robot:1', connected: true, bot: true },
      ],
      settings: { reader: 'none' },
      seed: 1,
      now: T0,
    });
    expect(withBot.ready).toEqual(['robo']);
  });

  it('the last Ready starts a breath + 3 · 2 · 1, then question 1', () => {
    let s = start({}, 3);
    s = input(s, 'ana', { type: 'ready' }, T0 + 2_000);
    s = input(s, 'ben', { type: 'ready' }, T0 + 3_000);
    expect(s.startAt).toBeNull();
    s = input(s, 'cy', { type: 'ready' }, T0 + 4_000);
    expect(s.startAt).toBe(T0 + 4_000 + 3_400);
    expect(s.phase.deadline).toBe(s.startAt);
    expect(tvView(s, ID).startAt).toBe(s.startAt);
    expect(timer(s).phase.id).toBe('answer');
  });

  it('a Ready twice, or from a spectator, changes nothing', () => {
    let s = input(start({}, 3), 'ana', { type: 'ready' }, T0 + 1_000);
    expect(input(s, 'ana', { type: 'ready' }, T0 + 1_500)).toBe(s);
    expect(input(s, 'zed', { type: 'ready' }, T0 + 1_500)).toBe(s);
    s = input(s, 'ben', { type: 'ready' }, T0 + 2_000);
    // Cy drops: everyone still here is ready, so the count starts
    s = game.reduce(s, { type: 'player', now: T0 + 3_000, playerId: 'cy', connected: false });
    expect(s.startAt).toBe(T0 + 3_000 + 3_400);
  });

  it('shows who is ready on every phone', () => {
    const s = input(start({}, 3), 'ben', { type: 'ready' }, T0 + 1_000);
    expect(controllerView(s, 'ana', ID).ready).toEqual(['ben']);
  });
});

describe('the settings hold', () => {
  it('the first menu stops the clock for everyone; the last one closing starts 3 · 2 · 1 with the time left', () => {
    let s = atAnswer();
    const t = s.phase.startedAt;
    s = menu(s, 'ana', true, t + 4_000); // 11 s of 15 were left
    expect(s.phase.deadline).toBeNull();
    expect(s.hold).toEqual({ remaining: 11_000 });
    expect(tvView(s, ID).holdBy).toEqual(['ana']);
    s = menu(s, 'ben', true, t + 6_000);
    s = menu(s, 'ana', false, t + 9_000);
    expect(s.phase.deadline).toBeNull(); // Ben is still in his menu
    s = menu(s, 'ben', false, t + 20_000);
    expect(s.resumeAt).toBe(t + 23_000);
    expect(s.phase.deadline).toBe(t + 23_000 + 11_000);
    expect(s.phase.id).toBe('answer');
  });

  it('answers still land during a hold, but the all-in beat waits for the clock to run', () => {
    let s = atAnswer({}, 3);
    const t = s.phase.startedAt;
    s = menu(s, 'ana', true, t + 1_000);
    const tile = s.q.tiles?.[0]?.id ?? '';
    for (const id of ['ana', 'ben', 'cy']) s = input(s, id, { type: 'pick', tile }, t + 2_000);
    expect(Object.keys(s.q.answers)).toHaveLength(3);
    expect(s.phase.deadline).toBeNull();
  });

  it('a phone that drops with its menu open stops holding the room', () => {
    let s = menu(atAnswer(), 'ana', true, T0 + 1_000);
    s = game.reduce(s, { type: 'player', now: T0 + 5_000, playerId: 'ana', connected: false });
    expect(s.menus).toEqual([]);
    expect(s.phase.deadline).not.toBeNull();
  });

  it('a VIP skip moves on and clears the hold', () => {
    let s = menu(atAnswer(), 'ana', true, T0 + 1_000);
    s = game.reduce(s, { type: 'vip', now: T0 + 2_000, action: 'skip' });
    expect([s.phase.id, s.menus, s.hold]).toEqual(['herd', [], null]);
  });

  it('the phone knows its own menu is open', () => {
    const s = menu(atAnswer(), 'ben', true, T0 + 1_000);
    expect(controllerView(s, 'ben', ID).menuOpen).toBe(true);
    expect(controllerView(s, 'ana', ID).menuOpen).toBe(false);
  });

  it('a hold during the 3 · 2 · 1 before question 1 restarts the count after it', () => {
    let s = start({}, 2);
    s = input(s, 'ana', { type: 'ready' }, T0 + 1_000);
    s = input(s, 'ben', { type: 'ready' }, T0 + 1_000);
    s = menu(s, 'ana', true, T0 + 2_000);
    s = menu(s, 'ana', false, T0 + 10_000);
    expect(s.startAt).toBe(s.phase.deadline);
    expect(s.phase.deadline).toBe(T0 + 10_000 + 3_000 + 2_400);
  });
});
