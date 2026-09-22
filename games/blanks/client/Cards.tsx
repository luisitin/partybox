// The two cards, rendered the same way on the TV and on every phone: a black card (dark, light
// text) that reads as one sentence with the played white cards dropped into its blanks as light
// "paper" marks — the physical game's convention, kept in every theme so the game is its own
// thing. `fill` (server/cards.ts) is the one rule for where the text goes.
import type { CSSProperties, JSX, ReactNode } from 'react';
import { usePrefersReducedMotion } from '@partybox/game-sdk/ui';
import { BLANK } from '../content/schema';
import { fill, fillText, glue } from '../server/cards';
import type { Segment } from '../server/cards';
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
  /** I-140: the fill at `index` is a preview, not a pick — it carries `className`. */
  provisional?: { index: number; className: string };
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

/** An unfilled blank stays on the line with the word before it: "exhibit: ____." wrapped the
 *  blank alone onto its own line on the TV's answer stage (review-loop #121). */
function glueBlanks(segments: readonly Segment[]): Segment[] {
  return segments.map((s, i) => {
    const next = segments[i + 1];
    if (s.kind === 'text' && next?.kind === 'text' && next.text === BLANK && s.text.endsWith(' '))
      return { ...s, text: `${s.text.slice(0, -1)}\u00A0` };
    return s;
  });
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
  provisional,
}: FilledCardProps): JSX.Element {
  const { segments, extra } = fill(text, whites);
  const sizeClass = styles[size] ?? '';
  const parts = glueBlanks(segments);
  let fills = 0;
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
        {parts.map((s, i) => {
          if (s.kind !== 'fill')
            return (
              // A bare space between two whites ("____, ____") becomes a visible gap, so two
              // paper marks never read as one slab (review-loop #99).
              <span key={i} className={s.text.trim() === '' ? styles.gap : undefined}>
                {s.text}
              </span>
            );
          const n = fills++;
          return (
            // Keyed by text as well: a new white dropped into the phone's preview mounts fresh
            // and pops into place (review-loop #146).
            <mark
              key={`${i}:${s.text}`}
              className={`${styles.fill} ${provisional?.index === n ? provisional.className : ''}`}
              style={{ '--fill-index': n } as CSSProperties}
            >
              {glue(s.text)}
            </mark>
          );
        })}

      </p>
      {extra.length > 0 ? (
        <ul className={styles.extras}>
          {extra.map((w, i) => (
            <li key={i}>
              <mark
                className={styles.fill}
                style={
                  {
                    '--fill-index': segments.filter((s) => s.kind === 'fill').length + i,
                  } as CSSProperties
                }
              >
                {glue(w)}
              </mark>
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

/**
 * The read-out card, dealt face-down and turned over (review-loop #159, the owner's "I love
 * choreography and 3D visuals"): the back is a cream card with the wordmark, the front is the
 * filled sentence. One element flips in 3D — the `card` pluck sounds as it is tossed, the face
 * is readable by ~320 ms, and the whites pop into their blanks after it settles. Under reduced
 * motion the front is simply there.
 */
export function FlipCard(props: FilledCardProps & { flipKey: string }): JSX.Element {
  const { flipKey, className, ...card } = props;
  const reduced = usePrefersReducedMotion();
  if (reduced) return <FilledCard {...card} className={className} />;
  return (
    <div className={styles.flipScene}>
      <div key={flipKey} className={styles.flipper}>
        <FilledCard {...card} className={`${styles.flipFront} ${className ?? ''}`} />
        <span className={styles.flipBack} aria-hidden>
          Blanks
        </span>
      </div>
    </div>
  );
}

/** A fan of three face-down cards — a black one between two whites — for the round card, so the
 *  screen between rounds carries the game's look and not just a number (review-loop #144). */
export function CardFan(): JSX.Element {
  return (
    <div className={styles.fan} aria-hidden>
      <span className={`${styles.fanCard} ${styles.fanWhite}`} />
      <span className={`${styles.fanCard} ${styles.fanBlack}`}>____</span>
      <span className={`${styles.fanCard} ${styles.fanWhite}`} />
    </div>
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
