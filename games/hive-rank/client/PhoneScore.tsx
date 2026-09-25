// The phone's `score` (after the TV has shown the whole hive): my order next to the hive's, each
// row marked ✓ exact (+2), ±1 one off (+1) or ✗; the round's points; "👑 You're the Queen Bee!".
// In a phone-only room the room's board follows (the TV's scores). The VIP's Next is the footer.
import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { PrimaryButton, Scoreboard, Screen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { HiveControllerView, MarkRow } from '../server/views';
import { boardRows } from './board';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

const MARK: Record<MarkRow['mark'], string> = { exact: '✓', near: '±1', miss: '✗' };

export function NextButton({
  view,
  skip,
}: {
  view: HiveControllerView;
  skip?: (() => void) | undefined;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const [sent, setSent] = useState(false);
  if (!skip || !view.next) return null;
  const label =
    view.next === 'start'
      ? L('Let’s go')
      : view.next === 'results'
        ? L('See results')
        : L('Next round');
  return (
    <PrimaryButton
      done={sent}
      onClick={() => {
        if (sent) return;
        setSent(true);
        skip();
      }}
    >
      {sent ? L('Moving on…') : label}
    </PrimaryButton>
  );
}

export function PhoneScore({
  view,
  skip,
}: {
  view: HiveControllerView;
  skip?: (() => void) | undefined;
}): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  const result = view.result;
  const board = phoneOnly ? boardRows(view) : null;
  return (
    <Screen footer={<NextButton view={view} skip={skip} />} className={styles.scoreScreen}>
      <div className={styles.head}>
        <span className={styles.kicker}>
          {L('Round {n} of {total}', { n: view.round, total: view.rounds })}
        </span>
        {result ? (
          <p className={styles.points}>
            <span className={styles.pointsNum}>+{result.pts}</span>
            <span className={styles.pointsWord}>{L('this round')}</span>
          </p>
        ) : (
          <p className={styles.noOrder}>{L('No order this round — you’ll get the next one!')}</p>
        )}
      </div>
      {result?.queen ? <p className={styles.queenBanner}>{L('👑 You’re the Queen Bee!')}</p> : null}
      {result?.perfect ? <p className={styles.perfectBanner}>{L('PERFECT HIVE')}</p> : null}
      {result ? (
        <p className={styles.legendPhone}>{L('✓ exact +2 · ±1 one off +1 · all five +2')}</p>
      ) : null}
      {result ? (
        <ol className={styles.marks} aria-label={L('Your order against the hive')}>
          {result.rows.map((row, i) => (
            <li
              key={row.id}
              className={`${styles.markRow} ${styles[row.mark] ?? ''}`}
              style={{ '--i': i } as CSSProperties}
            >
              <span className={styles.markMine}>{row.mine}</span>
              <span className={styles.markLabel}>{row.label}</span>
              <span className={styles.markHive}>
                <span className={styles.markSign} aria-hidden>
                  {MARK[row.mark]}
                </span>
                <span className={styles.markWhere}>
                  {row.mark === 'exact'
                    ? L('+2')
                    : row.mark === 'near'
                      ? L('+1 (hive #{n})', { n: row.hive })
                      : L('hive #{n}', { n: row.hive })}
                </span>
                <span className="pb-visually-hidden">
                  {row.mark === 'exact'
                    ? L('exact spot')
                    : row.mark === 'near'
                      ? L('one spot off')
                      : L('more than one spot off')}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      {!result && view.spots.length ? (
        <ol className={styles.marks} aria-label={L('The hive’s order')}>
          {[...view.spots]
            .sort((a, b) => a.place - b.place)
            .map((spot, i) => (
              <li key={spot.id} className={styles.markRow} style={{ '--i': i } as CSSProperties}>
                <span className={styles.markMine}>{spot.place}</span>
                <span className={styles.markLabel}>{spot.label}</span>
                <span className={styles.markHive}>
                  <span className={styles.markWhere}>
                    {L('avg {avg}', { avg: spot.avg.toFixed(1) })}
                  </span>
                </span>
              </li>
            ))}
        </ol>
      ) : null}
      {board ? <Scoreboard rows={board.rows} compact /> : null}
    </Screen>
  );
}
