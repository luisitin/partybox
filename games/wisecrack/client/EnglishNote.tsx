// The content-language marker (Fake Out's EnglishNote, reviewer rule [196a9e]): the deck is English
// only, so a phone in another language says so where the English text shows, never unannounced.
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './wisecrack.module.css';

/** ADR-054: `contentLang` is the running game's (the pushed view's): a Spanish game's prompts are
 *  Spanish, so the marker shows only where the deck is still English on a non-English phone. */
export function EnglishNote({ contentLang }: { contentLang?: 'en' | 'es' }): JSX.Element | null {
  const L = useT(STRINGS);
  const lang = useLang();
  if (lang === 'en' || contentLang === 'es') return null;
  return <span className={styles.englishNote}>{L('in English')}</span>;
}
