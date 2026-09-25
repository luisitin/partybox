// ADR-052 on the results screens: a team game's board, grouped by team — each group headed by its
// mark and name in the team's own colour, the winning team first and outlined, its members' rows
// under it. Individual trophies and ranks are off: the team won, not a row. TV and phone.
import type { CSSProperties, JSX } from 'react';
import { Scoreboard } from '@partybox/game-sdk/ui';
import type { TeamGroup } from './controller/results-rows';
import styles from './TeamBoards.module.css';

export function TeamBoards({
  groups,
  compact = false,
  highlightId,
  size,
  wonLabel,
}: {
  groups: TeamGroup[];
  compact?: boolean;
  highlightId?: string;
  size?: 'sm' | 'md' | 'lg';
  /** The winners' tag beside the team name ("Winners" / "Ganadores"). */
  wonLabel: string;
}): JSX.Element {
  return (
    <div className={`${styles.teams} ${compact ? styles.compact : ''}`}>
      {groups.map((g) => (
        <section
          key={g.id}
          className={`${styles.team} ${g.won ? styles.won : ''}`}
          style={{ '--team': g.color ?? 'var(--pb-accent-2)' } as CSSProperties}
          aria-label={`${g.mark ? `${g.mark} ` : ''}${g.name}${g.won ? `, ${wonLabel}` : ''}`}
        >
          <h3 className={styles.head}>
            {g.mark ? (
              <span className={styles.mark} aria-hidden>
                {g.mark}
              </span>
            ) : null}
            <span className={styles.name}>{g.name}</span>
            {g.won ? <span className={styles.tag}>🏆 {wonLabel}</span> : null}
          </h3>
          <Scoreboard
            rows={g.rows}
            noTrophy
            noRanks
            {...(compact ? { compact: true } : {})}
            {...(highlightId ? { highlightId } : {})}
            {...(size ? { size } : {})}
          />
        </section>
      ))}
    </div>
  );
}
