// Who the room is waiting on, as faces: everyone asked to act this phase, a ✓ popping onto each one
// as it locks in (the phone's view of the TV's chips), the ones still to lock breathing — so a
// waiting screen is never still (p14b: a locked phone held still for 6 s).
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import styles from './phone.module.css';
import { STRINGS } from './strings';

export function LockRow({
  players,
  phase,
  className,
}: {
  players: readonly ViewPlayer[];
  phase: string;
  className?: string;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const asked = players.filter((p) => p.status === 'active' || p.status === 'submitted');
  if (asked.length === 0) return null;
  const done = asked.filter((p) => p.status === 'submitted').length;
  const vars = { n: done, total: asked.length };
  return (
    <div className={`${styles.lockRow} ${className ?? ''}`} role="status">
      <span className={styles.lockCount}>
        {phase === 'call' ? L('{n} of {total} called', vars) : L('{n} of {total} locked in', vars)}
      </span>
      <span className={styles.lockFaces} aria-hidden>
        {asked.map((p) => (
          <span
            key={p.id}
            className={`${styles.lockFace} ${p.status === 'submitted' ? '' : styles.lockWaiting}`}
          >
            <Avatar avatarId={p.avatarId} size={32} dim={!p.connected} />
            {p.status === 'submitted' ? <span className={styles.lockTick}>✓</span> : null}
          </span>
        ))}
      </span>
    </div>
  );
}
