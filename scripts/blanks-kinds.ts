// What the fit model reads into cards added since a git revision — the loop's check on a batch of
// new content before it plays: every new prompt with the kind its blank wants (thing / doing /
// person / name, and the name blank's word / line grade), every new white with what it serves.
//   pnpm blanks-kinds [--since main] [--all]        (default: since main)
// Read the list; a wrong kind is fixed with a rule in server/fit.ts (then `pnpm blanks-kinds-golden`)
// or `slot` / `slots` / `serves` on the card in the deck JSON.
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { DECKS } from '../games/blanks/server/content';
import { fitScore, servesOf, slotOf } from '../games/blanks/server/fit';
import type { DeckId } from '../games/blanks/content/schema';

const { values } = parseArgs({
  options: { since: { type: 'string', default: 'main' }, all: { type: 'boolean', default: false } },
});

const DECK_IDS: DeckId[] = ['wild', 'crude', 'mild'];

/** The texts a deck file held at `rev` (empty when the file is new there). */
function textsAt(rev: string, deck: DeckId): Set<string> {
  try {
    const raw = execFileSync('git', ['show', `${rev}:games/blanks/content/${deck}.json`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    const json = JSON.parse(raw) as { black: { text: string }[]; white: { text: string }[] };
    return new Set([...json.black, ...json.white].map((c) => c.text));
  } catch {
    return new Set();
  }
}

/** How a name blank grades: a word (one or two), a line (a whole card) or a plain name (four words). */
function nameGrade(text: string): string {
  if (fitScore('name', ['thing'], 'a b c d', text) < 1) return 'name:word';
  if (fitScore('name', ['thing'], 'a b c d e f g', text) === 1) return 'name:line';
  return 'name';
}

let prompts = 0;
let whites = 0;
for (const deck of DECK_IDS) {
  const old = values.all ? new Set<string>() : textsAt(values.since ?? 'main', deck);
  for (const c of DECKS[deck].black) {
    if (old.has(c.text)) continue;
    const kind = c.slots ? c.slots.join('+') : slotOf(c);
    const label = kind === 'name' ? nameGrade(c.text) : kind;
    console.log(`${deck} ${c.id.padEnd(7)} ${label.padEnd(12)} ${c.text}`);
    prompts += 1;
  }
  for (const c of DECKS[deck].white) {
    if (old.has(c.text)) continue;
    console.log(`${deck} ${c.id.padEnd(7)} ${servesOf(c).join('+').padEnd(12)} ${c.text}`);
    whites += 1;
  }
}
console.log(`\n${prompts} prompts, ${whites} whites since ${values.all ? 'ever' : values.since}`);
