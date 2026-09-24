// `pnpm check-bundle [--update]` — what phones download, measured on the real client build
// (Part 00 §2.2, FOUNDATION-AUDIT #7). Runs Vite's build() in memory with the client's own config
// (nothing is written) and reads the output bundle, never Vite's manifest.json (it cannot see
// modules inlined into the entry). The bundle is the one build() returns, not the one a plugin's
// generateBundle sees: Vite writes the entry's `__vite__mapDeps` preload list (every lazy chunk's
// file name, so it grows per game) after every plugin's generateBundle, `enforce: 'post'` included,
// and a hook would undercount the entry by that much (1.3 KB raw on 2026-09-24). Fails when:
//   - an entry chunk carries more game modules than the ratchet allows (F1 drives it to 0);
//   - the entry chunk's gzip grew more than 1 KB over the recorded size;
//   - a game's phone closure (JS + CSS gzip, ruling 12) is over the phone budget;
//   - the build would write a manifest into dist (the errata: none is ever shipped).
// The ratchet lives in scripts/bundle-budget.json (bytes); --update rewrites it with today's numbers.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import {
  closure,
  entryChunks,
  entryGameModules,
  gzipBytes,
  gzipTotal,
  relativeIds,
  surfaceChunks,
  tvModulesIn,
} from './lib/bundle';
import type { Bundle, BundleAsset, BundleChunk } from './lib/bundle';
import { REPO_ROOT } from './lib/games';
import { fail } from './lib/run';

interface Budget {
  /** Game modules the entry chunk may still carry (a ratchet: lower it as F1 moves them out). */
  entryGameModules: number;
  /** The largest phone closure allowed, JS + CSS gzip, bytes. */
  phoneBudgetGzip: number;
  /** The entry chunk's gzip, bytes; it may not grow by more than ENTRY_SLACK. */
  entryGzip: number;
}

/** The slice of Vite's API used here; typed locally because `vite` resolves from packages/client. */
interface ViteApi {
  version: string;
  build(config: Record<string, unknown>): Promise<unknown>;
}

const CLIENT_DIR = join(REPO_ROOT, 'packages', 'client');
const BUDGET_FILE = join(REPO_ROOT, 'scripts', 'bundle-budget.json');
const ENTRY_SLACK = 1024;
const KB = 1024;
const kb = (bytes: number): string => (bytes / KB).toFixed(1);

/** The client's own Vite (the root has none): the same copy and config `pnpm build` uses. */
async function loadClientVite(): Promise<ViteApi> {
  const pkgFile = createRequire(join(CLIENT_DIR, 'package.json')).resolve('vite/package.json');
  const pkg = JSON.parse(readFileSync(pkgFile, 'utf8')) as {
    exports: Record<string, string | { import?: string; default?: string }>;
  };
  const dot = pkg.exports['.'];
  const entry = typeof dot === 'string' ? dot : (dot?.import ?? dot?.default);
  if (!entry) fail(`cannot find the ESM entry of ${pkgFile}`);
  return (await import(pathToFileURL(join(dirname(pkgFile), entry)).href)) as ViteApi;
}

/** Builds the client in memory and hands back its final output, module ids repo-relative. */
async function buildBundle(vite: ViteApi, problems: string[]): Promise<Bundle> {
  const result = await vite.build({
    configFile: join(CLIENT_DIR, 'vite.config.ts'),
    root: CLIENT_DIR,
    logLevel: 'error',
    build: { write: false, reportCompressedSize: false },
    plugins: [
      {
        name: 'partybox:check-bundle',
        configResolved(config: { build: { manifest: unknown; ssrManifest: unknown } }) {
          if (config.build.manifest || config.build.ssrManifest)
            problems.push('build.manifest is on: never ship a manifest (audit #7)');
        },
      },
    ],
  });
  const outputs = [result].flat() as { output?: (BundleChunk | BundleAsset)[] }[];
  const items = outputs.flatMap((o) => o.output ?? []);
  if (items.length === 0) fail('the build produced no output');
  for (const item of items)
    if (/(^|\/)(\.vite\/|(ssr-)?manifest\.json$)/.test(item.fileName))
      problems.push(`the build emits ${item.fileName}: never ship a manifest (audit #7)`);
  return relativeIds(items, REPO_ROOT);
}

function readBudget(): Budget | null {
  if (!existsSync(BUDGET_FILE)) return null;
  return JSON.parse(readFileSync(BUDGET_FILE, 'utf8')) as Budget;
}

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { update: { type: 'boolean', default: false } } });
  const vite = await loadClientVite();
  const problems: string[] = [];
  const bundle = await buildBundle(vite, problems);
  const budget = readBudget();
  if (!budget && !values.update)
    fail(`${BUDGET_FILE} is missing: run pnpm check-bundle --update and commit it`);

  console.log(`check-bundle: Vite ${vite.version} build of packages/client, in memory`);

  // 1. The entry chunk: game modules in it, and its size.
  const entries = entryChunks(bundle);
  const entryGzip = entries.reduce((sum, chunk) => sum + gzipBytes(chunk), 0);
  const entryCss = [...new Set(entries.flatMap((c) => [...(c.viteMetadata?.importedCss ?? [])]))];
  for (const chunk of entries)
    console.log(`entry ${chunk.fileName}: ${kb(gzipBytes(chunk))} KB gz`);
  console.log(
    `entry JS ${kb(entryGzip)} KB gz` +
      (budget ? ` (recorded ${kb(budget.entryGzip)} KB, +1 KB allowed)` : '') +
      ` · entry CSS ${kb(gzipTotal(bundle, entryCss))} KB gz`,
  );
  const inEntry = entryGameModules(bundle);
  console.log(
    `game modules in the entry: ${inEntry.length}` +
      (budget ? ` (ratchet ${budget.entryGameModules})` : ''),
  );
  for (const m of inEntry) console.log(`  ${m.game.padEnd(16)} ${m.path}`);

  // 2. Per-game closures.
  const surfaces = surfaceChunks(bundle);
  const games = [...new Set([...surfaces.keys(), ...inEntry.map((m) => m.game)])].sort();
  const rows = games.map((game) => {
    const s = surfaces.get(game) ?? { phone: [], tv: [] };
    const phone = closure(bundle, s.phone);
    const tv = closure(bundle, s.tv);
    return {
      game,
      phone: s.phone.length > 0 ? gzipTotal(bundle, phone) : null,
      tv: s.tv.length > 0 ? gzipTotal(bundle, tv) : null,
      tvOnPhone: tvModulesIn(bundle, phone),
    };
  });
  const cell = (bytes: number | null): string => (bytes === null ? '—' : kb(bytes)).padStart(12);
  console.log(
    `\n${'game'.padEnd(16)} ${'phone KB gz'.padStart(12)} ${'TV KB gz'.padStart(12)}  TV code on phones`,
  );
  for (const r of rows)
    console.log(
      `${r.game.padEnd(16)} ${cell(r.phone)} ${cell(r.tv)}  ` +
        (r.tvOnPhone.length > 0 ? `yes: ${r.tvOnPhone.join(', ')}` : 'no'),
    );
  const largest = rows.reduce<{ game: string; bytes: number }>(
    (max, r) => (r.phone !== null && r.phone > max.bytes ? { game: r.game, bytes: r.phone } : max),
    { game: '—', bytes: 0 },
  );
  console.log(`largest phone closure: ${largest.game} ${kb(largest.bytes)} KB gz`);

  if (values.update) {
    const next: Budget = {
      entryGameModules: inEntry.length,
      phoneBudgetGzip: Math.ceil(largest.bytes / KB) * KB,
      entryGzip,
    };
    writeFileSync(BUDGET_FILE, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`\nwrote scripts/bundle-budget.json: ${JSON.stringify(next)}`);
  } else if (budget) {
    // 3–4. The ratchet and the budgets.
    if (inEntry.length > budget.entryGameModules)
      problems.push(
        `the entry chunk carries ${inEntry.length} game modules (ratchet ${budget.entryGameModules}): load game code through the registry's lazy imports`,
      );
    else if (inEntry.length < budget.entryGameModules)
      console.log(
        `\nnote: ${inEntry.length} game modules < ratchet ${budget.entryGameModules}: lower it (pnpm check-bundle --update)`,
      );
    if (entryGzip > budget.entryGzip + ENTRY_SLACK)
      problems.push(
        `the entry chunk grew to ${kb(entryGzip)} KB gz (recorded ${kb(budget.entryGzip)} KB, +1 KB allowed)`,
      );
    else if (entryGzip < budget.entryGzip - ENTRY_SLACK)
      console.log(
        `note: the entry shrank to ${kb(entryGzip)} KB gz: lock it in (pnpm check-bundle --update)`,
      );
    for (const r of rows)
      if (r.phone !== null && r.phone > budget.phoneBudgetGzip)
        problems.push(
          `${r.game}'s phone closure is ${kb(r.phone)} KB gz, over the ${kb(budget.phoneBudgetGzip)} KB budget`,
        );
    console.log(`phone budget: ${kb(budget.phoneBudgetGzip)} KB gz (JS + CSS)`);
  }

  if (problems.length > 0) {
    console.error(`\ncheck-bundle: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log('\ncheck-bundle: entry, closures and budgets are in bounds');
}

await main();
