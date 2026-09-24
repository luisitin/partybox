// Content pack schemas. `packs` maps content/<name>.json → its zod schema; the contract suite
// validates every pack with it. M1 ships only the About text; narrator lines, headlines and bot
// chat lines arrive in M2/M4 (SPEC §19).
import { z } from '@partybox/game-sdk';

export const aboutPackSchema = z.object({
  /** The licence credit (SPEC's opening note): About sheet, results screen and recap. */
  credit: z.string().min(1).max(160),
  /** Three steps, ≤ 90 characters each (SPEC §1 `howToPlay`; the manifest field arrives with F2). */
  howToPlay: z.array(z.string().min(1).max(90)).length(3),
});
export type AboutPack = z.infer<typeof aboutPackSchema>;

export const packs = { about: aboutPackSchema } as const;
