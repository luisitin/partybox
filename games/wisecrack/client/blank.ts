// The server's stand-in for a blank answer (server/types.ts NO_ANSWER). Screens compare the raw
// text (a muted card, a walkover) and show it in the device's language; a player's words are
// content and stay as written.
import type { Translator } from '@partybox/game-sdk/ui';

export const BLANK = '(no answer)';

/** An answer as a screen shows it: the blank stand-in translated, anything else as written. */
export function answerText(L: Translator, text: string): string {
  return text === BLANK ? L('(no answer)') : text;
}
