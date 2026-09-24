// I-652 B/C: the lobby's "Tonight" card beside "Last up" — each game of the night with its human
// winner (or "bots"), then the night's tally and its leader. Bots never count.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { Lang } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './TvLobby.module.css';

/** From this many players the roster takes two more rows and a list under "Last up" ran into the
 *  host bar (the spec's known limit at 9+ players): the card then sits beside "Last up" and keeps
 *  only the tally line (or the newest game, before anyone has won one). */
export const CROWDED_PLAYERS = 9;

/** I-652 A: 1st, 2nd, 3rd, 4th … ("1.º, 2.º" in Spanish). */
export function ordinal(n: number, lang: Lang = 'en'): string {
  if (lang === 'es') return `${n}.º`;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

/** I-652 B: tonight's games, newest first — the game and its human winner, or "bots took it". */
export function Tonight({ room }: { room: RoomSnapshot }): JSX.Element | null {
  const L = useT(STRINGS);
  const all = [...(room.tonight ?? [])].reverse();
  const crowded = room.players.length >= CROWDED_PLAYERS;
  const name = (id: string): string => room.games.find((g) => g.id === id)?.name ?? id;
  // I-652 C: the night's tally — a win per person (bots never count), over every game tonight
  const tally = new Map<string, { n: number; avatarId: string }>();
  for (const g of all)
    for (const w of g.winners)
      tally.set(w.name, { n: (tally.get(w.name)?.n ?? 0) + 1, avatarId: w.avatarId });
  const board = [...tally.entries()].sort((a, b) => b[1].n - a[1].n);
  const leader = board[0] && board[0][1].n > (board[1]?.[1].n ?? 0) ? board[0] : null;
  const games = crowded && board.length > 0 ? [] : crowded ? all.slice(0, 1) : all;
  return (
    <aside className={`${styles.lastUp} ${styles.tonight}`} aria-label={L('tonight')}>
      <span className={styles.lastUpKicker}>{L('Tonight · {n} games', { n: all.length })}</span>
      {games.length > 0 ? (
        <ul className={styles.tonightList}>
          {games.map((g, i) => (
            <li key={i} className={styles.tonightChip}>
              {g.winners.length === 0 ? (
                <span className={styles.lastUpNone}>
                  {g.botsWon ? L('🤖 bots') : L('no winner')}
                </span>
              ) : (
                <>
                  <Avatar avatarId={g.winners[0]?.avatarId ?? 'fox'} size={32} />
                  <strong>{g.winners.map((w) => w.name).join(' & ')}</strong>
                </>
              )}
              <span className={styles.tonightGame}>· {name(g.gameId)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {board.length > 0 ? (
        <p className={styles.tonightTally}>
          {leader ? <strong>{L('👑 {name} leads tonight', { name: leader[0] })}</strong> : null}
          {leader ? ' · ' : ''}
          {board.map(([n, v]) => `${n} ${v.n}`).join(' · ')}
        </p>
      ) : null}
    </aside>
  );
}
