// Appends cards to a Blanks deck from two plain-text lists (one card per line): the black cards
// get `pick` from their blank count (a question card = pick 1) and `draw` 2 on Pick 3, every card
// gets the next id in the deck's sequence, and lines already in the deck (case-insensitive, after
// trimming) are skipped, so the same list can be re-run. Validates the result with the schema.
// Usage: tsx scripts/blanks-add-cards.ts <mild|crude|wild> <black.txt> <white.txt>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deckSchema } from '../games/blanks/content/schema';
import type { BlackCard, WhiteCard } from '../games/blanks/content/schema';
import { REPO_ROOT } from './lib/games';

const [deckId, blackPath, whitePath] = process.argv.slice(2);
if (!deckId || !blackPath || !whitePath) {
  console.error('usage: tsx scripts/blanks-add-cards.ts <mild|crude|wild> <black.txt> <white.txt>');
  process.exit(2);
}
const contentDir = join(REPO_ROOT, 'games', 'blanks', 'content');
const file = join(contentDir, `${deckId}.json`);
const deck = deckSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
// A text in any deck is a duplicate: the same string in two hands trips the hidden-info contract
// test, and the decks mix in play.
const others = ['mild', 'crude', 'wild']
  .filter((d) => d !== deckId)
  .map((d) => deckSchema.parse(JSON.parse(readFileSync(join(contentDir, `${d}.json`), 'utf8'))));
const prefix = deckId[0] as string;
const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ');
const lines = (p: string): string[] =>
  readFileSync(p, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
const nextId = (cards: { id: string }[], kind: 'b' | 'w'): number =>
  cards.reduce((m, c) => Math.max(m, Number(c.id.slice(2))), 0) + 1 + (kind === 'b' ? 0 : 0);

const haveBlack = new Set(
  [...deck.black, ...others.flatMap((d) => d.black)].map((c) => norm(c.text)),
);
const haveWhite = new Set(
  [...deck.white, ...others.flatMap((d) => d.white)].map((c) => norm(c.text)),
);
let b = nextId(deck.black, 'b');
let w = nextId(deck.white, 'w');
let addedB = 0;
let addedW = 0;
for (const text of lines(blackPath)) {
  if (haveBlack.has(norm(text))) continue;
  const blanks = text.split('____').length - 1;
  const pick = Math.max(1, blanks);
  const card: BlackCard = { id: `${prefix}b${b++}`, text, pick, draw: pick === 3 ? 2 : 0 };
  deck.black.push(card);
  haveBlack.add(norm(text));
  addedB += 1;
}
for (const text of lines(whitePath)) {
  if (haveWhite.has(norm(text))) continue;
  const card: WhiteCard = { id: `${prefix}w${w++}`, text };
  deck.white.push(card);
  haveWhite.add(norm(text));
  addedW += 1;
}
const out = deckSchema.parse(deck);
writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
console.log(
  `${deckId}: +${addedB} black, +${addedW} white → ${out.black.length} / ${out.white.length}`,
);
