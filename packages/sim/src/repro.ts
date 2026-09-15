// Repro files: everything needed to replay a failing run exactly (docs/TESTING.md). Written to
// reports/stress/repros/<hash>.json; `pnpm sim --replay <file>` re-applies the events and re-runs
// the invariants so the failure shows up at the same event index.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AnyGameDefinition, GameEvent, GameStateBase } from '@partybox/shared';
import { REPO_ROOT, fnv1a, hashState } from '@partybox/game-sdk/testing';
import { checkResults, checkState, checkViews } from './invariants';
import type { RunInit, RunResult, Violation } from './runner';

export const REPRO_DIR = join(REPO_ROOT, 'reports', 'stress', 'repros');

export interface ReproFile {
  version: 1;
  gameId: string;
  seed: number;
  players: number;
  strategy: string;
  settings: RunResult['settings'];
  init: RunInit;
  events: GameEvent<unknown>[];
  violations: Violation[];
  finalHash: string;
}

export function writeRepro(run: RunResult, dir: string = REPRO_DIR): string {
  mkdirSync(dir, { recursive: true });
  const file: ReproFile = {
    version: 1,
    gameId: run.gameId,
    seed: run.seed,
    players: run.players,
    strategy: run.strategy,
    settings: run.settings,
    init: run.init,
    events: run.events,
    violations: run.violations,
    finalHash: run.hash,
  };
  const name = fnv1a(
    `${run.gameId}:${run.seed}:${run.players}:${run.strategy}:${JSON.stringify(run.settings)}`,
  );
  const path = join(dir, `${run.gameId}-${name}.json`);
  writeFileSync(path, JSON.stringify(file, null, 2));
  return path;
}

export function readRepro(path: string): ReproFile {
  if (!existsSync(path)) throw new Error(`repro not found: ${path}`);
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as ReproFile;
  if (parsed.version !== 1) throw new Error(`unsupported repro version ${String(parsed.version)}`);
  return parsed;
}

export interface ReplayReport {
  violations: Violation[];
  finalHash: string;
  matchesOriginal: boolean;
  events: number;
}

/** Re-applies a repro's events with invariants on; independent of any strategy or rng. */
export function replayRepro(game: AnyGameDefinition, repro: ReproFile): ReplayReport {
  const initIds = repro.init.players.map((p) => p.id);
  let state: GameStateBase = game.init(repro.init);
  const violations: Violation[] = [];
  repro.events.forEach((event, at) => {
    const before = state;
    try {
      state = game.reduce(before, event);
    } catch (err) {
      violations.push({ at, rule: 'reduce-throws', detail: `${event.type}: ${String(err)}` });
      return;
    }
    for (const detail of checkState({ game, initIds, event, before, after: state, now: event.now }))
      violations.push({ at, rule: 'state', detail });
    for (const detail of checkViews(game, state)) violations.push({ at, rule: 'views', detail });
  });
  if (game.results(state) !== null)
    for (const detail of checkResults(game, state, initIds))
      violations.push({ at: repro.events.length, rule: 'results', detail });
  const finalHash = hashState(state);
  return {
    violations,
    finalHash,
    matchesOriginal: finalHash === repro.finalHash,
    events: repro.events.length,
  };
}
