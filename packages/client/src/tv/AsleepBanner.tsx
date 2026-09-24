// I-746 B/C: every phone went quiet mid-game — the TV says why the game stopped and when it ends.
import type { JSX } from 'react';
import { t } from '../i18n';
import styles from './TvApp.module.css';

export function AsleepBanner({ asleep }: { asleep: boolean }): JSX.Element | null {
  if (!asleep) return null;
  return (
    <div className={styles.asleepBanner} role="status">
      {t.tv.asleep}
      <small>{t.tv.asleepEnds}</small>
    </div>
  );
}
