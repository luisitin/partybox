// Content pack schemas. A pack is one language's questions; every answer ships with the forms a
// player might type (foundation §4.2). `packs` maps content/<name>.json → its schema; the contract
// suite validates every pack with it. The deeper checks (duplicates after normalizing, accept →
// exact, style mix) live in __tests__/content.test.ts.
import { z } from '@partybox/game-sdk';
import { pronunciationsSchema } from '@partybox/game-sdk/speech';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const lower = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[^A-Z]*$/);

export const answerSchema = z.object({
  id: slug.max(40),
  /** Lowercase, what the matcher reads; the tile shows `display` when set, else this capitalised. */
  answer: lower.max(22),
  /** Casing the tile needs ("iPhone", "New York"); same letters as `answer` apart from case. */
  display: z.string().min(1).max(22).optional(),
  /** Roughly the share of people (0–100) who'd say it. Drives tile choice and the bots. */
  weight: z.number().int().min(0).max(100),
  accept: z.array(lower).max(16).default([]),
  reject: z.array(lower).max(8).optional(),
});
export type AnswerItem = z.infer<typeof answerSchema>;

export const STYLES = ['name', 'best', 'pick', 'finish', 'rather'] as const;
export type QuestionStyle = (typeof STYLES)[number];

export const questionSchema = z
  .object({
    id: z.string().regex(/^hm(x)?-[a-z]+-\d{3}$/),
    style: z.enum(STYLES),
    prompt: z
      .string()
      .min(8)
      .max(90)
      .regex(/[.?!:…]$/),
    /** What the reader says when the prompt reads badly aloud. */
    say: z.string().min(4).max(120).optional(),
    /** "all": a would-you-rather with 2–4 answers, every one a tile. */
    tiles: z.literal('all').optional(),
    answers: z.array(answerSchema).min(2).max(14),
  })
  .refine((q) => (q.tiles === 'all' ? q.answers.length <= 4 : q.answers.length >= 8), {
    message: 'tiled questions need 8+ answers; "tiles": "all" questions have 2–4',
  });
export type QuestionItem = z.infer<typeof questionSchema>;

export const packSchema = z.object({
  lang: z.literal('en'),
  items: z.array(questionSchema).min(1),
});
export type Pack = z.infer<typeof packSchema>;

export const packs = {
  family: packSchema,
  spicy: packSchema,
  pronunciations: pronunciationsSchema,
} as const;
