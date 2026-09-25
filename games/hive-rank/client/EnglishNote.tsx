// The content-language marker ([196a9e] rule 1, Fake-Out's and Wisecrack's model): the questions
// are English only, so a screen in another language says so where the English shows.
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

export function EnglishNote({ className }: { className?: string }): JSX.Element | null {
  const L = useT(STRINGS);
  if (useLang() === 'en') return null;
  return <span className={`${styles.englishNote} ${className ?? ''}`}>{L('in English')}</span>;
}
