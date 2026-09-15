// `pnpm e2e` / `pnpm e2e:snap` — see packages/e2e/README.md.
//   pnpm e2e [--game <id>]... [--phones 4] [--port <n>] [--seed 1] [--timeout 300]
//   pnpm e2e:snap --game <id> [--out <dir>] [--devices iphone,pixel,...] [--port <n>] [--seed 1] [--max-phases 14]
import { parseArgs } from 'node:util';
import { PHONE_PRESETS, parsePresets } from './devices';
import { formatReports, runFullGames } from './run';
import { snapGame } from './snap';

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    game: { type: 'string', multiple: true },
    phones: { type: 'string', default: '4' },
    port: { type: 'string' },
    seed: { type: 'string', default: '1' },
    timeout: { type: 'string', default: '300' },
    out: { type: 'string' },
    devices: { type: 'string' },
    'max-phases': { type: 'string', default: '14' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
});

const command = positionals[0] ?? 'run';
if (values.help || !['run', 'snap'].includes(command)) {
  console.log(`pnpm e2e [--game <id>]... [--phones 4] [--port <n>] [--seed 1] [--timeout 300]
pnpm e2e:snap --game <id> [--out <dir>] [--devices ${PHONE_PRESETS.join(',')}] [--port <n>] [--seed 1] [--max-phases 14]`);
  process.exit(values.help ? 0 : 2);
}

const port = values.port ? Number(values.port) : undefined;
const seed = Number(values.seed);

if (command === 'run') {
  const reports = await runFullGames({
    games: values.game ?? [],
    phones: Number(values.phones),
    port,
    seed,
    gameTimeoutMs: Number(values.timeout) * 1000,
  });
  console.log(formatReports(reports));
  process.exit(reports.every((r) => r.ok) ? 0 : 1);
}

if (!values.game?.[0]) {
  console.error('snap: --game <id> is required');
  process.exit(2);
}
const report = await snapGame({
  game: values.game[0],
  out: values.out,
  devices: parsePresets(values.devices, ['iphone', 'pixel']),
  port,
  seed,
  maxPhases: Number(values['max-phases']),
});
console.log(`${report.shots} screenshots in ${report.out}\nphases: ${report.phases.join(' → ')}`);
for (const f of report.failures) console.log(`FAIL: ${f}`);
process.exit(report.failures.length === 0 ? 0 : 1);
