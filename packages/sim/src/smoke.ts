// `pnpm sim --smoke` — what `pnpm verify` runs: a fixed number of mixed-strategy games per game
// folder (registered games AND the template) with varying player counts. Exit 1 on any violation.
import { loadAllGames } from '@partybox/game-sdk/testing';
import { formatSummary, runBatch } from './batch';

export const SMOKE_RUNS = 50;

export async function smoke(runs = SMOKE_RUNS): Promise<boolean> {
  const games = await loadAllGames();
  let ok = true;
  for (const loaded of games) {
    const summary = runBatch({
      game: loaded.game,
      runs,
      seed: 1000,
      players: 'vary',
      strategy: 'mixed',
      writeRepros: true,
    });
    console.log(formatSummary(summary));
    if (summary.failed > 0) ok = false;
  }
  return ok;
}
