// The phone's quiet screens: how to play (intro) and the lot while it is read out — its name, hint
// chips and your coins, so a phone that cannot see the TV has everything the TV shows.
import type { JSX } from 'react';
import { Screen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BlindAuctionControllerView, LotView } from '../server/views';
import { COIN } from './copy';
import { HintChips, LotCard } from './LotCard';
import styles from './phone.module.css';
import { STRINGS } from './strings';
import { useReading } from './useVoice';

type View = PushedView<BlindAuctionControllerView>;

/** Your coins, as a pill in the corner of every screen. */
export function Purse({ coins }: { coins: number }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <span className={styles.purse} aria-label={L('You have {n} coins', { n: coins })}>
      {COIN} {coins}
    </span>
  );
}

/** The lot in one line: "Lot 3/8 · 🏴‍☠️ Pirate's Chest" (the bid screen's header). */
export function LotTitle({ lot }: { lot: LotView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <p className={`${styles.lotTitle} ${lot.grand ? styles.grand : ''}`}>
      <span className={styles.lotTitleKicker}>
        {lot.grand ? `★ ${L('Grand Lot')}` : L('Lot {n}/{total}', { n: lot.n, total: lot.of })}
      </span>
      <span className={styles.lotTitleName}>
        <span aria-hidden>{lot.icon}</span> {lot.name}
      </span>
    </p>
  );
}

/** The lot in a few lines: kicker, icon and name, hint chips. */
export function LotSummary({
  lot,
  flavour = false,
}: {
  lot: LotView;
  flavour?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={styles.lot}>
      <p className={`${styles.kicker} ${lot.grand ? styles.grand : ''}`}>
        {lot.grand
          ? `★ ${L('THE GRAND LOT')} ★`
          : L('Lot {n} of {total}', { n: lot.n, total: lot.of })}
      </p>
      <h2 className={styles.lotName}>
        <span className={styles.lotIcon} aria-hidden>
          {lot.icon}
        </span>
        {lot.name}
      </h2>
      {flavour ? <p className={styles.flavour}>{lot.flavour}</p> : null}
      <HintChips hints={lot.hints} size="phone" />
    </div>
  );
}

export function PhoneLot({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  useReading(phoneOnly ? view.voice : null);
  return (
    <Screen className={styles.screen}>
      <div className={styles.topRow}>
        <Purse coins={view.coins} />
      </div>
      {view.lot ? (
        <div className={styles.lotStage}>
          <LotCard
            icon={view.lot.icon}
            grand={view.lot.grand}
            face={null}
            flipped={false}
            deal
            size="phone"
          />
          <LotSummary lot={view.lot} flavour />
        </div>
      ) : null}
      <p className={styles.soon}>
        {view.live ? L('Live bidding opens in a moment…') : L('Secret bidding opens in a moment…')}
      </p>
    </Screen>
  );
}

export function HowTo({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const steps = [
    L('A mystery lot comes up, with a hint of what might be inside.'),
    view.live
      ? L('Bid out loud from your phone: going once, going twice…')
      : L('Bid in secret. The highest bid wins the lot and pays for it.'),
    L('The lot flips: treasure, trap, heist or swap. Most coins at the end wins.'),
  ];
  return (
    <Screen className={styles.screen}>
      <h2 className={styles.howTitle}>
        <span aria-hidden>🔨</span> {L('Blind Auction')}
      </h2>
      <ol className={styles.howSteps}>
        {steps.map((text, i) => (
          <li key={i} className={styles.howStep} style={{ animationDelay: `${i * 160}ms` }}>
            <span className={styles.howNum}>{i + 1}</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <p className={styles.startCoins}>
        {L('Everyone starts with {coin} {n}', { coin: COIN, n: view.startCoins })}
      </p>
    </Screen>
  );
}
