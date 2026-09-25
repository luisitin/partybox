// Content stays English (Part 00 §7.8): on a Spanish phone the word and the clues say so
// (design review [a0c548] 3, decision [196a9e]).
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function EnMark(): JSX.Element | null {
  const L = useT(STRINGS);
  const lang = useLang();
  return lang === 'en' ? null : <span className={styles.enMark}>{L('in English')}</span>;
}
