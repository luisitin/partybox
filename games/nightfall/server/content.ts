// Typed access to content/*.json. Content is imported statically (host-only: server code, never
// client code) and parsed once, so a broken pack fails at import time and in the contract suite.
import {
  botlinesPackSchema,
  flavoursPackSchema,
  pronunciationsPackSchema,
} from '../content/schema';
import type {
  BotlinesPack,
  Flavour,
  FlavourId,
  FlavoursPack,
  PronunciationsPack,
} from '../content/schema';
import botlinesJson from '../content/botlines.json' with { type: 'json' };
import flavoursJson from '../content/flavours.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };

export const FLAVOUR_PACK: FlavoursPack = flavoursPackSchema.parse(flavoursJson);
export const BOTLINES: BotlinesPack = botlinesPackSchema.parse(botlinesJson);
export const PRONUNCIATIONS: PronunciationsPack =
  pronunciationsPackSchema.parse(pronunciationsJson);

export function flavourOf(id: FlavourId): Flavour {
  return FLAVOUR_PACK[id];
}

/** `{name}`-style placeholders; unknown ones stay as written. */
export function fillIn(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(/\{(\w+)\}/g, (whole, key: string) =>
    Object.hasOwn(values, key) ? (values[key] as string) : whole,
  );
}

/** A bot line in this flavour: `{name}` plus the flavour's words (`{seer}`, `{aWolf}`, …). */
export function botLine(text: string, flavour: FlavourId, name: string): string {
  const w = FLAVOUR_PACK[flavour].words;
  const filled = fillIn(text, {
    name,
    seer: w.seer,
    villager: w.villager,
    aWolf: w.aWolf,
    wolves: w.wolves,
  });
  // A token that opens a sentence ("{seer} here.") is capitalised.
  return filled.replace(
    /(^|[.!?:]\s+)([a-z])/g,
    (_, lead: string, c: string) => lead + c.toUpperCase(),
  );
}
