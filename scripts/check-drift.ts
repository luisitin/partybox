// Doc-drift checks (Section 7 of the spec). Cheap, deterministic, part of `pnpm verify`.
// Every check prints one line; any failure exits 1 at the end so you see all of them at once.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { listGameFolders, REPO_ROOT, REQUIRED_README_HEADINGS } from './lib/games';
import { run } from './lib/run';

const problems: string[] = [];
const bad = (msg: string): void => {
  problems.push(msg);
};

const REQUIRED_DOCS = [
  'START_HERE',
  'ARCHITECTURE',
  'GAME_CONTRACT',
  'ADDING_A_GAME',
  'PROTOCOL',
  'DEV_API',
  'DESIGN_SYSTEM',
  'TESTING',
  'CONVENTIONS',
  'DECISIONS',
  'DEPENDENCIES',
  'BACKLOG',
  'GLOSSARY',
];

function lines(file: string): number {
  return readFileSync(file, 'utf8').replace(/\n$/, '').split('\n').length;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function checkDocsExist(): void {
  for (const name of REQUIRED_DOCS) {
    if (!existsSync(join(REPO_ROOT, 'docs', `${name}.md`))) bad(`docs/${name}.md is missing`);
  }
  const claude = join(REPO_ROOT, 'CLAUDE.md');
  if (!existsSync(claude)) bad('CLAUDE.md is missing');
  else if (lines(claude) > 120) bad(`CLAUDE.md has ${lines(claude)} lines (max 120)`);
}

function checkFolderDocs(): void {
  const folders = [
    ...readdirSync(join(REPO_ROOT, 'packages')).map((p) => join(REPO_ROOT, 'packages', p)),
    ...listGameFolders().map((g) => g.dir),
    join(REPO_ROOT, 'games'),
    join(REPO_ROOT, 'scripts'),
    join(REPO_ROOT, 'docs'),
    join(REPO_ROOT, 'reports'),
  ];
  for (const dir of folders) {
    const rel = relative(REPO_ROOT, dir).split(sep).join('/');
    const isPackageOrGame = rel.startsWith('packages/') || rel.startsWith('games/');
    // A game README is its spec (8 required sections + edge cases): it gets twice the room.
    const readmeCap = rel.startsWith('games/') ? 120 : 60;
    const readme = join(dir, 'README.md');
    if (!existsSync(readme)) bad(`${rel}/README.md is missing`);
    else if (lines(readme) > readmeCap)
      bad(`${rel}/README.md has ${lines(readme)} lines (max ${readmeCap})`);
    if (isPackageOrGame) {
      const local = join(dir, 'CLAUDE.md');
      if (!existsSync(local)) bad(`${rel}/CLAUDE.md is missing`);
      else if (lines(local) > 30) bad(`${rel}/CLAUDE.md has ${lines(local)} lines (max 30)`);
    }
  }
}

async function checkGames(): Promise<void> {
  for (const game of listGameFolders()) {
    const readme = readFileSync(join(game.dir, 'README.md'), 'utf8');
    for (const heading of REQUIRED_README_HEADINGS) {
      if (!new RegExp(`^##\\s+${heading}\\s*$`, 'm').test(readme))
        bad(`games/${game.id}/README.md lacks heading "## ${heading}"`);
    }
    const entry = pathToFileURL(join(game.dir, 'server', 'index.ts')).href;
    const mod = (await import(entry)) as { game?: { phases?: readonly string[] } };
    const phases = mod.game?.phases;
    if (!phases || phases.length === 0) {
      bad(`games/${game.id}/server/index.ts exports no phases`);
      continue;
    }
    for (const phase of phases) {
      if (!existsSync(join(game.dir, 'fixtures', `${phase}.json`)))
        bad(`games/${game.id}/fixtures/${phase}.json is missing (phase "${phase}")`);
    }
  }
}

function checkAddingAGameMentionsTemplate(): void {
  const template = join(REPO_ROOT, 'games', '_template');
  if (!existsSync(template)) return;
  const doc = readFileSync(join(REPO_ROOT, 'docs', 'ADDING_A_GAME.md'), 'utf8');
  for (const file of walk(template)) {
    const rel = relative(template, file).replaceAll('\\', '/');
    if (!doc.includes(rel)) bad(`docs/ADDING_A_GAME.md does not mention _template file "${rel}"`);
  }
}

function checkTodos(): void {
  const backlog = readFileSync(join(REPO_ROOT, 'docs', 'BACKLOG.md'), 'utf8');
  const roots = ['packages', 'games', 'scripts'].map((d) => join(REPO_ROOT, d)).filter(existsSync);
  for (const file of roots.flatMap((r) => walk(r))) {
    // Code only: prose may mention the word TODO (this file included).
    if (!/\.(ts|tsx|js|css)$/.test(file) || file.endsWith('check-drift.ts')) continue;
    const text = readFileSync(file, 'utf8');
    const rel = relative(REPO_ROOT, file).replaceAll('\\', '/');
    for (const match of text.matchAll(/\b(TODO|FIXME)\b(\(BL-\d+\))?/g)) {
      const id = match[2]?.slice(1, -1);
      if (!id)
        bad(
          `${rel}: ${match[1]} without a backlog id — write TODO(BL-nnn) and add BL-nnn to docs/BACKLOG.md`,
        );
      else if (!backlog.includes(id)) bad(`${rel}: ${id} is not in docs/BACKLOG.md`);
    }
  }
}

function checkDependenciesDocumented(): void {
  const doc = readFileSync(join(REPO_ROOT, 'docs', 'DEPENDENCIES.md'), 'utf8');
  const manifests = [
    join(REPO_ROOT, 'package.json'),
    join(REPO_ROOT, 'games', 'package.json'),
    ...readdirSync(join(REPO_ROOT, 'packages')).map((p) =>
      join(REPO_ROOT, 'packages', p, 'package.json'),
    ),
  ].filter(existsSync);
  const names = new Set<string>();
  for (const file of manifests) {
    const pkg = JSON.parse(readFileSync(file, 'utf8')) as Record<string, Record<string, string>>;
    for (const key of ['dependencies', 'devDependencies'])
      for (const name of Object.keys(pkg[key] ?? {}))
        if (!name.startsWith('@partybox/')) names.add(name);
  }
  for (const name of names) {
    if (!doc.includes(`\`${name}\``)) bad(`docs/DEPENDENCIES.md has no line for \`${name}\``);
  }
}

/**
 * Two design-loop sessions append rows to one table; a clean git merge can land the same pass
 * number twice (loop 375: eight pairs). `pnpm resolve-loop-log` renumbers a colliding row; this
 * catches the merges that never conflicted.
 */
function checkLoopLogNumbers(): void {
  const file = join(REPO_ROOT, 'reports', 'design', 'loop-log.md');
  if (!existsSync(file)) return;
  const seen = new Set<number>();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\| (\d+) +\| [\d-]+ +\| (\w+)/.exec(line);
    if (!m) continue;
    const n = Number(m[1]);
    if (seen.has(n))
      bad(
        `reports/design/loop-log.md: pass ${n} appears twice — renumber the later row past the highest (\`pnpm resolve-loop-log\`)`,
      );
    seen.add(n);
  }
}

async function main(): Promise<void> {
  const registry = run('pnpm', ['gen-registry', '--check'], REPO_ROOT, true);
  if (!registry.ok) bad('registry is stale — run: pnpm gen-registry');
  checkDocsExist();
  checkFolderDocs();
  await checkGames();
  checkAddingAGameMentionsTemplate();
  checkTodos();
  checkDependenciesDocumented();
  checkLoopLogNumbers();
  if (problems.length > 0) {
    console.error(`check-drift: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log('check-drift: docs, registry, fixtures, TODOs and dependencies are in sync');
}

await main();
