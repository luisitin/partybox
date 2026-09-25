// The Black Sheep token: a gold coin with a black sheep on it, readable in every theme (the
// silhouette is the emoji darkened, the coin is the highlight token). Turns slowly when `spin`.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './SheepCoin.module.css';

export function SheepCoin({
  size = 'md',
  spin = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  spin?: boolean;
  className?: string;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <span
      className={`${styles.coin} ${styles[size] ?? ''} ${spin ? styles.spin : ''} ${className}`}
      role="img"
      aria-label={L('the Black Sheep')}
    >
      <span className={styles.face} aria-hidden>
        🐑
      </span>
    </span>
  );
}
