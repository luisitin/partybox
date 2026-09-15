// `pnpm sim` — headless games. See packages/sim/README.md.
//   pnpm sim --game <id> [--players 6|vary] [--runs 200] [--seed 1] [--strategy mixed] [--no-repros]
//   pnpm sim --replay reports/stress/repros/<file>.json
//   pnpm sim --smoke [--runs 50]
//   pnpm sim --game <id> --dump-fixtures [--players 4] [--seed 1]
//   pnpm sim --room-chaos [--runs 100] [--steps 400] [--seed 1]
//   pnpm sim --soak [--minutes 60] [--port 42070] [--out <dir>]
//   pnpm sim --net [--port 42070] [--url http://host:port] [--only name,name]
//   pnpm sim --fuzz all|adversarial|hostile-content|schema-shape|chaos-timing --game <id> [--seed 1]
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { loadAllGames } from '@partybox/game-sdk/testing';
import type { LoadedGame } from '@partybox/game-sdk/testing';
import type { AnyGameDefinition } from '@partybox/shared';
import { formatSummary, runBatch } from './batch';
import { dumpFixtures } from './fixtures';
import { formatFuzz, runFuzz } from './fuzz';
import { CATEGORIES } from './fuzz/attacks';
import type { Category } from './fuzz/attacks';
import { readRepro, replayRepro } from './repro';
import { formatNet, runNet } from './net';
import { formatRoomBatch, replayRoomRepro, runRoomBatch } from './room/batch';
import { runSoak } from './soak';
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
    fuzz: { type: 'string' },
    'room-chaos': { type: 'boolean', default: false },
    net: { type: 'boolean', default: false },
    soak: { type: 'boolean', default: false },
    minutes: { type: 'string', default: '60' },
    out: { type: 'string' },
    port: { type: 'string', default: '42070' },
    url: { type: 'string' },
    only: { type: 'string' },
    steps: { type: 'string', default: '400' },
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
pnpm sim --game <id> --dump-fixtures [--players 4] [--seed 1]
pnpm sim --room-chaos [--runs 100] [--steps 400] [--seed 1]
pnpm sim --soak [--minutes 60] [--port 42070] [--out <dir>]
pnpm sim --net [--port 42070] [--url http://host:port] [--only name,name]
pnpm sim --fuzz all|${CATEGORIES.join('|')} --game <id> [--seed 1] [--runs 3]`);
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

function isRoomRepro(path: string): boolean {
  try {
    return (JSON.parse(readFileSync(path, 'utf8')) as { version?: unknown }).version === 'room-1';
  } catch {
    return false;
  }
}

async function allGames(): Promise<Record<string, AnyGameDefinition>> {
  const out: Record<string, AnyGameDefinition> = {};
  for (const g of await loadAllGames()) out[g.game.manifest.id] = g.game;
  return out;
}

if (values.soak) {
  const { rows, errors } = await runSoak({
    port: Number(values.port),
    minutes: Number(values.minutes),
    outDir: values.out,
    onSample: (r) =>
      console.log(
        `min ${r.minute}: rss ${r.rssMb} MB heap ${r.heapMb} MB lag p50/p99/max ${r.lagP50Ms}/${r.lagP99Ms}/${r.lagMaxMs} ms snapshot ${r.snapshotBytes} B games ${r.games} (+${r.gamesPerMin}) sockets ${r.sockets} errors ${r.errors}`,
      ),
  });
  console.log(`soak: ${rows.length} samples, ${errors.length} errors`);
  for (const e of errors.slice(0, 10)) console.log(`  ${e}`);
  process.exit(errors.length > 0 ? 1 : 0);
}

if (values.net) {
  const report = await runNet({
    port: Number(values.port),
    url: values.url,
    only: values.only ? values.only.split(',') : undefined,
  });
  console.log(formatNet(report));
  process.exit(report.ok ? 0 : 1);
}

if (values['room-chaos']) {
  const summary = runRoomBatch({
    games: await allGames(),
    runs: values.runs ? Number(values.runs) : 100,
    seed,
    steps: Number(values.steps),
    writeRepros: !values['no-repros'],
  });
  console.log(formatRoomBatch(summary));
  process.exit(summary.failed > 0 ? 1 : 0);
}

if (values.replay && isRoomRepro(values.replay)) {
  const report = replayRoomRepro(values.replay, await allGames());
  for (const v of report.violations) console.log(`  event ${v.at}: ${v.detail}`);
  console.log(report.matches ? 'final hash matches the original run' : 'final hash DIFFERS');
  process.exit(report.violations.length === 0 && report.matches ? 0 : 1);
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

if (values.fuzz) {
  const categories =
    values.fuzz === 'all' ? [...CATEGORIES] : (values.fuzz.split(',') as Category[]);
  for (const c of categories)
    if (!CATEGORIES.includes(c))
      die(`unknown fuzz category "${c}" (all, ${CATEGORIES.join(', ')})`);
  const fuzz = runFuzz(loaded, {
    categories,
    seed,
    runsPerStrategy: values.runs ? Number(values.runs) : undefined,
    writeRepros: !values['no-repros'],
  });
  console.log(formatFuzz(fuzz));
  process.exit(fuzz.failures.length > 0 ? 1 : 0);
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
