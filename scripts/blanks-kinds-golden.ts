// Regenerates games/blanks/__tests__/kinds.golden.json — the kind reads pinned by the fit loop —
// from the current rules: run it after a deliberate rule change, read the diff, commit both.
//   pnpm blanks-kinds-golden
import { writeFileSync } from 'node:fs';
import { DECKS } from '../games/blanks/server/content';
import { servesOf, slotOf } from '../games/blanks/server/fit';

const prompts: Record<string, string[]> = {};
const cards: Record<string, string[]> = {};
/** A stable pick of one card in `n` by its text, so the pinned sample does not shift as decks grow. */
function oneIn(text: string, n: number): boolean {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % n === 0;
}
/** Things worth pinning: the frames the loop has had to correct. */
const TRICKY =
  / (for|over|by|to|until|when|after|during) ____\.?$|trick|budget|went to|full of|caught|doing|named|called/i;
for (const id of ['wild', 'crude', 'mild'] as const) {
  for (const c of DECKS[id].black) {
    if (c.slot || c.slots) continue;
    const k = slotOf(c);
    if (k === 'thing' && !(TRICKY.test(c.text) && oneIn(c.text, 2))) continue;
    prompts[c.text] = [k];
  }
  for (const c of DECKS[id].white) {
    if (c.serves) continue;
    const k = servesOf(c);
    const key = k.join('+');
    if ((key === 'thing' || key === 'thing+name') && !oneIn(c.text, 14)) continue;
    if ((key === 'doing' || key === 'doing+name') && !oneIn(c.text, 6)) continue;
    cards[c.text] = k;
  }
}
writeFileSync(
  'games/blanks/__tests__/kinds.golden.json',
  JSON.stringify({ prompts, cards }, null, 2) + '\n',
);
console.log(`pinned ${Object.keys(prompts).length} prompts, ${Object.keys(cards).length} cards`);
