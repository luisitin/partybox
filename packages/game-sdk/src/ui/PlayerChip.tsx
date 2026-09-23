// A player chip: avatar + name + state glyph. Shared by the TV envelope, lobby, results and games.
// State is never colour-only: submitted shows ✓, disconnected shows ⟳ and dims, spectator shows 👁.
import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { STRINGS } from '../controller/strings';
import { Avatar } from './Avatar';
import { useT } from './lang';
import type { Translator } from './lang';
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
  /** I-070 C: this player just nudged the VIP — the chip waves. */
  waving?: boolean;
  /** I-089 A: seconds of disconnect grace left (the TV counts it); shown under the name. */
  awayLeft?: number | null;
  /** I-045 B + the owner's note: the room waits on this player — three pulsing dots over the
   *  avatar, the avatar dimmed under them. */
  thinking?: boolean;
  /** This chip is the viewer: a small "you" tag (not the turn outline). */
  isMe?: boolean;
  /** A bot player (ADR-028): shows a robot tag so nobody mistakes it for a person. */
  isBot?: boolean;
  /** Renders a ✕ inside the chip (e.g. remove a bot you own); 44 px hit area. */
  onRemove?: () => void;
  removeLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GLYPH: Record<NonNullable<PlayerChipProps['status']>, string> = {
  active: '',
  submitted: '✓',
  // No glyph: a row of dashes during a reveal carried nothing; the label keeps it for screen readers.
  waiting: '',
  spectator: '◎',
};

/** The state's words for screen readers, in the device's language (`L` from the caller). */
function stateLabel(state: PlayerChipProps['status'] | 'reconnecting', L: Translator): string {
  switch (state) {
    case 'submitted':
      return L('submitted');
    case 'waiting':
      return L('waiting');
    case 'spectator':
      return L('spectator');
    case 'reconnecting':
      return L('reconnecting');
    default:
      return '';
  }
}

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
    waving = false,
    awayLeft = null,
    thinking = false,
    isMe,
    isBot,
    onRemove,
    removeLabel,
    size = 'md',
  } = props;
  const L = useT(STRINGS);
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
  const glyph = connected
    ? { text: GLYPH[status], label: stateLabel(status, L) }
    : { text: '⟳', label: stateLabel('reconnecting', L) };
  const locked = status === 'submitted' && connected;
  const classes = [
    styles.chip,
    styles[size],
    active ? styles.active : '',
    waving ? styles.wave : '', // I-070 C: the sender waves while their nudge shows
    !connected ? styles.off : '',
    blip === 'off' ? styles.flicker : blip === 'back' ? styles.snap : '',
    status === 'spectator' ? styles.spectator : '',
    locked ? styles.locked : '',
  ].join(' ');
  return (
    <div
      className={classes}
      aria-label={`${name}${isMe ? ` ${L('(you)')}` : ''}${isBot ? ` ${L('(bot)')}` : ''}${isVip ? ', VIP' : ''}${glyph.label ? `, ${glyph.label}` : ''}${leader ? `, ${L('leading')}` : ''}`}
    >
      <span className={`${styles.avatar} ${thinking ? styles.avatarThinking : ''}`}>
        <span
          className={`${styles.portrait} ${!connected && awayLeft !== null ? styles.draining : ''}`}
          style={
            !connected && awayLeft !== null
              ? ({ ['--pb-away']: `${(awayLeft / 120) * 360}deg` } as CSSProperties)
              : undefined
          }
        >
          <Avatar avatarId={avatarId} dim={!connected || status === 'spectator'} />
        </span>
        {thinking ? (
          <span className={styles.dots} aria-hidden>
            <i />
            <i />
            <i />
          </span>
        ) : null}
      </span>
      <span className={styles.name}>{name}</span>
      {!connected && awayLeft !== null ? (
        <span
          className={styles.away}
          aria-label={L('{seconds} seconds before they drop out', { seconds: awayLeft })}
        >
          {Math.floor(awayLeft / 60)}:{String(awayLeft % 60).padStart(2, '0')}
        </span>
      ) : null}
      {isMe ? (
        <span className={styles.you} aria-hidden>
          {L('you')}
        </span>
      ) : null}
      {isBot ? (
        <span className={styles.bot} role="img" aria-label={L('bot')}>
          🤖
        </span>
      ) : null}
      {isVip ? (
        <span
          className={`${styles.vip} ${justVip ? styles.vipPop : ''}`}
          aria-hidden
          onAnimationEnd={() => setJustVip(false)}
        >
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
        <span className={styles.leader} role="img" aria-label={L('leading')}>
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
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={removeLabel ?? L('remove')}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
