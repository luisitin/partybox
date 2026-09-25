// Keno / Lucky numbers (LIVE-EVENTS.md — the owner: like KENO, the Bingo balls, a tray for the
// winning numbers, the payouts clear up front). The pay table shows from the box on; the phone
// picks three numbers on a 1–20 grid before the stake; at `open` the balls drop into the tray one
// by one and light their numbers on the board.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { buzz, useReducedMotion, useSound, useT } from '@partybox/game-sdk/ui';
import { KENO_BALL_MS, KENO_NUMBERS, KENO_PAY, KENO_PICKS, betsMs } from '../server/timing';
import styles from './live.module.css';
import { STRINGS } from './strings';

/** "0 → lose · 1 → stake back · 2 → ×2 · 3 → ×25", always on show before anyone stakes. */
export function PayTable({ size = 'tv' }: { size?: 'tv' | 'phone' }): JSX.Element {
  const L = useT(STRINGS);
  const words = [
    L('No match: you lose it'),
    L('1 match: stake back'),
    L('2 matches: ×{x}', { x: KENO_PAY[2] }),
    L('3 matches: ×{x}', { x: KENO_PAY[3] }),
  ];
  return (
    <ul className={`${styles.payTable} ${size === 'phone' ? styles.payTablePhone : ''}`}>
      {words.map((w, i) => (
        <li key={i} className={i === 3 ? styles.payTop : undefined}>
          {w}
        </li>
      ))}
    </ul>
  );
}

/** The phone's pick: three numbers of 1–20; each change is sent when three are chosen. */
export function KenoPad({
  spots,
  onSpots,
}: {
  spots: readonly number[];
  onSpots: (spots: number[]) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const [mine, setMine] = useState<number[]>([...spots]);
  const toggle = (n: number): void => {
    buzz(10);
    const next = mine.includes(n)
      ? mine.filter((x) => x !== n)
      : mine.length < KENO_PICKS
        ? [...mine, n]
        : [...mine.slice(1), n];
    setMine(next);
    if (next.length === KENO_PICKS) onSpots(next);
  };
  return (
    <div className={styles.kenoPad}>
      <p className={styles.kenoHint}>
        {mine.length < KENO_PICKS
          ? L('Pick {n} lucky numbers', { n: KENO_PICKS - mine.length })
          : L('Your numbers: {list}', { list: mine.join(' · ') })}
      </p>
      {/* The payouts above the grid: always in view before the stake (play-test). */}
      <PayTable size="phone" />
      <div className={styles.kenoGrid} role="group" aria-label={L('Your lucky numbers')}>
        {Array.from({ length: KENO_NUMBERS }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={mine.includes(n)}
            className={`${styles.kenoNum} ${mine.includes(n) ? styles.kenoMine : ''}`}
            onClick={() => toggle(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The draw: the board of 1–20 and the tray; a ball drops every KENO_BALL_MS after the bets. */
export function KenoStage({
  drawn,
  bets,
  mine = [],
}: {
  drawn: readonly number[];
  bets: number;
  mine?: readonly number[];
}): JSX.Element {
  const reduced = useReducedMotion();
  const play = useSound();
  const [shown, setShown] = useState(reduced ? drawn.length : 0);
  useEffect(() => {
    if (reduced) return;
    const start = betsMs(bets);
    const hs = drawn.map((_, i) =>
      setTimeout(() => setShown(i + 1), start + (i + 1) * KENO_BALL_MS - KENO_BALL_MS / 2),
    );
    return () => hs.forEach(clearTimeout);
  }, [drawn, bets, reduced]);
  useEffect(() => {
    if (shown > 0) play('tick');
  }, [shown, play]);
  const out = drawn.slice(0, shown);
  return (
    <div className={styles.keno}>
      <div className={styles.kenoBoard} aria-hidden>
        {Array.from({ length: KENO_NUMBERS }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`${styles.kenoCell} ${out.includes(n) ? styles.kenoHit : ''} ${mine.includes(n) ? styles.kenoMineCell : ''}`}
          >
            {n}
          </span>
        ))}
      </div>
      <div className={styles.tray} aria-live="polite">
        {out.map((n) => (
          <span key={n} className={styles.kenoBall}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
