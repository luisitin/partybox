// A player chip: avatar + name + state glyph. Shared by the TV envelope, lobby, results and games.
// State is never colour-only: submitted shows ✓, disconnected shows ⟳ and dims, spectator shows 👁.
import { useState } from 'react';
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
  /** A held-over score (the strip is frozen for a beat): muted, no pop. */
  scoreMuted?: boolean;
  /** Currently leading on points: a ▲ before the score. */
  leader?: boolean;
  /** Highlight (e.g. it is this player's turn). */
  active?: boolean;
  /** I-044 A: the room's first VIP — the pill assembles from four sparks as it pops in. */
  crown?: boolean;
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
    scoreMuted = false,
    leader,
    active,
    crown = false,
    isMe,
    isBot,
    onRemove,
    removeLabel = 'remove',
    size = 'md',
  } = props;
  // The ★ VIP badge pops only when it arrives on a mounted chip (a handover), never on a screen
  // swap — 'adjust state when a prop changes' (review-loop #5).
  const [wasVip, setWasVip] = useState(isVip ?? false);
  const [justVip, setJustVip] = useState(false);
  if ((isVip ?? false) !== wasVip) {
    setWasVip(isVip ?? false);
    setJustVip(isVip === true);
  }
  // I-009 A: a drop and a return on a mounted chip flicker out / snap back — never on a screen
  // swap (the same 'adjust state when a prop changes' rule as the ★ badge above).
  const [wasConnected, setWasConnected] = useState(connected);
  const [blip, setBlip] = useState<'off' | 'back' | null>(null);
  if (connected !== wasConnected) {
    setWasConnected(connected);
    setBlip(connected ? 'back' : 'off');
  }
  const glyph = connected ? GLYPH[status] : { text: '⟳', label: 'reconnecting' };
  const locked = status === 'submitted' && connected;
  const classes = [
    styles.chip,
    styles[size],
    active ? styles.active : '',
    !connected ? styles.off : '',
    blip === 'off' ? styles.flicker : blip === 'back' ? styles.snap : '',
    status === 'spectator' ? styles.spectator : '',
    locked ? styles.locked : '',
  ].join(' ');
  return (
    <div
      className={classes}
      aria-label={`${name}${isMe ? ' (you)' : ''}${isBot ? ' (bot)' : ''}${isVip ? ', VIP' : ''}${glyph.label ? `, ${glyph.label}` : ''}${leader ? ', leading' : ''}`}
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
        <span
          className={`${styles.vip} ${justVip || crown ? styles.vipPop : ''} ${crown ? styles.crown : ''}`}
          aria-hidden
          onAnimationEnd={() => setJustVip(false)}
        >
          {crown ? (
            <span className={styles.sparks} aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
          ) : null}
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
      {leader && score !== undefined ? (
        <span className={styles.leader} role="img" aria-label="leading">
          ▲
        </span>
      ) : null}
      {score !== undefined ? (
        // keyed on the value so a change re-mounts and pops in place
        <span key={score} className={`${styles.score} ${scoreMuted ? styles.scoreMuted : ''}`}>
          {score}
        </span>
      ) : null}
      {onRemove ? (
        <button type="button" className={styles.remove} onClick={onRemove} aria-label={removeLabel}>
          ✕
        </button>
      ) : null}
    </div>
  );
}
