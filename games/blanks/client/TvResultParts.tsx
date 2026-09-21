// The result's authors: who wrote a card (a face, or the card-stack mascot for Rando — I-018 A)
// and who voted for it. Split from TvResult.tsx at the 300-line cap.
import type { CSSProperties, JSX } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import type { RevealedCard } from '../server/index';
import styles from './blanks.module.css';

/** Who voted for this card: up to six avatars with names, then "+n" (review-loop #170). */
export function Voters({ card }: { card: RevealedCard }): JSX.Element | null {
  if (card.voters.length === 0) return null;
  const shown = card.voters.slice(0, 6);
  const rest = card.voters.length - shown.length;
  return (
    <span className={styles.voters}>
      {shown.map((v, i) => (
        // I-005 A: one at a time, 120 ms apart (--pb-i), with a lock note each (TvResult's effect)
        <span
          key={v.id}
          className={`${styles.voter} ${styles.voterIn}`}
          style={{ '--pb-i': i } as CSSProperties}
        >
          <Avatar avatarId={v.avatarId} size="var(--pb-chip-size)" />
          <span className={styles.authorName}>{v.name}</span>
        </span>
      ))}
      {rest > 0 ? <span className={styles.authorName}>+{rest}</span> : null}
    </span>
  );
}

export function Author({
  card,
  shown,
  label,
}: {
  card: RevealedCard;
  shown: boolean;
  label: string | null;
}): JSX.Element {
  return (
    <span
      className={`${styles.author} ${shown ? styles.rise : styles.pending}`}
      aria-hidden={!shown}
    >
      {/* I-018 A: Rando's card is authored by the deck — a card-stack mascot, not a face (the
          owner's note: the name stays Rando). */}
      {card.rando ? (
        <span className={styles.deck} aria-label="Rando">
          <span />
          <span />
          <span />
        </span>
      ) : (
        <Avatar avatarId={card.avatarId} size="var(--pb-chip-size)" />
      )}
      <span className={styles.authorName}>{card.rando ? 'Rando' : card.name}</span>
      {label ? <span className={styles.voteCount}>{label}</span> : null}
    </span>
  );
}
