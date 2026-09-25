// Two soft glows drifting behind a TV stage (I-029 B): the room breathes while people gather or
// pick, so the picture never freezes. Transform only; still under reduced motion.
import type { JSX } from 'react';
import styles from './Glow.module.css';

export function Glow(): JSX.Element {
  return (
    <div className={styles.glow} aria-hidden>
      <span className={styles.glowA} />
      <span className={styles.glowB} />
    </div>
  );
}
