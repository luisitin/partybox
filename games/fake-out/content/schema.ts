// Content pack schemas (SPEC §3.15). `packs` maps content/<name>.json → its zod schema; the
// contract suite validates every pack with it. The deeper checks (house lies against the truth
// through the matcher, accepts that must come back exact) live in __tests__/content.test.ts.
import { z } from '@partybox/game-sdk';
import { pronunciationsSchema } from '@partybox/game-sdk/speech';

/** Max characters of a player's lie (SPEC §3.7); the truth and house lies stay well inside it. */
export const LIE_MAX_CHARS = 40;
/** The blank as written in a fact; the TV draws it as a rounded box, the reader says "blank". */
export const BLANK = '___';

export const CATEGORIES = [
  'animals',
  'history',
  'food',
  'science',
  'geography',
  'weird-laws',
  'sports',
  'inventions',
  'space',
  'body',
  'words',
  'holidays',
  'drinking',
  'dating',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const KINDS = [
  'animal',
  'person',
  'place',
  'food',
  'drink',
  'object',
  'number',
  'year',
  'job',
  'body-part',
  'activity',
  'word',
  'group',
  'substance',
  'event',
  'other',
] as const;
export type Kind = (typeof KINDS)[number];

const lower = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[^A-Z]*$/, 'lowercase only');

export const factSchema = z.object({
  id: z.string().regex(/^f[os]-[a-z-]+-\d{3}$/),
  category: z.enum(CATEGORIES),
  kind: z.enum(KINDS),
  fact: z
    .string()
    .min(10)
    .max(140)
    .refine((t) => t.split(BLANK).length === 2 && !t.includes('____'), 'exactly one ___ blank'),
  truth: z.object({
    answer: lower,
    accept: z.array(lower).min(6),
    reject: z.array(lower),
  }),
  houseLies: z.array(lower).length(8),
  source: z.string().min(3).max(200),
  verified: z.boolean(),
  hardWords: z.array(z.string().min(1).max(60)).optional(),
});
export type FactItem = z.infer<typeof factSchema>;

function uniqueIds(facts: readonly FactItem[]): boolean {
  return new Set(facts.map((f) => f.id)).size === facts.length;
}

/** A played pack: every fact sourced and checked (SPEC §3.15 "The truth has to be true"). */
function playedPack(min: number) {
  return z.object({
    lang: z.literal('en'),
    facts: z
      .array(factSchema.extend({ verified: z.literal(true) }))
      .min(min)
      .refine(uniqueIds, { message: 'duplicate fact id' }),
  });
}

export const familyPackSchema = playedPack(150);
export const spicyPackSchema = playedPack(60);
export type FactPack = z.infer<typeof familyPackSchema>;

/** Facts waiting for the owner's spot-check before promotion into a played pack. Never played. */
export const unverifiedPackSchema = z.object({
  lang: z.literal('en'),
  facts: z.array(factSchema),
});

const fillerList = z.array(lower).min(20);
/** The bots' last resort when a fact's house lies are all taken (SPEC §3.8, §3.11). */
export const fillersPackSchema = z.object({
  byKind: z.record(z.enum(KINDS), fillerList),
  byCategory: z.record(z.enum(CATEGORIES), fillerList),
});
export type FillersPack = z.infer<typeof fillersPackSchema>;

export const packs = {
  family: familyPackSchema,
  spicy: spicyPackSchema,
  unverified: unverifiedPackSchema,
  fillers: fillersPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
