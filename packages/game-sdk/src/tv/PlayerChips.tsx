// A row/grid of player chips built from the view envelope's `players[]`.
import type { JSX } from 'react';
import type { ViewPlayer } from '@partybox/shared';
import { PlayerChip } from '../ui/PlayerChip';
import styles from './PlayerChips.module.css';

export interface PlayerChipsProps {
  players: ViewPlayer[];
  vip?: string | null;
  /** Ids to highlight. */
  activeIds?: string[];
  showScores?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** `grid` wraps into rows (lobby), `row` stays on one line (game footer). */
  layout?: 'grid' | 'row';
}

export function PlayerChips({
  players,
  vip,
  activeIds = [],
  showScores,
  size = 'md',
  layout = 'row',
}: PlayerChipsProps): JSX.Element {
  return (
    <ul className={`${styles.list} ${styles[layout]}`} aria-label="players">
      {players.map((p) => (
        <li key={p.id} className={styles.item}>
          <PlayerChip
            name={p.name}
            avatarId={p.avatarId}
            connected={p.connected}
            status={p.status}
            isVip={vip === p.id}
            active={activeIds.includes(p.id)}
            score={showScores ? p.score : undefined}
            size={size}
          />
        </li>
      ))}
    </ul>
  );
}
