// Content pack schemas: three decks (mild / crude / wild), each self-contained with its own black
// (prompt) and white (answer) cards. `packs` maps content/<name>.json → its schema; the contract
// suite validates every pack with it. Ids: <m|c|w>b<n> for black, <m|c|w>w<n> for white.
import { z } from '@partybox/game-sdk';

export const DECK_IDS = ['mild', 'crude', 'wild'] as const;
export type DeckId = (typeof DECK_IDS)[number];

export const WHITE_MAX_CHARS = 80;
export const BLACK_MAX_CHARS = 160;
/** How a blank is written in a black card's text. */
export const BLANK = '____';

export function blanksIn(text: string): number {
  return text.split(BLANK).length - 1;
}

export const blackCardSchema = z
  .object({
    id: z.string().regex(/^[mcw]b\d{1,4}$/),
    text: z.string().min(1).max(BLACK_MAX_CHARS),
    /** White cards the prompt takes (1–3); at least as many as it has blanks. */
    pick: z.number().int().min(1).max(3),
    /** Extra white cards every answerer draws before choosing (0 or 2). */
    draw: z.number().int().min(0).max(2),
  })
  .refine((c) => c.pick >= Math.max(1, blanksIn(c.text)), { message: 'pick < blanks' });
export type BlackCard = z.infer<typeof blackCardSchema>;

export const whiteCardSchema = z.object({
  id: z.string().regex(/^[mcw]w\d{1,4}$/),
  text: z.string().min(1).max(WHITE_MAX_CHARS),
});
export type WhiteCard = z.infer<typeof whiteCardSchema>;

function uniqueIds(cards: { id: string }[]): boolean {
  return new Set(cards.map((c) => c.id)).size === cards.length;
}

export const deckSchema = z.object({
  id: z.enum(DECK_IDS),
  name: z.string().min(1).max(20),
  rating: z.enum(['clean', 'adult', 'explicit']),
  black: z.array(blackCardSchema).min(30).refine(uniqueIds, { message: 'duplicate black id' }),
  white: z.array(whiteCardSchema).min(120).refine(uniqueIds, { message: 'duplicate white id' }),
});
export type Deck = z.infer<typeof deckSchema>;

export const packs = { mild: deckSchema, crude: deckSchema, wild: deckSchema } as const;
