import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import type { AnyGameDefinition } from '@partybox/shared';
import { loadGame } from '@partybox/game-sdk/testing';
import { playersForRun, runBatch } from './batch';
import { readRepro, replayRepro, writeRepro } from './repro';
import { runGame } from './runner';
import { STRATEGIES, assignStrategies, chaosAction, reactionDelay } from './strategies';
import { createRng } from '@partybox/shared';

const template = await loadGame('_template');
const game = template.game;
const tmp = mkdtempSync(join(tmpdir(), 'pb-sim-'));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe('runner', () => {
  for (const strategy of STRATEGIES) {
    it(`finishes the template with ${strategy} bots and no violations`, () => {
      for (const players of [1, 4, 16]) {
        const run = runGame(game, { seed: 3, players, strategy });
        expect(run.violations, `${strategy} n=${players}`).toEqual([]);
        expect(run.stuck).toBe(false);
        expect(game.results(run.finalState)).not.toBeNull();
        expect(run.phaseVisits['done']).toBe(1);
      }
    });
  }

  it('is deterministic for the same (seed, players, strategy)', () => {
    const a = runGame(game, { seed: 11, players: 5, strategy: 'mixed' });
    const b = runGame(game, { seed: 11, players: 5, strategy: 'mixed' });
    expect(a.hash).toBe(b.hash);
    expect(a.events).toEqual(b.events);
    expect(runGame(game, { seed: 12, players: 5, strategy: 'mixed' }).hash).not.toBe(a.hash);
  });

  it('reports a game that never terminates as stuck within the budget', () => {
    const stubborn: AnyGameDefinition = { ...game, results: () => null };
    const run = runGame(stubborn, { seed: 1, players: 3, strategy: 'random', maxSimMs: 60_000 });
    expect(run.stuck).toBe(true);
    const rules = run.violations.map((v) => v.rule);
    expect(rules.some((r) => r === 'budget' || r === 'stuck')).toBe(true);
  });

  it('catches a throwing reducer, undeclared phases and view crashes', () => {
    const broken: AnyGameDefinition = {
      ...game,
      reduce: (s, e) => {
        if (e.type === 'timer') throw new Error('boom');
        return game.reduce(s, e);
      },
    };
    const run = runGame(broken, { seed: 2, players: 2, strategy: 'idle', maxSimMs: 120_000 });
    expect(run.violations.some((v) => v.rule === 'reduce-throws')).toBe(true);
    const wanderer: AnyGameDefinition = {
      ...game,
      reduce: (s, e) =>
        e.type === 'timer' ? { ...s, phase: { ...s.phase, id: 'limbo' } } : game.reduce(s, e),
    };
    const run2 = runGame(wanderer, { seed: 2, players: 2, strategy: 'idle', maxSimMs: 120_000 });
    expect(run2.violations.some((v) => v.rule === 'state' && v.detail.includes('undeclared'))).toBe(
      true,
    );
    const blind: AnyGameDefinition = {
      ...game,
      tvView: () => {
        throw new Error('no tv');
      },
    };
    const run3 = runGame(blind, { seed: 2, players: 2, strategy: 'fast' });
    expect(run3.violations.some((v) => v.rule === 'views')).toBe(true);
  });
});

describe('batch + repro', () => {
  it('varies player counts across min..max and summarises', () => {
    expect([0, 1, 2, 15, 16].map((i) => playersForRun(game, i, 'vary'))).toEqual([1, 2, 3, 16, 1]);
    expect(playersForRun(game, 0, 99)).toBe(16);
    const summary = runBatch({
      game,
      runs: 20,
      seed: 500,
      players: 'vary',
      strategy: 'mixed',
      writeRepros: false,
    });
    expect(summary.failed).toBe(0);
    expect(summary.phaseVisits['done']).toBe(20);
    expect(summary.avgEvents).toBeGreaterThan(0);
  });

  it('writes a repro for a failing run that replays to the same failure', () => {
    const broken: AnyGameDefinition = {
      ...game,
      reduce: (s, e) => {
        if (e.type === 'timer' && s.phase.id === 'reveal') throw new Error('reveal boom');
        return game.reduce(s, e);
      },
    };
    const run = runGame(broken, { seed: 9, players: 3, strategy: 'idle', maxSimMs: 120_000 });
    expect(run.violations.length).toBeGreaterThan(0);
    const path = writeRepro(run, tmp);
    const repro = readRepro(path);
    expect(repro.gameId).toBe('template');
    expect(repro.events).toEqual(run.events);
    const report = replayRepro(broken, repro);
    expect(report.violations.map((v) => v.rule)).toContain('reduce-throws');
    expect(report.matchesOriginal).toBe(true);
    // The healthy game replays the same events without violations (the bug is in the reducer).
    expect(replayRepro(game, repro).violations).toEqual([]);
    expect(() => readRepro(join(tmp, 'missing.json'))).toThrow();
  });
});

describe('strategies', () => {
  it('assigns per-player strategies and yields sane delays', () => {
    const rng = createRng(1);
    expect(assignStrategies('fast', 3, rng)).toEqual(['fast', 'fast', 'fast']);
    expect(new Set(assignStrategies('mixed', 40, rng)).size).toBeGreaterThan(1);
    expect(reactionDelay('idle', rng, 1000)).toBeNull();
    expect(reactionDelay('fast', rng, 1000)).toBeLessThanOrEqual(400);
    expect(reactionDelay('slow', rng, 10_000)).toBeGreaterThanOrEqual(100);
    expect(reactionDelay('slow', rng, Number.POSITIVE_INFINITY)).toBeGreaterThanOrEqual(2000);
    expect(reactionDelay('random', rng, 1)).toBeGreaterThanOrEqual(300);
    const actions = new Set(Array.from({ length: 500 }, () => chaosAction(rng)));
    expect(actions.has(null)).toBe(true);
    expect(actions.has('disconnect')).toBe(true);
  });
});
