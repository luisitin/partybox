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
