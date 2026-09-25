// Policy cards (SPEC §7.5): a heavy paper decree with a deckled edge, a ribbon in the party colour,
// a wax seal with the party emblem and "LIBERAL POLICY" / "FASCIST POLICY". The back is an engraved
// guilloché with a brass star. `FlipCard` turns between them in 3D (transform only). Never colour
// alone: the word and the emblem always carry the meaning (§7.9).
import type { CSSProperties, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Party } from '../server/types';
import { CardBackArt, Seal } from './art';
import styles from './card.module.css';
import { STRINGS } from './strings';

export type CardSize = 'sm' | 'md' | 'lg';

export function PolicyCard({
  party,
  size = 'md',
  marked = false,
}: {
  party: Party;
  size?: CardSize;
  marked?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <span
      className={styles.card}
      data-party={party}
      data-size={size}
      data-marked={marked || undefined}
      role="img"
      aria-label={party === 'L' ? L('Liberal policy') : L('Fascist policy')}
    >
      <span className={styles.ribbon} aria-hidden="true" />
      <span className={styles.seal} aria-hidden="true">
        <Seal party={party} size="100%" />
      </span>
      <span className={styles.word} aria-hidden="true">
        {party === 'L' ? L('Liberal') : L('Fascist')}
      </span>
      <span className={styles.kind} aria-hidden="true">
        {L('Policy')}
      </span>
    </span>
  );
}

/** A face-down card, or an empty slot on a track (`slot`). */
export function CardBack({
  label,
  slot = false,
  size = 'md',
}: {
  label?: string;
  slot?: boolean;
  size?: CardSize;
}): JSX.Element {
  return (
    <span className={slot ? styles.slot : styles.back} data-size={size}>
      {slot ? null : <CardBackArt />}
      {label ? <span className={styles.backLabel}>{label}</span> : null}
    </span>
  );
}

/** A card that turns face-up (3D, 500 ms) when `up` — its back engraved, its face the decree. */
export function FlipCard({
  party,
  up,
  size = 'md',
  marked = false,
  delayMs = 0,
  label,
}: {
  party: Party;
  up: boolean;
  size?: CardSize;
  marked?: boolean;
  delayMs?: number;
  label?: string;
}): JSX.Element {
  const style = { '--sh-flip-delay': `${delayMs}ms` } as CSSProperties;
  return (
    <span className={styles.flip} data-size={size} data-up={up || undefined} style={style}>
      <span className={styles.turn}>
        <span className={styles.faceBack}>
          <CardBack size={size} label={label} />
        </span>
        <span className={styles.faceFront}>
          <PolicyCard party={party} size={size} marked={marked} />
        </span>
      </span>
    </span>
  );
}
