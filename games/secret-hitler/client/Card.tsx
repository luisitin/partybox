// A policy card, plain for M1: the party word and a mark on a party-toned card. Never colour
// alone (SPEC §7.9): the word and the mark always carry the meaning.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Party } from '../server/types';
import styles from './card.module.css';
import { STRINGS } from './strings';

export function PolicyCard({
  party,
  size = 'md',
  marked = false,
}: {
  party: Party;
  size?: 'sm' | 'md';
  marked?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <span
      className={styles.card}
      data-party={party}
      data-size={size}
      data-marked={marked || undefined}
    >
      <span className={styles.mark} aria-hidden="true">
        {party === 'L' ? '◆' : '✶'}
      </span>
      <span className={styles.word}>{party === 'L' ? L('Liberal') : L('Fascist')}</span>
    </span>
  );
}

/** An empty slot on a track, or a face-down card. */
export function CardBack({ label }: { label?: string }): JSX.Element {
  return (
    <span className={styles.back} data-size="md">
      {label ?? ''}
    </span>
  );
}
