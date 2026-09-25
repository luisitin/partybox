// The fact packs are English only: a Spanish room is told so up front, and on the lie screen,
// rather than meeting English facts unannounced (reviewer [d738fb] #5).
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './fakeout.module.css';

export function EnglishNote(): JSX.Element | null {
  const L = useT(STRINGS);
  if (useLang() === 'en') return null;
  return <p className={styles.englishNote}>{L('The facts and answers are in English.')}</p>;
}

/** The same note folded into a kicker line (" · in English"), for screens with no room to spare:
 *  the SE lie screen scrolled 64 px in Spanish with the full line (hive-rank [32d48b]). */
export function EnglishTag(): JSX.Element | null {
  const L = useT(STRINGS);
  if (useLang() === 'en') return null;
  return <span> · {L('in English')}</span>;
}
