// A live event on the TV at `open` (LIVE-EVENTS.md): it waits for the bets to land, then plays out
// from the server's `run` alone — the race's finishing order, the dice, where the wheel stops — and
// finishes as step 1 opens the payouts (timing.ts EVENT_MS). Transform/opacity only; reduced motion
// shows the finish at once.
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { useReducedMotion, useT } from '@partybox/game-sdk/ui';
import { EVENT_MS, betsMs } from '../server/timing';
import { iconOf, nameOf } from './copy';
import { KenoStage } from './Keno';
import styles from './live.module.css';
import { useProgress } from './liveShared';
import type { Props } from './liveShared';
import { Coins, Penalty, Reveal4 } from './MoreEvents';
import { STRINGS } from './strings';

const LANE_TINT = ['--pb-player-1', '--pb-player-2', '--pb-player-3', '--pb-player-4'];

function Race({ run, options, bets }: Props): JSX.Element {
  const L = useT(STRINGS);
  // The winner crosses the line just before the payouts; the others a little behind, in order.
  const total = EVENT_MS.race - 700;
  const p = useProgress(betsMs(bets), total);
  const rankOf = (i: number): number => Math.max(0, run.detail.indexOf(i));
  const pos = (i: number): number => {
    const rank = rankOf(i);
    const finish = 1 + rank * 0.07;
    // The winner saves its speed for the end; the rest start quicker and fade.
    const shape = rank === 0 ? 1.45 : 0.8 + ((i * 37) % 30) / 100;
    const base = Math.min(1, Math.pow(p / finish, shape) * (rank === 0 ? 1 : 1 - rank * 0.02));
    const wobble = Math.sin(p * 11 + i * 1.7) * 0.035 * (1 - p);
    return Math.max(0, Math.min(1, base + wobble));
  };
  const done = p >= 1;
  return (
    <div className={styles.race} aria-label={L('The race')}>
      {options.map((o, i) => (
        <div
          key={i}
          className={`${styles.lane} ${done && i === run.outcome ? styles.laneWin : ''}`}
          style={{ '--lane': `var(${LANE_TINT[i] ?? '--pb-accent'})` } as CSSProperties}
        >
          <span className={`${styles.laneName} ${p > 0 && !done ? styles.laneNameBack : ''}`}>
            {nameOf(L, o)}
          </span>
          <span className={styles.racer} style={{ '--x': pos(i) } as CSSProperties} aria-hidden>
            <span className={p > 0 && !done ? styles.gallop : undefined}>{iconOf(o)}</span>
          </span>
        </div>
      ))}
      <span className={styles.finish} aria-hidden />
    </div>
  );
}

/** Pips per face (3×3 grid cells), and the turn that brings a value to the front. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
const FACES: [number, string][] = [
  [1, 'rotateY(0deg)'],
  [6, 'rotateY(180deg)'],
  [2, 'rotateY(90deg)'],
  [5, 'rotateY(-90deg)'],
  [3, 'rotateX(90deg)'],
  [4, 'rotateX(-90deg)'],
];
const SHOW: Record<number, [number, number]> = {
  1: [0, 0],
  6: [0, 180],
  2: [0, -90],
  5: [0, 90],
  3: [-90, 0],
  4: [90, 0],
};

function Die({ value, i, rolling }: { value: number; i: number; rolling: boolean }): JSX.Element {
  const [x, y] = SHOW[value] ?? [0, 0];
  // Several whole turns on the way, then the value's face towards the room.
  const turn = rolling
    ? `rotateX(${x - 18 + 720}deg) rotateY(${y + 22 + (i ? -1080 : 1080)}deg) rotateZ(${i ? -6 : 6}deg)`
    : 'rotateX(-18deg) rotateY(22deg)';
  return (
    <div className={`${styles.dieSlot} ${rolling ? styles.thrown : ''}`}>
      <div className={styles.die} style={{ transform: turn }}>
        {FACES.map(([v, rot]) => (
          <div
            key={v}
            className={`${styles.face} ${v === 1 ? styles.one : ''}`}
            style={{ transform: `${rot} translateZ(var(--ba-die-half))` }}
          >
            {Array.from({ length: 9 }, (_, k) =>
              (PIPS[v] ?? []).includes(k) ? <i key={k} /> : <span key={k} />,
            )}
          </div>
        ))}
      </div>
      <span className={styles.dieShadow} aria-hidden />
    </div>
  );
}

function Dice({ run, options, bets }: Props): JSX.Element {
  const L = useT(STRINGS);
  const p = useProgress(betsMs(bets), EVENT_MS.dice - 600);
  const [a = 1, b = 1] = run.detail;
  const landed = p >= 1;
  const call = options[run.outcome];
  return (
    <div className={styles.dice}>
      <div className={styles.felt}>
        <Die value={a} i={0} rolling={p > 0} />
        <Die value={b} i={1} rolling={p > 0} />
      </div>
      <p className={`${styles.sum} ${landed ? styles.sumOn : ''}`} aria-live="polite">
        {landed ? `${a} + ${b} = ${a + b}${call ? ` · ${nameOf(L, call)}` : ''}` : ' '}
      </p>
    </div>
  );
}

const SLICE_TINT = [
  '--pb-player-1',
  '--pb-player-2',
  '--pb-player-3',
  '--pb-player-4',
  '--pb-player-5',
  '--pb-player-6',
];

function Wheel({ run, options, bets }: Props): JSX.Element {
  const L = useT(STRINGS);
  const reduced = useReducedMotion();
  const delay = betsMs(bets);
  const [spun, setSpun] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const h = setTimeout(() => setSpun(true), delay);
    return () => clearTimeout(h);
  }, [delay, reduced]);
  const total = options.reduce((s, o) => s + o.chance, 0) || 100;
  const before = (i: number): number => options.slice(0, i).reduce((s, o) => s + o.chance, 0);
  const slices = options.map((_, i) => ({
    start: (before(i) / total) * 360,
    end: (before(i + 1) / total) * 360,
  }));
  const win = slices[run.outcome] ?? { start: 0, end: 90 };
  const stop = win.start + ((win.end - win.start) * (run.detail[0] ?? 50)) / 100;
  // The pointer is at the top: turn the wheel so `stop` comes under it, after six whole turns.
  const angle = spun ? 6 * 360 + (360 - stop) : 0;
  const gradient = slices
    .map((s, i) => `var(${SLICE_TINT[i] ?? '--pb-surface-2'}) ${s.start}deg ${s.end}deg`)
    .join(', ');
  const spinMs = EVENT_MS.wheel - 800;
  return (
    <div className={styles.wheelBox}>
      <span className={`${styles.pointer} ${spun && !reduced ? styles.ticking : ''}`} aria-hidden>
        ▼
      </span>
      <div className={styles.tilt}>
        <div
          className={styles.wheel}
          style={
            {
              background: `conic-gradient(${gradient})`,
              transform: `rotate(${angle}deg)`,
              transitionDuration: reduced ? '0ms' : `${spinMs}ms`,
            } as CSSProperties
          }
        >
          {options.map((o, i) => {
            const s = slices[i] ?? { start: 0, end: 0 };
            const mid = (s.start + s.end) / 2;
            return (
              <span
                key={i}
                className={styles.prize}
                style={{ transform: `rotate(${mid}deg) translateY(-34%) rotate(${-mid}deg)` }}
                aria-label={nameOf(L, o)}
              >
                {iconOf(o)}
              </span>
            );
          })}
          <span className={styles.hub} aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** Three doors: `opened` shows its goat (the host's door); `car` set = every door swings open
 *  after `delay`, the car behind it. Used by `swap` (no car yet) and `open`. */
export function Doors({
  opened,
  car,
  delay = 0,
}: {
  opened: number | null;
  car: number | null;
  delay?: number;
}): JSX.Element {
  const L = useT(STRINGS);
  const reduced = useReducedMotion();
  const [all, setAll] = useState(reduced && car !== null);
  useEffect(() => {
    if (car === null || reduced) return;
    const h = setTimeout(() => setAll(true), delay);
    return () => clearTimeout(h);
  }, [car, delay, reduced]);
  return (
    <div className={styles.doors}>
      {[0, 1, 2].map((d) => {
        const open = d === opened || all;
        const prize = d === car ? '🚗' : '🐐';
        return (
          <div key={d} className={`${styles.doorCell} ${all && d === car ? styles.doorWin : ''}`}>
            <span className={styles.behind} aria-hidden={!open}>
              {open ? (d === opened || car !== null ? prize : '') : ''}
            </span>
            <span className={`${styles.door} ${open ? styles.doorOpen : ''}`} aria-hidden>
              {d + 1}
            </span>
            <span className={styles.doorLabel}>{L('Door {n}', { n: d + 1 })}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LiveStage(props: Props): JSX.Element {
  if (props.run.kind === 'race') return <Race {...props} />;
  if (props.run.kind === 'dice') return <Dice {...props} />;
  if (props.run.kind === 'coins') return <Coins {...props} />;
  if (props.run.kind === 'penalty') return <Penalty {...props} />;
  if (props.run.kind === 'ghost' || props.run.kind === 'wires') return <Reveal4 {...props} />;
  if (props.run.kind === 'keno') return <KenoStage drawn={props.run.detail} bets={props.bets} />;
  if (props.run.kind === 'doors')
    return (
      <Doors
        opened={props.run.detail[0] ?? null}
        car={props.run.outcome}
        delay={betsMs(props.bets)}
      />
    );
  return <Wheel {...props} />;
}
