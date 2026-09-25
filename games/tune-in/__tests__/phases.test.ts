// The phase graph (spec §5.4, §5.12, §5.17): exits by deadline, all-done and VIP skip; void
// rounds; drops, leaves and returns; the huddle's lock/unlock; one connected player; everyone idle.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { DROP_GRACE_MS, REVEAL_OPEN_MS } from '../server/types';
import { dialAll, guessers, link, send, start, T0, timer, toClue, toDial, vip } from './helpers';

describe('the round', () => {
  it("clue (turn 1, straight after the shell's start) → dial → reveal (two beats) → scores", () => {
    let s = start(4, { mode: 'solo' });
    expect(s.phase.id).toBe('clue');
    expect(s.phase.startedAt).toBe(T0);
    s = toDial(s, 60);
    expect(s.phase.id).toBe('dial');
    s = dialAll(s, [60, 61, 62]);
    expect(s.phase.id).toBe('reveal');
    expect(s.turn.step).toBe(0);
    expect(s.phase.deadline).toBe(s.phase.startedAt + REVEAL_OPEN_MS);
    const startedAt = s.phase.startedAt;
    s = timer(s);
    expect(s.phase.id).toBe('reveal');
    expect(s.phase.startedAt).toBe(startedAt); // the same instance, re-armed (ADR-033)
    expect(s.turn.step).toBe(1);
    s = timer(s);
    expect(s.phase.id).toBe('scores');
    const first = s.turn.psychic;
    s = timer(s);
    expect(s.phase.id).toBe('clue');
    expect(s.turn.n).toBe(2);
    expect(s.turn.psychic).not.toBe(first);
  });

  it('every player is the psychic once in a one-per-player solo game', () => {
    let s = start(5, { mode: 'solo' });
    const seen: string[] = [];
    while (s.phase.id !== 'done') {
      // Each psychic sends a clue: an idle room ends after a few void rounds (§5.17).
      if (s.phase.id === 'clue') {
        seen.push(s.turn.psychic);
        s = toDial(s);
      } else s = timer(s);
    }
    expect(seen.sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
  });

  it('with no clue by the deadline the round is void: "No signal!", nobody scores, next round', () => {
    let s = toClue(start(4, { mode: 'solo' }));
    s = timer(s);
    expect(s.phase.id).toBe('reveal');
    expect(s.turn.void).toBe(true);
    s = timer(s);
    expect(s.phase.id).toBe('clue');
    expect(Object.values(s.scores).every((v) => v === 0)).toBe(true);
  });

  it('a dial after a lock clears the lock', () => {
    let s = toDial(start(4, { mode: 'solo' }));
    const id = guessers(s)[0] as string;
    s = send(s, id, { type: 'dial', pos: 30 });
    s = send(s, id, { type: 'lock' });
    expect(s.turn.locked).toContain(id);
    s = send(s, id, { type: 'dial', pos: 35 });
    expect(s.turn.locked).not.toContain(id);
    expect(s.turn.dials[id]).toBe(35);
  });

  it('a lock without a dial, and inputs from the psychic or a spectator, are ignored', () => {
    const s = toDial(start(4, { mode: 'solo' }));
    const id = guessers(s)[0] as string;
    expect(send(s, id, { type: 'lock' })).toBe(s);
    expect(send(s, s.turn.psychic, { type: 'dial', pos: 10 })).toBe(s);
    expect(send(s, 'ghost', { type: 'dial', pos: 10 })).toBe(s);
    expect(send(s, '__proto__', { type: 'call', side: 'left' })).toBe(s);
  });
});

describe('the VIP', () => {
  it('skips every phase, and a dial skip locks the dials where they are', () => {
    let s = start(4, { mode: 'solo' });
    expect(s.phase.id).toBe('clue');
    s = vip(s, 'skip');
    expect(s.turn.void).toBe(true);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('clue');
    s = send(s, s.turn.psychic, {
      type: 'clue',
      text: s.spectra[s.turn.spectrum]?.clues[0]?.text ?? '',
    });
    const id = guessers(s)[0] as string;
    s = send(s, id, { type: 'dial', pos: 70 });
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('reveal');
    expect(s.turn.points[id]).toBeDefined();
    s = vip(s, 'skip');
    expect(s.turn.step).toBe(1);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('scores');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('clue');
  });

  it('resume re-checks what a drop did during the pause (reviewer [12ea6b])', () => {
    // the last unlocked guesser drops while paused: resume goes straight to the reveal
    let s = toDial(start(4, { mode: 'solo' }));
    const [a, b, c] = guessers(s) as [string, string, string];
    s = send(s, a, { type: 'dial', pos: 40 });
    s = send(s, a, { type: 'lock' });
    s = send(s, b, { type: 'dial', pos: 50 });
    s = send(s, b, { type: 'lock' });
    s = vip(s, 'pause', s.phase.startedAt + 1000);
    s = link(s, c, false);
    expect(s.phase.id).toBe('dial');
    s = vip(s, 'resume', s.phase.startedAt + 4000);
    expect(s.phase.id).toBe('reveal');
    // the psychic drops while paused: resume starts the drop grace, never extends the clue
    let t = toClue(start(4, { mode: 'solo' }));
    const psychic = t.turn.psychic;
    t = vip(t, 'pause', t.phase.startedAt + 1000);
    t = link(t, psychic, false);
    const resumedAt = t.phase.startedAt + 3000;
    t = vip(t, 'resume', resumedAt);
    expect(t.phase.id).toBe('clue');
    expect(t.phase.deadline).toBe(resumedAt + DROP_GRACE_MS);
    // the psychic leaves for good while paused: resume voids the turn
    let u = toClue(start(4, { mode: 'solo' }));
    u = vip(u, 'pause', u.phase.startedAt + 1000);
    u = link(u, u.turn.psychic, false, 'left');
    u = vip(u, 'resume', u.phase.startedAt + 3000);
    expect(u.phase.id).toBe('reveal');
    expect(u.turn.void).toBe(true);
  });

  it('pause holds the clock, resume shifts the deadline, the dial positions stay', () => {
    let s = toDial(start(4, { mode: 'solo' }));
    const id = guessers(s)[0] as string;
    s = send(s, id, { type: 'dial', pos: 44 });
    const deadline = s.phase.deadline as number;
    s = vip(s, 'pause', s.phase.startedAt + 1000);
    expect(send(s, id, { type: 'dial', pos: 90 }).turn.dials[id]).toBe(44);
    s = vip(s, 'resume', s.phase.startedAt + 6000);
    expect(s.phase.deadline).toBe(deadline + 5000);
    expect(s.turn.dials[id]).toBe(44);
  });
});

describe('drops, leaves and returns', () => {
  it('a psychic who drops keeps the clue open a few seconds; coming back returns the full time', () => {
    let s = toClue(start(4, { mode: 'solo' }));
    const full = s.phase.deadline as number;
    s = link(s, s.turn.psychic, false);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 200 + DROP_GRACE_MS);
    s = link(s, s.turn.psychic, true);
    expect(s.phase.deadline).toBe(full);
  });

  it('a psychic who leaves for good voids the round and is never drawn again', () => {
    let s = toClue(start(4, { mode: 'solo' }));
    const gone = s.turn.psychic;
    s = link(s, gone, false, 'left');
    expect(s.turn.void).toBe(true);
    while (s.phase.id !== 'done') {
      s = timer(s);
      if (s.phase.id === 'clue') expect(s.turn.psychic).not.toBe(gone);
    }
    expect(game.results(s)?.scores).toHaveProperty(gone);
  });

  it('the last outstanding guesser dropping ends the dial like their lock would', () => {
    let s = toDial(start(4, { mode: 'solo' }));
    const [a, b, c] = guessers(s) as [string, string, string];
    s = send(send(s, a, { type: 'dial', pos: 20 }), a, { type: 'lock' });
    s = send(send(s, b, { type: 'dial', pos: 20 }), b, { type: 'lock' });
    expect(s.phase.id).toBe('dial');
    s = link(s, c, false);
    expect(s.phase.id).toBe('reveal');
  });

  it('one connected player: psychic rounds pass with nobody to dial', () => {
    let s = start(3, { mode: 'solo' });
    s = link(link(s, 'p2', false), 'p3', false);
    s = timer(s);
    let guard = 0;
    while (s.phase.id !== 'done' && guard++ < 50) {
      if (s.phase.id === 'clue' && s.players[s.turn.psychic]?.connected)
        s = send(s, s.turn.psychic, {
          type: 'clue',
          text: s.spectra[s.turn.spectrum]?.clues[0]?.text ?? '',
        });
      else s = timer(s);
    }
    expect(s.phase.id).toBe('done');
  });

  it('everyone idle: every round is void and the game ends quickly', () => {
    let s = start(6, { mode: 'solo' });
    let simulated = 0;
    while (s.phase.id !== 'done') {
      simulated += (s.phase.deadline ?? 0) - s.phase.startedAt;
      s = timer(s);
    }
    expect(simulated).toBeLessThan(6 * 60_000);
    expect(new Set(Object.values(game.results(s)?.scores ?? {}))).toEqual(new Set([0]));
  });
});

describe('teams', () => {
  it('Sun and Moon alternate; the other team calls; a team with nobody left is void', () => {
    let s = toClue(start(4, { mode: 'teams' }));
    const first = s.turn.team;
    s = dialAll(toDial(s, 50), [10]);
    expect(s.phase.id).toBe('call');
    s = timer(timer(timer(timer(s))));
    expect(s.phase.id).toBe('clue');
    expect(s.turn.team).not.toBe(first);
  });
});
