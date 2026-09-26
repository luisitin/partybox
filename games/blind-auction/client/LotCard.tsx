// The mystery box as a card, shared by the TV, the phone and PhoneStage. Face down: a
// patterned back in tokens (surface-2 with accent-2 trim, gold for the Grand Lot) with the lot's
// icon in a medallion, a slow 3D sway and a shimmer — the table is never still. Face up: the
// outcome, big. The flip is transform-only (pb-flip), so the 3D context never flattens.
import { useState } from 'react';
import type { CSSProperties, JSX, ReactNode } from 'react';
import type { Tone } from './copy';
import styles from './card.module.css';

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
