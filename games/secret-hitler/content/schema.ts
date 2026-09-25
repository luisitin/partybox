// Content pack schemas. `packs` maps content/<name>.json → its zod schema; the contract suite
// validates every pack with it: the About text and the newspaper headlines; narrator lines and
// bot chat lines arrive later (SPEC §19).
import { z } from '@partybox/game-sdk';

export const aboutPackSchema = z.object({
  /** The licence credit (SPEC's opening note): About sheet, results screen and recap. */
  credit: z.string().min(1).max(160),
  /** Three steps, ≤ 90 characters each (SPEC §1 `howToPlay`; the manifest field arrives with F2). */
  howToPlay: z.array(z.string().min(1).max(90)).length(3),
});
export type AboutPack = z.infer<typeof aboutPackSchema>;

/** SPEC §19: 6–8 newspaper headlines per event, at most 40 characters (the TV banner). */
export const HEADLINE_EVENTS = [
  'elected',
  'rejected',
  'tracker2',
  'liberal',
  'fascist',
  'chaos',
  'zone',
  'notHitler',
  'veto',
  'execution',
  'special',
  'investigation',
  'liberalPolicies',
  'hitlerExecuted',
  'hitlerFled',
  'fascistPolicies',
  'hitlerElected',
  'tooFew',
] as const;
export type HeadlineEvent = (typeof HEADLINE_EVENTS)[number];

const headlineList = z.array(z.string().min(1).max(40)).min(6).max(8);
export const headlinesPackSchema = z.object(
  Object.fromEntries(HEADLINE_EVENTS.map((e) => [e, headlineList])) as Record<
    HeadlineEvent,
    typeof headlineList
  >,
);
export type HeadlinesPack = z.infer<typeof headlinesPackSchema>;

export const packs = { about: aboutPackSchema, headlines: headlinesPackSchema } as const;
