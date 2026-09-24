// Content pack schemas. `packs` maps content/<name>.json → its zod schema; the contract suite
// validates every pack with it. Nightfall's content is small and host-only: the two flavours (a
// reskin of names, icons, descriptions and narrator lines), the bots' canned lines and the
// reader's pronunciation fixes. Only what a view needs ever reaches a phone.
import { z } from '@partybox/game-sdk';

export const ROLES = ['wolf', 'seer', 'doctor', 'villager', 'hunter', 'jester'] as const;
export type Role = (typeof ROLES)[number];

export const FLAVOURS = ['village', 'mafia'] as const;
export type FlavourId = (typeof FLAVOURS)[number];

/** Bot lines are posted to the town board (80 characters there) with the longest name filled in. */
export const LINE_MAX_CHARS = 80;
export const NAME_MAX_CHARS = 16;

const roleText = z.object({
  name: z.string().min(1).max(20),
  plural: z.string().min(1).max(24),
  icon: z.string().min(1).max(16),
  desc: z.string().min(1).max(80),
  /** The narrator's reveal clip ("A wolf!"), said when a name cannot be read aloud. */
  reveal: z.string().min(1).max(30),
});

const line = z.string().min(1).max(80);

export const flavourSchema = z.object({
  roles: z.object({
    wolf: roleText,
    seer: roleText,
    doctor: roleText,
    villager: roleText,
    hunter: roleText,
    jester: roleText,
  }),
  sides: z.object({ wolves: line, village: line, jester: line }),
  /** Flavoured words the screens and bot lines drop in. */
  words: z.object({
    aWolf: line,
    wolves: line,
    seer: line,
    villager: line,
    question: line,
    pack: line,
    packPicks: line,
    isWolf: line,
    notWolf: line,
    packChose: line,
    victim: line,
    packmate: line,
  }),
  /** Fixed narrator lines (SPEC §10.15). */
  narrator: z.object({
    nightFalls: line,
    sleeps: line,
    dawn: line,
    survived: line,
    discuss: line,
    vote: line,
    votesIn: line,
    tie: line,
    noAgree: line,
    hunter: line,
    ghosts: line,
    wolvesWin: line,
    villageWin: line,
    jesterWin: line,
  }),
  /** Live readings, `{name}` filled in at the moment they are revealed. */
  live: z.object({ died: line, was: line, left: line, shot: line, lastWords: line }),
});
export type Flavour = z.infer<typeof flavourSchema>;
export type NarratorKey = keyof Flavour['narrator'];

export const flavoursPackSchema = z.object({ village: flavourSchema, mafia: flavourSchema });
export type FlavoursPack = z.infer<typeof flavoursPackSchema>;

const botLine = z.object({
  id: z.string().regex(/^[a-z]+-\d{2}$/),
  text: z.string().min(1).max(LINE_MAX_CHARS),
});
export type BotLine = z.infer<typeof botLine>;

export const botlinesPackSchema = z.object({
  accusations: z.array(botLine).min(40),
  defences: z.array(botLine).min(20),
  seerClaims: z.array(botLine).min(10),
  lastWords: z.array(botLine).min(10),
  generic: z.array(botLine).min(10),
});
export type BotlinesPack = z.infer<typeof botlinesPackSchema>;

const pronunciation = z.object({
  say: z.string().min(1).max(60),
  ipa: z.string().min(1).max(80).optional(),
  anyCase: z.boolean().optional(),
});

export const pronunciationsPackSchema = z.object({
  words: z.record(z.string().min(1).max(40), pronunciation),
});
export type PronunciationsPack = z.infer<typeof pronunciationsPackSchema>;

export const packs = {
  flavours: flavoursPackSchema,
  botlines: botlinesPackSchema,
  pronunciations: pronunciationsPackSchema,
} as const;
