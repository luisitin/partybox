// The content-language marker (Fake Out's EnglishNote, reviewer rule [196a9e]): the deck is English
// only, so a phone in another language says so where the English text shows, never unannounced.
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './wisecrack.module.css';

export function EnglishNote(): JSX.Element | null {
  const L = useT(STRINGS);
  if (useLang() === 'en') return null;
  return <span className={styles.englishNote}>{L('in English')}</span>;
}
