// Echo's view of the shared matcher (@partybox/game-sdk/match, ADR-048): the SDK does the work;
// this keeps Echo's call sites (a `lang` argument on isLegalClue) and adds the stem key the bot
// guesser indexes its banks by. It replaced Echo's local stand-in on 2026-09-25.
import { isLegalClue as sdkIsLegalClue, normalize, stem } from '@partybox/game-sdk/match';
import type { ClueVerdict, MatchItem, MatchLang } from '@partybox/game-sdk/match';

export { groupAnswers, matchAnswer, normalize, sameAnswer } from '@partybox/game-sdk/match';
export type {
  ClueReason,
  ClueVerdict,
  MatchItem as AnswerItem,
  MatchLang as Lang,
  MatchLevel,
} from '@partybox/game-sdk/match';

export interface ClueOpts {
  oneWord?: boolean;
  maxChars?: number;
}

export function isLegalClue(
  clue: string,
  secret: MatchItem,
  lang: MatchLang,
  opts: ClueOpts = {},
): ClueVerdict {
  return sdkIsLegalClue(clue, secret, { ...opts, lang });
}

/** Every word of the normalized text stemmed, then compacted (the bot's bank index key). */
export function stemCompact(text: string, lang: MatchLang): string {
  return normalize(text, lang)
    .norm.split(' ')
    .filter((w) => w.length > 0)
    .map((w) => stem(w, lang))
    .join('');
}
