// The teams' scores beat (spec §5.4: "the two totals racing to the target"): a lane per team, one
// cell per point up to the target and a flag at the end. The totals already moved on the round's
// banner, so this picture is the race itself: the old cells stand, then this turn's points fill in
// one by one — Sun's, then Moon's — and each lane's number and +N land after its last cell.
import type { CSSProperties, JSX } from 'react';
import styles from './tv.module.css';

type Team = 'sun' | 'moon';

export interface RaceTrackProps {
  totals: Record<Team, number>;
  gained: Record<Team, number>;
  winAt: number;
  names: Record<Team, string>;
  /** The team that goes again (catch-up): its lane glows. */
  active: Team | null;
}

function Lane(props: {
  team: Team;
  name: string;
  total: number;
  gained: number;
  winAt: number;
  active: boolean;
  /** How many fresh cells land before this lane's first one. */
  after: number;
}): JSX.Element {
  const { team, name, total, gained, winAt, active, after } = props;
  const before = Math.max(0, total - gained);
  const fresh = Math.max(0, Math.min(total, winAt) - before);
  return (
    <div
      className={`${styles.lane} ${team === 'moon' ? styles.laneMoon : ''} ${active ? styles.laneActive : ''}`}
      style={{ '--end': after + fresh } as CSSProperties}
    >
      <span className={styles.laneName}>{name}</span>
      <span className={styles.cells} style={{ '--cells': winAt } as CSSProperties}>
        {Array.from({ length: winAt }, (_, i) => {
          const isNew = i >= before && i < before + fresh;
          return (
            <span
              key={i}
              className={`${styles.cell} ${i < before ? styles.cellFull : ''} ${isNew ? styles.cellNew : ''}`}
              style={isNew ? ({ '--k': after + i - before } as CSSProperties) : undefined}
            />
          );
        })}
      </span>
      <span className={styles.flag} aria-hidden>
        🏁
      </span>
      {/* The old total from the first frame; the new one lands with the last new cell. */}
      <span className={styles.laneScore}>
        {gained > 0 ? (
          <>
            <span className={styles.scoreWas}>{total - gained}</span>
            <span className={styles.scoreNow}>{total}</span>
          </>
        ) : (
          total
        )}
      </span>
      <span className={styles.laneGain}>{gained > 0 ? `+${gained}` : ''}</span>
    </div>
  );
}

export function RaceTrack({ totals, gained, winAt, names, active }: RaceTrackProps): JSX.Element {
  const sunFresh = Math.max(0, Math.min(totals.sun, winAt) - Math.max(0, totals.sun - gained.sun));
  return (
    <div className={styles.race}>
      <Lane
        team="sun"
        name={names.sun}
        total={totals.sun}
        gained={gained.sun}
        winAt={winAt}
        active={active === 'sun'}
        after={0}
      />
      <Lane
        team="moon"
        name={names.moon}
        total={totals.moon}
        gained={gained.moon}
        winAt={winAt}
        active={active === 'moon'}
        after={sunFresh}
      />
    </div>
  );
}
