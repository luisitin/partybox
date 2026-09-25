// D7 (leaving the game) and D8 (too few players). A seat is exiled when its player leaves or is
// removed (`gone`), or after EXILE_MS dropped, counted by the game (the owner's call 2026-09-24).
import { describe, expect, it } from 'vitest';
import { EXILE_MS } from '../server/types';
import type { Party, State } from '../server/types';
import { elect, reduce, rig, seated, send, timeout, until, vip } from './helpers';

function leave(state: State, id: string, at?: number): State {
  const now = at ?? state.phase.startedAt + 100;
  return reduce(state, { type: 'player', now, playerId: id, connected: false, gone: 'left' });
}

function drop(state: State, id: string, now: number, connected = false): State {
  return reduce(state, { type: 'player', now, playerId: id, connected });
}

describe('D7 · exile', () => {
  it('D7 Hitler exiled: the Liberals win ("Hitler fled")', () => {
    const s = leave(seated(rig(5)), 'p5');
    expect(s.phase.id).toBe('gameOver');
    expect(s).toMatchObject({ winner: 'liberals', winReason: 'hitlerFled' });
  });

  it('D7 an exiled player leaves the seat order, the votes and the nominations; the role stays hidden', () => {
    let s = leave(seated(rig(7)), 'p3');
    expect(s.alive).not.toContain('p3');
    expect(s.exiled).toEqual(['p3']);
    expect(send(s, 'p1', { type: 'nominate', target: 'p3' }).phase.id).toBe('nominate');
    s = until(elect(s, 'p2', false), 'nominate');
    s = until(elect(s, 'p4', false), 'nominate');
    expect(s.round.president).toBe('p4'); // p2 → (p3 skipped) → p4
  });

  it('D7 nominate: the Presidential candidate exiled → the candidacy passes on, tracker untouched', () => {
    const s = leave(seated(rig(7)), 'p1');
    expect(s.phase.id).toBe('nominate');
    expect(s.round.president).toBe('p2');
    expect(s.tracker).toBe(0);
  });

  it('D7 vote: the nominee exiled → votes discarded, back to nominate with the same President', () => {
    let s = send(seated(rig(7)), 'p1', { type: 'nominate', target: 'p3' });
    s = send(s, 'p2', { type: 'vote', ja: true });
    s = leave(s, 'p3');
    expect(s.phase.id).toBe('nominate');
    expect(s.round).toMatchObject({ president: 'p1', nominee: null, votes: {} });
  });

  it('D7 vote: an exiled voter’s vote is dropped from the count', () => {
    let s = send(seated(rig(7)), 'p1', { type: 'nominate', target: 'p2' });
    for (const id of ['p1', 'p2', 'p3', 'p5', 'p6']) s = send(s, id, { type: 'vote', ja: true });
    s = send(s, 'p4', { type: 'vote', ja: false });
    s = leave(s, 'p4'); // p7 still to vote
    expect(s.phase.id).toBe('vote');
    expect(s.round.votes).not.toHaveProperty('p4');
    s = send(s, 'p7', { type: 'vote', ja: false });
    expect(s.phase.id).toBe('voteReveal');
    expect(s.history.at(-1)).toMatchObject({ ja: 5, nein: 1 }); // six voters left
  });

  it('D7 session: the chooser exiled → the timeout result applies at once', () => {
    let s = until(elect(seated(rig(7)), 'p2'), 'presDraw');
    s = leave(s, 'p1');
    expect(s.phase.id).toBe('chanEnact');
    expect(s.round.passed).toHaveLength(2);
    s = leave(s, 'p2');
    expect(s.phase.id).toBe('enactReveal');
  });

  it('D7 the Chancellor exiled during the draw: the session still ends at once when their turn comes', () => {
    let s = until(elect(seated(rig(7)), 'p2'), 'presDraw');
    s = leave(s, 'p2');
    expect(s.phase.id).toBe('presDraw');
    s = send(s, 'p1', { type: 'discard', index: 0 });
    expect(s.phase.id).toBe('enactReveal');
  });

  it('D7 power: the President exiled → a random valid target at once', () => {
    const FF: Party[] = Array<Party>(17).fill('F');
    let s = until(
      elect(seated(rig(7, { deck: FF, patch: { board: { L: 0, F: 3 } } })), 'p2'),
      'presDraw',
    );
    s = send(send(s, 'p1', { type: 'discard', index: 0 }), 'p2', { type: 'enact', index: 0 });
    s = timeout(timeout(s)); // enactReveal → claims → power (execution)
    expect(s.phase.id).toBe('power');
    s = leave(s, 'p1');
    expect(s.phase.id).toBe('powerReveal');
    expect(s.round.power?.target).not.toBeNull();
  });

  it('D7 a seat dropped for the whole hold is exiled; one back in time is not', () => {
    const s = seated(rig(7));
    const t = s.phase.startedAt + 1_000;
    const gone = drop(s, 'p3', t);
    expect(gone.exiled).toEqual([]);
    const later = send(gone, 'p1', { type: 'nominate', target: 'p2' }, t + EXILE_MS);
    expect(later.exiled).toEqual(['p3']);
    const back = drop(gone, 'p3', t + 60_000, true);
    expect(send(back, 'p1', { type: 'nominate', target: 'p2' }, t + EXILE_MS).exiled).toEqual([]);
  });

  it('D7 a dropped player who is not exiled yet simply misses deadlines', () => {
    const table = seated(rig(5));
    const s = timeout(drop(table, 'p1', table.phase.startedAt + 100));
    expect(s.phase.id).toBe('vote');
    expect(s.exiled).toEqual([]);
  });
});

describe('D10 · a pause holds what a leave or drop would do until resume', () => {
  it('D10 the last missing voter leaves during a pause: the reveal waits for resume', () => {
    // p4 is a Liberal (not Hitler), so the table plays on without them.
    let s = send(seated(rig(6)), 'p1', { type: 'nominate', target: 'p2' });
    for (const id of ['p1', 'p2', 'p3', 'p5', 'p6']) s = send(s, id, { type: 'vote', ja: true });
    const at = s.phase.startedAt + 1_000;
    s = vip(s, 'pause', at);
    s = leave(s, 'p4', at + 500);
    expect(s.phase.id).toBe('vote');
    s = vip(s, 'resume', at + 5_000);
    expect(s.phase.id).toBe('voteReveal');
  });

  it('D10 a drop completes the ready-up during a pause: the count starts at resume', () => {
    let s = rig(5);
    for (const id of ['p1', 'p2', 'p3', 'p4']) s = send(s, id, { type: 'ready' });
    const at = s.phase.startedAt + 1_000;
    s = vip(s, 'pause', at);
    s = drop(s, 'p5', at + 500);
    expect(s.startAt).toBeNull();
    s = vip(s, 'resume', at + 4_000);
    expect(s.startAt).not.toBeNull();
  });
});

describe('D8 · too few players', () => {
  it('D8 fewer than 3 players left: the side closer to its goal wins', () => {
    let s = seated(
      rig(5, {
        patch: { board: { L: 3, F: 2 }, alive: ['p1', 'p2', 'p4'], executed: ['p3', 'p5'] },
      }),
    );
    s = { ...s, role: { ...s.role, p5: 'liberal', p3: 'hitler' } };
    s = leave(s, 'p4');
    expect(s).toMatchObject({ winner: 'liberals', winReason: 'tooFew' });
    expect(s.phase.id).toBe('gameOver');
  });

  it('D8 a tie goes to the Fascists', () => {
    let s = seated(
      rig(5, {
        patch: { board: { L: 0, F: 0 }, alive: ['p1', 'p2', 'p4'], executed: ['p3', 'p5'] },
      }),
    );
    s = { ...s, role: { ...s.role, p5: 'liberal', p3: 'hitler' } };
    s = leave(s, 'p1');
    expect(s).toMatchObject({ winner: 'fascists', winReason: 'tooFew' });
  });
});
