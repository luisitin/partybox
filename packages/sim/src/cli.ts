// `pnpm sim` — headless games. See packages/sim/README.md.
//   pnpm sim --game <id> [--players 6|vary] [--runs 200] [--seed 1] [--strategy mixed] [--no-repros]
//   pnpm sim --replay reports/stress/repros/<file>.json
//   pnpm sim --smoke [--runs 50]
//   pnpm sim --game <id> --dump-fixtures [--players 4] [--seed 1]
import { parseArgs } from 'node:util';
import { loadAllGames } from '@partybox/game-sdk/testing';
import type { LoadedGame } from '@partybox/game-sdk/testing';
import { formatSummary, runBatch } from './batch';
import { dumpFixtures } from './fixtures';
import { readRepro, replayRepro } from './repro';
import { smoke } from './smoke';
import { STRATEGIES } from './strategies';
import type { Strategy } from './strategies';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    game: { type: 'string' },
    players: { type: 'string', default: '6' },
    runs: { type: 'string' },
    seed: { type: 'string', default: '1' },
    strategy: { type: 'string', default: 'mixed' },
    replay: { type: 'string' },
    smoke: { type: 'boolean', default: false },
    'dump-fixtures': { type: 'boolean', default: false },
    'no-repros': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
});

function die(message: string): never {
  console.error(`sim: ${message}`);
  process.exit(2);
}

if (values.help) {
  console.log(`pnpm sim --game <id> [--players 6|vary] [--runs 200] [--seed 1] [--strategy ${STRATEGIES.join('|')}] [--no-repros]
pnpm sim --replay <reports/stress/repros/file.json>
pnpm sim --smoke [--runs 50]
pnpm sim --game <id> --dump-fixtures [--players 4] [--seed 1]`);
  process.exit(0);
}

const strategy = values.strategy as Strategy;
if (!STRATEGIES.includes(strategy))
  die(`unknown strategy "${values.strategy}" (${STRATEGIES.join(', ')})`);
const seed = Number(values.seed);
if (!Number.isInteger(seed)) die('--seed must be an integer');
const players: number | 'vary' = values.players === 'vary' ? 'vary' : Number(values.players);
if (players !== 'vary' && !Number.isInteger(players)) die('--players must be an integer or "vary"');

async function findGame(id: string): Promise<LoadedGame> {
  const all = await loadAllGames();
  const match = all.find((g) => g.id === id || g.game.manifest.id === id);
  if (!match) die(`unknown game "${id}" (have: ${all.map((g) => g.game.manifest.id).join(', ')})`);
  return match;
}

if (values.smoke) {
  const ok = await smoke(values.runs ? Number(values.runs) : undefined);
  process.exit(ok ? 0 : 1);
}

if (values.replay) {
  const repro = readRepro(values.replay);
  const loaded = await findGame(repro.gameId);
  const report = replayRepro(loaded.game, repro);
  console.log(
    `replayed ${report.events} events of ${repro.gameId} (seed ${repro.seed}, ${repro.players} players, ${repro.strategy})`,
  );
  console.log(
    `final hash ${report.finalHash} — ${report.matchesOriginal ? 'matches the original run' : 'DIFFERS from the original run (non-determinism?)'}`,
  );
  for (const v of report.violations) console.log(`  event ${v.at}: ${v.rule} — ${v.detail}`);
  if (report.violations.length === 0) console.log('  no violations on replay');
  process.exit(report.violations.length === 0 && report.matchesOriginal ? 0 : 1);
}

if (!values.game) die('--game <id> is required (or --smoke / --replay)');
const loaded = await findGame(values.game);

if (values['dump-fixtures']) {
  const written = dumpFixtures(loaded, players === 'vary' ? 4 : players, seed);
  for (const file of written) console.log(`wrote ${file}`);
  const missing = loaded.game.phases.filter((p) => !written.some((f) => f.endsWith(`${p}.json`)));
  if (missing.length > 0) console.log(`not reached by bots (write by hand): ${missing.join(', ')}`);
  process.exit(0);
}

const summary = runBatch({
  game: loaded.game,
  runs: values.runs ? Number(values.runs) : 100,
  seed,
  players,
  strategy,
  writeRepros: !values['no-repros'],
});
console.log(formatSummary(summary));
process.exit(summary.failed > 0 ? 1 : 0);
