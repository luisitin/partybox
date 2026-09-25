// The phone's quiet screens: the rules with a Ready button (then 3·2·1), and the box while it is
// read out — its name and everything it might hold, with the odds, so a phone that cannot see the
// TV has what the TV shows.
import type { JSX } from 'react';
import { PrimaryButton, Screen, usePhoneOnly, useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BlindAuctionControllerView, BoxView } from '../server/views';
import { COIN, boxWords } from './copy';
import { LotCard } from './LotCard';
import { OptionBoard } from './Options';
import styles from './phone.module.css';
import { SAMPLE_OPTIONS } from './sample';
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
export function LotTitle({ box }: { box: BoxView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <p className={`${styles.lotTitle} ${box.grand ? styles.grand : ''}`}>
      <span className={styles.lotTitleKicker}>
        {box.grand ? `★ ${L('Grand box ×2')}` : L('Box {n}/{total}', { n: box.n, total: box.of })}
      </span>
      <span className={styles.lotTitleName}>
        <span aria-hidden>{box.icon}</span> {boxWords(L, box).name}
      </span>
    </p>
  );
}

function Countdown({ view }: { view: View }): JSX.Element {
  const left = useSecondsLeft(view.deadline, view.paused, 50) ?? 0;
  return (
    <span key={left} className={styles.countdown} aria-live="assertive">
      {Math.max(1, left)}
    </span>
  );
}

export function PhoneRules({ view, onReady }: { view: View; onReady?: () => void }): JSX.Element {
  const L = useT(STRINGS);
  const waiting = view.players.length - view.readyIds.length;
  const steps = [
    L('A mystery box shows what might be inside, and the odds.'),
    L('Bet your coins in secret on what you think is inside. Long shots pay big.'),
    L('The box opens: call it right and you get paid by the odds. Most coins at the end wins.'),
  ];
  const footer =
    view.step === 1 || !onReady ? null : (
      <PrimaryButton
        done={view.ready}
        onClick={() => {
          if (!view.ready) onReady();
        }}
      >
        {view.ready
          ? waiting > 0
            ? L('✓ Ready · waiting for {n} more', { n: waiting })
            : L('✓ Ready')
          : L("I'm ready")}
      </PrimaryButton>
    );
  return (
    <Screen className={styles.screen} footer={footer}>
      <h2 className={styles.howTitle}>
        <span aria-hidden>📦</span> {L('Blind Auction')}
      </h2>
      {view.step === 1 ? (
        <div className={styles.countdownBox}>
          <p className={styles.soon}>{L('Here comes the first box…')}</p>
          <Countdown view={view} />
        </div>
      ) : (
        <>
          <ol className={styles.howSteps}>
            {steps.map((text, i) => (
              <li key={i} className={styles.howStep} style={{ animationDelay: `${i * 160}ms` }}>
                <span className={styles.howNum}>{i + 1}</span>
                <span className={styles.howBody}>
                  <span>{text}</span>
                  {i === 0 ? <OptionBoard options={SAMPLE_OPTIONS} size="phone" compact /> : null}
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.startCoins}>
            {L('Everyone starts with {coin} {n}', { coin: COIN, n: view.startCoins })}
          </p>
        </>
      )}
    </Screen>
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
