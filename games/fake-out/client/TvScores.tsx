// TV: the scoreboard after each question (SPEC §3.3 `scores`): totals climbing to their new places
// with this question's deltas, then how the points came — each scorer's reason chips ("+1000
// truth", "+1000 fooled 2", "×2 final"). The Next button lives on the VIP's phone.
import type { JSX } from 'react';
import { Avatar, BigText, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { FakeOutTvView } from '../server/index';
import { whyChip } from './labels';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type Props = GameTvProps<FakeOutTvView>;

export function TvScores({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const last = view.n >= view.total;
  const nextFinal = !last && view.finalNext;
  const rows = view.standings.map((r) => {
    const p = view.players.find((x) => x.id === r.playerId);
    return {
      ...r,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? 'ghost',
      connected: p?.connected ?? false,
    };
  });
  // Where every row stood before this question: by pre-delta score, ties in roster order.
  const roster = new Map(view.players.map((p, i) => [p.id, i]));
  const climbFrom = [...rows]
    .sort(
      (a, b) =>
        b.score - b.delta - (a.score - a.delta) ||
        (roster.get(a.playerId) ?? 0) - (roster.get(b.playerId) ?? 0),
    )
    .map((r) => r.playerId);
  const scorers = rows.filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta);
  return (
    <Stage center className={styles.scores}>
      <p className={styles.kicker}>
        {last
          ? L('After the Final Fake-Out')
          : L('After question {n} of {total}', { n: view.n, total: view.total })}
      </p>
      <BigText level="h1">{last ? L('Final scores') : L('Scores so far')}</BigText>
      {/* above the board, so it never runs under the host bar (session-c [90140d] A) */}
      {nextFinal ? (
        <BigText level="h2" tone="accent" className={styles.nextFinal}>
          {L('Next: the Final Fake-Out — double points!')}
        </BigText>
      ) : null}
      <div className={styles.board}>
        <Scoreboard rows={rows} noTrophy stagger="climb" climbFrom={climbFrom} />
      </div>
      {scorers.length > 0 ? (
        <ul className={styles.howList} aria-label={L('How the points came')}>
          {scorers.slice(0, 4).map((r, i) => (
            <li key={r.playerId} className={styles.how} style={{ ['--i' as string]: i }}>
              <Avatar avatarId={r.avatarId} size="var(--pb-space-7)" />
              <span className={styles.howName}>{r.name}</span>
              {r.why.map((w, j) => (
                <span key={j} className={styles.chip} data-k={w.k}>
                  {whyChip(L, w)}
                </span>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <BigText level="h2" tone="muted">
          {L('Nobody scored this time')}
        </BigText>
      )}
    </Stage>
  );
}
