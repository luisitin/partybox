// The two cards, rendered the same way on the TV and on every phone: a black card (dark, light
// text) that reads as one sentence with the played white cards dropped into its blanks as light
// "paper" marks — the physical game's convention, kept in every theme so the game is its own
// thing. `fill` (server/cards.ts) is the one rule for where the text goes.
import type { JSX, ReactNode } from 'react';
import { fill, fillText, glue } from '../server/cards';
import styles from './blanks.module.css';

export const LETTERS = 'ABCDEFGHIJKLMNOP';

export interface FilledCardProps {
  text: string;
  /** White cards in blank order; none = the bare prompt with its blanks. */
  whites?: readonly string[];
  /** Shown as a PICK n badge when > 1 and nothing is filled in yet. */
  pick?: number;
  /** Type size: `hero` (the card on stage), `medium` (the result winner), `grid` (many on stage),
   *  `phone`, `mini` (thumbnails). */
  size?: 'hero' | 'medium' | 'grid' | 'phone' | 'mini';
  /** Slot letter disc in the corner (reveal / judge). */
  letter?: string;
  /** Extra chrome inside the card (author row, votes). */
  children?: ReactNode;
  className?: string;
  /** Emphasised (the winner). */
  winner?: boolean;
  ariaLabel?: string;
}

// A Pick 3 with three long whites runs past 190 characters: h2 still fits the stage in five
// lines; body size is for the very rare longer one (review-loop #99).
const HERO_LONG = 90;
const HERO_VERY_LONG = 210;

/** Long sentences step down a size so they still fit the stage / the phone width. */
function lengthClass(
  size: FilledCardProps['size'],
  text: string,
  whites: readonly string[],
): string {
  if (size !== 'hero' && size !== 'phone') return '';
  const length = fillText(text, whites).length;
  if (length > HERO_VERY_LONG) return styles.veryLong ?? '';
  if (length > HERO_LONG) return styles.long ?? '';
  return '';
}

export function FilledCard({
  text,
  whites = [],
  pick = 1,
  size = 'phone',
  letter,
  children,
  className,
  winner,
  ariaLabel,
}: FilledCardProps): JSX.Element {
  const { segments, extra } = fill(text, whites);
  const sizeClass = styles[size] ?? '';
  return (
    <article
      className={`${styles.black} ${sizeClass} ${lengthClass(size, text, whites)} ${letter ? styles.lettered : ''} ${winner ? styles.winner : ''} ${className ?? ''}`}
      aria-label={ariaLabel ?? fillText(text, whites)}
    >
      {letter ? (
        <span className={styles.letter} aria-hidden>
          {letter}
        </span>
      ) : null}
      <p className={styles.sentence}>
        {segments.map((s, i) =>
          s.kind === 'fill' ? (
            <mark key={i} className={styles.fill}>
              {glue(s.text)}
            </mark>
          ) : (
            // A bare space between two whites ("____, ____") becomes a visible gap, so two
            // paper marks never read as one slab (review-loop #99).
            <span key={i} className={s.text.trim() === '' ? styles.gap : undefined}>
              {s.text}
            </span>
          ),
        )}
      </p>
      {extra.length > 0 ? (
        <ul className={styles.extras}>
          {extra.map((w, i) => (
            <li key={i}>
              <mark className={styles.fill}>{glue(w)}</mark>
            </li>
          ))}
        </ul>
      ) : null}
      {whites.length === 0 && pick > 1 ? (
        <span className={styles.pickBadge}>Pick {pick}</span>
      ) : null}
      {children}
    </article>
  );
}

/** The filled sentence as inline text with the whites marked — for vote rows and captions. */
export function InlineFilled({
  text,
  whites,
}: {
  text: string;
  whites: readonly string[];
}): JSX.Element {
  const { segments, extra } = fill(text, whites);
  return (
    <span className={styles.inline}>
      {segments.map((s, i) =>
        s.kind === 'fill' ? (
          <mark key={i} className={styles.fill}>
            {glue(s.text)}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
      {extra.map((w, i) => (
        <mark key={`x${i}`} className={styles.fill}>
          {glue(w)}
        </mark>
      ))}
    </span>
  );
}
