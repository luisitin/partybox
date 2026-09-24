// `intro` on the TV (SPEC §8.4): the title, the three steps landing one by one, "Everyone starts
// with 🪙 100", and a fan of face-down cards swaying behind them. Says why bids are sealed when
// Live was asked for but somebody is remote.
import type { CSSProperties, JSX } from 'react';
import { Stage, useBeats, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BlindAuctionTvView } from '../server/views';
import { COIN } from './copy';
import { LotCard } from './LotCard';
import { STRINGS } from './strings';
import styles from './tv.module.css';

const FAN = ['🎁', '🗝️', '💎'];

export function TvIntro({ view }: { view: PushedView<BlindAuctionTvView> }): JSX.Element {
  const L = useT(STRINGS);
  const beat = useBeats([0, 900, 1900, 2900, 3900]);
  const steps = [
    L('A mystery lot comes up, with a hint of what might be inside.'),
    view.live
      ? L('Bid out loud from your phone: going once, going twice…')
      : L('Bid in secret. The highest bid wins the lot and pays for it.'),
    L('The lot flips: treasure, trap, heist or swap. Most coins at the end wins.'),
  ];
  return (
    <Stage center className={styles.intro}>
      <div className={styles.fan} aria-hidden>
        {FAN.map((icon, i) => (
          <div key={icon} className={styles.fanCard} style={{ '--ba-fan': i - 1 } as CSSProperties}>
            <LotCard icon={icon} grand={i === 1} face={null} flipped={false} deal />
          </div>
        ))}
      </div>
      <div className={styles.introText}>
        <h1 className={styles.title}>
          <span aria-hidden>🔨</span> {L('Blind Auction')}
        </h1>
        <ol className={styles.steps}>
          {steps.map((text, i) => (
            <li key={i} className={`${styles.stepItem} ${beat >= i + 1 ? styles.stepIn : ''}`}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <p className={`${styles.startCoins} ${beat >= 4 ? styles.stepIn : ''}`}>
          {L('Everyone starts with {coin} {n}', { coin: COIN, n: view.startCoins })}
        </p>
        {view.liveRefused ? (
          <p className={styles.note}>
            {L('Live bidding needs everyone in one room, so tonight the bids are sealed.')}
          </p>
        ) : null}
      </div>
    </Stage>
  );
}
