import { describe, expect, it } from 'vitest';
import type { AnyGameDefinition } from '@partybox/shared';
import { createRng } from '@partybox/shared';
import { loadGame } from '@partybox/game-sdk/testing';
import { runFuzz } from './index';
import { attacksFor, CATEGORIES } from './attacks';
import { buildCorpus } from './corpus';
import { breakShape, getAt, hostileContent, paths, semantic, setAt } from './mutate';
import { runRoomBatch } from '../room/batch';

const template = await loadGame('_template');

describe('mutators', () => {
  const sample = { type: 'answer', text: 'hi', n: 3, nested: { flag: true, list: [1, 'a'] } };
  it('paths/getAt/setAt round-trip every node', () => {
    for (const p of paths(sample)) expect(getAt(setAt(sample, p, 'X'), p)).toBe('X');
    expect(setAt(sample, ['nested', 'list', 1], 'b')).toMatchObject({ nested: { list: [1, 'b'] } });
    expect(sample.nested.list[1]).toBe('a'); // never mutates the original
  });
  it('hostileContent keeps every JSON type', () => {
    const out = hostileContent(sample, createRng(3)) as typeof sample;
    expect(typeof out.text).toBe('string');
    expect(typeof out.n).toBe('number');
    expect(out.nested.flag).toBe(true);
    expect(Array.isArray(out.nested.list)).toBe(true);
  });
  it('semantic and breakShape usually change something and never add keys at the root', () => {
    const rng = createRng(9);
    const changed = (v: unknown): number =>
      paths(sample).filter((p) => JSON.stringify(getAt(v, p)) !== JSON.stringify(getAt(sample, p)))
        .length;
    let touched = 0;
    for (let i = 0; i < 40; i++) {
      const s = semantic(sample, rng, { me: 'p1', players: ['p1', 'p2'] }) as Record<
        string,
        unknown
      >;
      if (changed(s) > 0) touched += 1;
      expect(Object.keys(s)).toEqual(Object.keys(sample));
      breakShape(sample, rng); // must not throw on any path
    }
    expect(touched).toBeGreaterThan(20);
  });
});

describe('fuzz', () => {
  it('builds a corpus that covers every declared phase with replayable prefixes', () => {
    const corpus = buildCorpus(template.game, { seed: 1, runsPerStrategy: 1, perPhase: 3 });
    for (const phase of template.game.phases)
      expect(
        corpus.some((c) => c.state.phase.id === phase),
        phase,
      ).toBe(true);
    for (const c of corpus) {
      let s = template.game.init(c.init);
      for (const e of c.prefix) s = template.game.reduce(s, e);
      expect(s).toEqual(c.state);
    }
  });

  it('generates attacks in every category for the template', () => {
    const corpus = buildCorpus(template.game, { seed: 1, runsPerStrategy: 1, perPhase: 2 });
    const state = corpus[0]?.state as NonNullable<(typeof corpus)[0]>['state'];
    for (const c of CATEGORIES)
      expect(attacksFor(c, template.game, state, createRng(1)).length, c).toBeGreaterThan(0);
  });

  it('the template survives every category', () => {
    const s = runFuzz(template, { seed: 1, runsPerStrategy: 1, perPhase: 3, writeRepros: false });
    expect(s.failures).toEqual([]);
    expect(s.schema.threw).toBe(0);
    expect(s.schema.rejected).toBeGreaterThan(0);
  });

  it('catches a reducer that throws on strangers, a mutating reducer, and a leaking view', () => {
    const game = template.game;
    const throwing: AnyGameDefinition = {
      ...game,
      reduce: (s, e) => {
        if (e.type === 'input' && !(e.playerId in s.players)) throw new Error('stranger');
        return game.reduce(s, e);
      },
    };
    const mutating: AnyGameDefinition = {
      ...game,
      reduce: (s, e) => {
        if (e.type === 'timer') (s as { phase: { id: string } }).phase.id = s.phase.id; // touches input
        (s as { touched?: number }).touched =
          (Number((s as { touched?: number }).touched) || 0) + 1;
        return game.reduce(s, e);
      },
    };
    const leaking: AnyGameDefinition = {
      ...game,
      tvView: (s) => ({ ...game.tvView(s), all: (s as { answers: unknown }).answers }),
    };
    const opts = { seed: 2, runsPerStrategy: 1, perPhase: 2, writeRepros: false } as const;
    const a = runFuzz({ ...template, game: throwing }, { ...opts, categories: ['adversarial'] });
    expect(a.failures.some((f) => f.detail.includes('reduce threw'))).toBe(true);
    const b = runFuzz({ ...template, game: mutating }, { ...opts, categories: ['chaos-timing'] });
    expect(b.failures.some((f) => f.detail.includes('MUTATED'))).toBe(true);
    const c = runFuzz({ ...template, game: leaking }, { ...opts, categories: ['adversarial'] });
    expect(c.failures.some((f) => f.detail.includes('tvView leaks'))).toBe(true);
  });
});

describe('room chaos', () => {
  it('runs seeded rooms through the engine without violations and replays them', () => {
    const s = runRoomBatch({
      games: { template: template.game },
      runs: 20,
      seed: 1,
      steps: 300,
      writeRepros: false,
    });
    expect(s.failed).toBe(0);
    expect(s.gamesFinished).toBeGreaterThan(0);
  });
});
