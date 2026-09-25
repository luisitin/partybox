// `rules` on the TV (the owner, 2026-09-24: "start the game explaining the rules and waiting for
// everybody to ready up"): the three steps land one by one (the first with an example box's odds), then the room's
// faces tick ✓ as each phone taps Ready; once everyone is in, a big 3 · 2 · 1.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar, Stage, useBeats, useSecondsLeft, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BlindAuctionTvView } from '../server/views';
import { COIN } from './copy';
import { OptionBoard } from './Options';
import { SAMPLE_OPTIONS } from './sample';
import { STRINGS } from './strings';
import styles from './tv.module.css';

function Countdown({ view }: { view: PushedView<BlindAuctionTvView> }): JSX.Element {
  const play = useSound();
  const left = useSecondsLeft(view.deadline, view.paused, 50) ?? 0;
  const last = useRef(-1);
  useEffect(() => {
    if (left > 0 && left !== last.current) play('countdown');
    last.current = left;
  }, [left, play]);
  return (
    <span key={left} className={styles.countdown} aria-live="assertive">
      {Math.max(1, left)}
    </span>
  );
}

export function TvRules({ view }: { view: PushedView<BlindAuctionTvView> }): JSX.Element {
  const L = useT(STRINGS);
  // All three steps at once (a slow reader can read ahead), a short stagger for the entrance.
  const beat = useBeats([0, 150, 300, 450, 700]);
  const steps = [
    L('A mystery box shows what might be inside, and the odds.'),
    L('Bet your coins in secret on what you think is inside. Long shots pay big.'),
    L('The box opens: call it right and you get paid by the odds. Most coins at the end wins.'),
  ];
  const humans = view.players;
  const ready = view.readyIds.length;
  return (
    <div className={styles.frame}>
      <Stage center className={styles.rules}>
        <h1 className={styles.title}>
          <span aria-hidden>📦</span> {L('Blind Auction')}
        </h1>
        <div className={styles.rulesRow}>
          <ol className={styles.steps}>
            {steps.map((text, i) => (
              <li key={i} className={`${styles.stepItem} ${beat >= i + 1 ? styles.stepIn : ''}`}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepBody}>
                  <span>{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className={`${styles.rulesSample} ${beat >= 1 ? styles.stepIn : ''}`} aria-hidden>
            <OptionBoard options={SAMPLE_OPTIONS} compact />
          </div>
        </div>
        <div className={`${styles.readyRow} ${beat >= 4 ? styles.stepIn : ''}`}>
          <p className={styles.startCoins}>
            {L('Everyone starts with {coin} {n}', { coin: COIN, n: view.startCoins })}
          </p>
          {view.step === 1 ? (
            <Countdown view={view} />
          ) : (
            <>
              <p className={styles.readyLine}>
                {L('Tap Ready on your phone · {n} of {total} ready', {
                  n: ready,
                  total: humans.length,
                })}
              </p>
              <span className={styles.readyFaces}>
                {humans.map((p) => (
                  <span
                    key={p.id}
                    className={`${styles.readyFace} ${view.readyIds.includes(p.id) ? styles.isReady : ''}`}
                    title={p.name}
                  >
                    <Avatar avatarId={p.avatarId} size="100%" />
                    {view.readyIds.includes(p.id) ? (
                      <span className={styles.readyTick}>✓</span>
                    ) : null}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
      </Stage>
    </div>
  );
}
