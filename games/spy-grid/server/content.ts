// Typed access to content/*.json (host only: nothing here reaches a phone except the 25 words a
// board draws, through the views). Parsed once at import, so a broken pack fails fast.
import { packs } from '../content/schema';
import type { Theme, Word } from '../content/schema';
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import spicyThemesJson from '../content/spicy-themes.json' with { type: 'json' };
import spicyWordsJson from '../content/spicy-words.json' with { type: 'json' };
import themesJson from '../content/themes.json' with { type: 'json' };
import wordsJson from '../content/words.json' with { type: 'json' };

export const FAMILY_WORDS: readonly Word[] = packs.words.parse(wordsJson).words;
export const FAMILY_THEMES: readonly Theme[] = packs.themes.parse(themesJson).themes;
export const SPICY_WORDS: readonly Word[] = packs['spicy-words'].parse(spicyWordsJson).words;
export const SPICY_THEMES: readonly Theme[] = packs['spicy-themes'].parse(spicyThemesJson).themes;
export const PRONUNCIATIONS = packs.pronunciations.parse(pronunciationsJson).words;
export const LANG = 'en' as const;

export interface Pool {
  words: ReadonlyMap<string, Word>;
  /** Themes with their members narrowed to this pool. */
  themes: readonly Theme[];
}

function build(words: readonly Word[], themes: readonly Theme[]): Pool {
  const map = new Map(words.map((w) => [w.id, w]));
  return {
    words: map,
    themes: themes
      .map((t) => ({ ...t, members: t.members.filter((m) => map.has(m)) }))
      .filter((t) => t.members.length >= 3),
  };
}

const FAMILY_POOL = build(FAMILY_WORDS, FAMILY_THEMES);
const SPICY_POOL = build([...FAMILY_WORDS, ...SPICY_WORDS], [...FAMILY_THEMES, ...SPICY_THEMES]);

export function poolFor(spicy: boolean): Pool {
  return spicy ? SPICY_POOL : FAMILY_POOL;
}

const ALL_WORDS = new Map([...FAMILY_WORDS, ...SPICY_WORDS].map((w) => [w.id, w]));

/** A board word's entry (every drawn id exists; unknown ids get a bare entry). */
export function wordEntry(id: string): Word {
  return ALL_WORDS.get(id) ?? { id, word: id.toUpperCase(), themes: [], hints: [], family: [id] };
}
