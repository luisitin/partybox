// Bingo's words in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// shell's game picker reads the manifest's tagline, description and setting labels from here too.
// `{name}` marks a placeholder. Content (cards, prompts, questions) stays in the deck's language.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {},
};
