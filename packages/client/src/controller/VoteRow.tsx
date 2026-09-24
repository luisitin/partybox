// I-650 A: "What should we play next?" — a person's vote for the next game: one tap, tap another
// to change it, tap it again to take it back. The VIP still decides.
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import styles from './VoteRow.module.css';

/** Votes per game id. */
export function voteCounts(room: RoomSnapshot): Map<string, number> {
  const counts = new Map<string, number>();
  for (const gameId of Object.values(room.votes ?? {}))
    counts.set(gameId, (counts.get(gameId) ?? 0) + 1);
  return counts;
}

/** The most-wanted game and its votes, or null with no votes (a tie keeps the list's order). */
export function voteLeader(room: RoomSnapshot): { id: string; name: string; votes: number } | null {
  const counts = voteCounts(room);
  let best: { id: string; name: string; votes: number } | null = null;
  for (const g of room.games) {
    const n = counts.get(g.id) ?? 0;
    if (n > 0 && (!best || n > best.votes)) best = { id: g.id, name: g.name, votes: n };
  }
  return best;
}

/** "Bingo 3 · Blanks 1" — the tally, most-wanted first. */
export function tallyLine(room: RoomSnapshot): string {
  const counts = voteCounts(room);
  return room.games
    .filter((g) => (counts.get(g.id) ?? 0) > 0)
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
    .map((g) => `${g.name} ${counts.get(g.id) ?? 0}`)
    .join(' · ');
}

export function VoteRow({
  controller,
  room,
  me,
  row = false,
}: {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
  /** One line that scrolls sideways (a footer), instead of wrapping chips. */
  row?: boolean;
}): JSX.Element | null {
  if (me.bot) return null;
  const counts = voteCounts(room);
  const mine = room.votes?.[me.id] ?? null;
  return (
    <section className={styles.vote} aria-label={t.vote.label}>
      <p className={styles.ask}>{mine ? t.vote.voted : t.vote.ask}</p>
      <div className={`${styles.chips} ${row ? styles.row : ''}`}>
        {room.games.map((g) => {
          const n = counts.get(g.id) ?? 0;
          const on = g.id === mine;
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              className={`${styles.chip} ${on ? styles.on : ''}`}
              onClick={() => controller.vote(on ? null : g.id)}
            >
              {g.name}
              {n > 0 ? <span className={styles.count}>{n}</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
