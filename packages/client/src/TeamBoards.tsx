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
  sideBySide = false,
  highlightId,
  size,
  wonLabel,
}: {
  groups: TeamGroup[];
  compact?: boolean;
  /** The groups in columns, not stacked (the TV when stacked groups would run under the host bar). */
  sideBySide?: boolean;
  highlightId?: string;
  size?: 'sm' | 'md' | 'lg';
  /** The winners' tag beside the team name ("Winners" / "Ganadores"). */
  wonLabel: string;
}): JSX.Element {
  // A third TV column leaves too little width for team and player names. More sides wrap below.
  const sides = groups.filter((g) => g.id !== '').length;
  const columns = Math.min(2, Math.max(1, sides));
  return (
    <div
      className={`${styles.teams} ${compact ? styles.compact : ''} ${sideBySide ? styles.sideBySide : ''} ${sideBySide && sides > 2 ? styles.multiSide : ''}`}
      // The "No team" group spans both columns below the sides.
      style={sideBySide ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    >
      {groups.map((g) => (
        <section
          key={g.id || 'teamless'}
          className={`${styles.team} ${g.won ? styles.won : ''} ${g.id === '' ? styles.teamless : ''}`}
          style={{ '--team': g.color ?? 'var(--pb-accent-2)' } as CSSProperties}
          aria-label={`${g.mark ? `${g.mark} ` : ''}${g.name}${g.won ? `, ${wonLabel}` : ''}`}
        >
          <h3 className={styles.head}>
            {/* the mark rides in the name's box: when the tag drops to its own line, the mark and
                the name stay together on the first */}
            <span className={styles.name}>
              {g.mark ? <span aria-hidden>{g.mark} </span> : null}
              {g.name}
            </span>
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
