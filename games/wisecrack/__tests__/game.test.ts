// Unit tests for Wisecrack: a whole game on timers alone, pairing and content rules (README
// "Phases" + "Content"). Scoring and phase edge cases live in scoring.test.ts / phases.test.ts.
import { describe, expect, it } from 'vitest';
import { FAMILY, SPICY } from '../server/content';
import { game } from '../server/index';
import { PLAYERS, T0, playRound, promptsOf, start, timer } from './helpers';

describe('whole game', () => {
  it('finishes on timers alone (idle room) and every player gets a finite score', () => {
    let s = start({ rounds: 3 });
    const phases: string[] = [];
    let guard = 0;
    while (game.results(s) === null) {
      if (guard++ > 100) throw new Error(`stuck in ${s.phase.id}`);
      expect(s.phase.deadline).not.toBeNull();
      phases.push(s.phase.id);
      s = timer(s);
    }
    // Idle players answer nothing, so every prompt is both-blank: no vote/reveal at all.
    const round = ['intro', 'answer', 'scores'];
    expect(phases).toEqual([...round, ...round, ...round]);
    expect(game.results(s)?.scores).toEqual({ ana: 0, ben: 0, cleo: 0, dev: 0 });
  });

  it('manifest matches manifest.json and declares the six phases in order', () => {
    expect(game.manifest.id).toBe('wisecrack');
    expect(game.phases).toEqual(['intro', 'answer', 'vote', 'reveal', 'scores', 'done']);
    expect(game.manifest.settings.map((s) => s.key)).toEqual(['rounds', 'answerSeconds', 'spicy']);
  });

  it('clamps out-of-range settings to the manifest spec', () => {
    const s = game.init({
      players: PLAYERS,
      settings: { rounds: 99, answerSeconds: 1, spicy: 'yes' },
      seed: 1,
      now: T0,
    });
    expect(s.settings).toEqual({ rounds: 5, answerSeconds: 30, spicy: false });
  });
});

describe('pairing', () => {
  for (const n of [3, 4, 5, 8]) {
    it(`with ${n} players: n prompts, two distinct authors each, two prompts per player`, () => {
      const s = game.init({
        players: Array.from({ length: n }, (_, i) => ({
          id: `p${i}`,
          name: `P${i}`,
          avatarId: 'fox',
          connected: true,
        })),
        settings: {},
        seed: n,
        now: T0,
      });
      expect(s.phase.id).toBe('intro');
      expect(s.round).toBe(1);
      expect(s.prompts).toHaveLength(n);
      for (const p of s.prompts) {
        expect(p.authors).toHaveLength(2);
        expect(p.authors[0]).not.toBe(p.authors[1]);
        expect(p.text.length).toBeGreaterThan(0);
      }
      for (const id of Object.keys(s.players)) expect(promptsOf(s, id)).toHaveLength(2);
    });
  }

  it('never repeats a prompt across the whole game', () => {
    let s = start({ rounds: 5, players: 4 });
    const seen = new Set<string>();
    for (let round = 1; round <= 5; round++) {
      expect(s.round).toBe(round);
      for (const p of s.prompts) {
        expect(seen.has(p.id), `prompt ${p.id} repeated`).toBe(false);
        seen.add(p.id);
      }
      s = playRound(s);
      s = timer(s); // scores → next intro (or done)
    }
    expect(s.phase.id).toBe('done');
    expect(seen.size).toBe(20);
  });

  it('is seeded: same seed ⇒ same prompts and pairing; different seed ⇒ different draw', () => {
    const a = start({ seed: 42 });
    const b = start({ seed: 42 });
    const c = start({ seed: 43 });
    expect(a.prompts).toEqual(b.prompts);
    expect(a.deck).toEqual(b.deck);
    expect(c.deck).not.toEqual(a.deck);
  });

  it('draws only family prompts by default and mixes the spicy pack in when spicy is on', () => {
    const familyIds = new Set(FAMILY.prompts.map((p) => p.id));
    const spicyIds = new Set(SPICY.prompts.map((p) => p.id));
    const plain = start();
    expect(plain.deck.length).toBe(FAMILY.prompts.length - PLAYERS.length);
    for (const id of [...plain.deck, ...plain.prompts.map((p) => p.id)])
      expect(familyIds.has(id)).toBe(true);
    const spicy = start({ spicy: true });
    const all = [...spicy.deck, ...spicy.prompts.map((p) => p.id)];
    expect(all.length).toBe(FAMILY.prompts.length + SPICY.prompts.length);
    expect(all.some((id) => spicyIds.has(id))).toBe(true);
  });

  it('content packs meet the README counts with unique ids and short prompts', () => {
    expect(FAMILY.prompts.length).toBeGreaterThanOrEqual(150);
    expect(SPICY.prompts.length).toBeGreaterThanOrEqual(50);
    expect(FAMILY.botAnswers.length).toBeGreaterThanOrEqual(40);
    const ids = [...FAMILY.prompts, ...SPICY.prompts].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const text of FAMILY.botAnswers) expect(text.length).toBeLessThanOrEqual(80);
  });
});
