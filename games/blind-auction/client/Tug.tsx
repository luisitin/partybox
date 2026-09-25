// Tug of war (LIVE-EVENTS.md): on the TV the two teams face each other across a rope whose knot
// follows the server's `rope` (−1 ▲ Sun has won … +1 ● Moon has won); on each phone one big button
// in your team's colour pulls, and says how much of your team's pull is yours (your share of its
// stake). Teams carry a shape and a word, never colour alone.
import { useEffect, useRef } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, Screen, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps, PushedView } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView, BlindAuctionTvView } from '../server/views';
import styles from './live.module.css';
import { STRINGS } from './strings';

type RopeView = Pick<PushedView<BlindAuctionTvView>, 'tug' | 'players'>;

const MARK = ['▲', '●'] as const;

function Side({ view, team, faces }: { view: RopeView; team: 0 | 1; faces: boolean }): JSX.Element {
  const L = useT(STRINGS);
  const ids = (team === 0 ? view.tug?.sun : view.tug?.moon) ?? [];
  return (
    <div className={`${styles.tugSide} ${team === 0 ? styles.sun : styles.moon}`}>
      <span className={styles.tugTeam}>
        {MARK[team]} {team === 0 ? L('Sun') : L('Moon')}
      </span>
      {faces ? (
        <span className={styles.tugFaces}>
          {ids.map((id) => {
            const p = view.players.find((x) => x.id === id);
            return p ? (
              <span key={id} className={styles.tugFace} title={p.name}>
                <Avatar avatarId={p.avatarId} size="100%" />
              </span>
            ) : null;
          })}
        </span>
      ) : null}
    </div>
  );
}

/** The rope: the knot sits at `rope` between the two teams; `live` = still pulling. */
export function TugRope({
  view,
  live,
  faces = true,
}: {
  view: RopeView;
  live: boolean;
  /** The team faces (the TV); a phone's rope leaves them out to stay on one screen. */
  faces?: boolean;
}): JSX.Element {
  const play = useSound();
  const rope = view.tug?.rope ?? 0;
  const last = useRef(rope);
  // A soft tick whenever the rope changes hands (crosses the middle).
  useEffect(() => {
    if (Math.sign(rope) !== Math.sign(last.current) && rope !== 0) play('tick');
    last.current = rope;
  }, [rope, play]);
  return (
    <div className={styles.tug}>
      <Side view={view} team={0} faces={faces} />
      <div className={styles.rope} aria-hidden>
        <span className={styles.ropeLine} />
        <span className={styles.ropeMid} />
        <span
          className={`${styles.knot} ${live ? styles.knotLive : ''}`}
          style={{ '--rope': rope } as CSSProperties}
        >
          🪢
        </span>
      </div>
      <Side view={view} team={1} faces={faces} />
    </div>
  );
}

type PhoneProps = GameControllerProps<BlindAuctionControllerView, Input>;

/** The phone: your team, your share, one big PULL. */
export function PhoneTug({ view, send }: PhoneProps): JSX.Element {
  const L = useT(STRINGS);
  const team = view.myTeam;
  const share = Math.round(view.myShare * 100);
  if (team === null)
    return (
      <Screen className={styles.screen}>
        <TugRope view={view} live />
      </Screen>
    );
  return (
    <Screen
      className={`${styles.screen} ${styles.tugScreen} ${team === 0 ? styles.sun : styles.moon}`}
    >
      <p className={styles.potatoTitle}>
        {MARK[team]} {team === 0 ? L('Team Sun') : L('Team Moon')}
      </p>
      <div className={styles.phoneStage}>
        <TugRope view={view} live faces={false} />
      </div>
      <button
        type="button"
        className={styles.pull}
        disabled={share === 0}
        onPointerDown={(e) => {
          e.preventDefault();
          buzz(8);
          send({ type: 'tug' });
        }}
      >
        {L('PULL!')}
      </button>
      <p className={styles.potatoHint}>
        {share === 0
          ? L('No stake on this one: your pulls count for nothing')
          : L('Your pull: {n}% of your team', { n: share })}
      </p>
    </Screen>
  );
}
