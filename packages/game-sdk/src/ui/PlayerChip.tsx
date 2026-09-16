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
  /** This chip is the viewer: a small "you" tag (not the turn outline). */
  isMe?: boolean;
  /** A bot player (ADR-028): shows a robot tag so nobody mistakes it for a person. */
  isBot?: boolean;
  /** Renders a ✕ inside the chip (e.g. remove a bot you own); 44 px hit area. */
  onRemove?: () => void;
  removeLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GLYPH: Record<NonNullable<PlayerChipProps['status']>, { text: string; label: string }> = {
  active: { text: '', label: '' },
  submitted: { text: '✓', label: 'submitted' },
  // No glyph: a row of dashes during a reveal carried nothing; the label keeps it for screen readers.
  waiting: { text: '', label: 'waiting' },
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
    isMe,
    isBot,
    onRemove,
    removeLabel = 'remove',
    size = 'md',
  } = props;
  const glyph = connected ? GLYPH[status] : { text: '⟳', label: 'reconnecting' };
  const locked = status === 'submitted' && connected;
  const classes = [
    styles.chip,
    styles[size],
    active ? styles.active : '',
    !connected ? styles.off : '',
    status === 'spectator' ? styles.spectator : '',
    locked ? styles.locked : '',
  ].join(' ');
  return (
    <div
      className={classes}
      aria-label={`${name}${isMe ? ' (you)' : ''}${isBot ? ' (bot)' : ''}${isVip ? ', VIP' : ''}${glyph.label ? `, ${glyph.label}` : ''}`}
    >
      <span className={styles.avatar}>
        <Avatar avatarId={avatarId} dim={!connected || status === 'spectator'} />
      </span>
      <span className={styles.name}>{name}</span>
      {isMe ? (
        <span className={styles.you} aria-hidden>
          you
        </span>
      ) : null}
      {isBot ? (
        <span className={styles.bot} role="img" aria-label="bot">
          🤖
        </span>
      ) : null}
      {isVip ? (
        <span className={styles.vip} aria-hidden>
          ★ VIP
        </span>
      ) : null}
      {/* Always in the layout (a reserved slot), so a ✓ landing never shoves the neighbours. */}
      <span
        className={`${styles.glyph} ${glyph.text ? styles.shown : ''} ${locked ? styles.ok : ''} ${!connected ? styles.spin : ''}`}
        aria-hidden
      >
        {glyph.text}
      </span>
      {score !== undefined ? <span className={styles.score}>{score}</span> : null}
      {onRemove ? (
        <button type="button" className={styles.remove} onClick={onRemove} aria-label={removeLabel}>
          ✕
        </button>
      ) : null}
    </div>
  );
}
