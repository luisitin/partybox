// More live-event stages (split from LiveStage.tsx): the coin-flip streak and the penalty kick.
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { useReducedMotion, useT } from '@partybox/game-sdk/ui';
import { COIN_FLIP_MS, EVENT_MS, betsMs } from '../server/timing';
import styles from './live.module.css';
import { useProgress } from './liveShared';
import type { Props } from './liveShared';
import { STRINGS } from './strings';

/** Coin-flip streak: the coin spins once per flip; heads stack up in a row until tails lands. */
export function Coins({ run, bets }: Props): JSX.Element {
  const L = useT(STRINGS);
  const reduced = useReducedMotion();
  const flips = run.detail;
  const [shown, setShown] = useState(reduced ? flips.length : 0);
  useEffect(() => {
    if (reduced) return;
    const start = betsMs(bets);
    const hs = flips.map((_, i) =>
      setTimeout(() => setShown(i + 1), start + (i + 1) * COIN_FLIP_MS),
    );
    return () => hs.forEach(clearTimeout);
  }, [flips, bets, reduced]);
  const last = shown > 0 ? flips[shown - 1] : null;
  const done = shown >= flips.length;
  return (
    <div className={styles.coins}>
      <span
        key={shown}
        className={`${styles.coin} ${shown < flips.length ? styles.coinSpin : ''} ${last === 0 ? styles.coinTails : ''}`}
        aria-hidden
      >
        {last === null ? '?' : last === 0 ? 'T' : 'H'}
      </span>
      <p className={`${styles.sum} ${shown > 0 ? styles.sumOn : ''}`} aria-live="polite">
        {shown === 0
          ? ' '
          : done
            ? last === 0
              ? L('Tails! A streak of {n}', { n: flips.filter((f) => f === 1).length })
              : L('{n} heads in a row!', { n: flips.length })
            : L('Heads! {n} so far…', { n: shown })}
      </p>
      <span className={styles.flipRow} aria-hidden>
        {flips.slice(0, shown).map((f, i) => (
          <span key={i} className={styles.flip}>
            {f ? 'H' : 'T'}
          </span>
        ))}
      </span>
    </div>
  );
}

/** Penalty kick: the ball waits on the spot, the keeper sways; then the kick and the dive together,
 *  and the ball ends in the net, in the gloves, or off the post. */
export function Penalty({ run, bets }: Props): JSX.Element {
  const L = useT(STRINGS);
  const p = useProgress(betsMs(bets) + 600, EVENT_MS.penalty - 1400);
  const [aim = 1, keeper = 1] = run.detail;
  const kicked = p > 0;
  const done = p >= 1;
  const result =
    run.outcome === 0 ? L('GOAL!') : run.outcome === 1 ? L('SAVED!') : L('Off the post!');
  return (
    <div className={styles.pitch}>
      <div className={styles.goal}>
        <span
          className={`${styles.keeper} ${kicked ? styles.dive : ''}`}
          style={{ '--dir': keeper - 1 } as CSSProperties}
          aria-hidden
        >
          🧤
        </span>
      </div>
      <span
        className={`${styles.kickBall} ${kicked ? styles.kicked : ''} ${run.outcome === 2 ? styles.wide : ''} ${run.outcome === 1 ? styles.caught : ''}`}
        style={{ '--dir': aim - 1 } as CSSProperties}
        aria-hidden
      >
        ⚽
      </span>
      <p className={`${styles.sum} ${done ? styles.sumOn : ''}`} aria-live="polite">
        {done ? result : ' '}
      </p>
    </div>
  );
}
