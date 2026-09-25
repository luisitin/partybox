// The phone's quiet screen: the box while it is
// read out — its name and everything it might hold, with the odds, so a phone that cannot see the
// TV has what the TV shows.
import type { JSX } from 'react';
import { Screen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BlindAuctionControllerView, BoxView } from '../server/views';
import { COIN, boxWords } from './copy';
import { LotCard } from './LotCard';
import { OptionBoard } from './Options';
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

/** "Box 3/8 · 🏴‍☠️ Pirate's Chest" in one line. */
export function LotTitle({ box, coins }: { box: BoxView; coins?: number }): JSX.Element {
  const L = useT(STRINGS);
  const kicker = (
    <span className={styles.lotTitleKicker}>
      {box.grand ? `★ ${L('Grand box ×2')}` : L('Box {n}/{total}', { n: box.n, total: box.of })}
    </span>
  );
  return (
    <p className={`${styles.lotTitle} ${box.grand ? styles.grand : ''}`}>
      {/* With `coins`, the purse shares the kicker's line so the name gets the full width. */}
      {coins === undefined ? (
        kicker
      ) : (
        <span className={styles.kickerRow}>
          {kicker}
          <Purse coins={coins} />
        </span>
      )}
      <span className={styles.lotTitleName}>
        <span aria-hidden>{box.icon}</span> {boxWords(L, box).name}
      </span>
    </p>
  );
}

export function PhoneBox({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  useReading(phoneOnly ? view.voice : null);
  const box = view.box;
  return (
    <Screen className={styles.screen}>
      <div className={styles.topRow}>
        {box ? <LotTitle box={box} /> : <span />}
        <Purse coins={view.coins} />
      </div>
      {box ? (
        <div className={styles.lotStage}>
          <LotCard
            icon={box.icon}
            grand={box.grand}
            face={null}
            flipped={false}
            deal
            size="phone"
          />
          <p className={styles.flavour}>{boxWords(L, box).flavour}</p>
          <OptionBoard options={box.options} size="phone" />
        </div>
      ) : null}
      <p className={styles.soon}>{L('Betting opens in a moment: what is inside?')}</p>
    </Screen>
  );
}
