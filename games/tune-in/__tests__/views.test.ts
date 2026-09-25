// Spec §5.6 / §5.18 "Leaks": the target only on the psychic's phone before the reveal; solo dials
// never in another view before the reveal; huddle markers only on the active side and the TV,
// never in remote-text; the phone's own result only after the TV's points beat.
import { describe, expect, it } from 'vitest';
import type { InitContext } from '@partybox/game-sdk';
import { game } from '../server/index';
import { dialAll, guessers, roster, send, start, T0, timer, toClue, toDial } from './helpers';

const json = (v: unknown): string => JSON.stringify(v);

describe('the target', () => {
  it('is only in the psychic view until the reveal, then in everyone’s', () => {
    for (const s of [toClue(start(5, { mode: 'solo' })), toDial(start(5, { mode: 'solo' }), 37)]) {
      expect(json(game.tvView(s))).not.toContain('bullseyeAt');
      for (const id of s.seats) {
        const has = json(game.controllerView(s, id)).includes('bullseyeAt');
        expect(has).toBe(id === s.turn.psychic);
      }
    }
    let s = dialAll(toDial(start(5, { mode: 'solo' }), 37), [30, 30, 30, 30]);
    expect(game.tvView(s).reveal?.bullseyeAt).toBe(37);
    s = timer(s);
    for (const id of s.seats) expect(game.controllerView(s, id).bullseyeAt).toBe(37);
  });
});

describe('solo dials', () => {
  it('never appear in another view before the reveal — not even the psychic’s', () => {
    let s = toDial(start(5, { mode: 'solo' }), 50);
    const [a] = guessers(s) as [string];
    s = send(s, a, { type: 'dial', pos: 83 });
    expect(json(game.tvView(s))).not.toContain('83');
    for (const id of s.seats) {
      const view = game.controllerView(s, id);
      if (id === a) expect(view.myDial).toBe(83);
      else expect(json(view)).not.toContain(':83');
    }
  });
});

describe('huddle markers', () => {
  it('co-op: every phone of the side and the TV see them live', () => {
    let s = toDial(start(4, { mode: 'coop' }), 50);
    const [a] = guessers(s) as [string];
    s = send(s, a, { type: 'dial', pos: 61 });
    expect(game.tvView(s).huddleMarks).toEqual([{ id: a, pos: 61 }]);
    for (const id of s.seats) expect(game.controllerView(s, id).huddleMarks).toBeDefined();
  });

  it('teams: only the active team (and its psychic); never the other team', () => {
    let s = toDial(start(6, { mode: 'teams' }), 50);
    const [a] = guessers(s) as [string];
    s = send(s, a, { type: 'dial', pos: 61 });
    const active = s.teams?.[s.turn.team as 'sun' | 'moon'] ?? [];
    for (const id of s.seats)
      expect(json(game.controllerView(s, id)).includes('huddleMarks')).toBe(active.includes(id));
  });

  it('remote-text forces the huddle off: nobody sees markers, the TV neither', () => {
    const ctx = {
      players: roster(4),
      settings: { mode: 'coop' },
      seed: 3,
      now: T0,
      presence: { mode: 'remote-text', phoneOnly: false },
    } as InitContext;
    let s = toDial(game.init(ctx), 50);
    expect(s.cfg.huddle).toBe(false);
    const [a] = guessers(s) as [string];
    s = send(s, a, { type: 'dial', pos: 61 });
    expect(json(game.tvView(s))).not.toContain('huddleMarks');
    for (const id of s.seats) expect(json(game.controllerView(s, id))).not.toContain('huddleMarks');
  });
});

describe('the phone never spoils', () => {
  it('own result appears only at the TV’s points beat', () => {
    let s = dialAll(toDial(start(4, { mode: 'solo' }), 50), [50, 58, 90]);
    expect(s.phase.id).toBe('reveal');
    const [a] = guessers(s) as [string];
    expect(game.controllerView(s, a).mine).toBeNull();
    s = timer(s);
    expect(game.controllerView(s, a).mine).toEqual({ pts: 4, away: 0, psychic: null });
    expect(game.controllerView(s, s.turn.psychic).mine?.psychic).toEqual({
      sum: 7,
      n: 3,
      perfect: false,
    });
  });

  it('the teams banner and the co-op meter hold their totals until the points beat', () => {
    let t = toDial(start(4, { mode: 'teams' }), 50);
    t = dialAll(t, [50]);
    t = timer(t); // the call runs out → reveal, step 0
    expect(t.phase.id).toBe('reveal');
    const active = t.turn.team as 'sun' | 'moon';
    expect(t.team[active]).toBe(4);
    expect(game.tvView(t).team[active]).toBe(0);
    expect(game.tvView(timer(t)).team[active]).toBe(4);
    let c = dialAll(toDial(start(3, { mode: 'coop' }), 50), [50, 50]);
    expect(c.coopTotal).toBe(4);
    expect(game.tvView(c).coop?.total).toBe(0);
    c = timer(c);
    expect(game.tvView(c).coop?.total).toBe(4);
  });

  it('the TV strip keeps the old scores through the reveal', () => {
    const s = dialAll(toDial(start(4, { mode: 'solo' }), 50), [50, 50, 50]);
    expect(game.tvView(s).players.every((p) => (p.score ?? 0) === 0)).toBe(true);
    expect(Object.values(s.scores).some((v) => v > 0)).toBe(true);
  });
});

describe('views are small and honest', () => {
  it('stay under 4 KB at 16 players in every phase', () => {
    let s = start(16, { mode: 'teams' });
    let worst = 0;
    for (let i = 0; i < 40 && s.phase.id !== 'done'; i += 1) {
      if (s.phase.id === 'dial')
        s = dialAll(
          s,
          guessers(s).map((_, k) => 10 + k * 5),
        );
      const views = [game.tvView(s), ...s.seats.map((id) => game.controllerView(s, id))];
      for (const v of views) worst = Math.max(worst, json(v).length);
      s = s.phase.id === 'clue' ? toDial(s) : timer(s);
    }
    expect(worst).toBeLessThan(4096);
  });
});
