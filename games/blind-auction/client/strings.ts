// Blind Auction's words in other languages, keyed by the English sentence (the owner, 2026-09-22:
// every screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// shell's picker reads the manifest's tagline, description and setting labels from here too, and
// the VIP's Skip labels and the awards the server writes. `{name}` marks a placeholder. Content (lot
// names and flavour lines) stays in the deck's language.
import type { Strings } from '@partybox/game-sdk/ui';
import { ES_GAME } from './strings-es-game';
import { ES_SCREENS } from './strings-es-screens';

export const STRINGS: Strings = {
  es: { ...ES_GAME, ...ES_SCREENS },
};
