// A row/grid of player chips built from the view envelope's `players[]`.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  /** The TV strip: go faces-only by itself when the named chips would take more than this many
   *  rows (Tune In: 10+ players pushed the stage up). Re-checked when the players change. */
  autoFacesPastRows?: number;
}

/** More rows than `limit` in a wrapped list (distinct tops of its items). */
function tooManyRows(el: HTMLElement, limit: number | undefined): boolean {
  if (!limit) return false;
  return new Set([...el.children].map((c) => (c as HTMLElement).offsetTop)).size > limit;
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
  autoFacesPastRows,
}: PlayerChipsProps): JSX.Element {
  const L = useT(STRINGS);
  // Auto faces-only: the named chips are laid out, their rows counted (distinct tops), and past the
  // limit the strip drops the names. A new set of players starts over with names.
  const list = useRef<HTMLUListElement>(null);
  const key = players.map((p) => `${p.id}:${p.name}`).join('|');
  const [auto, setAuto] = useState<{ key: string; faces: boolean }>({ key, faces: false });
  if (auto.key !== key) setAuto({ key, faces: false });
  // Measured before the first paint (a layout effect), so a 16-player strip never shows its names
  // once and then collapses (tune-in's note); a resize is watched after that.
  useLayoutEffect(() => {
    const el = list.current;
    if (el && !auto.faces && tooManyRows(el, autoFacesPastRows)) setAuto({ key, faces: true });
  }, [key, auto.faces, autoFacesPastRows]);
  useEffect(() => {
    const el = list.current;
    if (!el || !autoFacesPastRows || auto.faces) return undefined;
    const ro = new ResizeObserver(() => {
      if (tooManyRows(el, autoFacesPastRows)) setAuto({ key, faces: true });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoFacesPastRows, auto.faces, key]);
  const faces = facesOnly || auto.faces;
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
      ref={list}
      className={`${styles.list} ${styles[layout]} ${align === 'start' ? styles.start : ''}`}
      aria-label={L('players')}
    >
      {ordered.map((p) => (
        <li key={p.id} className={`${styles.item} ${enter ? styles.enter : ''}`}>
          <PlayerChip
            name={faces && p.id !== leadId ? '' : p.name}
            avatarId={p.avatarId}
            connected={p.connected}
            status={p.status}
            isVip={vip === p.id}
            active={activeIds.includes(p.id)}
            waving={wavingIds.includes(p.id)}
            awayLeft={awayLeft[p.id] ?? null}
            thinking={thinkingIds.includes(p.id)}
            // a game's faces-only (a claim) drops the scores too; the automatic one drops only the
            // names, so a game that shows scores keeps them (face + score)
            score={showScores && !(facesOnly && p.id !== leadId) ? p.score : undefined}
            scoreMuted={scoresMuted}
            leader={leaders.has(p.id)}
            // faces only: the chip is its content — no empty ✓ slot, no 🤖 (a bot's face already
            // says so) — so the rows read as faces, not blank name tags (reviewer)
            isBot={botIds.includes(p.id) && !(faces && p.id !== leadId)}
            compact={faces && p.id !== leadId}
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
