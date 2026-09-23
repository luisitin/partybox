// Lightning Round's words in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// shell's game picker reads the manifest's tagline, description and setting labels from here too.
// `{name}` marks a placeholder. Content (cards, prompts, questions) stays in the deck's language.
// The Spanish lives in two files: the manifest's picker lines (which also name the categories and
// topics the screens show) and the screens' own sentences.
import type { Strings } from '@partybox/game-sdk/ui';
import { SCREENS_ES } from './strings-es';
import { PICKER_ES } from './strings-picker-es';

export const STRINGS: Strings = {
  es: { ...PICKER_ES, ...SCREENS_ES },
};
