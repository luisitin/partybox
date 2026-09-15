// A player chip: avatar + name + state glyph. Shared by the TV envelope, lobby, results and games.
// State is never colour-only: submitted shows ✓, disconnected shows ⟳ and dims, spectator shows 👁.
import type { JSX } from 'react';
import { Avatar } from './Avatar';
import styles from './PlayerChip.module.css';

export interface PlayerChipProps {
  name: string;
  avatarId: string;
  connected?: boolean;
  status?: 'active' | 'submitted' | 'waiting' | 'spectator';
  isVip?: boolean;
  score?: number;
  /** Highlight (e.g. it is this player's turn). */
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const GLYPH: Record<NonNullable<PlayerChipProps['status']>, { text: string; label: string }> = {
  active: { text: '', label: '' },
  submitted: { text: '✓', label: 'submitted' },
  waiting: { text: '…', label: 'waiting' },
  spectator: { text: '◎', label: 'spectator' },
};

export function PlayerChip(props: PlayerChipProps): JSX.Element {
  const {
    name,
    avatarId,
    connected = true,
    status = 'active',
    isVip,
    score,
    active,
    size = 'md',
  } = props;
  const glyph = connected ? GLYPH[status] : { text: '⟳', label: 'reconnecting' };
  const classes = [
    styles.chip,
    styles[size],
    active ? styles.active : '',
    !connected ? styles.off : '',
    status === 'spectator' ? styles.spectator : '',
  ].join(' ');
  return (
    <div
      className={classes}
      aria-label={`${name}${isVip ? ', VIP' : ''}${glyph.label ? `, ${glyph.label}` : ''}`}
    >
      <span className={styles.avatar}>
        <Avatar avatarId={avatarId} dim={!connected || status === 'spectator'} />
      </span>
      <span className={styles.name}>{name}</span>
      {isVip ? (
        <span className={styles.vip} aria-hidden>
          ★ VIP
        </span>
      ) : null}
      {glyph.text ? (
        <span
          className={`${styles.glyph} ${status === 'submitted' && connected ? styles.ok : ''}`}
          aria-hidden
        >
          {glyph.text}
        </span>
      ) : null}
      {score !== undefined ? <span className={styles.score}>{score}</span> : null}
    </div>
  );
}
