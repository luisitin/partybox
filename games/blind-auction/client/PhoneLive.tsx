// Live bidding on the phone (SPEC §8.5): the current bid and bidder on top; four big buttons, each
// showing the absolute amount it would bid ("Bid 85"); the ones you cannot afford say why. While
// you hold the high bid the buttons give way to "You're winning! 🔨". A tap locks the pad until
// the room answers (no double send); a refusal shakes its reason into view.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  Avatar,
  DeadlineBar,
  Screen,
  WaitingScreen,
  buzz,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView } from '../server/views';
import { COIN } from './copy';
import { HintChips } from './LotCard';
import { Purse } from './PhoneLot';
import styles from './phone.module.css';
import { STRINGS } from './strings';

type Props = GameControllerProps<BlindAuctionControllerView, Input>;

/** A tap waits this long at most for the room's answer before the pad unlocks by itself. */
const PENDING_MS = 1500;

export function PhoneLive({ view, send, me }: Props): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const a = view.auction;
  // The amount this phone just sent, and the standing bid it was sent against.
  const [pending, setPending] = useState<{ amount: number; against: number; at: number } | null>(
    null,
  );
  const standing = a?.high?.amount ?? 0;
  if (pending && standing !== pending.against) setPending(null);
  useEffect(() => {
    if (!pending) return undefined;
    const h = setTimeout(() => setPending(null), PENDING_MS);
    return () => clearTimeout(h);
  }, [pending]);
  if (view.me.role !== 'player' || !a)
    return <WaitingScreen title={L('Live bidding — watch the TV')} mood="watch" />;
  const high = a.high;
  const bidder = high ? view.players.find((p) => p.id === high.by) : undefined;
  const winning = high?.by === me.id;
  const stageLine = a.stage === 1 ? L('Going once…') : a.stage === 2 ? L('Going twice…') : null;
  const notice =
    view.notice?.code === 'outbid'
      ? L('Outbid! Try again.')
      : view.notice?.code === 'winning'
        ? L("You're already winning")
        : null;
  return (
    <Screen className={styles.screen}>
      <div className={styles.topRow}>
        {view.lot ? (
          <span className={styles.liveLot}>
            {view.lot.icon} {view.lot.name}
          </span>
        ) : (
          <span />
        )}
        <Purse coins={view.coins} />
      </div>
      <div className={styles.standing} aria-live="polite">
        <p className={styles.standingLabel}>{high ? L('Current bid') : L('No bids yet')}</p>
        <p key={standing} className={styles.standingAmount}>
          <span className={styles.standingCoin} aria-hidden>
            {COIN}
          </span>{' '}
          {standing}
        </p>
        {bidder ? (
          <p key={bidder.id} className={styles.standingWho}>
            <Avatar avatarId={bidder.avatarId} size={28} /> {bidder.name}
          </p>
        ) : null}
        <DeadlineBar deadline={view.deadline} phaseKey={`${a.from}`} paused={view.paused} />
        {stageLine ? (
          <p key={a.stage} className={styles.stageCall}>
            {stageLine}
          </p>
        ) : null}
      </div>
      {winning ? (
        <div key="winning" className={styles.winning} role="status">
          {L("You're winning! 🔨")}
        </div>
      ) : (
        <div className={styles.raises}>
          {a.options.map((o) => {
            const off = !o.ok || pending !== null;
            const reason = !o.ok && o.amount > view.coins ? L('Not enough coins') : null;
            return (
              <button
                key={o.step || 'all'}
                type="button"
                className={`${styles.raise} ${o.step === 0 ? styles.raiseAll : ''} ${pending?.amount === o.amount ? styles.raiseSent : ''}`}
                aria-disabled={off}
                onClick={() => {
                  if (off) {
                    if (!o.ok) buzz(10);
                    return;
                  }
                  setPending({ amount: o.amount, against: standing, at: Date.now() });
                  play('submit');
                  send({ type: 'raise', amount: o.amount });
                }}
              >
                <span className={styles.raiseStep}>{o.step ? `+${o.step}` : L('All in')}</span>
                <span className={styles.raiseAmount}>{L('Bid {n}', { n: o.amount })}</span>
                {reason ? <span className={styles.raiseWhy}>{reason}</span> : null}
              </button>
            );
          })}
        </div>
      )}
      {notice ? (
        <p key={view.notice?.at} className={styles.notice} role="alert">
          {notice}
        </p>
      ) : null}
      {view.lot ? (
        <HintChips hints={view.lot.hints} size="phone" className={styles.liveHints} />
      ) : null}
    </Screen>
  );
}
