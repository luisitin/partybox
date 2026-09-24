// The lot card (SPEC §8.5) and its hint chips, shared by the TV and PhoneStage. Face down: a
// patterned back in tokens (surface-2 with accent-2 trim, gold for the Grand Lot) with the lot's
// icon in a medallion, a slow 3D sway and a shimmer — the table is never still. Face up: the
// outcome, big. The flip is transform-only (pb-flip), so the 3D context never flattens.
import { useState } from 'react';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Hint } from '../server/hints';
import { ICON, hintLabel, hintText, tierWord, toneOf } from './copy';
import type { Tone } from './copy';
import styles from './card.module.css';
import { STRINGS } from './strings';

/** The idle sway's period; its phase follows the wall clock so a remount never jumps. */
const SWAY_MS = 6000;

export interface CardFace {
  icon: string;
  kicker: string;
  big: string;
  tone: Tone;
}

export function LotCard({
  icon,
  grand,
  face,
  flipped,
  deal,
  size = 'tv',
  stamp,
}: {
  icon: string;
  grand: boolean;
  /** What the face shows once turned. */
  face: CardFace | null;
  /** Face up (animates the turn when it becomes true while mounted, or on mount). */
  flipped: boolean;
  /** Deal the card in (a new lot). */
  deal?: boolean;
  size?: 'tv' | 'phone';
  /** Something stamped across the card (SOLD). */
  stamp?: ReactNode;
}): JSX.Element {
  // Fixed per mount: the sway continues where the last screen's left off.
  const [swayDelay] = useState(() => -(Date.now() % SWAY_MS));
  return (
    <div
      className={`${styles.card} ${styles[size]} ${grand ? styles.grand : ''} ${deal ? styles.deal : ''}`}
      style={{ '--ba-sway-delay': `${swayDelay}ms` } as CSSProperties}
    >
      <div className={styles.sway}>
        <div className={`${styles.inner} ${flipped ? styles.turned : ''}`}>
          <div
            className={`${styles.side} ${styles.face} ${face ? styles[face.tone] : ''}`}
            aria-hidden={!flipped}
          >
            {face ? (
              <>
                <span className={styles.faceIcon}>{face.icon}</span>
                <span className={styles.faceKicker}>{face.kicker}</span>
                <span className={styles.faceBig}>{face.big}</span>
              </>
            ) : null}
          </div>
          <div className={`${styles.side} ${styles.back}`} aria-hidden={flipped}>
            <span className={styles.medallion}>
              <span className={styles.lotIcon}>{icon}</span>
            </span>
            <span className={styles.mark} aria-hidden>
              ?
            </span>
          </div>
        </div>
      </div>
      {stamp ? <div className={styles.stamp}>{stamp}</div> : null}
    </div>
  );
}

export function HintChips({
  hints,
  size = 'tv',
  compact = false,
  className,
}: {
  hints: readonly Hint[];
  size?: 'tv' | 'phone';
  /** One row that never wraps (the bid screen). */
  compact?: boolean;
  className?: string;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <ul
      className={`${styles.chips} ${styles[`chips-${size}`]} ${compact ? styles.compact : ''} ${className ?? ''}`}
      aria-label={L('What might be inside')}
    >
      {hints.map((h, i) => (
        <li
          key={`${h.type}-${h.n}-${i}`}
          className={`${styles.chip} ${styles[toneOf(h.type)]}`}
          style={{ '--ba-i': i } as CSSProperties}
          aria-label={hintLabel(L, h)}
        >
          <span className={styles.tier}>{tierWord(L, h.tier)}</span>
          <span className={styles.what}>
            <span aria-hidden>{ICON[h.type]}</span> {hintText(L, h)}
          </span>
        </li>
      ))}
    </ul>
  );
}
