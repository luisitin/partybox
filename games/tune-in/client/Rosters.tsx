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
}): JSX.Element {
  const L = useT(STRINGS);
  const { team, ids, players, won } = props;
  return (
    <div
      className={`${styles.roster} ${team === 'moon' ? styles.rosterMoon : ''} ${won ? styles.rosterWon : ''}`}
    >
      <span className={styles.rosterName}>
        {teamName(L, team)}
        {won ? ` · ${L('Winners!')}` : ''}
      </span>
      <ul className={styles.rosterList}>
        {ids.map((id, i) => (
          <li key={id} className={styles.rosterRow} style={{ animationDelay: `${i * 80}ms` }}>
            <Avatar avatarId={avatarOf(players, id)} size={40} />
            {nameOf(players, id)}
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
}): JSX.Element {
  const { teams, players, winner = null } = props;
  return (
    <div className={styles.rosters}>
      <Roster team="sun" ids={teams.sun} players={players} won={winner === 'sun'} />
      <Roster team="moon" ids={teams.moon} players={players} won={winner === 'moon'} />
    </div>
  );
}
