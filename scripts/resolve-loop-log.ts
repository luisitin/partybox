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
const extra = head.filter((line) => isRow(line) && !seen.has(rowNo(line)));
for (const line of extra) seen.add(rowNo(line));
const text = `${out.join('\n').trimEnd()}\n${extra.length ? `${extra.join('\n')}\n` : ''}`;
const rows = text.split('\n').filter(isRow);
if (rows.length !== new Set(rows.map(rowNo)).size) throw new Error('duplicates remain');
writeFileSync(FILE, text, 'utf8');
console.log(
  `resolved ${FILE}: ${rows.length} rows; from HEAD + [${extra.map(rowNo).join(', ')}] — now \`pnpm format\` and commit`,
);
