// Every user-facing string in the core screens (BL-007 localisation hook). Keep the voice short,
// friendly and consistent; games own their own copy.
//
// The owner (2026-09-22): "all text should be at least translatable to Spanish when the language is
// changed". `t` answers in the device's language (@partybox/game-sdk `getLang`): English is the
// source and `es` a complete twin of the same shape; any other language falls back to English here
// (the join screen carries its own de / fr / pt, i18n-join.ts).
import { getLang } from '@partybox/game-sdk/ui';
import { en } from './i18n-en';
import type { Texts } from './i18n-en';
import { es } from './i18n-es';

export { ordinal } from './ordinal';

export type { Texts } from './i18n-en';

const TEXTS: Partial<Record<string, Texts>> = { es };

/** The texts in a given language (English when it has no table here). */
export function textsFor(lang: string): Texts {
  return TEXTS[lang] ?? en;
}

/** Every string in the device's language, read at render; a language change re-renders the phone
 *  through the controller app's `useLang` key. */
export const t: Texts = new Proxy(en as Texts, {
  get: (_target, key) => textsFor(getLang())[key as keyof Texts],
});

/** English, always. */
export const tEn: Texts = en;
