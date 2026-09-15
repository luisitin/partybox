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
  /** Grid alignment: centred by default; `start` lines up under a left-aligned heading. */
  align?: 'center' | 'start';
  /** Ids of bot players (they get a 🤖 tag). The room snapshot knows; the game view does not. */
  botIds?: readonly string[];
}

export function PlayerChips({
  players,
  vip,
  activeIds = [],
  showScores,
  size = 'md',
  layout = 'row',
  align = 'center',
  botIds = [],
}: PlayerChipsProps): JSX.Element {
  return (
    <ul
      className={`${styles.list} ${styles[layout]} ${align === 'start' ? styles.start : ''}`}
      aria-label="players"
    >
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
            isBot={botIds.includes(p.id)}
            size={size}
          />
        </li>
      ))}
    </ul>
  );
}
