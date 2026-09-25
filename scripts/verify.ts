// `pnpm verify` — the gate before every commit (docs/TESTING.md). Runs each step in order,
// stops at the first failure, prints a timing table. Target: < 3 minutes on a laptop.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './lib/games';
import { run } from './lib/run';

interface Step {
  name: string;
  args: string[];
  /** Steps whose entry point does not exist yet are skipped (earlier build phases). */
  requires?: string;
}

const steps: Step[] = [
  { name: 'registry', args: ['gen-registry', '--check'] },
  { name: 'typecheck', args: ['typecheck'] },
  { name: 'lint', args: ['lint'] },
  { name: 'lint:deps', args: ['lint:deps'] },
  { name: 'format', args: ['format:check'] },
  { name: 'unit+contract', args: ['test'] },
  { name: 'sim smoke', args: ['sim', '--smoke'], requires: 'packages/sim/src/smoke.ts' },
  { name: 'build', args: ['build'] },
  // What phones download: game code in the entry, per-game closures, budgets (FOUNDATION-AUDIT #7).
  { name: 'bundle', args: ['check-bundle'] },
  { name: 'doc drift', args: ['check-drift'] },
];

const startedAll = Date.now();
const results: { name: string; ms: number; status: string }[] = [];
let failed = false;

for (const step of steps) {
  if (step.requires && !existsSync(join(REPO_ROOT, step.requires))) {
    results.push({ name: step.name, ms: 0, status: 'skipped (not built yet)' });
    continue;
  }
  console.log(`\n━━━ ${step.name} ━━━`);
  const result = run('pnpm', step.args, REPO_ROOT);
  results.push({
    name: step.name,
    ms: result.ms,
    status: result.ok ? 'ok' : `FAILED (exit ${result.code})`,
  });
  if (!result.ok) {
    failed = true;
    break;
  }
}

console.log('\n┌─ pnpm verify ─────────────────────────────');
for (const r of results)
  console.log(
    `│ ${r.name.padEnd(14)} ${String(Math.round(r.ms / 100) / 10).padStart(6)} s  ${r.status}`,
  );
console.log(
  `└─ total ${Math.round((Date.now() - startedAll) / 100) / 10} s — ${failed ? 'RED' : 'GREEN'}`,
);
process.exit(failed ? 1 : 0);
