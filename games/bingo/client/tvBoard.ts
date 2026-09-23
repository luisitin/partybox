// Small helpers for the TV's between-rounds board: where each row stood before this round's
// points (I-103's climb), and the "Sam and Priya are" phrasing.
import { useEffect } from 'react';
import type { SoundApi } from '@partybox/game-sdk/ui';
import type { BingoTvView } from '../server/views';
import styles from './Tv.module.css';

/**
 * Dibs (loop 252): the "says BINGO?…" line pops with a soft rising "hm?" each time the window
 * opens — a window passing on to the next in line is a new window, so it sounds again.
 */
export function useDibsCue(armWindow: number | null, sound: SoundApi): void {
  useEffect(() => {
    if (armWindow !== null) sound.play('dibs');
  }, [armWindow, sound]);
}

/** I-103 A: where every row stood before this round's points — pre-delta wins, ties in roster
 *  order (the I-027 rule Wisecrack uses). */
export function climbFrom(view: BingoTvView): string[] {
  const roster = new Map(view.players.map((p, i) => [p.id, i]));
  return [...view.standings]
    .sort(
      (a, b) =>
        b.wins - b.delta - (a.wins - a.delta) ||
        (roster.get(a.playerId) ?? 0) - (roster.get(b.playerId) ?? 0),
    )
    .map((r) => r.playerId);
}

/** "Sam is" / "Sam and Priya are" / "Sam and 2 others are". */
export function joinNames(names: string[]): string {
  if (names.length === 1) return `${names[0]} is`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are`;
  return `${names[0]} and ${names.length - 1} others are`;
}

/**
 * The verdict's decide line. I-131 (Session B's note): with the strip gone on the verdict the card
 * grows, and the long form — the blackout option, or a winning card sitting the pattern out — ran
 * past the stage's bottom at 15-16 players, so it steps down a size.
 */
export function decideLineClass(view: BingoTvView): string {
  const long = Boolean(view.decide?.blackout) || (view.claim?.cardCount ?? 1) > 1;
  return `${styles.decideLine} ${long ? styles.decideLong : ''} pb-enter`;
}
