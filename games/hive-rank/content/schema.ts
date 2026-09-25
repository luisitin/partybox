// Content pack schemas (content/<name>.json → its zod schema; the contract suite validates each).
// A pack is a list of ranking questions: five things, the words for spot 1 and spot 5, and the
// writer's guess at the room's usual order (`expected`, which only bots read).
import { z } from '@partybox/game-sdk';

const itemSchema = z.object({
  /** Stable inside its question; what a phone sends back in its order. */
  id: z.string().regex(/^[a-z0-9]{2,12}$/),
  /** SPEC §6.13: at most 22 characters, one meaning in every country. */
  label: z.string().min(2).max(22),
});

export const questionSchema = z
  .object({
    id: z.string().regex(/^hr-[a-z]{2,10}-\d{3}$/),
    kind: z.enum(['preference', 'usefulness', 'hypothetical', 'social']),
    /** Shown on the TV (h1) and the phone (h2, two lines at 320 px). */
    prompt: z.string().min(8).max(48),
    /** The reader's sentence at `rank` ("Rank these road-trip snacks, from best to worst."). */
    say: z.string().min(10).max(90),
    /** The words for spot 1 and spot 5 ("Best" / "Worst"). */
    top: z.string().min(3).max(12),
    bottom: z.string().min(3).max(12),
    /** In pack order — the order shown, and the last tie-break of the hive (SPEC §6.6). */
    items: z.array(itemSchema).length(5),
    expected: z.array(z.string()).length(5),
  })
  .refine(
    (q) => {
      const ids = new Set(q.items.map((i) => i.id));
      return (
        ids.size === 5 && new Set(q.expected).size === 5 && q.expected.every((e) => ids.has(e))
      );
    },
    { message: 'item ids must be unique and `expected` must be exactly those five ids' },
  );
export type Question = z.infer<typeof questionSchema>;

export const questionPackSchema = z.array(questionSchema).min(40);
export type QuestionPack = z.infer<typeof questionPackSchema>;

/** Per-game pronunciation fixes (foundation §5.4, audit #21): a whole word, matched exactly
 *  (case-sensitive unless `anyCase`), said as `say`. */
export const pronunciationsSchema = z.record(
  z.string().min(1),
  z.object({ say: z.string().min(1), anyCase: z.boolean().optional() }),
);
export type Pronunciations = z.infer<typeof pronunciationsSchema>;

export const packs = {
  family: questionPackSchema,
  spicy: questionPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
