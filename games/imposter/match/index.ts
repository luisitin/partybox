// Imposter's door to the shared matcher (@partybox/game-sdk/match, ADR-048): the same functions
// with English as the default language (every Imposter pack is English), plus `atLeast`.
import {
  isLegalClue as sdkIsLegalClue,
  matchAnswer as sdkMatchAnswer,
  normalize as sdkNormalize,
  sameAnswer as sdkSameAnswer,
  stem as sdkStem,
} from '@partybox/game-sdk/match';
import type {
  ClueOptions,
  ClueVerdict,
  MatchItem,
  MatchLang,
  MatchLevel,
  Normalized,
} from '@partybox/game-sdk/match';

export type {
  ClueOptions,
  ClueReason,
  ClueVerdict,
  MatchLang,
  MatchLevel,
  Normalized,
} from '@partybox/game-sdk/match';
export type AnswerItem = MatchItem;

const RANK: Record<MatchLevel, number> = { exact: 3, stem: 2, fuzzy: 1, none: 0 };

/** True when `level` is `bar` or better. */
export function atLeast(level: MatchLevel, bar: MatchLevel): boolean {
  return RANK[level] >= RANK[bar];
}

export const normalize = (text: string, lang: MatchLang = 'en'): Normalized =>
  sdkNormalize(text, lang);
export const stem = (word: string, lang: MatchLang = 'en'): string => sdkStem(word, lang);
export const matchAnswer = (input: string, item: MatchItem, lang: MatchLang = 'en'): MatchLevel =>
  sdkMatchAnswer(input, item, lang);
export const sameAnswer = (a: string, b: string, lang: MatchLang = 'en'): boolean =>
  sdkSameAnswer(a, b, lang);
export const isLegalClue = (
  clue: string,
  secret: MatchItem,
  opts: Partial<ClueOptions> = {},
): ClueVerdict => sdkIsLegalClue(clue, secret, { lang: 'en', ...opts } as ClueOptions);
