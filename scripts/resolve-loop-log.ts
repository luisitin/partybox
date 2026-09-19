// Resolves a merge conflict in reports/design/loop-log.md (loop 291). Two loop sessions append rows
// to one table and every merge conflicts; concatenating both sides once quadrupled the table.
// Result: main's file with every row kept once (first occurrence — a duplicated table was always
// appended whole, so the first copy sits in the right section), plus HEAD's rows main lacks, in
// HEAD's order. Run from a worktree with the conflict open: `pnpm resolve-loop-log`, then commit.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const FILE = 'reports/design/loop-log.md';
const SECTIONS = 4; // the tables the log has grown into (columns widened over time)

const show = (ref: string): string =>
  execFileSync('git', ['show', `${ref}:${FILE}`], { encoding: 'utf8' });
const isRow = (line: string): boolean => /^\| \d+ /.test(line);
const rowNo = (line: string): number => Number(line.split('|')[1]);

const main = show('main').split('\n');
const head = show('HEAD').split('\n');
const seen = new Set<number>();
const out: string[] = [];
let headers = 0;
for (const line of main) {
  if (isRow(line)) {
    if (seen.has(rowNo(line))) continue;
    seen.add(rowNo(line));
  } else if (line.startsWith('| Pass')) {
    headers += 1;
    if (headers > SECTIONS) continue; // a duplicated table's header…
  } else if (line.startsWith('| ---') && headers > SECTIONS) continue; // …and its rule
  out.push(line);
}
// A HEAD row whose NUMBER main already has but whose text differs is a collision — two sessions
// picked the same pass number — not a duplicate: it is renumbered past the highest, its evidence
// folders untouched, and named in the output (loop 370: twelve Bingo rows were dropped silently).
const mainText = new Map(main.filter(isRow).map((line) => [rowNo(line), line]));
const game = (line: string): string => line.split('|')[3]?.trim() ?? '';
let next = Math.max(...seen) + 1;
const renumbered: string[] = [];
const extra = head
  .filter((line) => isRow(line))
  .flatMap((line) => {
    const n = rowNo(line);
    const theirs = mainText.get(n);
    if (theirs === undefined) return [line];
    if (theirs.trim() === line.trim() || game(theirs) === game(line)) return [];
    const cells = line.split('|');
    cells[1] = ` ${next} `;
    renumbered.push(`${n}→${next}`);
    next += 1;
    return [cells.join('|')];
  });
for (const line of extra) seen.add(rowNo(line));
const text = `${out.join('\n').trimEnd()}\n${extra.length ? `${extra.join('\n')}\n` : ''}`;
const rows = text.split('\n').filter(isRow);
if (rows.length !== new Set(rows.map(rowNo)).size) throw new Error('duplicates remain');
writeFileSync(FILE, text, 'utf8');
console.log(
  `resolved ${FILE}: ${rows.length} rows; from HEAD + [${extra.map(rowNo).join(', ')}]${renumbered.length ? ` (renumbered after a collision: ${renumbered.join(', ')} — update the memory/notes)` : ''} — now \`pnpm format\` and commit`,
);
