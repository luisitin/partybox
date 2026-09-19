// Resolves a merge conflict in reports/design/loop-log.md (loop 291). Two loop sessions append rows
// to one table and every merge conflicts; concatenating both sides once quadrupled the table.
// Result: main's file with every row kept once, plus HEAD's rows main lacks, appended. A row is
// identified by its TEXT, not its number (loop 379): two sessions pick the same pass number often,
// and a row one side renumbered must not come back under its old number. Run from a worktree with
// the conflict open: `pnpm resolve-loop-log`, then `pnpm format` and commit.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const FILE = 'reports/design/loop-log.md';
const SECTIONS = 4; // the tables the log has grown into (columns widened over time)

const show = (ref: string): string =>
  execFileSync('git', ['show', `${ref}:${FILE}`], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
const isRow = (line: string): boolean => /^\| \d+ /.test(line);
const rowNo = (line: string): number => Number(line.split('|')[1]);
/** A row's text without its number and any renumbering note: the identity of a pass. */
const body = (line: string): string =>
  line
    .split('|')
    .slice(2)
    .join('|')
    .replace(/\(folders numbered[^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const main = show('main').split('\n');
const head = show('HEAD').split('\n');

// 1. Every row from both sides, main's first, one per body: the higher number wins (a row one
//    side renumbered after a collision beats its older copy).
const byBody = new Map<string, string>();
const order: string[] = [];
for (const line of [...main, ...head].filter(isRow)) {
  const b = body(line);
  const prev = byBody.get(b);
  if (prev === undefined) order.push(b);
  if (prev === undefined || rowNo(line) > rowNo(prev)) byBody.set(b, line);
}
// 2. One pass number per row: a later row on a number an earlier row holds is renumbered past
//    the highest — two sessions picked the same number (loop 370: twelve Bingo rows were once
//    dropped silently for this; loop 452: two sessions on the SAME game collided, so the game no
//    longer matters — a row is a duplicate only by its text, which step 1 already folded).
const rowsAll = order.map((b) => byBody.get(b) as string);
let next = Math.max(...rowsAll.map(rowNo)) + 1;
const taken = new Set<number>();
const renumbered: string[] = [];
const finalRows: string[] = [];
for (const line of rowsAll) {
  const n = rowNo(line);
  if (!taken.has(n)) {
    taken.add(n);
    finalRows.push(line);
  } else {
    const cells = line.split('|');
    cells[1] = ` ${next} `;
    renumbered.push(`${n}→${next}`);
    taken.add(next);
    next += 1;
    finalRows.push(cells.join('|'));
  }
}
const resolvedByBody = new Map(finalRows.map((r) => [body(r), r]));
// 3. main's file with each row swapped for its resolved copy, then HEAD's new rows appended.
const out: string[] = [];
let headers = 0;
const placed = new Set<string>();
for (const line of main) {
  if (isRow(line)) {
    const b = body(line);
    const kept = resolvedByBody.get(b);
    if (kept === undefined || placed.has(b)) continue;
    placed.add(b);
    out.push(kept);
    continue;
  }
  if (line.startsWith('| Pass')) {
    headers += 1;
    if (headers > SECTIONS) continue; // a duplicated table's header…
  } else if (line.startsWith('| ---') && headers > SECTIONS) continue; // …and its rule
  out.push(line);
}
const extra = finalRows.filter((r) => !placed.has(body(r)));
const text = `${out.join('\n').trimEnd()}\n${extra.length ? `${extra.join('\n')}\n` : ''}`;
const rows = text.split('\n').filter(isRow);
const dup = rows.map(rowNo).filter((n, i, a) => a.indexOf(n) !== i);
if (dup.length > 0) throw new Error(`duplicates remain: ${dup.join(', ')}`);
writeFileSync(FILE, text, 'utf8');
console.log(
  `resolved ${FILE}: ${rows.length} rows; from HEAD + [${extra.map(rowNo).join(', ')}]${renumbered.length ? ` (renumbered after a collision: ${renumbered.join(', ')} — update the memory/notes)` : ''} — now \`pnpm format\` and commit`,
);
