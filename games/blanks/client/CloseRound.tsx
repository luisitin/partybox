// I-447 B: the VIP's two-tap "Close the round" in the hand's title row (untimed rounds).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './blanks.module.css';

/** I-447 B: the VIP's "Close the round" while they choose: the first tap asks, the second closes
 *  (the cards not yet played sit this round out); left alone, it forgets the ask after 3 s. */
export function CloseRound({ skip, waiting }: { skip: () => void; waiting: number }): JSX.Element {
  const L = useT(STRINGS);
  const [ask, setAsk] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!ask) return undefined;
    const h = setTimeout(() => setAsk(false), 3000);
    return () => clearTimeout(h);
  }, [ask]);
  return (
    <button
      type="button"
      className={`${styles.closeRound} ${ask ? styles.closeAsk : ''}`}
      disabled={sent}
      onClick={() => {
        if (!ask) return setAsk(true);
        setSent(true);
        skip();
      }}
    >
      {sent
        ? L('Closing…')
        : ask
          ? L('Sure? {n} still choosing', { n: waiting })
          : L('⏭ Close the round')}
    </button>
  );
}
