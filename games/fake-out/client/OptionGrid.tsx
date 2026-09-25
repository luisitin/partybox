// The pick grid (SPEC §3.4): up to 13 cards in three columns (a short last row centred), text in
// capitals at h2 shrinking with the count and length (never under 36 px), every card identical —
// no author, no colour, no order hint. The cards are dealt in as the pick opens.
import type { JSX } from 'react';
import styles from './tv.module.css';

export interface OptionGridProps {
  options: readonly { id: string; display: string }[];
}

/** Card text size: fewer and shorter answers read bigger. */
export function sizeOf(count: number, text: string): 'lg' | 'md' | 'sm' {
  const long = text.length > 18;
  if (count <= 6) return long ? 'md' : 'lg';
  if (count <= 9) return long ? 'sm' : 'md';
  return 'sm';
}

export function OptionGrid({ options }: OptionGridProps): JSX.Element {
  const rows = Math.ceil(options.length / 3);
  return (
    <ul className={styles.grid} style={{ ['--rows' as string]: rows }}>
      {options.map((o, i) => (
        <li
          key={o.id}
          className={styles.option}
          data-size={sizeOf(options.length, o.display)}
          style={{ ['--i' as string]: i }}
        >
          <span className={styles.optionText}>{o.display.toUpperCase()}</span>
        </li>
      ))}
    </ul>
  );
}
