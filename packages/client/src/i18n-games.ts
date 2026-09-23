// A game's own words on the shell's screens — the manifest's tagline, description and setting
// labels — in the device's language, from the table the game ships with its client module
// (`strings`, keyed by the English sentence). A game without a table reads as its manifest does.
import { translate } from '@partybox/game-sdk/ui';
import type { Lang, Strings } from '@partybox/game-sdk/ui';
import { clientGames } from './games.generated';

const NONE: Strings = {};

/** The game's table, or an empty one. */
export function gameStrings(gameId: string | null | undefined): Strings {
  return (gameId ? clientGames[gameId]?.strings : undefined) ?? NONE;
}

/** One of the game's manifest sentences in `lang`. */
export function gameText(gameId: string | null | undefined, lang: Lang, en: string): string {
  return translate(gameStrings(gameId), lang, en);
}
