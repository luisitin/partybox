// A row/grid of player chips built from the view envelope's `players[]`.
import type { JSX } from 'react';
import type { ViewPlayer } from '@partybox/shared';
import { useT } from '../ui/lang';
import { PlayerChip } from '../ui/PlayerChip';
import { STRINGS } from './strings';
import styles from './PlayerChips.module.css';

export interface PlayerChipsProps {
  players: ViewPlayer[];
  vip?: string | null;
  /** Ids to highlight. */
  activeIds?: string[];
  /** I-131 A: faces only — no names, no scores (a claim needs the height). */
  facesOnly?: boolean;
  /** I-131 B: this player's chip keeps its name and leads the row. */
  leadId?: string | null;
  /** I-070 C: players whose nudge is showing — their chip waves. */
  wavingIds?: string[];
  /** I-089 A: seconds of grace left per dropped player. */
  awayLeft?: Record<string, number>;
  /** I-045 B: players the room is waiting on — three pulsing dots over their dimmed avatar. */
  thinkingIds?: string[];
  showScores?: boolean;
  /** The scores are held-over values, not live: rendered muted (review-loop #32). */
  scoresMuted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** `grid` wraps into rows (lobby), `row` stays on one line (game footer). */
  layout?: 'grid' | 'row';
  /** Grid alignment: centred by default; `start` lines up under a left-aligned heading. */
  align?: 'center' | 'start';
  /** Ids of bot players (they get a 🤖 tag). The room snapshot knows; the game view does not. */
  botIds?: readonly string[];
  /** Newly mounted chips pop in (lobby joins). Off by default: no pop on screen transitions. */
  enter?: boolean;
  /** Empty dashed seats rendered after the players (an empty lobby shows where people go). */
  seats?: number;
}

export function PlayerChips({
  players,
  vip,
  activeIds = [],
  facesOnly = false,
  leadId = null,
  wavingIds = [],
  awayLeft = {},
  thinkingIds = [],
  showScores,
  scoresMuted = false,
  size = 'md',
  layout = 'row',
  align = 'center',
  botIds = [],
  enter = false,
  seats = 0,
}: PlayerChipsProps): JSX.Element {
  const L = useT(STRINGS);
  // Same rule as Scoreboard's 🏆: no leader mark when nobody has scored or everyone is tied.
  // Alphabetical everywhere chips appear (lobby, selecting, game strip), so a player finds their
  // chip in the same place on every screen; numeric-aware so Bot 2 precedes Bot 10 (review-loop #3).
  const ordered = [...players].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
  );
  const scored = showScores ? ordered.filter((p) => p.score !== undefined) : [];
  const top = Math.max(0, ...scored.map((p) => p.score as number));
  const leaders =
    top > 0 && scored.some((p) => p.score !== top)
      ? new Set(scored.filter((p) => p.score === top).map((p) => p.id))
      : new Set<string>();
  return (
    <ul
      className={`${styles.list} ${styles[layout]} ${align === 'start' ? styles.start : ''}`}
      aria-label={L('players')}
    >
      {ordered.map((p) => (
        <li key={p.id} className={`${styles.item} ${enter ? styles.enter : ''}`}>
          <PlayerChip
            name={facesOnly && p.id !== leadId ? '' : p.name}
            avatarId={p.avatarId}
            connected={p.connected}
            status={p.status}
            isVip={vip === p.id}
            active={activeIds.includes(p.id)}
            waving={wavingIds.includes(p.id)}
            awayLeft={awayLeft[p.id] ?? null}
            thinking={thinkingIds.includes(p.id)}
            score={showScores && !(facesOnly && p.id !== leadId) ? p.score : undefined}
            scoreMuted={scoresMuted}
            leader={leaders.has(p.id)}
            isBot={botIds.includes(p.id)}
            size={p.id === leadId ? 'md' : size}
          />
        </li>
      ))}
      {Array.from({ length: Math.max(0, seats) }, (_, i) => (
        <li key={`seat-${i}`} className={styles.seat} aria-hidden="true">
          <span className={styles.seatDisc} />
        </li>
      ))}
    </ul>
  );
}
