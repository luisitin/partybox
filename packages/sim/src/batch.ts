// Runs many games and summarises: per-strategy counts, phase visits, violations, repro files.
import type { AnyGameDefinition } from '@partybox/shared';
import { writeRepro } from './repro';
import { runGame } from './runner';
import type { RunResult } from './runner';
import type { Strategy } from './strategies';

export interface BatchOptions {
  game: AnyGameDefinition;
  runs: number;
  seed: number;
  players: number | 'vary';
  strategy: Strategy;
  writeRepros: boolean;
  onRun?: (run: RunResult, index: number) => void;
}

export interface BatchSummary {
  gameId: string;
  runs: number;
  failed: number;
  repros: string[];
  violationsByRule: Record<string, number>;
  phaseVisits: Record<string, number>;
  avgEvents: number;
  avgSimSeconds: number;
  maxSimSeconds: number;
  firstFailures: { seed: number; players: number; strategy: Strategy; violation: string }[];
  ms: number;
}

/** Player count for run `i` when varying: walks min..max so every count is exercised. */
export function playersForRun(
  game: AnyGameDefinition,
  i: number,
  requested: number | 'vary',
): number {
  if (requested !== 'vary')
    return Math.min(game.manifest.maxPlayers, Math.max(game.manifest.minPlayers, requested));
  const { minPlayers, maxPlayers } = game.manifest;
  return minPlayers + (i % (maxPlayers - minPlayers + 1));
}

export function runBatch(options: BatchOptions): BatchSummary {
  const started = Date.now();
  const summary: BatchSummary = {
    gameId: options.game.manifest.id,
    runs: options.runs,
    failed: 0,
    repros: [],
    violationsByRule: {},
    phaseVisits: {},
    avgEvents: 0,
    avgSimSeconds: 0,
    maxSimSeconds: 0,
    firstFailures: [],
    ms: 0,
  };
  let events = 0;
  let sim = 0;
  for (let i = 0; i < options.runs; i++) {
    const players = playersForRun(options.game, i, options.players);
    const run = runGame(options.game, {
      seed: options.seed + i,
      players,
      strategy: options.strategy,
    });
    options.onRun?.(run, i);
    events += run.events.length;
    sim += run.simMs;
    summary.maxSimSeconds = Math.max(summary.maxSimSeconds, run.simMs / 1000);
    for (const [phase, n] of Object.entries(run.phaseVisits))
      summary.phaseVisits[phase] = (summary.phaseVisits[phase] ?? 0) + n;
    if (run.violations.length > 0) {
      summary.failed += 1;
      for (const v of run.violations)
        summary.violationsByRule[v.rule] = (summary.violationsByRule[v.rule] ?? 0) + 1;
      if (summary.firstFailures.length < 5)
        summary.firstFailures.push({
          seed: run.seed,
          players,
          strategy: options.strategy,
          violation: `${run.violations[0]?.rule}: ${run.violations[0]?.detail}`,
        });
      if (options.writeRepros) summary.repros.push(writeRepro(run));
    }
  }
  summary.avgEvents = options.runs ? Math.round(events / options.runs) : 0;
  summary.avgSimSeconds = options.runs ? Math.round(sim / options.runs / 1000) : 0;
  summary.ms = Date.now() - started;
  return summary;
}

export function formatSummary(s: BatchSummary): string {
  const lines = [
    `${s.gameId}: ${s.runs} runs, ${s.failed} failed, ${Math.round(s.ms)} ms (${s.avgEvents} events / ${s.avgSimSeconds} s simulated per game, max ${Math.round(s.maxSimSeconds)} s)`,
    `  phases: ${Object.entries(s.phaseVisits)
      .map(([p, n]) => `${p}×${n}`)
      .join('  ')}`,
  ];
  if (s.failed > 0) {
    lines.push(
      `  violations: ${Object.entries(s.violationsByRule)
        .map(([r, n]) => `${r}×${n}`)
        .join('  ')}`,
    );
    for (const f of s.firstFailures)
      lines.push(`  seed ${f.seed} players ${f.players} ${f.strategy}: ${f.violation}`);
    for (const r of s.repros) lines.push(`  repro: ${r}`);
  }
  return lines.join('\n');
}
