// I-347 A/C: the returning host whose VIP passed on mid-game is told who took over, with a
// "Take it back" button (until the next game starts or the role moves again). The pill is the
// only message: the server raises no reconnect toast for it. Like every toast, a tap on its text
// puts it away on this phone — it sits over the game's lower answers while it stays.
import { useState } from 'react';
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import styles from './ControllerShell.module.css';

export function ReclaimVip({
  room,
  playerId,
  controller,
}: {
  room: RoomSnapshot | null | undefined;
  playerId: string | null | undefined;
  controller: Controller;
}): JSX.Element | null {
  const [dismissed, setDismissed] = useState<string | null>(null);
  if (!room?.formerVip || room.formerVip !== playerId || room.vip === playerId) return null;
  // one handover = one pill: a later handover (a new holder) shows it again
  const key = `${room.formerVip}>${room.vip ?? ''}`;
  if (dismissed === key) return null;
  const who = room.players.find((p) => p.id === room.vip)?.name ?? t.reclaim.someone;
  return (
    <div className={`${styles.toast} ${styles.info} ${styles.reclaim}`}>
      <span role="status" onClick={() => setDismissed(key)}>
        {t.reclaim.tookOver(who)}
      </span>
      <button type="button" onClick={() => controller.vip({ action: 'reclaimVip' })}>
        {t.reclaim.takeBack}
      </button>
    </div>
  );
}
