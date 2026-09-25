// The twist on this event's betting (Cfg.twists; the owner: rules and payouts clear up front): one
// line on the TV and the phone before anyone bets, and the insurance switch on the phone.
import type { JSX } from 'react';
import { buzz, useT } from '@partybox/game-sdk/ui';
import { insuranceFee } from '../server/odds';
import type { Twist } from '../server/types';
import { COIN } from './copy';
import styles from './live.module.css';
import { STRINGS } from './strings';

export function TwistNote({
  twist,
  size = 'tv',
}: {
  twist?: Twist;
  size?: 'tv' | 'phone';
}): JSX.Element | null {
  const L = useT(STRINGS);
  if (!twist) return null;
  const text =
    twist === 'early'
      ? L('⏰ Early bird: bet now for up to ×1.25 more — it slides to ×1.00 at the buzzer.')
      : twist === 'insure'
        ? L("🛟 Insurance: pay 10 % more to get half your stake back if you're wrong.")
        : twist === 'peek'
          ? L('👁 Peek: pay to rule out one wrong answer, on your phone only.')
          : twist === 'split'
            ? L('✂️ Split: tap two answers to put half your stake on each.')
            : twist === 'double'
              ? L('🪙 Double or nothing: a right call flips a coin, twice the win or nothing.')
              : L(
                  '🧮 The crowd sets the odds: right calls split the whole pot — back the unpopular pick!',
                );
  return (
    <p className={`${styles.twist} ${size === 'phone' ? styles.twistPhone : ''}`}>
      <span className={styles.twistTag}>{L('Twist')}</span> {text}
    </p>
  );
}

/** The phone's insurance switch (the insure twist): on = pay the fee with the stake. */
export function InsureSwitch({
  on,
  amount,
  onToggle,
}: {
  on: boolean;
  amount: number;
  onToggle: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`${styles.insure} ${on ? styles.insureOn : ''}`}
      onClick={() => {
        buzz(10);
        onToggle();
      }}
    >
      {on
        ? L('🛟 Insured (+{coin} {n})', { coin: COIN, n: insuranceFee(amount) })
        : L('🛟 Add insurance')}
    </button>
  );
}

/** The phone's peek button (the peek twist): pay once to rule out one wrong option. */
export function PeekButton({
  price,
  done,
  onPeek,
}: {
  price: number;
  done: boolean;
  onPeek: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <button
      type="button"
      disabled={done}
      aria-pressed={done}
      className={`${styles.insure} ${done ? styles.insureOn : ''}`}
      onClick={() => {
        buzz(10);
        onPeek();
      }}
    >
      {done
        ? L('👁 Ruled out: the struck card')
        : L('👁 Peek: rule one out ({coin} {n})', { coin: COIN, n: price })}
    </button>
  );
}

/** The phone's double-or-nothing switch (the double twist). */
export function DoubleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`${styles.insure} ${on ? styles.insureOn : ''}`}
      onClick={() => {
        buzz(10);
        onToggle();
      }}
    >
      {on ? L('🪙 Double or nothing: on') : L('🪙 Go double or nothing')}
    </button>
  );
}
