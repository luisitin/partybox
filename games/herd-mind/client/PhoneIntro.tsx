// The phone's ready-up (the owner, 2026-09-24): the rules, the Black Sheep spelled out, and a
// Ready button. Once tapped: who the room still waits for. The VIP may start without them.
import type { JSX } from 'react';
import { buzz, PrimaryButton, Screen, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { HerdControllerView } from '../server/views';
import { SettingsPill } from './Settings';
import { SheepCoin } from './SheepCoin';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

export function PhoneIntro({
  view,
  send,
  skip,
}: {
  view: PushedView<HerdControllerView>;
  send: (input: Input) => void;
  skip?: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const ready = view.ready.includes(view.me.id);
  const waiting = view.players
    .filter((p) => p.connected && p.status !== 'spectator' && !view.ready.includes(p.id))
    .map((p) => p.name);
  const tapReady = (): void => {
    buzz(20);
    play('submit');
    send({ type: 'ready' });
  };
  return (
    <Screen
      footer={
        <div className={styles.readyBar}>
          {ready ? (
            <p className={styles.readyLine} role="status">
              {waiting.length > 0
                ? L('✓ Ready · waiting for {names}', { names: waiting.join(', ') })
                : L('✓ Everyone is ready')}
            </p>
          ) : (
            <PrimaryButton onClick={tapReady}>{L("I'm ready")}</PrimaryButton>
          )}
          {skip && ready && waiting.length > 0 ? (
            <PrimaryButton tone="neutral" onClick={skip}>
              {L('Start now')}
            </PrimaryButton>
          ) : null}
        </div>
      }
    >
      <div className={styles.introHead}>
        <SheepCoin size="md" spin />
        <h1 className={styles.title}>{L('Herd Mind')}</h1>
        <span className={styles.pushRight}>
          <SettingsPill />
        </span>
      </div>
      <ol className={styles.steps}>
        <li>{L('Pick the answer you think MOST people will pick — not your favourite.')}</li>
        <li>{L('The biggest group scores 1 point each. A tie for biggest? Nobody scores.')}</li>
        <li>{L('You can change your pick until time runs out.')}</li>
      </ol>
      <section className={styles.sheepCard}>
        <h2 className={styles.sheepTitle}>
          <SheepCoin size="sm" /> {L('The Black Sheep')}
        </h2>
        <p>{L('The only one alone on an answer gets the Black Sheep.')}</p>
        <p>
          {L("While you hold it, you can't win — even at {target} points.", {
            target: view.target,
          })}
        </p>
        <p>
          {L(
            'It leaves you when someone else is the only one alone. Two or more alone? It stays put.',
          )}
        </p>
      </section>
      <p className={styles.note}>
        {L('First to {target} points without the sheep wins.', { target: view.target })}
      </p>
    </Screen>
  );
}
