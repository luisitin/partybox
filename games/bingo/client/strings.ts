// Bingo's words in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// shell's game picker reads the manifest's tagline, description and setting labels from here too,
// and `L.sent` the pattern names and hints the server writes. `{name}` marks a placeholder.
// Content (the caller's nicknames, the recorded calls) stays in the deck's language.
import type { Strings } from '@partybox/game-sdk/ui';
import { ES_GAME } from './strings-es-game';
import { ES_PHONE } from './strings-es-phone';
import { ES_TV } from './strings-es-tv';

export const STRINGS: Strings = {
  es: { ...ES_GAME, ...ES_PHONE, ...ES_TV },
};
