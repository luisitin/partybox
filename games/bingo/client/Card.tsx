// The 5×5 card, used by both surfaces: tappable on the phone, read-only on the TV. Marks are
// never carried by colour alone — green cells get ✓, red cells ✕, missed pattern cells a dashed
// outline — so a check reads the same in every theme and for every viewer.
import type { JSX } from 'react';
import styles from './Card.module.css';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];
const FREE = 12;

export interface CardProps {
  numbers: number[];
  daubs: number[];
  /** Highlighted as the pattern (intro / phones): dotted outline. */
  pattern?: number[];
  /** Check / celebration marks. */
  green?: number[];
  red?: number[];
  missing?: number[];
  /** Phone only: tap to toggle. */
  onTap?: (index: number) => void;
  disabled?: boolean;
  size?: 'phone' | 'tv' | 'mini';
  /** A check or celebration: plain daubs step back so green / red / missing carry the story. */
  verdict?: boolean;
}

export function Card({
  numbers,
  daubs,
  pattern = [],
  green = [],
  red = [],
  missing = [],
  onTap,
  disabled,
  size = 'phone',
  verdict = false,
}: CardProps): JSX.Element {
  const daubed = new Set(daubs);
  const patternSet = new Set(pattern);
  const greenSet = new Set(green);
  const redSet = new Set(red);
  const missingSet = new Set(missing);
  const interactive = onTap !== undefined && !disabled;
  return (
    <div className={`${styles.card} ${styles[size]}`} role="grid" aria-label="bingo card">
      <div className={styles.head} role="row">
        {LETTERS.map((l) => (
          <span key={l} className={styles.letter} role="columnheader">
            {l}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {numbers.map((n, i) => {
          const isFree = i === FREE;
          const isDaubed = isFree || daubed.has(i);
          const cls = [
            styles.cell,
            isDaubed ? styles.daubed : '',
            verdict && isDaubed && !isFree && !greenSet.has(i) && !redSet.has(i) ? styles.dim : '',
            greenSet.has(i) ? styles.green : '',
            redSet.has(i) ? styles.red : '',
            missingSet.has(i) ? styles.missing : '',
            patternSet.has(i) && !isDaubed ? styles.pattern : '',
            isFree ? styles.free : '',
          ].join(' ');
          const mark = greenSet.has(i) ? '✓' : redSet.has(i) ? '✕' : null;
          const label = isFree ? 'FREE' : String(n);
          const Tag = interactive && !isFree ? 'button' : 'div';
          return (
            <Tag
              key={i}
              type={Tag === 'button' ? 'button' : undefined}
              className={cls}
              role="gridcell"
              aria-pressed={Tag === 'button' ? isDaubed : undefined}
              aria-label={`${LETTERS[i % 5]} ${label}${isDaubed ? ', daubed' : ''}`}
              onClick={Tag === 'button' ? () => onTap?.(i) : undefined}
            >
              <span className={styles.number}>{label}</span>
              {mark ? (
                <span className={styles.mark} aria-hidden>
                  {mark}
                </span>
              ) : null}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

/** Tiny pattern icon: the shape the round is after, nothing else. */
export function PatternIcon({ cells, size = 48 }: { cells: number[]; size?: number }): JSX.Element {
  const set = new Set(cells);
  return (
    <span
      className={styles.icon}
      style={{ width: size, height: size }}
      aria-hidden
      data-testid="pattern-icon"
    >
      {Array.from({ length: 25 }, (_, i) => (
        <span key={i} className={`${styles.iconCell} ${set.has(i) ? styles.iconOn : ''}`} />
      ))}
    </span>
  );
}
