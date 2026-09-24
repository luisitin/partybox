// Hidden information (SPEC §11): roles, votes and cards never reach a view early or a view that
// may not see them; spectators get the TV's information; the state stays small. Driven by real
// bot games at every player count, checking every state they pass through.
import { createRng } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { knownTeam } from '../server/rules';
import { controllerView, tvView } from '../server/views';
import type { State } from '../server/types';
import { start } from './helpers';

const OVER = new Set(['gameOver', 'done']);

/** Plays a bot game and returns every state it passed through. */
function playOut(n: number, seed: number, long = false): State[] {
  const rng = createRng(seed);
  let s = long
    ? game.init({ players: longPlayers(n, seed), settings: {}, seed, now: 0 })
    : start(n, seed);
  const seen = [s];
  for (let step = 0; step < 3000 && s.phase.id !== 'done'; step++) {
    const acts = s.seats
      .map((id) => ({ id, input: game.bot.sampleInput(s, id, rng) }))
      .filter((a) => a.input !== null);
    const now = s.phase.startedAt + 500;
    if (acts.length > 0) {
      const a = acts[rng.int(0, acts.length - 1)] as { id: string; input: NonNullable<unknown> };
      s = game.reduce(s, { type: 'input', now, playerId: a.id, input: a.input as never });
    } else {
      const at = s.phase.deadline ?? now;
      s = game.reduce(s, {
        type: 'timer',
        now: at,
        phaseId: s.phase.id,
        startedAt: s.phase.startedAt,
      });
    }
    seen.push(s);
  }
  return seen;
}

/** Worst-case ids for the view budget: UUID-long ids, photo avatars, 12-character names. */
function longPlayers(n: number, seed: number): State['players'][string][] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${String(seed).padStart(8, '0')}-4a1b-4c2d-8e3f-${String(i).padStart(12, '0')}`,
    name: `Longer Name${i}`.slice(0, 12),
    avatarId: 'photo:0123456789abcdef',
    connected: true,
  }));
}

const GAMES = [5, 6, 7, 8, 9, 10].flatMap((n) => [1, 2].map((seed) => playOut(n, seed * 100 + n)));

describe('leaks', () => {
  it('bot games reach the end', () => {
    for (const g of GAMES) expect(g.at(-1)?.phase.id).toBe('done');
  });

  it('roles never appear in the TV view before gameOver', () => {
    for (const s of GAMES.flat()) {
      if (OVER.has(s.phase.id)) continue;
      const tv = tvView(s);
      expect(tv.seats.every((x) => x.role === undefined)).toBe(true);
      expect(JSON.stringify(tv)).not.toMatch(/"(liberal|fascist|hitler)"/);
    }
  });

  it("a phone sees its own role, and another player's role only as R2 allows", () => {
    for (const s of GAMES.flat().filter((_, i) => i % 7 === 0)) {
      if (OVER.has(s.phase.id)) continue;
      for (const viewer of s.seats) {
        const v = controllerView(s, viewer);
        expect(v.dossier?.role).toBe(s.role[viewer]);
        const allowed = new Set(knownTeam(s, viewer));
        for (const t of v.dossier?.team ?? []) expect(allowed.has(t.id)).toBe(true);
        expect(v.seats.every((x) => x.role === undefined)).toBe(true);
      }
    }
  });

  it('every dossier has the same structure', () => {
    const s = start(7, 3);
    const shapes = s.seats.map((id) => Object.keys(controllerView(s, id).dossier ?? {}).join());
    expect(new Set(shapes).size).toBe(1);
  });

  it('votes stay hidden until voteReveal', () => {
    for (const s of GAMES.flat().filter((x) => x.phase.id === 'vote')) {
      expect(tvView(s).seats.every((x) => x.vote === undefined)).toBe(true);
      for (const viewer of s.seats) {
        const others = controllerView(s, viewer).seats.filter((x) => x.id !== viewer);
        expect(others.every((x) => x.vote === undefined)).toBe(true);
      }
    }
  });

  it('card identities never appear early: no cards on the TV, only the chooser holds them', () => {
    for (const s of GAMES.flat()) {
      const tv = tvView(s);
      expect(JSON.stringify(tv)).not.toContain('"cards"');
      if (['presDraw', 'chanEnact', 'vetoAsk'].includes(s.phase.id))
        expect(tv.round.enacted).toBeNull();
      for (const viewer of s.seats) {
        const act = controllerView(s, viewer).act;
        if (act && act.cards.length > 0) {
          const ok =
            (s.phase.id === 'chanEnact' && viewer === s.round.nominee) ||
            (s.phase.id !== 'chanEnact' && viewer === s.round.president);
          expect(ok).toBe(true);
        }
      }
    }
  });

  it('spectators get exactly the TV information', () => {
    for (const s of GAMES.flat().filter((_, i) => i % 11 === 0)) {
      const { me: _me, dossier, act, status, ...cv } = controllerView(s, 'late-joiner');
      void _me;
      expect(dossier).toBeNull();
      expect(act).toBeNull();
      expect(status).toBe('spectator');
      expect({ ...cv, lastCall: false }).toEqual({ ...tvView(s), lastCall: false });
    }
  });

  it('views stay within 4 KB (owner ruling 20) and the state under 96 KB at 10 players', () => {
    for (const s of [1, 2, 3].flatMap((seed) => playOut(10, seed, true))) {
      expect(JSON.stringify(s).length).toBeLessThan(96 * 1024);
      expect(JSON.stringify(tvView(s)).length).toBeLessThanOrEqual(4096);
      for (const id of s.seats)
        expect(JSON.stringify(controllerView(s, id)).length).toBeLessThanOrEqual(4096);
    }
  });
});
