// The answer matcher is the SDK's now (foundation F5, ADR-048); this file keeps Herd Mind's one
// helper on top of it: the stem key (every word's stem, joined) the pack test compares.
import { normalize, stem } from '@partybox/game-sdk/match';
import type { MatchLang } from '@partybox/game-sdk/match';

export { matchAnswer, normalize, sameAnswer, stem } from '@partybox/game-sdk/match';
export type { MatchItem, MatchLang as Lang, MatchLevel } from '@partybox/game-sdk/match';

/** The stems of every word, joined without spaces — the "same stem" comparison key. */
export function stemKey(text: string, lang: MatchLang): string {
  return normalize(text, lang)
    .norm.split(' ')
    .map((w) => stem(w, lang))
    .join('');
}
