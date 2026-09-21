// The pick screen's three offers (I-023): each tier as heat — one, two or three discs, green to
// red — rising in order; the tapped tier's discs bump and its card takes the accent edge while the
// other two step back until the server moves the phone on; with Spicy on the hard tier's discs
// breathe like an ember.
import type { CSSProperties, JSX } from 'react';
import styles from './Controller.module.css';

const LEVELS = ['easy', 'medium', 'hard'] as const;

export function Offers({
  offers,
  spicy,
  picked,
  onPick,
}: {
  offers: readonly string[];
  spicy: boolean;
  picked: number | null;
  onPick: (option: number) => void;
}): JSX.Element {
  return (
    <ul className={styles.offers}>
      {offers.map((word, i) => (
        <li
          key={word}
          style={{ '--pb-i': i } as CSSProperties}
          className={
            picked !== null ? (picked === i ? styles.offerPicked : styles.offerOther) : undefined
          }
        >
          <button type="button" className={styles.offer} onClick={() => onPick(i)}>
            <span
              className={`${styles.heat} ${styles[`heat${i}`]} ${spicy && i === 2 ? styles.ember : ''}`}
              aria-hidden
            >
              {Array.from({ length: i + 1 }, (_, k) => (
                <span key={k} className={styles.heatDot} />
              ))}
            </span>
            <span className={styles.offerLevel}>{LEVELS[i]}</span>
            <span className={styles.offerText}>{word}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
