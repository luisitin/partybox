// Live bidding on the TV (SPEC §8.5): the current bid at display size inside a ring clock that
// drains over each stage, the high bidder's face and name, and the auctioneer's stage ("Going
// once…"). Each new bid pops the number, swaps the face in and plays `wager`; "Going once / twice"
// ring the countdown and their clips on the frame the stage changes.
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, useServerOffset, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import { LIVE_OPENING_BID } from '../server/timing';
import type { BlindAuctionTvView } from '../server/views';
import { COIN } from './copy';
import { HintChips } from './LotCard';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { useLine } from './useVoice';

const RING = 2 * Math.PI * 170;

/** The ring clock: drains from `from` to `to` (server times), restarted by a key on `from`. The
 *  start point is read once at mount, so a push mid-stage never makes it jump. */
function RingClock({
  from,
  to,
  offset,
  held,
  last,
}: {
  from: number;
  to: number;
  offset: number;
  held: boolean;
  last: boolean;
}): JSX.Element {
  const span = Math.max(1, to - from);
  const [into] = useState(() => Math.min(span, Math.max(0, Date.now() + offset - from)));
  const style = {
    '--ba-ring-ms': `${span}ms`,
    '--ba-ring-delay': `${-into}ms`,
    '--ba-ring-len': `${RING}`,
  } as CSSProperties;
  return (
    <svg className={styles.ring} viewBox="0 0 380 380" style={style} aria-hidden>
      <circle className={styles.ringTrack} cx="190" cy="190" r="170" />
      <circle
        className={`${styles.ringLeft} ${held ? styles.ringHeld : ''} ${last ? styles.ringLast : ''}`}
        cx="190"
        cy="190"
        r="170"
      />
    </svg>
  );
}

export function TvLive({ view }: { view: PushedView<BlindAuctionTvView> }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  const offset = useServerOffset();
  const auction = view.auction;
  const high = auction?.high ?? null;
  const stage = auction?.stage ?? 0;
  const bidder = high ? view.players.find((p) => p.id === high.by) : undefined;
  const last = useRef<{ amount: number; stage: number }>({ amount: high?.amount ?? 0, stage });
  useEffect(() => play('phase'), [play]);
  useLine(view.clips.bids, true, 350);
  useLine(view.clips.once, stage === 1);
  useLine(view.clips.twice, stage === 2);
  // Cues on the frame the change lands (the phase re-arms its deadline per stage, ADR-033).
  useEffect(() => {
    if (high && high.amount !== last.current.amount) play('wager');
    else if (stage > 0 && stage !== last.current.stage) play('countdown');
    last.current = { amount: high?.amount ?? 0, stage };
  }, [high, stage, play]);
  if (!auction || !view.lot) return null;
  const line =
    stage === 1
      ? L('Going once…')
      : stage === 2
        ? L('Going twice…')
        : high
          ? L('{name} bids!', { name: bidder?.name ?? '?' })
          : L('Opening bid {coin} {n}. Who will start?', { coin: COIN, n: LIVE_OPENING_BID });
  return (
    <div className={`${styles.panel} ${styles.livePanel}`}>
      <div className={styles.liveRow}>
        <div className={styles.ringBox}>
          <RingClock
            key={auction.from}
            from={auction.from}
            to={view.deadline ?? auction.from}
            offset={offset}
            held={view.paused}
            last={stage === 2}
          />
          <span key={high?.amount ?? 0} className={styles.liveAmount} aria-live="polite">
            <span className={styles.liveCoin} aria-hidden>
              {COIN}
            </span>
            {high?.amount ?? 0}
          </span>
        </div>
        <div className={styles.bidder}>
          {bidder ? (
            <span key={bidder.id} className={styles.bidderIn}>
              <Avatar avatarId={bidder.avatarId} size={120} />
              <span className={styles.bidderName}>{bidder.name}</span>
            </span>
          ) : (
            <span className={styles.bidderEmpty} aria-hidden>
              🔨
            </span>
          )}
        </div>
      </div>
      <p
        key={`${stage}-${high?.amount ?? 0}`}
        className={`${styles.stageLine} ${stage > 0 ? styles.stageCall : ''}`}
      >
        {line}
      </p>
      <HintChips hints={view.lot.hints} className={styles.liveChips} />
    </div>
  );
}
