// Doors `swap` on the phone: the host has opened a goat door; you keep your door or switch. A
// bettor whose own door was opened picks one of the two still closed. Your choice can change until
// the doors open; a player with no stake watches.
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen, buzz, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView } from '../server/views';
import { LotTitle, Purse } from './PhoneLot';
import styles from './phone.module.css';
import { STRINGS } from './strings';

type Props = GameControllerProps<BlindAuctionControllerView, Input>;

export function PhoneSwap({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const mine = view.myDoor;
  const opened = view.opened;
  if (mine === null || opened === null)
    return (
      <WaitingScreen
        title={L('Stay or switch?')}
        hint={L('No stake on these doors: watch the others choose.')}
        mood="watch"
      />
    );
  const closed = [0, 1, 2].filter((d) => d !== opened);
  const forced = mine === opened;
  const now = view.mySwap ?? (forced ? null : mine);
  const pick = (door: number): void => {
    buzz(15);
    send({ type: 'swap', door });
  };
  const choices = forced ? closed : [mine, ...closed.filter((d) => d !== mine)];
  return (
    <Screen className={styles.screen}>
      <div className={styles.topRow}>
        {view.box ? <LotTitle box={view.box} /> : <span />}
        <Purse coins={view.coins} />
      </div>
      <div className={styles.doorRow} aria-hidden>
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className={`${styles.doorMini} ${d === opened ? styles.doorMiniOpen : ''} ${d === now ? styles.doorMiniMine : ''}`}
          >
            {d === opened ? '🐐' : d + 1}
          </span>
        ))}
      </div>
      <p className={styles.swapLine}>
        {forced
          ? L('A goat behind your door {n}! Pick one of the other two.', { n: mine + 1 })
          : L('A goat behind door {n}! You are on door {m}.', { n: opened + 1, m: mine + 1 })}
      </p>
      <div className={styles.swapButtons}>
        {choices.map((door) => {
          const stay = door === mine;
          return (
            <PrimaryButton
              key={door}
              tone={stay ? 'neutral' : 'accent'}
              done={view.mySwap === door}
              onClick={() => pick(door)}
            >
              {stay
                ? L('Stay on door {n}', { n: door + 1 })
                : forced
                  ? L('Door {n}', { n: door + 1 })
                  : L('Switch to door {n}', { n: door + 1 })}
            </PrimaryButton>
          );
        })}
      </div>
      <p className={styles.soon}>
        {view.mySwap === null
          ? L('Choose before the doors open.')
          : L('✓ Locked in. You can still change.')}
      </p>
    </Screen>
  );
}
