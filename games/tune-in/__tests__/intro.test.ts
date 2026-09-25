// The owner's pacing rule [cc45f4]: rules + I'm ready + 3 · 2 · 1 before turn 1. Bots are ready
// from the start; the count starts when every connected player has tapped (a dropped phone never
// holds the room up) or on the VIP's Start now. The INTRO_MS net starts only a room where nobody
// has tapped; once anyone has, it waits for the rest, up to INTRO_GIVE_UP_MS ([a9623e]).
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { COUNTDOWN_MS, INTRO_GIVE_UP_MS, INTRO_MS, READY_BREATH_MS } from '../server/types';
import type { State } from '../server/types';
import { link, roster, send, T0, timer, vip } from './helpers';

function room(people: number, bots: number): State {
  return game.init({ players: roster(people + bots, bots), settings: {}, seed: 5, now: T0 });
}

describe('the ready-up', () => {
  it('has the bots ready and the people not, with no count yet', () => {
    const s = room(2, 2);
    expect(s.phase.id).toBe('intro');
    expect([...s.ready].sort()).toEqual(['p3', 'p4']);
    expect(s.startAt).toBeNull();
    expect(s.phase.deadline).toBe(T0 + INTRO_MS);
  });

  it('starts the 3 · 2 · 1 on the last person’s tap, then turn 1', () => {
    let s = room(2, 1);
    s = send(s, 'p1', { type: 'ready' }, T0 + 5000);
    expect(s.startAt).toBeNull();
    s = send(s, 'p1', { type: 'ready' }, T0 + 5100); // a second tap changes nothing
    expect(s.ready.filter((id) => id === 'p1')).toHaveLength(1);
    s = send(s, 'p2', { type: 'ready' }, T0 + 9000);
    const at = T0 + 9000 + READY_BREATH_MS + COUNTDOWN_MS;
    expect(s.startAt).toBe(at);
    expect(s.phase).toMatchObject({ id: 'intro', deadline: at });
    s = timer(s);
    expect(s.phase.id).toBe('clue');
  });

  it('never waits for a dropped phone or a player who left', () => {
    let s = room(3, 0);
    s = send(s, 'p1', { type: 'ready' }, T0 + 1000);
    s = send(s, 'p2', { type: 'ready' }, T0 + 1500);
    expect(s.startAt).toBeNull();
    s = link(s, 'p3', false);
    expect(s.startAt).not.toBeNull();
    let t = room(2, 0);
    t = send(t, 'p1', { type: 'ready' }, T0 + 1000);
    t = link(t, 'p2', false, 'left');
    expect(t.startAt).not.toBeNull();
    expect(send(t, 'p2', { type: 'ready' }).ready).not.toContain('p2');
  });

  it('starts a room where nobody has tapped after INTRO_MS', () => {
    let s = room(3, 1);
    s = timer(s);
    expect(s.phase.id).toBe('intro');
    expect(s.startAt).toBe(T0 + INTRO_MS + READY_BREATH_MS + COUNTDOWN_MS);
    s = timer(s);
    expect(s.phase.id).toBe('clue');
  });

  it('waits for the last connected player once anyone has tapped, then gives up at 10 min', () => {
    let s = room(3, 1);
    s = send(s, 'p1', { type: 'ready' }, T0 + 2000);
    s = send(s, 'p2', { type: 'ready' }, T0 + 3000);
    s = timer(s);
    expect(s.phase.id).toBe('intro');
    expect(s.startAt).toBeNull();
    expect(s.phase.deadline).toBe(T0 + 2 * INTRO_MS);
    while (s.startAt === null && (s.phase.deadline as number) < T0 + INTRO_GIVE_UP_MS) s = timer(s);
    expect(s.startAt).toBeNull();
    expect(s.phase.deadline).toBe(T0 + INTRO_GIVE_UP_MS);
    s = timer(s);
    expect(s.startAt).toBe(T0 + INTRO_GIVE_UP_MS + READY_BREATH_MS + COUNTDOWN_MS);
    let t = room(3, 0);
    t = send(t, 'p1', { type: 'ready' }, T0 + 2000);
    t = send(t, 'p2', { type: 'ready' }, T0 + 3000);
    t = timer(t);
    t = send(t, 'p3', { type: 'ready' }, T0 + INTRO_MS + 9000);
    expect(t.startAt).toBe(T0 + INTRO_MS + 9000 + READY_BREATH_MS + COUNTDOWN_MS);
  });

  it('shows no clock on the rules, TV or phone', () => {
    const s = room(2, 1);
    expect(game.tvView(s).timerMode).toBe('hidden');
    expect(game.controllerView(s, 'p1').timerMode).toBe('hidden');
  });

  it('keeps the 3 · 2 · 1 in step with a pause: the views follow the shifted deadline', () => {
    let s = room(1, 1);
    s = send(s, 'p1', { type: 'ready' }, T0 + 1000);
    const at = s.startAt as number;
    s = vip(s, 'pause', T0 + 2000);
    s = vip(s, 'resume', T0 + 7000);
    expect(s.phase.deadline).toBe(at + 5000);
    expect(game.tvView(s).startAt).toBe(at + 5000);
    expect(game.controllerView(s, 'p1').startAt).toBe(at + 5000);
    s = timer(s);
    expect(s.phase.id).toBe('clue');
  });

  it('ticks each ready player on the strip and tells each phone its own state', () => {
    let s = room(2, 1);
    s = send(s, 'p1', { type: 'ready' }, T0 + 1000);
    const status = (id: string): string | undefined =>
      game.tvView(s).players.find((p) => p.id === id)?.status;
    expect(status('p1')).toBe('submitted');
    expect(status('p2')).toBe('active');
    expect(game.controllerView(s, 'p1').ready).toBe(true);
    expect(game.controllerView(s, 'p2').ready).toBe(false);
  });
});
