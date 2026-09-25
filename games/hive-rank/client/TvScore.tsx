// The TV's `score`: the Queen Bee's face crowned on the left, the running scores on the right —
// each row's "+n" lands, the totals count, and rows climb to their new places. "PERFECT HIVE"
// stamps across the top when someone got all five exact. The host's own Next is on the header.
import type { CSSProperties, JSX } from 'react';
import { Avatar, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import type { HiveTvView } from '../server/views';
import { boardRows } from './board';
import { STRINGS } from './strings';
import { TvButton } from './TvRank';
import styles from './Tv.module.css';

function Queen({ view }: { view: HiveTvView }): JSX.Element {
  const L = useT(STRINGS);
  const queens = view.score?.queens ?? [];
  const pts = view.score?.rows.find((r) => r.id === queens[0])?.pts ?? 0;
  if (queens.length === 0)
    return (
      <div className={styles.queen}>
        <span className={styles.queenNone}>{L('No Queen Bee this round')}</span>
      </div>
    );
  const shown = queens.slice(0, 3);
  const names = shown.map((id) => view.players.find((p) => p.id === id)?.name ?? '?');
  return (
    <div className={styles.queen}>
      <span className={styles.queenTitle}>
        {queens.length > 1 ? L('Queen Bees') : L('Queen Bee')}
      </span>
      <div className={styles.queenFaces}>
        {shown.map((id, i) => {
          const p = view.players.find((x) => x.id === id);
          return (
            <span key={id} className={styles.queenFace} style={{ '--i': i } as CSSProperties}>
              <span className={styles.crown} aria-hidden>
                👑
              </span>
              <Avatar avatarId={p?.avatarId ?? 'fox'} size={shown.length > 1 ? 104 : 140} />
            </span>
          );
        })}
      </div>
      <span className={styles.queenName}>
        {queens.length > 3 ? L('{n} players', { n: queens.length }) : names.join(' · ')}
      </span>
      <span className={styles.queenPts}>+{pts}</span>
    </div>
  );
}

export function TvScore({
  view,
  skip,
}: {
  view: HiveTvView;
  skip?: (() => void) | undefined;
}): JSX.Element {
  const L = useT(STRINGS);
  const { rows, before } = boardRows(view);
  const next = view.next === 'results' ? L('See results') : L('Next round');
  return (
    <Stage className={styles.scoreStage}>
      <header className={styles.scoreHeader}>
        <span className={styles.kicker}>
          {L('Round {n} of {total}', { n: view.round, total: view.rounds })} · {L('Scores')}
        </span>
        {view.score?.perfect ? (
          <span className={styles.perfect} role="status">
            {L('PERFECT HIVE')}
          </span>
        ) : null}
        {view.next && skip ? <TvButton label={next} skip={skip} delayMs={2000} /> : null}
      </header>
      <div className={styles.scoreBody}>
        <Queen view={view} />
        <div className={styles.board}>
          <Scoreboard
            key={view.round}
            rows={rows}
            stagger="climb"
            climbFrom={before}
            size={rows.length > 8 ? 'sm' : 'md'}
            columns={rows.length > 8 ? 2 : undefined}
            highlightId={view.score?.queens[0] ?? null}
          />
        </div>
      </div>
    </Stage>
  );
}
