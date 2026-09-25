// Echo's TV building blocks: the deck counter (three little piles) and a playing card that turns
// over in 3D (transform only; the back and the face never show at once).
import { useState } from 'react';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type PileKind = 'left' | 'won' | 'lost';

/** A number that pops when it changes (never on first paint). */
function Count({ n }: { n: number }): JSX.Element {
  const [first] = useState(n);
  const changed = n !== first;
  return (
    <span key={n} className={styles.pileNum} data-bump={changed ? '1' : '0'}>
      {n}
    </span>
  );
}

function Pile({ kind, n, label }: { kind: PileKind; n: number; label: string }): JSX.Element {
  return (
    <div className={styles.pile} data-kind={kind}>
      <Count n={n} />
      <span className={styles.pileLabel}>{label}</span>
    </div>
  );
}

export interface DeckCounts {
  left: number;
  won: number;
  lost: number;
}

/** 🂠 left · ✓ won · ✗ lost — the co-op score, in every phase (§7.4). */
export function Deck({ counts }: { counts: DeckCounts }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div
      className={styles.deck}
      role="group"
      aria-label={L('{left} left, {won} won, {lost} lost', { ...counts })}
    >
      <Pile kind="left" n={counts.left} label={L('left')} />
      <Pile kind="won" n={counts.won} label={L('won')} />
      <Pile kind="lost" n={counts.lost} label={L('lost')} />
    </div>
  );
}

export interface CardProps {
  up: boolean;
  /** Deal order: the card lands this long after the stage begins. */
  dealMs?: number;
  /** How far into the stage we mounted: already-dealt cards are simply there. */
  skipMs?: number;
  back?: ReactNode;
  children?: ReactNode;
  faceClass?: string;
  backClass?: string;
  /** Already on the table (no deal). */
  still?: boolean;
  below?: ReactNode;
  label?: string;
}

export function Card(props: CardProps): JSX.Element {
  const {
    up,
    dealMs = 0,
    skipMs = 0,
    back,
    children,
    faceClass,
    backClass,
    still,
    below,
    label,
  } = props;
  const style = {
    '--deal': `${dealMs}ms`,
    '--skip': `${Math.min(skipMs, dealMs + 600)}ms`,
  } as CSSProperties;
  return (
    <div
      className={`${styles.card} ${still ? styles.still : ''}`}
      data-up={up ? '1' : '0'}
      style={style}
      aria-label={label}
    >
      <div className={styles.cardInner}>
        <div className={`${styles.cardBack} ${backClass ?? ''}`} aria-hidden={up}>
          {back ?? '🔁'}
        </div>
        <div className={`${styles.cardFace} ${faceClass ?? ''}`} aria-hidden={!up}>
          {children}
        </div>
      </div>
      {below}
    </div>
  );
}

/** Size step for a clue on a card: whole words always fit, never broken mid-word. */
export function fitOf(text: string): 's' | 'm' | 'l' {
  const n = [...text].length;
  return n <= 6 ? 'l' : n <= 9 ? 'm' : 's';
}

/** A clue in card size: long words step down a size so they never spill. */
export function ClueText({ text, struck }: { text: string; struck?: boolean }): JSX.Element {
  return (
    <span className={`${styles.clueText} ${struck ? styles.struck : ''}`} data-len={fitOf(text)}>
      {text}
    </span>
  );
}

export function EchoFace(): JSX.Element {
  const L = useT(STRINGS);
  return (
    <span className={styles.echoMark}>
      <span aria-hidden>🔇</span>
      <span className={styles.echoWord}>{L('echo')}</span>
    </span>
  );
}

export function AuthorTag({ player }: { player: ViewPlayer | undefined }): JSX.Element | null {
  if (!player) return null;
  return (
    <span className={styles.author}>
      <Avatar avatarId={player.avatarId} size={36} />
      {player.name}
    </span>
  );
}
