// "Waiting for 3 more…" under a locked answer: who the room still waits on, with three dots
// that bounce in turn — the phone never sits frozen while the others decide.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { PushedView, ViewEnvelope } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

export function WaitingFor({
  view,
  me,
}: {
  view: PushedView<ViewEnvelope>;
  me: string;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const left = view.players.filter(
    (p) => p.connected && p.status === 'active' && p.id !== me,
  ).length;
  if (left === 0) return null;
  return (
    <span className={styles.waiting}>
      {left === 1 ? L('Waiting for 1 more') : L('Waiting for {n} more', { n: left })}
      <span className={styles.dots} aria-hidden>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
