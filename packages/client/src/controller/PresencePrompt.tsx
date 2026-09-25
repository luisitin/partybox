// Part 00 §3.3 / audit #33 (ADR-047): the room says everyone is together, yet a phone says it can't
// see the TV — the VIP is asked, between games only and never in a phone-only room: "Maya can't
// see the TV. Are you on a call?" On a call / No call set the room's mode; Not now puts it away
// until the set of remote players changes. Derived from the snapshot: no server prompt state.
import { useState } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { awayToAsk } from '../presence';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import shell from './ControllerShell.module.css';
import styles from './PresencePrompt.module.css';

export function PresencePrompt({
  room,
  me,
  controller,
}: {
  room: RoomSnapshot | null | undefined;
  me: PlayerPublic | null | undefined;
  controller: Controller;
}): JSX.Element | null {
  const [dismissed, setDismissed] = useState<string | null>(null);
  const away = me?.isVip ? awayToAsk(room) : [];
  const key = away.map((p) => p.id).join(',');
  if (away.length === 0 || dismissed === key) return null;
  return (
    <div className={`${shell.toast} ${shell.info} ${styles.prompt}`} role="group">
      <span role="status">{t.presence.prompt(away[0]?.name ?? '', away.length - 1)}</span>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => controller.vip({ action: 'setPresenceMode', mode: 'remote-voice' })}
        >
          {t.presence.onCall}
        </button>
        <button
          type="button"
          onClick={() => controller.vip({ action: 'setPresenceMode', mode: 'remote-text' })}
        >
          {t.presence.noCall}
        </button>
        <button type="button" className={styles.quiet} onClick={() => setDismissed(key)}>
          {t.presence.dismiss}
        </button>
      </div>
    </div>
  );
}
