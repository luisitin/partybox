// What the fit model puts on top for every prompt of a deck (the owner, 2026-09-22: "audit the
// cards' ratings and combos … ask yourself whether 'Grandma's cookies were laced with ____' and
// 'Harambe' is actually funny"): for each black card, the white cards the bot's own yardstick
// (bot.ts `cardAppeal`, noise off) ranks highest across the whole deck — the combos players see.
// Usage: tsx scripts/blanks-combo-dump.ts --deck wild --top 10 --batch 40 --out <dir> [--ids wb1,wb2]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import type { Rng } from '@partybox/game-sdk';
import { cardAppeal } from '../games/blanks/server/bot';
import { DECKS, blackSlots, whiteTags } from '../games/blanks/server/content';
import type { DeckId } from '../games/blanks/content/schema';

const { values } = parseArgs({
  options: {
    deck: { type: 'string', default: 'wild' },
    top: { type: 'string', default: '10' },
    batch: { type: 'string', default: '40' },
    out: { type: 'string' },
    ids: { type: 'string' },
  },
});

/** Noise off: the model's own ranking, the same every run. */
const still = { float: () => 0 } as unknown as Rng;
const deck = DECKS[values.deck as DeckId];
const top = Number(values.top);
const only = values.ids ? new Set(values.ids.split(',')) : null;

const rows = deck.black
  .filter((b) => !only || only.has(b.id))
  .map((b) => {
    const slot = blackSlots(b.id)[0] ?? 'thing';
    const ranked = deck.white
      .map((w) => ({ w, score: cardAppeal(slot, w.id, still, b.text) }))
      .sort((a, c) => c.score - a.score)
      .slice(0, top)
      .map(({ w, score }) => ({
        id: w.id,
        text: w.text,
        tier: w.tier ?? 2,
        tags: whiteTags(w.id) ?? [],
        score: Math.round(score * 1000) / 1000,
      }));
    return { id: b.id, text: b.text, pick: b.pick, slot, tier: b.tier ?? 2, top: ranked };
  });

if (values.out) {
  mkdirSync(values.out, { recursive: true });
  const size = Number(values.batch);
  for (let i = 0; i < rows.length; i += size)
    writeFileSync(
      join(values.out, `batch-${String(i / size).padStart(2, '0')}.json`),
      JSON.stringify(rows.slice(i, i + size), null, 1),
    );
  writeFileSync(
    join(values.out, 'whites.json'),
    JSON.stringify(
      deck.white.map((w) => ({ id: w.id, text: w.text, tier: w.tier ?? 2, tags: w.tags ?? [] })),
    ),
  );
  console.log(`${rows.length} prompts → ${Math.ceil(rows.length / size)} batches in ${values.out}`);
} else {
  for (const r of rows) {
    console.log(`\n${r.id} [${r.slot}] ${r.text}`);
    for (const t of r.top)
      console.log(
        `   ${t.score.toFixed(3)}  t${t.tier}  ${t.id}  ${t.text}${t.tags.length ? `   #${t.tags.join(', #')}` : ''}`,
      );
  }
}
