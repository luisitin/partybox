// A game's own words on the shell's screens. Its manifest sentences (tagline, description, setting
// labels) come from the host in the device's language (ADR-049: `games/<id>/manifest.es.json`,
// fetched on demand — catalog.ts), so the picker never needs the game's code. The game's client
// `strings` table still covers its server's sentences while it plays (server-text.ts).
import type { Lang, Strings } from '@partybox/game-sdk/ui';
import { textTable } from './catalog';
import { peekGame } from './game-loader';

const NONE: Strings = {};

/** The game's table once its code is here (a phone's or a TV's entry), or an empty one. */
export function gameStrings(gameId: string | null | undefined): Strings {
  return (peekGame(gameId, 'phone') ?? peekGame(gameId, 'tv'))?.strings ?? NONE;
}

/** One of the game's manifest sentences in `lang` (English until the host's words arrive: a
 *  screen showing these calls `useGameText` so it re-renders when they do). */
export function gameText(gameId: string | null | undefined, lang: Lang, en: string): string {
  return textTable(gameId, lang)[en] ?? en;
}
