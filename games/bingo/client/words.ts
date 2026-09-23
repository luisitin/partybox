// The names on Bingo's own per-phone settings — card styles, daubs, inks — and the programme's
// short pattern names, in the device's language (the owner, 2026-09-22: every screen translatable
// to Spanish). Each takes the screen's translator (`useT(STRINGS)`), so every sentence stays a
// literal inside an `L(…)` call, where the i18n coverage test can see it.
import { translate, translateSent } from '@partybox/game-sdk/ui';
import type { Lang, Translator } from '@partybox/game-sdk/ui';
import type { Pattern } from '../server/types';
import { STRINGS } from './strings';
import type { CardStyle, DaubStyle, Ink } from './styles';

/** Each card style's name and its one-line hint. */
export function styleWords(L: Translator): Record<CardStyle, { label: string; hint: string }> {
  return {
    focus: { label: L('Focus'), hint: L('one big card + thumbnails') },
    grid: { label: L('Grid'), hint: L('all cards at once') },
    stack: { label: L('Stack'), hint: L('two cards, upright') },
    side: { label: L('Side by side'), hint: L('two cards, sideways') },
    strip: { label: L('Strip'), hint: L('3–4 cards, sideways') },
  };
}

/** The daub's look (S-002 A). */
export function daubWords(L: Translator): Record<DaubStyle, string> {
  return { blot: L('Blot'), stamp: L('Stamp'), ring: L('Ring') };
}

/** The daub's ink (S-002 B). */
export function inkWords(L: Translator): Record<Ink, string> {
  return { mine: L('Mine'), pink: L('Pink'), gold: L('Gold'), green: L('Green') };
}

/** The TV intro's programme ("1. Line  2. Corners …", capitalised by the stylesheet). */
export function patternShort(p: Pattern, L: Translator): string {
  const names: Record<Pattern, string> = {
    line: L('line'),
    corners: L('corners'),
    x: L('x'),
    blackout: L('blackout'),
    frame: L('frame'),
    stamp: L('stamp'),
    tee: L('tee'),
  };
  return names[p];
}

/** A translator outside React (tests, plain helpers): Bingo's table in `lang`. */
export function translatorFor(lang: Lang): Translator {
  return Object.assign(
    (en: string, vars?: Readonly<Record<string, string | number>>) =>
      translate(STRINGS, lang, en, vars),
    { sent: (text: string) => translateSent(STRINGS, lang, text), lang },
  );
}
