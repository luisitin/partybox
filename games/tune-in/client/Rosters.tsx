// Both teams side by side: a card per team with its shape, its name and every face (the intro
// introduces them; the finale shows who won together, the winners' card lit).
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import { avatarOf, nameOf, teamName } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type Team = 'sun' | 'moon';

function Roster(props: {
  team: Team;
  ids: readonly string[];
  players: readonly ViewPlayer[];
  won: boolean;
  first: boolean;
  ready: readonly string[] | null;
}): JSX.Element {
  const L = useT(STRINGS);
  const { team, ids, players, won, first, ready } = props;
  return (
    <div
      className={`${styles.roster} ${team === 'moon' ? styles.rosterMoon : ''} ${won ? styles.rosterWon : ''} ${first ? styles.rosterFirst : ''}`}
    >
      <span className={styles.rosterName}>
        {teamName(L, team)}
        {won ? ` · ${L('Winners!')}` : first ? ` · ${L('first up')}` : ''}
      </span>
      <ul className={styles.rosterList}>
        {ids.map((id, i) => (
          <li
            key={id}
            className={`${styles.rosterRow} ${ready && !ready.includes(id) ? styles.rosterWaiting : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Avatar avatarId={avatarOf(players, id)} size={40} />
            {nameOf(players, id)}
            {ready?.includes(id) ? (
              <span className={styles.rosterTick} aria-hidden>
                ✓
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Rosters(props: {
  teams: Record<Team, string[]>;
  players: readonly ViewPlayer[];
  /** The finale: the winning side (null on a shared win). */
  winner?: Team | null;
  /** The intro: the side that plays first. */
  first?: Team | null;
  /** The intro's ready-up: who has tapped I'm ready (a ✓ after the name; the rest breathe). */
  ready?: readonly string[] | null;
}): JSX.Element {
  const { teams, players, winner = null, first = null, ready = null } = props;
  return (
    <div className={styles.rosters}>
      {(['sun', 'moon'] as const).map((team) => (
        <Roster
          key={team}
          team={team}
          ids={teams[team]}
          players={players}
          won={winner === team}
          first={first === team}
          ready={ready}
        />
      ))}
    </div>
  );
}
