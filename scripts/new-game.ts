// `pnpm new-game <id>` — copies games/_template to games/<id>, rewrites the id/name, regenerates
// the registry. No install step needed (ADR-008). Refuses to overwrite.
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { GAMES_DIR, REPO_ROOT } from './lib/games';
import { fail, run } from './lib/run';

const id = process.argv[2];
if (!id || !/^[a-z][a-z0-9-]{1,31}$/.test(id))
  fail('usage: pnpm new-game <id>   (kebab-case: letters, digits, dashes; e.g. word-storm)');
if (id.startsWith('_')) fail('ids must not start with "_" (reserved for the template)');
const target = join(GAMES_DIR, id);
if (existsSync(target)) fail(`games/${id} already exists`);
const template = join(GAMES_DIR, '_template');
if (!existsSync(template)) fail('games/_template is missing');

const title = id
  .split('-')
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');

cpSync(template, target, { recursive: true });

// Text substitutions: the template's id/name → the new game's. Everything else stays as-is so the
// new game starts as a working Quick Poll you then reshape (docs/ADDING_A_GAME.md).
const replacements: [RegExp, string][] = [
  [/"id": "template"/g, `"id": "${id}"`],
  [/id: 'template'/g, `id: '${id}'`],
  [/Quick Poll \(template\)/g, title],
  [/Quick Poll/g, title],
  [/_template \(Quick Poll\)/g, id],
  [/games\/_template/g, `games/${id}`],
  [/--game template/g, `--game ${id}`],
  [/QuickPoll/g, title.replace(/\s+/g, '')],
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

for (const file of walk(target)) {
  if (!/\.(ts|tsx|json|md)$/.test(file)) continue;
  let text = readFileSync(file, 'utf8');
  const before = text;
  for (const [pattern, value] of replacements) text = text.replace(pattern, value);
  if (text !== before) writeFileSync(file, text);
}

// The template's CLAUDE.md talks about being the template; give the new game a fresh one.
writeFileSync(
  join(target, 'CLAUDE.md'),
  `# ${id} — local rules
- Spec lives in README.md (required headings); keep it true when rules change.
- One file per phase under server/phases/; every phase in \`phases\` has fixtures/<phase>.json.
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure (no Date.now, Math.random, timers, I/O).
- Regenerate fixtures after changing state shape: pnpm sim --game ${id} --players 4 --runs 1 --dump-fixtures
- Test: pnpm vitest --project games · pnpm vitest --project contract · pnpm sim --game ${id} --players 6 --runs 200
`,
);

const registry = run('pnpm', ['gen-registry'], REPO_ROOT, true);
if (!registry.ok) fail('gen-registry failed');
console.log(`created games/${id} ("${title}") from _template and regenerated the registry.
Next: edit games/${id}/README.md (the spec), then server/, content/, client/, fixtures/, __tests__/.
Run: pnpm vitest --project contract   (must stay green)   → docs/ADDING_A_GAME.md`);
