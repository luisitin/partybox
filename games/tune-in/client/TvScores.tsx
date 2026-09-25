// The scores beat: solo's board (rows climb to their new places), the teams racing to the target,
// or co-op's group meter filling. The catch-up turn is announced here, and the reader says it.
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, ScoreboardRow } from '@partybox/game-sdk/ui';
import type { TuneTvView } from '../server/index';
import { ratingText, teamName } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { RaceTrack } from './RaceTrack';
import { CoopMeter } from './TvHeader';
import { useReading } from './useReading';

function soloRows(view: TuneTvView): { rows: ScoreboardRow[]; before: string[] } {
  const rows = view.players
    .map((p) => ({ playerId: p.id, name: p.name, avatarId: p.avatarId, score: p.score ?? 0 }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  let rank = 0;
  let last: number | null = null;
  const ranked = rows.map((r, i) => {
    if (r.score !== last) {
      rank = i + 1;
      last = r.score;
    }
    const delta = view.deltas[r.playerId] ?? 0;
    return { ...r, rank, ...(delta ? { delta } : {}) };
  });
  const before = [...ranked]
    .sort((a, b) => b.score - (b.delta ?? 0) - (a.score - (a.delta ?? 0)))
    .map((r) => r.playerId);
  return { rows: ranked, before };
}

export function TvScores({ view }: GameTvProps<TuneTvView>): JSX.Element {
  const L = useT(STRINGS);
  useReading(view.reading);
  const { turn, reveal } = view;
  // Teams count turns (catch-ups included), like the round line over the dial.
  const title = view.last
    ? L('Final scores')
    : turn.mode === 'teams'
      ? L('After turn {n}', { n: turn.n })
      : L('After round {n}', { n: turn.n });
  if (turn.mode === 'teams') {
    const other = turn.team === 'sun' ? 'moon' : 'sun';
    return (
      <Stage center className={styles.scores}>
        <BigText level="h1">{title}</BigText>
        <RaceTrack
          totals={view.team}
          gained={reveal?.teamPoints ?? { sun: 0, moon: 0 }}
          winAt={view.winAt}
          names={{ sun: teamName(L, 'sun'), moon: teamName(L, 'moon') }}
          active={view.catchUpNext ? turn.team : null}
        />
        {view.catchUpNext ? (
          <BigText level="h2" tone="accent" className={styles.catchUp}>
            {L('{team} hit the bullseye and goes again!', { team: teamName(L, turn.team) })}
          </BigText>
        ) : view.last ? null : (
          <BigText level="h2" tone="muted" className={styles.catchUp}>
            {L('Next up: {team}', { team: teamName(L, other) })}
          </BigText>
        )}
      </Stage>
    );
  }
  if (turn.mode === 'coop' && view.coop) {
    const gained = reveal?.needlePts ?? 0;
    return (
      <Stage center className={styles.scores}>
        <BigText level="h1">{title}</BigText>
        <div className={styles.bigMeter}>
          <CoopMeter total={view.coop.total} max={view.coop.max} from={view.coop.total - gained} />
        </div>
        <BigText level="h2" tone={gained > 0 ? 'accent' : 'muted'} className={styles.gainLine}>
          {L('+{n} for the group this round', { n: gained })}
        </BigText>
        <BigText level="h2" tone="muted">
          {ratingText(L, view.coop.rating)}
        </BigText>
      </Stage>
    );
  }
  const { rows, before } = soloRows(view);
  return (
    <Stage className={styles.scores}>
      <BigText level="h1">{title}</BigText>
      <div className={styles.board}>
        <Scoreboard rows={rows} stagger="climb" climbFrom={before} />
      </div>
    </Stage>
  );
}
