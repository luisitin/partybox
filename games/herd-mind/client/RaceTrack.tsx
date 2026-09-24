// The race to the target, one lane per player (a horse race reads at 3 players and at 16).
// Beats: +1 pops over the herd's faces, the Black Sheep coin flies from its old holder (or the
// pasture) to the new one, then the faces slide to their new scores. Transform-only motion; the
// flight is measured from the real faces and played with the Web Animations API.
import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties, JSX, RefObject } from 'react';
import { Avatar, useReducedMotion, useT } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import { SHEEP_FLIGHT_MS } from '../server/timing';
import { SheepCoin } from './SheepCoin';
import { STRINGS } from './strings';
import styles from './Race.module.css';

export interface RaceProps {
  players: readonly ViewPlayer[];
  target: number;
  /** Who scored this question (+1), and where the sheep was and is now. */
  scored: readonly string[];
  sheepFrom: string | null;
  sheep: string | null;
  /** Beats reached: the +1s showing, the sheep flying/landed, the faces moved to new scores. */
  plus: boolean;
  fly: boolean;
  moved: boolean;
  winners: readonly string[];
}

/** The coin as a badge on its new holder, flying in from where it was (a face or the pasture). */
function FlyingSheep({
  from,
  track,
}: {
  from: string;
  track: RefObject<HTMLDivElement | null>;
}): JSX.Element {
  const coin = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = coin.current;
    const a = track.current?.querySelector<HTMLElement>(`[data-sheep-spot="${from}"]`);
    if (!el || !a || reduced) return undefined;
    const ra = a.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const dx = ra.left + ra.width / 2 - (box.left + box.width / 2);
    const dy = ra.top + ra.height / 2 - (box.top + box.height / 2);
    // An arc over the lanes: up and bigger mid-flight, a full turn, down onto the new holder.
    const run = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(1) rotateY(0deg)` },
        {
          transform: `translate(${dx / 2}px, ${dy / 2 - 140}px) scale(1.7) rotateY(180deg)`,
          offset: 0.5,
        },
        { transform: 'translate(0, 0) scale(1) rotateY(360deg)' },
      ],
      { duration: SHEEP_FLIGHT_MS, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' },
    );
    return () => run.cancel();
  }, [from, track, reduced]);
  return (
    <span ref={coin} className={`${styles.badge} ${styles.flying}`}>
      <SheepCoin size="sm" />
    </span>
  );
}

export function RaceTrack(props: RaceProps): JSX.Element {
  const L = useT(STRINGS);
  const track = useRef<HTMLDivElement>(null);
  const { players, target, scored } = props;
  const before = (p: ViewPlayer): number => (p.score ?? 0) - (scored.includes(p.id) ? 1 : 0);
  // Leaders on top, by the scores this question started from, so no lane jumps mid-phase.
  const lanes = [...players].sort((a, b) => before(b) - before(a) || a.name.localeCompare(b.name));
  const moving = props.sheep !== props.sheepFrom && props.sheep !== null;
  // Before the flight the coin is where it was (a face, or the pasture); from the flight on it
  // is on its new holder.
  const holder = moving && !props.fly ? props.sheepFrom : props.sheep;
  return (
    <div ref={track} className={styles.track} style={{ '--lanes': lanes.length } as CSSProperties}>
      <div className={styles.pasture} data-sheep-spot="pasture">
        {holder === null ? <SheepCoin size="sm" /> : null}
        <span>{L('Pasture')}</span>
      </div>
      <ol className={styles.lanes}>
        {lanes.map((p) => {
          const score = props.moved ? (p.score ?? 0) : before(p);
          const x = Math.min(score, target) / target;
          const holds = holder === p.id;
          const flying = holds && moving && props.fly;
          const blocked = holds && score >= target;
          return (
            <li
              key={p.id}
              className={`${styles.lane} ${props.winners.includes(p.id) && props.moved ? styles.won : ''}`}
            >
              <span className={styles.who}>{p.name}</span>
              <div className={styles.run}>
                <div className={styles.slide} style={{ '--x': x } as CSSProperties}>
                  <span className={styles.face} data-sheep-spot={p.id}>
                    <Avatar avatarId={p.avatarId} size="100%" dim={!p.connected} />
                    {props.plus && scored.includes(p.id) ? (
                      <span className={styles.plus}>+1</span>
                    ) : null}
                    {flying ? (
                      <FlyingSheep from={props.sheepFrom ?? 'pasture'} track={track} />
                    ) : holds ? (
                      <SheepCoin size="sm" className={styles.badge} />
                    ) : null}
                  </span>
                  <span className={styles.points}>{score}</span>
                  {blocked ? (
                    <span className={styles.blocked}>{L('holding the sheep')}</span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className={styles.finish} aria-hidden>
        🏁 {target}
      </div>
    </div>
  );
}
